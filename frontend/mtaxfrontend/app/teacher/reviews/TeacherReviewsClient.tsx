// app/teacher/reviews/TeacherReviewsClient.tsx
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import {
  FiFileText,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiEye,
  FiSearch,
  FiUser,
  FiCalendar,
  FiMail,
  FiAlertCircle,
  FiMessageSquare,
  FiChevronLeft,
  FiChevronRight,
  FiX,
  FiHome,
} from "react-icons/fi";
import Header from "@/app/component/Header";
import { useRouter, useSearchParams } from "next/navigation";
import { API_BASE_URL } from "@/api_base_url/page";

interface Report {
  id: number;
  title: string;
  report_name?: string;
  report_title?: string;
  student: string;
  student_id: number;
  student_name: string;
  student_first_name?: string;
  student_last_name?: string;
  student_email: string;
  type: string;
  type_name?: string;
  type_id?: number;
  course?: string;
  course_name?: string;
  submitted_at: string;
  report_status: string;
  status: string;
  content?: string;
  report_data?: any;
  attachments?: string[];
  teacher_id?: number;
  teacher_name?: string;
  reviewed_at?: string;
  feedback?: string;
  comments?: Comment[];
  org_id?: number;
  org_name?: string;
  tax_period_year?: number;
  tax_period_month?: number;
  total_income?: string;
  total_tax_amount?: string;
  created_at?: string;
  updated_at?: string;
}

interface TeacherInfo {
  id: number;
  name: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  department?: string;
}

const formatDate = (dateString: string | undefined) => {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  } catch {
    return dateString;
  }
};

const getStatusBadge = (reportStatus: string) => {
  const status = reportStatus?.toLowerCase() || "";
  
  if (status === "баталгаажсан" || status === "approved") {
    return (
      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center gap-1">
        <FiCheckCircle className="text-green-600" /> Баталгаажсан
      </span>
    );
  } 
  if (status === "буцаасан" || status === "rejected" || status === "returned") {
    return (
      <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium flex items-center gap-1">
        <FiXCircle className="text-red-600" /> Буцаасан
      </span>
    );
  }
  if (status === "хянаж буй" || status === "reviewing" || status === "in_review") {
    return (
      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium flex items-center gap-1">
        <FiEye className="text-blue-600" /> Хянаж буй
      </span>
    );
  }
  
  return (
    <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium flex items-center gap-1">
      <FiClock className="text-yellow-600" /> Хүлээгдэж буй
    </span>
  );
};

const mapMongolianStatusToEnglish = (mongolianStatus: string): string => {
  const status = mongolianStatus?.toLowerCase() || "";
  if (status === "баталгаажсан") return "approved";
  if (status === "буцаасан") return "rejected";
  if (status === "хянаж буй") return "reviewed";
  return "pending";
};

const mapEnglishStatusToMongolian = (englishStatus: string): string => {
  switch(englishStatus) {
    case "approved":
      return "Баталгаажсан";
    case "rejected":
      return "Буцаасан";
    case "reviewed":
      return "Хянаж буй";
    default:
      return "Хүлээгдэж буй";
  }
};

