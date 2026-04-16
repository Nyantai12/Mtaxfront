// app/teacher/review/page.tsx
"use client";

import { useState, useEffect } from "react";
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
} from "react-icons/fi";
import Header from "@/app/component/Header";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/api_base_url/page";

// Интерфейсүүд
interface Report {
  id: number;
  title: string;
  report_name?: string;
  report_title?: string;
  student: string;
  student_id: string;
  student_name: string;
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
}

interface TeacherInfo {
  id: number;
  name: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  department?: string;
}

// Статусыг монголоос англи руу хөрвүүлэх
const mapMongolianStatusToEnglish = (mongolianStatus: string): string => {
  switch(mongolianStatus) {
    case "Баталгаажсан":
      return "approved";
    case "Буцаасан":
      return "rejected";
    case "Хянаж буй":
      return "reviewed";
    case "Хүлээгдэж буй":
      return "pending";
    default:
      return "pending";
  }
};

// Англи статусыг монгол руу хөрвүүлэх
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

export default function TeacherReviewPage() {
  const router = useRouter();
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [teacherInfo, setTeacherInfo] = useState<TeacherInfo | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [commentText, setCommentText] = useState("");
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(3);

  // Хэрэглэгчийн мэдээлэл авах
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

  // Тайлангийн жагсаалт татах
  useEffect(() => {
    if (teacherInfo?.id) {
      fetchReports();
    }
  }, [teacherInfo]);

  // Хайлт эсвэл шүүлтүүр өөрчлөгдөхөд хуудасны дугаарыг 1 болгох
  useEffect(() => {
    setCurrentPage(1);
    setSelectedReport(null);
  }, [filterStatus, searchQuery]);

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
      console.log("teacherreportlist хариу:", data);

      if (data.resultCode === 7640 && data.data) {
        const reportList = data.data;
        
        // report_id-ээр бүлэглэх Map объект
        const reportsMap = new Map<number, Report>();
        
        for (const item of reportList) {
          const reportId = item.report_id;
          
          if (reportsMap.has(reportId)) {
            console.log(`Тайлан ${reportId} аль хэдийн нэмэгдсэн байна. Давхардахгүй.`);
            continue;
          }
          
          // Backend-ээс ирсэн current_status-г ашиглах
          const mongolianStatus = item.current_status || "Хүлээгдэж буй";
          const englishStatus = mapMongolianStatusToEnglish(mongolianStatus);
          const reportTitle = item.type_name || "Тайлан";
          
          const report: Report = {
            id: reportId,
            title: reportTitle,
            report_name: item.type_name,
            type_name: item.type_name,
            student: item.student_name || "Оюутан",
            student_id: item.student_id || "",
            student_name: item.student_name || "",
            student_email: item.student_email || item.email || "",
            type: item.type_name || "Тайлан",
            course: item.course_name || "Хичээл",
            submitted_at: item.submitted_at || new Date().toISOString(),
            report_status: mongolianStatus,
            status: englishStatus,
            content: item.content,
            report_data: item.report_data,
            attachments: item.attachments || [],
            teacher_id: item.teacher_id,
            teacher_name: item.teacher_name,
            reviewed_at: item.reviewed_at,
            feedback: item.feedback,
            comments: item.comments || [],
          };
          
          reportsMap.set(reportId, report);
        }
        
        const uniqueReports = Array.from(reportsMap.values());
        uniqueReports.sort((a, b) => 
          new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime()
        );
        
        console.log("Давхардал арилгасан тайлангууд:", uniqueReports);
        setReports(uniqueReports);
      } else if (data.resultCode === 8213) {
        setError("Хэрэглэгчийн эрх баталгаажаагүй байна. Дахин нэвтэрнэ үү.");
        setTimeout(() => {
          router.push("/login");
        }, 2000);
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

  // Тайлангийн дэлгэрэнгүй мэдээлэл татах
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
        setSelectedReport(prev => ({
          ...prev!,
          content: reportDetail.content,
          report_data: reportDetail.report_data,
          attachments: reportDetail.attachments || [],
          feedback: reportDetail.feedback,
          comments: reportDetail.comments || [],
          student_email: reportDetail.student_email || prev?.student_email || "",
          report_status: reportDetail.report_status || prev?.report_status || "Хүлээгдэж буй",
        }));
        
        if (reportDetail.feedback) {
          setCommentText(reportDetail.feedback);
        } else {
          setCommentText("");
        }
      }
    } catch (error) {
      console.error("Тайлангийн дэлгэрэнгүй ачаалахад алдаа:", error);
    }
  };

  // Коммент нэмэх функц
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

  // Тайлангийн статус шинэчлэх
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

  // Тайлан сонгох үед
  const handleSelectReport = (report: Report) => {
    setSelectedReport(report);
    setCommentText(report.feedback || "");
    fetchReportDetail(report.id);
  };

  // Баталгаажуулах боломжтой эсэх
  const canApproveOrReject = (reportStatus: string) => {
    return reportStatus === "Хүлээгдэж буй";
  };

  // Баталгаажуулах
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

  // Татгалзах
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

  // Статус badge
  const getStatusBadge = (reportStatus: string) => {
    switch(reportStatus) {
      case "Баталгаажсан":
        return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center gap-1"><FiCheckCircle /> Баталгаажсан</span>;
      case "Буцаасан":
        return <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium flex items-center gap-1"><FiXCircle /> Буцаасан</span>;
      case "Хянаж буй":
        return <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium flex items-center gap-1"><FiEye /> Хянаж буй</span>;
      case "Хүлээгдэж буй":
        return <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium flex items-center gap-1"><FiClock /> Хүлээгдэж буй</span>;
      default:
        return <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">{reportStatus}</span>;
    }
  };

  // Шүүлтүүр хийх
  const filteredReports = reports.filter(report => {
    if (filterStatus !== "all") {
      if (filterStatus === "pending" && report.report_status !== "Хүлээгдэж буй") return false;
      if (filterStatus === "approved" && report.report_status !== "Баталгаажсан") return false;
      if (filterStatus === "rejected" && report.report_status !== "Буцаасан") return false;
    }
    if (searchQuery && 
        !report.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !report.student.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !report.student_id.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !report.student_email.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  // Pagination - одоогийн хуудасны тайлангууд
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentReports = filteredReports.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredReports.length / itemsPerPage);

  // Хуудас солих функц
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      setSelectedReport(null);
    }
  };

  // Статистик тоо
  const pendingCount = reports.filter(r => r.report_status === "Хүлээгдэж буй").length;
  const approvedCount = reports.filter(r => r.report_status === "Баталгаажсан").length;
  const rejectedCount = reports.filter(r => r.report_status === "Буцаасан").length;

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
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Тайлан хянах</h1>
            <p className="text-gray-600 mt-1 flex items-center gap-2">
              <FiUser className="text-blue-600" />
              {teacherInfo?.name} - Багш
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700">
            <FiAlertCircle className="text-xl flex-shrink-0" />
            <span>{error}</span>
            <button onClick={() => setError("")} className="ml-auto text-red-500 hover:text-red-700">×</button>
          </div>
        )}

        {/* Stats Cards */}
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
                <p className="text-sm text-gray-500">Татгалзсан</p>
                <p className="text-3xl font-bold text-red-600">{rejectedCount}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <FiXCircle className="text-red-600 text-xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 mb-8">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Тайлан, оюутны нэр, ID эсвэл email-ээр хайх..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-black"
                />
              </div>
            </div>
            
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setFilterStatus("all")}
                className={`px-4 py-2 rounded-xl font-medium transition ${
                  filterStatus === "all" 
                    ? "bg-[#0f172a] text-white" 
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Бүгд ({filteredReports.length})
              </button>
              <button
                onClick={() => setFilterStatus("pending")}
                className={`px-4 py-2 rounded-xl font-medium transition ${
                  filterStatus === "pending" 
                    ? "bg-yellow-500 text-white" 
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Хүлээгдэж буй ({pendingCount})
              </button>
              <button
                onClick={() => setFilterStatus("approved")}
                className={`px-4 py-2 rounded-xl font-medium transition ${
                  filterStatus === "approved" 
                    ? "bg-green-500 text-white" 
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Баталгаажсан ({approvedCount})
              </button>
              <button
                onClick={() => setFilterStatus("rejected")}
                className={`px-4 py-2 rounded-xl font-medium transition ${
                  filterStatus === "rejected" 
                    ? "bg-red-500 text-white" 
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Татгалзсан ({rejectedCount})
              </button>
            </div>
          </div>
        </div>

        {/* Reports List and Detail */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Reports List with Pagination */}
          <div className="lg:col-span-1">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-900">
                Тайлангууд ({filteredReports.length})
              </h3>
              <span className="text-xs text-gray-500">
                {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredReports.length)} / {filteredReports.length}
              </span>
            </div>
            
            <div className="space-y-4">
              {currentReports.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 text-center">
                  <FiFileText className="text-4xl text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Тайлан байхгүй байна</p>
                </div>
              ) : (
                <>
                  {currentReports.map((report) => (
                    <motion.div
                      key={report.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={() => handleSelectReport(report)}
                      className={`bg-white rounded-2xl p-4 shadow-lg border-2 cursor-pointer transition ${
                        selectedReport?.id === report.id 
                          ? "border-blue-500" 
                          : "border-gray-100 hover:border-blue-300"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 line-clamp-2 text-base">
                            {report.title}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">{report.student}</p>
                          <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                            <FiMail className="text-xs" />
                            {report.student_email}
                          </p>
                          <p className="text-xs text-gray-400">{report.student_id}</p>
                        </div>
                        <div className="ml-2 flex-shrink-0">
                          {getStatusBadge(report.report_status)}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                        <span className="flex items-center gap-1">
                          <FiCalendar /> {new Date(report.submitted_at).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="mt-3 flex gap-2 flex-wrap">
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs">
                          {report.course}
                        </span>
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs">
                          {report.type}
                        </span>
                      </div>
                    </motion.div>
                  ))}

                  {/* Pagination Component */}
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
                            for (let i = 1; i <= totalPages; i++) {
                              pages.push(i);
                            }
                          } else {
                            if (currentPage <= 3) {
                              for (let i = 1; i <= 4; i++) pages.push(i);
                              pages.push(-1); // separator
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
                                  currentPage === page
                                    ? "bg-[#0f172a] text-white"
                                    : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
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

          {/* Right Column - Report Detail */}
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
                        <FiUser /> {selectedReport.student} ({selectedReport.student_id})
                      </span>
                      <span className="flex items-center gap-1">
                        <FiMail /> {selectedReport.student_email}
                      </span>
                      <span className="flex items-center gap-1">
                        <FiCalendar /> Илгээсэн: {new Date(selectedReport.submitted_at).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  {getStatusBadge(selectedReport.report_status)}
                </div>

                <div className="bg-gray-50 rounded-xl p-4 mb-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Хичээл</p>
                      <p className="font-medium text-gray-900">{selectedReport.course}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Тайлангийн төрөл</p>
                      <p className="font-medium text-gray-900">{selectedReport.type}</p>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3 text-lg">
                    Тайлангийн агуулга
                  </h3>
                  <div
                    onClick={() => router.push(`/teacher/reviews/${selectedReport.id}`)}
                    className="relative bg-white rounded-2xl p-5 shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300 cursor-pointer"
                  >
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-t-2xl" />
                    <div className="mt-2 space-y-3">
                      <div className="border-t border-gray-100 my-2" />
                      <div className="bg-gray-50 rounded-lg p-3 text-gray-700 max-h-[250px] overflow-y-auto text-sm leading-relaxed">
                        {selectedReport.content || "Тайлангийн дэлгэрэнгүй харах..."}
                      </div>
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
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none disabled:bg-gray-50 disabled:text-gray-500"
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
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-600">Хянасан багш:</span>
                          <span className="font-medium text-gray-900">{selectedReport.teacher_name || teacherInfo?.name || "Та"}</span>
                        </div>
                        {selectedReport.reviewed_at && (
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-600">Хянасан огноо:</span>
                            <span className="font-medium text-gray-900">{new Date(selectedReport.reviewed_at).toLocaleString()}</span>
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
    </div>
  );
}