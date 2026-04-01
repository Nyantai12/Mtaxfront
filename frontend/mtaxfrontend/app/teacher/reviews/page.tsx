// app/teacher/review/page.tsx
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FiFileText,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiDownload,
  FiEye,
  FiSearch,
  FiFilter,
  FiStar,
  FiMessageSquare,
  FiArrowLeft,
  FiUser,
  FiCalendar,
  FiPaperclip,
  FiAlertCircle,
  FiMail,
} from "react-icons/fi";
import { FaChalkboardTeacher } from "react-icons/fa";
import Link from "next/link";
import Header from "@/app/component/Header";
import { useRouter } from "next/navigation";

// Интерфейсүүд
interface Report {
  id: number;
  title: string;
  student: string;
  student_id: string;
  student_name: string;
  student_email: string;
  type: string;
  type_name?: string;
  type_id?: number;
  course?: string;
  submitted_at: string;
  report_status: string;  // API-аас ирэх статус
  status: string;  // Фронтенд ашиглах статус
  content?: string;
  report_data?: any;
  attachments?: string[];
  teacher_id?: number;
  teacher_name?: string;
  reviewed_at?: string;
  feedback?: string;
}

interface TeacherInfo {
  id: number;
  name: string;
  first_name: string;
  last_name: string;
  email: string;
  department?: string;
}

interface TeacherReportListItem {
  report_id: number;
  email: string;
  student_email?: string;
  student_name?: string;
}

// API статусыг фронтенд статус руу хөрвүүлэх
const mapApiStatusToFrontend = (apiStatus: string): string => {
  switch(apiStatus) {
    case "Баталгаажсан":
      return "approved";
    case "Буцаасан":
      return "rejected";
    case "Хянаж буй":
      return "reviewed";
    case "Хүлээн авсан":
      return "pending";
    default:
      return "pending";
  }
};

// Фронтенд статусыг API статус руу хөрвүүлэх
const mapStatusToApiFormat = (status: string): string => {
  switch(status) {
    case "approved":
      return "Баталгаажсан";
    case "rejected":
      return "Буцаасан";
    case "reviewed":
      return "Хянаж буй";
    default:
      return "Хүлээн авсан";
  }
};