export default function TeacherReviewsClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [teacherInfo, setTeacherInfo] = useState<TeacherInfo | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [tempStartDate, setTempStartDate] = useState("");
  const [tempEndDate, setTempEndDate] = useState("");
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(3);
  
  const hasRestoredSelection = useRef(false);
  const selectedReportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      const userData = JSON.parse(user);
      setTeacherInfo({
        id: userData.id,
        name: `${userData.last_name || ""} ${userData.first_name || ""}`,
        first_name: userData.first_name,
        last_name: userData.last_name,
        email: userData.email,
        department: userData.department,
      });
    } else {
      router.push("/login");
    }
  }, [router]);

  useEffect(() => {
    if (teacherInfo?.id) {
      fetchReports();
    }
  }, [teacherInfo]);

  useEffect(() => {
    const filterFromUrl = searchParams.get('filter');
    if (filterFromUrl && ["all", "pending", "approved", "rejected"].includes(filterFromUrl)) {
      setFilterStatus(filterFromUrl);
    }
  }, [searchParams]);

  // Restore selected report and scroll to correct page
  useEffect(() => {
    const reportIdFromUrl = searchParams.get('reportId');
    const filterFromUrl = searchParams.get('filter');
    
    if (reports.length > 0 && reportIdFromUrl && !hasRestoredSelection.current) {
      const foundReport = reports.find(r => r.id === parseInt(reportIdFromUrl));
      if (foundReport) {
        console.log("Restoring selected report:", foundReport.id);
        setSelectedReport(foundReport);
        setCommentText(foundReport.feedback || "");
        fetchReportDetail(foundReport.id);
        hasRestoredSelection.current = true;
        
        // Find and scroll to the page containing this report
        setTimeout(() => {
          const reportElement = document.getElementById(`report-${foundReport.id}`);
          if (reportElement) {
            reportElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            reportElement.classList.add('ring-2', 'ring-blue-500');
            setTimeout(() => {
              reportElement.classList.remove('ring-2', 'ring-blue-500');
            }, 2000);
          }
        }, 500);
      }
    }
  }, [reports, searchParams]);

  useEffect(() => {
    setCurrentPage(1);
    setSelectedReport(null);
    hasRestoredSelection.current = false;
  }, [filterStatus, searchQuery, startDate, endDate]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/report/teacherreportlist/`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      console.log("Teacher reports data:", data);

      if (data.resultCode === 7640 && data.data) {
        const reportList = data.data;
        const reportsMap = new Map<number, Report>();
        
        for (const item of reportList) {
          const reportId = item.report_id;
          
          if (reportsMap.has(reportId)) continue;
          
          let displayStudentName = item.student_name || "Оюутан";
          if ((!displayStudentName || displayStudentName === "") && (item.student_first_name || item.student_last_name)) {
            displayStudentName = `${item.student_last_name || ''} ${item.student_first_name || ''}`.trim();
          }
          
          const report: Report = {
            id: reportId,
            title: item.type_name || "Тайлан",
            report_name: item.type_name,
            type_name: item.type_name,
            student: displayStudentName,
            student_id: item.student_id || 0,
            student_name: displayStudentName,
            student_first_name: item.student_first_name,
            student_last_name: item.student_last_name,
            student_email: item.student_email || "",
            type: item.type_name || "Тайлан",
            course: item.course_name || "Хичээл",
            submitted_at: item.submission_date || new Date().toISOString(),
            report_status: item.current_status || "Хүлээгдэж буй",
            status: mapMongolianStatusToEnglish(item.current_status || "Хүлээгдэж буй"),
            content: item.content,
            report_data: item.report_data,
            attachments: item.attachments || [],
            teacher_id: item.teacher_id,
            teacher_name: item.teacher_name,
            reviewed_at: item.reviewed_at || item.checked_date,
            feedback: item.feedback,
            comments: item.comments || [],
            org_id: item.org_id,
            org_name: item.org_name || "",
            tax_period_year: item.tax_period_year,
            tax_period_month: item.tax_period_month,
            total_income: item.total_income,
            total_tax_amount: item.total_tax_amount,
            created_at: item.created_at,
            updated_at: item.updated_at,
          };
          
          reportsMap.set(reportId, report);
        }
        
        const uniqueReports = Array.from(reportsMap.values());
        setReports(uniqueReports);
      } else if (data.resultCode === 8213) {
        setError("Хэрэглэгчийн эрх баталгаажаагүй байна. Дахин нэвтэрнэ үү.");
        setTimeout(() => router.push("/login"), 2000);
      } else {
        setError(data.resultMessage || "Тайлан ачаалахад алдаа гарлаа");
      }
    } catch (error) {
      console.error("Тайлан ачаалахад алдаа:", error);
      setError("Сервертэй холбогдоход алдаа гарлаа");
    } finally {
      setLoading(false);
    }
  };

  const fetchReportDetail = async (reportId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/report/${reportId}/`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (data.resultCode === 7520 && data.data) {
        const reportDetail = data.data;
        setSelectedReport(prev => prev ? {
          ...prev,
          content: reportDetail.content,
          report_data: reportDetail.report_data,
          attachments: reportDetail.attachments || [],
          feedback: reportDetail.feedback,
          comments: reportDetail.comments || [],
        } : prev);
        
        if (reportDetail.feedback) {
          setCommentText(reportDetail.feedback);
        }
      }
    } catch (error) {
      console.error("Тайлангийн дэлгэрэнгүй ачаалахад алдаа:", error);
    }
  };

  const addComment = async (commentText: string) => {
    if (!selectedReport || !commentText.trim()) return false;
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/comment/addcomment/${selectedReport.id}/`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          comment_text: commentText,
        }),
      });

      const data = await response.json();
      return data.resultCode === 9020;
    } catch (error) {
      console.error("Коммент нэмэхэд алдаа:", error);
      return false;
    }
  };

  const updateReportStatus = async (reportId: number, englishStatus: string, feedback: string) => {
    const mongolianStatus = mapEnglishStatusToMongolian(englishStatus);
    const requestBody = {
      report_status: mongolianStatus,
      feedback: feedback,
    };

    const response = await fetch(`${API_BASE_URL}/api/report/teachereditreportstatus/${reportId}/`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();
    return data;
  };

  const canApproveOrReject = (reportStatus: string) => {
    const status = reportStatus?.toLowerCase() || "";
    return status === "хүлээгдэж буй" || status === "pending" || status === "submitted";
  };

  const handleApprove = async () => {
    if (!selectedReport) return;
    
    setSubmitting(true);
    try {
      if (commentText.trim()) {
        await addComment(commentText);
      }
      
      const data = await updateReportStatus(selectedReport.id, "approved", commentText);
      
      if (data.resultCode === 6150) {
        const updatedReports = reports.map(r => 
          r.id === selectedReport.id 
            ? { 
                ...r, 
                status: "approved",
                report_status: "Баталгаажсан",
                feedback: commentText, 
                reviewed_at: new Date().toISOString(), 
                teacher_name: teacherInfo?.name 
              }
            : r
        );
        setReports(updatedReports);
        
        setSelectedReport(prev => 
          prev ? { 
            ...prev, 
            status: "approved",
            report_status: "Баталгаажсан",
            feedback: commentText, 
            reviewed_at: new Date().toISOString(), 
            teacher_name: teacherInfo?.name 
          } : null
        );
        
        showNotification("Тайлан амжилттай баталгаажууллаа.", "success");
      } else {
        showNotification("Баталгаажуулахад алдаа гарлаа", "error");
      }
    } catch (error) {
      console.error("Баталгаажуулахад алдаа:", error);
      showNotification("Сервертэй холбогдоход алдаа гарлаа", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!selectedReport) return;
    
    if (!commentText.trim()) {
      showNotification("Татгалзах шалтгааныг бичнэ үү", "error");
      return;
    }
    
    setSubmitting(true);
    try {
      await addComment(commentText);
      
      const data = await updateReportStatus(selectedReport.id, "rejected", commentText);
      
      if (data.resultCode === 6150) {
        const updatedReports = reports.map(r => 
          r.id === selectedReport.id 
            ? { 
                ...r, 
                status: "rejected",
                report_status: "Буцаасан",
                feedback: commentText, 
                reviewed_at: new Date().toISOString(), 
                teacher_name: teacherInfo?.name 
              }
            : r
        );
        setReports(updatedReports);
        
        setSelectedReport(prev => 
          prev ? { 
            ...prev, 
            status: "rejected",
            report_status: "Буцаасан",
            feedback: commentText, 
            reviewed_at: new Date().toISOString(), 
            teacher_name: teacherInfo?.name 
          } : null
        );
        
        showNotification("Тайлан татгалзлаа.", "error");
      } else {
        showNotification("Татгалзахад алдаа гарлаа", "error");
      }
    } catch (error) {
      console.error("Татгалзахад алдаа:", error);
      showNotification("Сервертэй холбогдоход алдаа гарлаа", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const showNotification = (message: string, type: "success" | "error") => {
    const bgColor = type === "success" ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200";
    const textColor = type === "success" ? "text-green-800" : "text-red-800";
    
    const notificationDiv = document.createElement("div");
    notificationDiv.className = "fixed top-4 right-4 z-50 animate-slide-in";
    notificationDiv.innerHTML = `
      <div class="${bgColor} border rounded-xl p-4 shadow-lg">
        <div class="flex items-center gap-3">
          <div class="${textColor}">
            <p class="font-medium">${message}</p>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(notificationDiv);
    setTimeout(() => notificationDiv.remove(), 3000);
  };

  const handleSelectReport = (report: Report) => {
    setSelectedReport(report);
    setCommentText(report.feedback || "");
    router.push(`/teacher/reviews?reportId=${report.id}&filter=${filterStatus}`, { scroll: false });
    fetchReportDetail(report.id);
  };

  const handleFilterChange = (newFilter: string) => {
    setFilterStatus(newFilter);
    setSelectedReport(null);
    hasRestoredSelection.current = false;
    const currentReportId = searchParams.get('reportId');
    if (currentReportId) {
      router.push(`/teacher/reviews?reportId=${currentReportId}&filter=${newFilter}`, { scroll: false });
    } else {
      router.push(`/teacher/reviews?filter=${newFilter}`, { scroll: false });
    }
  };

  const getFilteredAndSortedReports = useCallback(() => {
    let filtered = [...reports];
    
    if (filterStatus !== "all") {
      if (filterStatus === "pending") {
        filtered = filtered.filter(r => {
          const status = r.report_status?.toLowerCase() || "";
          return status === "хүлээгдэж буй" || status === "pending" || status === "submitted";
        });
      } else if (filterStatus === "approved") {
        filtered = filtered.filter(r => {
          const status = r.report_status?.toLowerCase() || "";
          return status === "баталгаажсан" || status === "approved";
        });
      } else if (filterStatus === "rejected") {
        filtered = filtered.filter(r => {
          const status = r.report_status?.toLowerCase() || "";
          return status === "буцаасан" || status === "rejected" || status === "returned";
        });
      }
    }
    
    if (startDate) {
      const startDateTime = new Date(startDate);
      startDateTime.setHours(0, 0, 0, 0);
      filtered = filtered.filter(r => new Date(r.submitted_at) >= startDateTime);
    }
    if (endDate) {
      const endDateTime = new Date(endDate);
      endDateTime.setHours(23, 59, 59, 999);
      filtered = filtered.filter(r => new Date(r.submitted_at) <= endDateTime);
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(r => 
        r.title.toLowerCase().includes(query) || 
        r.student_name.toLowerCase().includes(query) ||
        (r.student_id && r.student_id.toString().includes(query)) ||
        r.student_email.toLowerCase().includes(query) ||
        (r.org_name && r.org_name.toLowerCase().includes(query))
      );
    }
    
    filtered.sort((a, b) => {
      if (sortOrder === "desc") {
        return new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime();
      } else {
        return new Date(a.submitted_at).getTime() - new Date(b.submitted_at).getTime();
      }
    });
    
    return filtered;
  }, [reports, filterStatus, startDate, endDate, searchQuery, sortOrder]);

  const filteredReports = getFilteredAndSortedReports();
  const hasDateFilter = startDate || endDate;
  const hasActiveFilters = filterStatus !== "all" || searchQuery || hasDateFilter;

  const clearAllFilters = () => {
    const currentReportId = searchParams.get('reportId');
    setFilterStatus("all");
    setSearchQuery("");
    setStartDate("");
    setEndDate("");
    setSortOrder("desc");
    setTempStartDate("");
    setTempEndDate("");
    setShowDateFilter(false);
    setSelectedReport(null);
    hasRestoredSelection.current = false;
    if (currentReportId) {
      router.push(`/teacher/reviews?reportId=${currentReportId}`, { scroll: false });
    } else {
      router.push('/teacher/reviews', { scroll: false });
    }
  };

  const resetDateFilter = () => {
    setStartDate("");
    setEndDate("");
    setTempStartDate("");
    setTempEndDate("");
    setShowDateFilter(false);
  };

  const applyDateFilter = () => {
    setStartDate(tempStartDate);
    setEndDate(tempEndDate);
    setShowDateFilter(false);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentReports = filteredReports.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredReports.length / itemsPerPage);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      if (selectedReport) {
        router.push(`/teacher/reviews?reportId=${selectedReport.id}&filter=${filterStatus}`, { scroll: false });
      }
    }
  };

  const pendingCount = reports.filter(r => {
    const status = r.report_status?.toLowerCase() || "";
    return status === "хүлээгдэж буй" || status === "pending" || status === "submitted";
  }).length;
  const approvedCount = reports.filter(r => {
    const status = r.report_status?.toLowerCase() || "";
    return status === "баталгаажсан" || status === "approved";
  }).length;
  const rejectedCount = reports.filter(r => {
    const status = r.report_status?.toLowerCase() || "";
    return status === "буцаасан" || status === "rejected" || status === "returned";
  }).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] via-white to-[#eef2ff]">
      <Header />
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Тайлан хянах</h1>
            <p className="text-gray-500 mt-1">Хамгийн сүүлд ирсэн тайлангууд эхэнд жагсана</p>
          </div>
          
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="mt-2 md:mt-0 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition flex items-center gap-2"
            >
              <FiX /> Бүх шүүлтүүрийг цэвэрлэх
            </button>
          )}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700">
            <FiAlertCircle className="text-xl flex-shrink-0" />
            <span>{error}</span>
            <button onClick={() => setError("")} className="ml-auto text-red-500 hover:text-red-700">×</button>
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Нийт тайлан</p>
                <p className="text-3xl font-bold text-gray-900">{reports.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <FiFileText className="text-blue-600 text-xl" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Хүлээгдэж буй</p>
                <p className="text-3xl font-bold text-yellow-600">{pendingCount}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <FiClock className="text-yellow-600 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Баталгаажсан</p>
                <p className="text-3xl font-bold text-green-600">{approvedCount}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <FiCheckCircle className="text-green-600 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Татгалзсан / Буцаасан</p>
                <p className="text-3xl font-bold text-red-600">{rejectedCount}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <FiXCircle className="text-red-600 text-xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 mb-8">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Тайлан, оюутны нэр, байгууллага, ID эсвэл email-ээр хайх..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-black"
                />
              </div>
            </div>
            
            <div className="flex gap-2 flex-wrap items-center">
              <button
                onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
                className="px-4 py-2 rounded-xl font-medium transition flex items-center gap-2 bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                <FiClock />
                {sortOrder === "desc" ? "Хамгийн сүүлд ирсэн" : "Хамгийн эрт ирсэн"}
              </button>
              
              <div className="relative">
                <button
                  onClick={() => setShowDateFilter(!showDateFilter)}
                  className={`px-4 py-2 rounded-xl font-medium transition flex items-center gap-2 ${
                    hasDateFilter ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <FiCalendar />
                  Огноогоор шүүх
                </button>
                
                {showDateFilter && (
                  <div className="absolute right-0 mt-2 z-20 bg-white rounded-2xl shadow-2xl border border-gray-200 p-5 w-80">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-semibold text-gray-900">Огнооны хязгаар</h4>
                      <button onClick={() => setShowDateFilter(false)} className="text-gray-400 hover:text-gray-600">
                        <FiX />
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Эхлэх огноо</label>
                        <input
                          type="date"
                          value={tempStartDate}
                          onChange={(e) => setTempStartDate(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-black"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Дуусах огноо</label>
                        <input
                          type="date"
                          value={tempEndDate}
                          onChange={(e) => setTempEndDate(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-black"
                        />
                      </div>
                      
                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={() => { setTempStartDate(""); setTempEndDate(""); }}
                          className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                        >
                          Цэвэрлэх
                        </button>
                        <button
                          onClick={applyDateFilter}
                          className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                          Хэрэглэх
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex gap-2 flex-wrap mt-4">
            <button
              onClick={() => handleFilterChange("all")}
              className={`px-4 py-2 rounded-xl font-medium transition ${
                filterStatus === "all" ? "bg-[#0f172a] text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Бүгд ({reports.length})
            </button>
            <button
              onClick={() => handleFilterChange("pending")}
              className={`px-4 py-2 rounded-xl font-medium transition ${
                filterStatus === "pending" ? "bg-yellow-500 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Хүлээгдэж буй ({pendingCount})
            </button>
            <button
              onClick={() => handleFilterChange("approved")}
              className={`px-4 py-2 rounded-xl font-medium transition ${
                filterStatus === "approved" ? "bg-green-500 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Баталгаажсан ({approvedCount})
            </button>
            <button
              onClick={() => handleFilterChange("rejected")}
              className={`px-4 py-2 rounded-xl font-medium transition ${
                filterStatus === "rejected" ? "bg-red-500 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Буцаасан ({rejectedCount})
            </button>
          </div>
        </div>

        {/* Reports List and Detail */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Reports List */}
          <div className="lg:col-span-1">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-900">Тайлангууд ({filteredReports.length})</h3>
              <span className="text-xs text-gray-500">
                {filteredReports.length > 0 ? `${indexOfFirstItem + 1}-${Math.min(indexOfLastItem, filteredReports.length)} / ${filteredReports.length}` : "0 / 0"}
              </span>
            </div>
            <div className="space-y-4">
              {currentReports.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 text-center">
                  <FiFileText className="text-4xl text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Тайлан байхгүй байна</p>
                  {hasActiveFilters && (
                    <button
                      onClick={clearAllFilters}
                      className="mt-3 text-sm text-blue-600 hover:text-blue-800"
                    >
                      Шүүлтүүрийг цэвэрлэх
                    </button>
                  )}
                </div>
              ) : (
                <>
                  {currentReports.map((report) => (
                    <motion.div
                      key={report.id}
                      id={`report-${report.id}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={() => handleSelectReport(report)}
                      className={`bg-white rounded-2xl p-4 shadow-lg border-2 cursor-pointer transition ${
                        selectedReport?.id === report.id ? "border-blue-500 bg-blue-50/30" : "border-gray-100 hover:border-blue-300"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 line-clamp-2 text-base">
                            {report.title}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">{report.student_name}</p>
                          <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                            <FiMail className="text-xs" /> {report.student_email}
                          </p>
                          {report.org_name && (
                            <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                              <FiHome className="text-xs" /> {report.org_name}
                            </p>
                          )}
                        </div>
                        <div className="ml-2 flex-shrink-0">
                          {getStatusBadge(report.report_status)}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                        <span className="flex items-center gap-1">
                          <FiCalendar /> {formatDate(report.submitted_at)}
                        </span>
                      </div>
                    </motion.div>
                  ))}

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 mt-6 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => goToPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="p-2 rounded-lg bg-white border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                      >
                        <FiChevronLeft />
                      </button>
                      
                      <div className="flex gap-1">
                        {(() => {
                          const pages = [];
                          const maxVisible = 5;
                          
                          if (totalPages <= maxVisible) {
                            for (let i = 1; i <= totalPages; i++) pages.push(i);
                          } else {
                            if (currentPage <= 3) {
                              for (let i = 1; i <= 4; i++) pages.push(i);
                              pages.push(-1);
                              pages.push(totalPages);
                            } else if (currentPage >= totalPages - 2) {
                              pages.push(1);
                              pages.push(-1);
                              for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
                            } else {
                              pages.push(1);
                              pages.push(-1);
                              for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
                              pages.push(-1);
                              pages.push(totalPages);
                            }
                          }
                          
                          return pages.map((page, idx) => (
                            page === -1 ? (
                              <span key={`sep-${idx}`} className="w-10 h-10 flex items-center justify-center text-gray-400">...</span>
                            ) : (
                              <button
                                key={page}
                                onClick={() => goToPage(page)}
                                className={`w-10 h-10 rounded-lg font-medium transition ${
                                  currentPage === page ? "bg-[#0f172a] text-white" : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                                }`}
                              >
                                {page}
                              </button>
                            )
                          ));
                        })()}
                      </div>
                      
                      <button
                        onClick={() => goToPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-lg bg-white border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                      >
                        <FiChevronRight />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Report Detail */}
          <div className="lg:col-span-2">
            {selectedReport ? (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-2xl p-6 shadow-xl border border-gray-200"
              >
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {selectedReport.title}
                    </h2>
                    <div className="flex flex-col gap-1 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <FiUser /> {selectedReport.student_name}
                        {selectedReport.student_id && ` (ID: ${selectedReport.student_id})`}
                      </span>
                      <span className="flex items-center gap-1">
                        <FiMail /> {selectedReport.student_email}
                      </span>
                      <span className="flex items-center gap-1">
                        <FiCalendar /> Илгээсэн: {formatDate(selectedReport.submitted_at)}
                      </span>
                      {selectedReport.org_name && (
                        <span className="flex items-center gap-1">
                          <FiHome /> Байгууллага: {selectedReport.org_name}
                        </span>
                      )}
                      {selectedReport.tax_period_year && selectedReport.tax_period_month && (
                        <span className="flex items-center gap-1">
                          <FiCalendar /> Тайлангийн хугацаа: {selectedReport.tax_period_year} оны {selectedReport.tax_period_month}-р сар
                        </span>
                      )}
                    </div>
                  </div>
                  {getStatusBadge(selectedReport.report_status)}
                </div>

                {/* Preview of report content */}
                <div
                  onClick={() => router.push(`/teacher/reviews/${selectedReport.id}`)}
                  className="relative bg-white rounded-2xl p-5 shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300 cursor-pointer mb-6"
                >
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-t-2xl" />
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-500">Тайлангийн агуулга</span>
                    <span className="text-xs text-blue-600">Дэлгэрэнгүй харах →</span>
                  </div>
                  <div className="border-t border-gray-100 pt-3">
                    <div className="bg-gray-50 rounded-lg p-3 text-gray-700 max-h-[200px] overflow-y-auto text-sm leading-relaxed">
                      {selectedReport.content || "Тайлангийн дэлгэрэнгүй харахын тулд дарна уу..."}
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FiMessageSquare />
                    Санал шүүмж бичих
                  </h3>
                  
                  <div className="mb-4">
                    <textarea
                      rows={4}
                      placeholder="Оюутанд хандаж санал шүүмжээ бичнэ үү..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      disabled={!canApproveOrReject(selectedReport.report_status) || submitting}
                      className="w-full text-black px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none disabled:bg-gray-50 disabled:text-black"
                    />
                  </div>

                  {canApproveOrReject(selectedReport.report_status) && (
                    <div className="flex gap-3">
                      <button
                        onClick={handleApprove}
                        disabled={submitting}
                        className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {submitting ? (
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <FiCheckCircle />
                        )}
                        Баталгаажуулах
                      </button>
                      <button
                        onClick={handleReject}
                        disabled={submitting}
                        className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {submitting ? (
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <FiXCircle />
                        )}
                        Татгалзах
                      </button>
                    </div>
                  )}

                  {!canApproveOrReject(selectedReport.report_status) && selectedReport.feedback && (
                    <div className="mt-6 pt-4 border-t border-gray-200">
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-600">Хянасан багш:</span>
                          <span className="font-medium text-gray-900">{selectedReport.teacher_name || teacherInfo?.name}</span>
                        </div>
                        {selectedReport.reviewed_at && (
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-600">Хянасан огноо:</span>
                            <span className="font-medium text-gray-900">{formatDate(selectedReport.reviewed_at)}</span>
                          </div>
                        )}
                        <div className="mt-3 p-3 bg-white rounded-lg">
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedReport.feedback}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              <div className="bg-white rounded-2xl p-12 shadow-xl border border-gray-200 text-center">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiFileText className="text-3xl text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Тайлан сонгоогүй байна</h3>
                <p className="text-gray-500">Зүүн талаас хянах тайлангаа сонгоно уу</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}