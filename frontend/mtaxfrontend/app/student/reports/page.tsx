// app/student/my-reports/page.tsx
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
  FiFilter,
  FiUser,
  FiCalendar,
  FiArrowLeft,
  FiHome,
  FiMail,
  FiStar,
  FiMessageSquare,
  FiDownload,
  FiAlertCircle,
} from "react-icons/fi";
import { FaGraduationCap, FaChalkboardTeacher } from "react-icons/fa";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/app/component/Header";
import { API_BASE_URL } from "@/api_base_url/page";

// Интерфейсүүд
interface Report {
  id: number;
  title: string;
  type_name: string;
  type_id: number;
  status: string;
  current_status?: string;
  created_at: string;
  submitted_at: string;
  reviewed_at?: string;
  teacher_name?: string;
  teacher_email?: string;
  feedback?: string;
  report_data?: any;
  org_name?: string;
  first_name?: string;
  last_name?: string;
}

interface StudentInfo {
  id: number;
  name: string;
  first_name: string;
  last_name: string;
  email: string;
  student_id: string;
}

export default function StudentMyReportsPage() {
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [studentInfo, setStudentInfo] = useState<StudentInfo | null>(null);

  // Статусыг маппинг хийх функц
  const mapStatus = (status: string): string => {
    switch(status) {
      case "Хүлээгдэж буй":
        return "pending";
      case "Хянаж буй":
        return "reviewed";
      case "Баталгаажсан":
        return "approved";
      case "Буцаасан":
        return "rejected";
      default:
        return "pending";
    }
  };

  // Хэрэглэгчийн мэдээлэл авах
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      const userData = JSON.parse(user);
      setStudentInfo({
        id: userData.id,
        name: `${userData.last_name || ""} ${userData.first_name || ""}`,
        first_name: userData.first_name,
        last_name: userData.last_name,
        email: userData.email,
        student_id: userData.student_id || userData.id?.toString() || "",
      });
    } else {
      router.push("/login");
    }
  }, [router]);

  // Тайлангийн жагсаалт татах
  useEffect(() => {
    if (studentInfo?.id) {
      fetchMyReports();
    }
  }, [studentInfo]);

  const fetchMyReports = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_BASE_URL}/api/report/submissionlist/`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      console.log("Миний тайлангууд (жагсаалт):", data);

      if (data.resultCode === 6130 && data.data) {
        const reportList = data.data;
        
        if (reportList.length === 0) {
          setReports([]);
          setLoading(false);
          return;
        }

        // report_id-ээр бүлэглэх Map объект
        const reportsMap = new Map<number, Report>();

        for (const item of reportList) {
          const reportId = item.report_id;
          
          // Хэрэв энэ ID-тай тайлан аль хэдийн нэмэгдсэн бол цааш үргэлжлүүлэхгүй
          if (reportsMap.has(reportId)) {
            console.log(`Тайлан ${reportId} аль хэдийн нэмэгдсэн байна. Давхардахгүй.`);
            continue;
          }

          try {
            const detailResponse = await fetch(`${API_BASE_URL}/api/report/${reportId}/`, {
              method: "GET",
              credentials: "include",
              headers: {
                "Content-Type": "application/json",
              },
            });
            
            const detailData = await detailResponse.json();
            console.log(`Тайлан ${reportId} дэлгэрэнгүй:`, detailData);
            
            let report: Report;
            
            if (detailData.resultCode === 7520 && detailData.data) {
              const reportData = detailData.data;
              const mappedStatus = mapStatus(item.current_status || reportData.status || "Хүлээгдэж буй");

              report = {
                id: reportData.report_id || reportId,
                title: reportData.type_name || item.type_name || `Тайлан ${reportId}`,
                type_name: reportData.type_name || item.type_name || "Тайлан",
                type_id: reportData.type_id || item.report_type_id,
                status: mappedStatus,
                current_status: item.current_status,
                created_at: reportData.created_at || item.submission_date || new Date().toISOString(),
                submitted_at: reportData.submitted_at || item.submission_date || "",
                reviewed_at: reportData.reviewed_at,
                teacher_name: reportData.teacher_name,
                teacher_email: reportData.teacher_email,
                feedback: reportData.feedback,
                report_data: reportData.report_data,
                org_name: item.org_name,
                first_name: item.first_name,
                last_name: item.last_name,
              };
            } else {
              // Дэлгэрэнгүй мэдээлэл байхгүй бол жагсаалтын мэдээллээр үүсгэх
              const mappedStatus = mapStatus(item.current_status);
              report = {
                id: reportId,
                title: item.type_name || `Тайлан ${reportId}`,
                type_name: item.type_name || "Тайлан",
                type_id: item.report_type_id,
                status: mappedStatus,
                current_status: item.current_status,
                created_at: item.submission_date || new Date().toISOString(),
                submitted_at: item.submission_date || "",
                reviewed_at: undefined,
                teacher_name: undefined,
                teacher_email: undefined,
                feedback: undefined,
                report_data: undefined,
                org_name: item.org_name,
                first_name: item.first_name,
                last_name: item.last_name,
              };
            }
            
            // Map-д хадгалах (report_id-ээр)
            reportsMap.set(reportId, report);
            
          } catch (err) {
            console.error(`Тайлан ${reportId} дэлгэрэнгүй татахад алдаа:`, err);
            // Алдаа гарсан ч жагсаалтын мэдээллээр нэмэх
            const mappedStatus = mapStatus(item.current_status);
            const report: Report = {
              id: reportId,
              title: item.type_name || `Тайлан ${reportId}`,
              type_name: item.type_name || "Тайлан",
              type_id: item.report_type_id,
              status: mappedStatus,
              current_status: item.current_status,
              created_at: item.submission_date || new Date().toISOString(),
              submitted_at: item.submission_date || "",
              reviewed_at: undefined,
              teacher_name: undefined,
              teacher_email: undefined,
              feedback: undefined,
              report_data: undefined,
              org_name: item.org_name,
              first_name: item.first_name,
              last_name: item.last_name,
            };
            reportsMap.set(reportId, report);
          }
        }
        
        // Map-аас массив болгон хөрвүүлэх
        const uniqueReports = Array.from(reportsMap.values());
        
        // Хамгийн сүүлд илгээсэнээр эрэмбэлэх
        uniqueReports.sort((a, b) => 
          new Date(b.submitted_at || b.created_at).getTime() - 
          new Date(a.submitted_at || a.created_at).getTime()
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

  const getStatusBadge = (status: string, currentStatus?: string) => {
    const displayStatus = currentStatus || 
      (status === "pending" ? "Хүлээгдэж буй" :
       status === "reviewed" ? "Хянаж буй" :
       status === "approved" ? "Баталгаажсан" :
       status === "rejected" ? "Татгалзсан" : "Хүлээгдэж буй");
    
    switch(status) {
      case "pending":
        return (
          <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium flex items-center gap-1">
            <FiClock /> {displayStatus}
          </span>
        );
      case "reviewed":
        return (
          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium flex items-center gap-1">
            <FiEye /> {displayStatus}
          </span>
        );
      case "approved":
        return (
          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center gap-1">
            <FiCheckCircle /> {displayStatus}
          </span>
        );
      case "rejected":
        return (
          <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium flex items-center gap-1">
            <FiXCircle /> {displayStatus}
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
            {displayStatus}
          </span>
        );
    }
  };

  const filteredReports = reports.filter(report => {
    if (filterStatus !== "all" && report.status !== filterStatus) return false;
    if (searchQuery && 
        !report.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !report.type_name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !(report.org_name && report.org_name.toLowerCase().includes(searchQuery.toLowerCase()))) 
      return false;
    return true;
  });

  const pendingCount = reports.filter(r => r.status === "pending").length;
  const approvedCount = reports.filter(r => r.status === "approved").length;
  const rejectedCount = reports.filter(r => r.status === "rejected").length;
  const reviewedCount = reports.filter(r => r.status === "reviewed").length;

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
            <h1 className="text-3xl font-bold text-gray-900">Миний тайлангууд</h1>
            <p className="text-gray-600 mt-1 flex items-center gap-2">
              <FaGraduationCap className="text-blue-600" />
              {studentInfo?.name} - {studentInfo?.student_id}
            </p>
          </div>
          <Link
            href="/student/reports"
            className="mt-4 md:mt-0 inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#0f172a] to-[#1e3a8a] text-white rounded-xl font-medium hover:opacity-90 transition"
          >
            <FiFileText />
            Шинэ тайлан илгээх
          </Link>
        </div>

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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Нийт тайлан</p>
                <p className="text-3xl font-bold text-gray-900">{reports.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <FiFileText className="text-blue-600 text-xl" />
              </div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Хүлээгдэж буй</p>
                <p className="text-3xl font-bold text-yellow-600">{pendingCount}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <FiClock className="text-yellow-600 text-xl" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Баталгаажсан</p>
                <p className="text-3xl font-bold text-green-600">{approvedCount}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <FiCheckCircle className="text-green-600 text-xl" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Татгалзсан</p>
                <p className="text-3xl font-bold text-red-600">{rejectedCount}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <FiXCircle className="text-red-600 text-xl" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 mb-8">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Тайлангийн нэр, байгууллагаар хайх..."
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

        {/* Reports Grid */}
        {filteredReports.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-lg border border-gray-200">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiFileText className="text-3xl text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Тайлан байхгүй байна</h3>
            <p className="text-gray-500 mb-4">
              Та одоогоор тайлан илгээгээгүй байна. 
              Шинэ тайлан илгээхийн тулд доорх товчийг дарна уу.
            </p>
            <Link
              href="/student/reports"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#0f172a] to-[#1e3a8a] text-white rounded-xl font-medium hover:opacity-90 transition"
            >
              <FiFileText />
              Шинэ тайлан илгээх
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReports.map((report, index) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setSelectedReport(report)}
                className={`bg-white rounded-2xl p-5 shadow-lg border-2 cursor-pointer transition hover:shadow-xl ${
                  selectedReport?.id === report.id 
                    ? "border-blue-500" 
                    : "border-gray-100 hover:border-blue-300"
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-lg mb-1 line-clamp-1">
                      {report.title}
                    </h3>
                    <p className="text-sm text-gray-500">{report.type_name}</p>
                    {report.org_name && (
                      <p className="text-xs text-gray-400 mt-1">{report.org_name}</p>
                    )}
                  </div>
                  {getStatusBadge(report.status, report.current_status)}
                </div>
                
                <div className="space-y-2 mt-3">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <FiCalendar className="text-gray-400" />
                    <span>Илгээсэн: {new Date(report.submitted_at || report.created_at).toLocaleDateString()}</span>
                  </div>
                  
                  {report.status !== "pending" && report.teacher_name && (
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <FaChalkboardTeacher className="text-gray-400" />
                      <span>Багш: {report.teacher_name}</span>
                    </div>
                  )}
                  
                  {report.status === "approved" && (
                    <div className="flex items-center gap-2 text-xs text-green-600">
                      <FiCheckCircle />
                      <span>Баталгаажсан</span>
                    </div>
                  )}
                  
                  {report.status === "rejected" && report.feedback && (
                    <div className="flex items-start gap-2 text-xs text-red-600">
                      <FiMessageSquare className="mt-0.5" />
                      <span className="line-clamp-2">{report.feedback}</span>
                    </div>
                  )}
                </div>
                
                <div className="mt-4 pt-3 border-t border-gray-100">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedReport(report);
                    }}
                    className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center justify-center gap-1"
                  >
                    <FiEye />
                    Дэлгэрэнгүй харах
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Report Detail Modal */}
        {selectedReport && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedReport(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedReport.title}</h2>
                    <p className="text-gray-500 mt-1">{selectedReport.type_name}</p>
                    {selectedReport.org_name && (
                      <p className="text-sm text-gray-500 mt-1">Байгууллага: {selectedReport.org_name}</p>
                    )}
                  </div>
                  <button
                    onClick={() => setSelectedReport(null)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition"
                  >
                    <FiXCircle className="text-gray-500 text-xl" />
                  </button>
                </div>
              </div>
              
              {/* Modal Content */}
              <div className="p-6 space-y-6">
                {/* Status */}
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                  <span className="text-gray-600">Статус:</span>
                  {getStatusBadge(selectedReport.status, selectedReport.current_status)}
                </div>
                
                {/* Dates */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-xs text-gray-500 mb-1">Илгээсэн огноо</p>
                    <p className="font-medium text-gray-900">
                      {new Date(selectedReport.submitted_at || selectedReport.created_at).toLocaleString()}
                    </p>
                  </div>
                  {selectedReport.reviewed_at && (
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <p className="text-xs text-gray-500 mb-1">Хянасан огноо</p>
                      <p className="font-medium text-gray-900">
                        {new Date(selectedReport.reviewed_at).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
                
                {/* Teacher Info */}
                {selectedReport.teacher_name && (
                  <div className="p-4 bg-blue-50 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <FaChalkboardTeacher className="text-blue-600" />
                      <h3 className="font-semibold text-gray-900">Хянасан багш</h3>
                    </div>
                    <p className="text-gray-700">{selectedReport.teacher_name}</p>
                    {selectedReport.teacher_email && (
                      <p className="text-sm text-gray-500 mt-1">{selectedReport.teacher_email}</p>
                    )}
                  </div>
                )}
                
                {/* Feedback */}
                {selectedReport.feedback && (
                  <div className={`p-4 rounded-xl ${
                    selectedReport.status === "approved" ? "bg-green-50" : "bg-red-50"
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                      <FiMessageSquare className={selectedReport.status === "approved" ? "text-green-600" : "text-red-600"} />
                      <h3 className="font-semibold text-gray-900">Багшийн сэтгэгдэл</h3>
                    </div>
                    <p className="text-gray-700 whitespace-pre-wrap">{selectedReport.feedback}</p>
                  </div>
                )}
                
                {/* Report Data */}
                {selectedReport.report_data && Object.keys(selectedReport.report_data).length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Тайлангийн мэдээлэл</h3>
                    <div className="bg-gray-50 rounded-xl p-4 max-h-[300px] overflow-y-auto">
                      <div className="space-y-2">
                        {Object.entries(selectedReport.report_data)
                          .sort(([a], [b]) => parseInt(a) - parseInt(b))
                          .map(([key, value]) => (
                            <div key={key} className="flex justify-between items-center border-b border-gray-200 py-2">
                              <span className="text-sm font-medium text-gray-600">Мөр {key}</span>
                              <span className="text-sm text-gray-900">{Number(value).toLocaleString()} ₮</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  {selectedReport.status === "rejected" && (
                    <Link
                      href={`/student/tax-report/${selectedReport.id}`}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition text-center"
                    >
                      Засварлах
                    </Link>
                  )}
                  <button
                    onClick={() => setSelectedReport(null)}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition"
                  >
                    Хаах
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}