export default function TeacherReviewPage() {
  const router = useRouter();
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingReports, setLoadingReports] = useState(false);
  const [error, setError] = useState("");
  const [teacherInfo, setTeacherInfo] = useState<TeacherInfo | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");

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

  const fetchReports = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:8000/api/report/teacherreportlist/", {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      console.log("Тайлангийн жагсаалт (teacherreportlist):", data);

      if (data.resultCode === 7640 && data.data) {
        const reportList: TeacherReportListItem[] = data.data;
        
        if (reportList.length === 0) {
          setReports([]);
          setLoading(false);
          return;
        }

        setLoadingReports(true);
        const detailedReports: Report[] = [];
        
        for (const item of reportList) {
          try {
            const detailResponse = await fetch(`http://localhost:8000/api/report/${item.report_id}/`, {
              method: "GET",
              credentials: "include",
              headers: {
                "Content-Type": "application/json",
              },
            });
            
            const detailData = await detailResponse.json();
            console.log(`Тайлан ${item.report_id} дэлгэрэнгүй:`, detailData);
            
            if (detailData.resultCode === 7520 && detailData.data) {
              const report = detailData.data;
              // API-аас ирсэн report_status-г ашиглах
              const apiStatus = report.report_status || report.status || "Хүлээн авсан";
              const frontendStatus = mapApiStatusToFrontend(apiStatus);
              
              detailedReports.push({
                id: report.report_id || item.report_id,
                title: report.type_name || `Тайлан ${item.report_id}`,
                student: report.student_name || report.student_full_name || "Оюутан",
                student_id: report.student_id?.toString() || "",
                student_name: report.student_name || "",
                student_email: report.student_email || item.email || item.student_email || "",
                type: report.type_name || "Тайлан",
                type_name: report.type_name,
                type_id: report.type_id,
                course: report.course_name || "Хичээл",
                submitted_at: report.created_at || report.submitted_at || new Date().toISOString(),
                report_status: apiStatus,  // API-аас ирсэн анхны статус
                status: frontendStatus,    // Фронтенд ашиглах статус
                content: report.content,
                report_data: report.report_data,
                attachments: report.attachments || [],
                teacher_id: report.teacher_id,
                teacher_name: report.teacher_name,
                reviewed_at: report.reviewed_at,
                feedback: report.feedback,
              });
            } else {
              detailedReports.push({
                id: item.report_id,
                title: `Тайлан ${item.report_id}`,
                student: "Оюутан",
                student_id: "",
                student_name: "",
                student_email: item.email || "",
                type: "Тайлан",
                type_name: "Тайлан",
                course: "Хичээл",
                submitted_at: new Date().toISOString(),
                report_status: "Хүлээн авсан",
                status: "pending",
                report_data: null,
                attachments: [],
              });
            }
          } catch (err) {
            console.error(`Тайлан ${item.report_id} дэлгэрэнгүй татахад алдаа:`, err);
            detailedReports.push({
              id: item.report_id,
              title: `Тайлан ${item.report_id}`,
              student: "Оюутан",
              student_id: "",
              student_name: "",
              student_email: item.email || "",
              type: "Тайлан",
              type_name: "Тайлан",
              course: "Хичээл",
              submitted_at: new Date().toISOString(),
              report_status: "Хүлээн авсан",
              status: "pending",
              report_data: null,
              attachments: [],
            });
          }
        }
        
        setReports(detailedReports);
        setLoadingReports(false);
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
      const response = await fetch(`http://localhost:8000/api/report/${reportId}/`, {
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
          student_email: reportDetail.student_email || prev?.student_email || "",
          report_status: reportDetail.report_status || prev?.report_status || "Хүлээн авсан",
        }));
        
        if (reportDetail.feedback) {
          setFeedbackText(reportDetail.feedback);
        }
      }
    } catch (error) {
      console.error("Тайлангийн дэлгэрэнгүй ачаалахад алдаа:", error);
    }
  };

  // Тайлан сонгох үед
  const handleSelectReport = (report: Report) => {
    setSelectedReport(report);
    setFeedbackText(report.feedback || "");
    fetchReportDetail(report.id);
  };

  // Тайлан баталгаажуулах / татгалзах
  const updateReportStatus = async (reportId: number, status: string, feedback: string) => {
    const apiStatus = mapStatusToApiFormat(status);
    const requestBody = {
      report_status: apiStatus,
      feedback: feedback,
    };
    
    console.log(`Илгээж буй өгөгдөл:`, requestBody);
    
    const response = await fetch(`http://localhost:8000/api/report/teachereditreportstatus/${reportId}/`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();
    console.log("Статус шинэчлэх хариу:", data);
    return data;
  };

  // Тайлан баталгаажуулах
  const handleApprove = async () => {
    if (!selectedReport) return;
    
    setSubmitting(true);
    try {
      const data = await updateReportStatus(selectedReport.id, "approved", feedbackText);
      
      if (data.resultCode === 6150) {
        const updatedReports = reports.map(r => 
          r.id === selectedReport.id 
            ? { 
                ...r, 
                status: "approved", 
                report_status: "Баталгаажсан",
                feedback: feedbackText, 
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
            feedback: feedbackText, 
            reviewed_at: new Date().toISOString(), 
            teacher_name: teacherInfo?.name 
          } : null
        );
        
        showNotification("Тайлан амжилттай баталгаажууллаа.", "success");
      } else {
        let errorMessage = "Баталгаажуулахад алдаа гарлаа";
        if (data.resultCode === 6151) errorMessage = "Буруу хүсэлт";
        if (data.resultCode === 6152) errorMessage = "Өгөгдлийн сангийн алдаа";
        if (data.resultCode === 6153) errorMessage = "Серверийн алдаа";
        if (data.resultCode === 6154) errorMessage = "Буруу хүсэлтийн метод";
        if (data.resultCode === 6155) errorMessage = "JSON формат алдаатай";
        if (data.resultCode === 6156) errorMessage = "report_status параметр байхгүй";
        if (data.resultCode === 8213) errorMessage = "Хэрэглэгчийн эрх баталгаажаагүй байна";
        
        setError(errorMessage);
      }
    } catch (error) {
      console.error("Баталгаажуулахад алдаа:", error);
      setError("Сервертэй холбогдоход алдаа гарлаа");
    } finally {
      setSubmitting(false);
    }
  };

  // Тайлан татгалзах
  const handleReject = async () => {
    if (!selectedReport) return;
    
    if (!feedbackText.trim()) {
      setError("Татгалзах шалтгааныг бичнэ үү");
      return;
    }
    
    setSubmitting(true);
    try {
      const data = await updateReportStatus(selectedReport.id, "rejected", feedbackText);
      
      if (data.resultCode === 6150) {
        const updatedReports = reports.map(r => 
          r.id === selectedReport.id 
            ? { 
                ...r, 
                status: "rejected", 
                report_status: "Буцаасан",
                feedback: feedbackText, 
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
            feedback: feedbackText, 
            reviewed_at: new Date().toISOString(), 
            teacher_name: teacherInfo?.name 
          } : null
        );
        
        showNotification("Тайлан татгалзлаа.", "error");
      } else {
        let errorMessage = "Татгалзахад алдаа гарлаа";
        if (data.resultCode === 6151) errorMessage = "Буруу хүсэлт";
        if (data.resultCode === 6152) errorMessage = "Өгөгдлийн сангийн алдаа";
        if (data.resultCode === 6153) errorMessage = "Серверийн алдаа";
        if (data.resultCode === 6154) errorMessage = "Буруу хүсэлтийн метод";
        if (data.resultCode === 6155) errorMessage = "JSON формат алдаатай";
        if (data.resultCode === 6156) errorMessage = "report_status параметр байхгүй";
        if (data.resultCode === 8213) errorMessage = "Хэрэглэгчийн эрх баталгаажаагүй байна";
        
        setError(errorMessage);
      }
    } catch (error) {
      console.error("Татгалзахад алдаа:", error);
      setError("Сервертэй холбогдоход алдаа гарлаа");
    } finally {
      setSubmitting(false);
    }
  };

  const showNotification = (message: string, type: "success" | "error") => {
    const bgColor = type === "success" ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200";
    const textColor = type === "success" ? "text-green-800" : "text-red-800";
    const iconColor = type === "success" ? "text-green-600" : "text-red-600";
    const icon = type === "success" 
      ? '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>'
      : '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>';
    
    const notificationDiv = document.createElement("div");
    notificationDiv.className = "fixed top-4 right-4 z-50 animate-slide-in";
    notificationDiv.innerHTML = `
      <div class="${bgColor} border rounded-xl p-4 shadow-lg">
        <div class="flex items-center gap-3">
          <div class="${iconColor}">${icon}</div>
          <div>
            <p class="${textColor} font-medium">${message}</p>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(notificationDiv);
    setTimeout(() => notificationDiv.remove(), 3000);
  };

  const getStatusBadge = (status: string, reportStatus?: string) => {
    // Хэрэв reportStatus байвал түүнийг харуулах
    const displayStatus = reportStatus || 
      (status === "approved" ? "Баталгаажсан" :
       status === "rejected" ? "Буцаасан" :
       status === "reviewed" ? "Хянаж буй" :
       status === "pending" ? "Хүлээгдэж буй" : "Хүлээгдэж буй");
    
    switch(status) {
      case "pending":
        return <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium flex items-center gap-1"><FiClock /> {displayStatus}</span>;
      case "reviewed":
        return <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium flex items-center gap-1"><FiEye /> {displayStatus}</span>;
      case "approved":
        return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center gap-1"><FiCheckCircle /> {displayStatus}</span>;
      case "rejected":
        return <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium flex items-center gap-1"><FiXCircle /> {displayStatus}</span>;
      default:
        return <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">{displayStatus}</span>;
    }
  };

  const filteredReports = reports.filter(report => {
    if (filterStatus !== "all" && report.status !== filterStatus) return false;
    if (searchQuery && !report.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !report.student.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !report.student_id.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !report.student_email.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const pendingCount = reports.filter(r => r.status === "pending").length;
  const approvedCount = reports.filter(r => r.status === "approved").length;
  const rejectedCount = reports.filter(r => r.status === "rejected").length;

  if (loading || loadingReports) {
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
        
        {/* Error Message */}
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
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setFilterStatus("all")}
                className={`px-4 py-2 rounded-xl font-medium transition ${
                  filterStatus === "all" 
                    ? "bg-[#0f172a] text-white" 
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Бүгд ({reports.length})
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
          {/* Left Column - Reports List */}
          <div className="lg:col-span-1 space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-900">Тайлангууд ({filteredReports.length})</h3>
            </div>
            
            {filteredReports.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center">
                <FiFileText className="text-4xl text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Тайлан байхгүй байна</p>
              </div>
            ) : (
              filteredReports.map((report) => (
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
                    <div>
                      <h3 className="font-semibold text-gray-900 line-clamp-1">{report.title}</h3>
                      <p className="text-sm text-gray-600">{report.student}</p>
                      <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                        <FiMail className="text-xs" />
                        {report.student_email}
                      </p>
                      <p className="text-xs text-gray-400">{report.student_id}</p>
                    </div>
                    {getStatusBadge(report.status, report.report_status)}
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <FiCalendar /> {new Date(report.submitted_at).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="mt-3 flex gap-2">
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs">
                      {report.course}
                    </span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs">
                      {report.type}
                    </span>
                  </div>
                </motion.div>
              ))
            )}
          </div>

          {/* Right Column - Report Detail */}
          <div className="lg:col-span-2">
            {selectedReport ? (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-2xl p-6 shadow-xl border border-gray-200"
              >
                {/* Report Header */}
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedReport.title}</h2>
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
                  {getStatusBadge(selectedReport.status, selectedReport.report_status)}
                </div>

                {/* Course Info */}
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

                {/* Report Content */}
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3 text-lg">
                    Тайлангийн агуулга
                  </h3>
                  <div
                    onClick={() => router.push(`/teacher/reviews/${selectedReport.id}`)}
                    className="relative bg-white rounded-2xl p-5 shadow-md border border-gray-100 
                              hover:shadow-lg transition-all duration-300 cursor-pointer"
                  >
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r 
                                    from-indigo-500 via-purple-500 to-pink-500 rounded-t-2xl" />

                    <div className="mt-2 space-y-3">
                      <h3 className="text-xl font-semibold text-gray-900 line-clamp-2">
                        {selectedReport.title}
                      </h3>

                      <div className="border-t border-gray-100 my-2" />

                      <div className="bg-gray-50 rounded-lg p-3 text-gray-700 max-h-[250px] overflow-y-auto text-sm leading-relaxed">
                        {selectedReport.content || "Тайлангийн дэлгэрэнгүй харах..."}
                      </div>
                    </div>
                  </div>    
                </div>    

                {/* Review Section */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Тайланд хариу өгөх</h3>
                  
                  {/* Feedback Input */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FiMessageSquare className="inline mr-2" />
                      Санал шүүмж
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Оюутанд хандаж санал шүүмжээ бичнэ үү..."
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      disabled={selectedReport.status !== "pending" || submitting}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>

                  {/* Action Buttons */}
                  {selectedReport.status === "pending" && (
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

                  {/* Review Info for reviewed reports */}
                  {selectedReport.status !== "pending" && selectedReport.feedback && (
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
                          <p className="text-sm text-gray-700">{selectedReport.feedback}</p>
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