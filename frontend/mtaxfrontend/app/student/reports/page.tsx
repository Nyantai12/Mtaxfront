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
  FiCalendar,
  FiMessageSquare,
  FiAlertCircle,
  FiChevronLeft,
  FiChevronRight,
  FiHome,
} from "react-icons/fi";
import { FaGraduationCap, FaChalkboardTeacher } from "react-icons/fa";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/app/component/Header";
import { API_BASE_URL } from "@/api_base_url/page";

interface Report {
  id: number;
  report_name: string;
  type_name: string;
  type_id: number;
  status: string;
  current_status?: string;
  created_at: string;
  submission_date: string;
  reviewed_at?: string;
  teacher_name?: string;
  teacher_email?: string;
  teacher_comment?: string;
  feedback?: string;
  report_data?: any;
  org_name?: string;
  org_id?: number;
  first_name?: string;
  last_name?: string;
  quarter?: number;
  report_year?: number;
}

interface StudentInfo {
  id: number;
  name: string;
  first_name: string;
  last_name: string;
  email: string;
  student_id: string;
}

interface Pagination {
  currentPage: number;
  itemsPerPage: number;
  totalPages: number;
  totalItems: number;
}

const getQuarterLabel = (quarter: number) => {
  const quarters = [
    { value: 1, label: "1-р улирал", period: "1-3 сар" },
    { value: 2, label: "2-р улирал", period: "4-6 сар" },
    { value: 3, label: "3-р улирал", period: "7-9 сар" },
    { value: 4, label: "4-р улирал", period: "10-12 сар" },
  ];
  const q = quarters.find(q => q.value === quarter);
  return q ? q.label : `${quarter}-р улирал`;
};

export default function StudentMyReportsPage() {
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterQuarter, setFilterQuarter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [studentInfo, setStudentInfo] = useState<StudentInfo | null>(null);
  
  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    itemsPerPage: 6,
    totalPages: 1,
    totalItems: 0,
  });

  

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
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();

      if (data.resultCode === 6130 && data.data) {
        const reportList = data.data;
        
        if (reportList.length === 0) {
          setReports([]);
          setLoading(false);
          return;
        }

        const reportsMap = new Map<number, Report>();

        for (const item of reportList) {
          const reportId = item.report_id;
          
          if (reportsMap.has(reportId)) continue;

          try {
            const detailResponse = await fetch(`${API_BASE_URL}/api/report/${reportId}/`, {
              method: "GET",
              credentials: "include",
              headers: { "Content-Type": "application/json" },
            });
            
            const detailData = await detailResponse.json();
            
            let report: Report;
            
            if (detailData.resultCode === 7520 && detailData.data) {
              const reportData = detailData.data;
              const mappedStatus = mapStatus(item.current_status || reportData.status || "Хүлээгдэж буй");

              report = {
                id: reportData.report_id || reportId,
                report_name: reportData.report_name || item.type_name || `Тайлан (${reportData.report_id || reportId})`,
                type_name: reportData.type_name || item.type_name || "Тайлан",
                type_id: reportData.type_id || item.report_type_id,
                status: mappedStatus,
                current_status: item.current_status,
                created_at: reportData.created_at || item.submission_date || new Date().toISOString(),
                submission_date: reportData.submission_date || item.submission_date || "",
                reviewed_at: reportData.reviewed_at,
                teacher_name: reportData.teacher_name || item.teacher_name,
                teacher_email: reportData.teacher_email,
                teacher_comment: reportData.teacher_comment || item.teacher_comment,
                feedback: reportData.feedback,
                report_data: reportData.report_data,
                org_name: item.org_name,
                org_id: item.org_id,
                first_name: item.first_name,
                last_name: item.last_name,
                quarter: reportData.quarter || item.quarter || 1,
                report_year: reportData.report_year || item.report_year || new Date().getFullYear(),
              };
            } else {
              const mappedStatus = mapStatus(item.current_status);
              report = {
                id: reportId,
                report_name: item.type_name,
                type_name: item.type_name || "Тайлан",
                type_id: item.report_type_id,
                status: mappedStatus,
                current_status: item.current_status,
                created_at: item.submission_date || new Date().toISOString(),
                submission_date: item.submission_date || "",
                reviewed_at: undefined,
                teacher_name: item.teacher_name,
                teacher_email: undefined,
                teacher_comment: item.teacher_comment,
                feedback: undefined,
                report_data: undefined,
                org_name: item.org_name,
                org_id: item.org_id,
                first_name: item.first_name,
                last_name: item.last_name,
                quarter: item.quarter || 1,
                report_year: item.report_year || new Date().getFullYear(),
              };
            }
            
            reportsMap.set(reportId, report);
            
          } catch {
            const mappedStatus = mapStatus(item.current_status);
            const report: Report = {
              id: reportId,
              report_name: item.type_name,
              type_name: item.type_name || "Тайлан",
              type_id: item.report_type_id,
              status: mappedStatus,
              current_status: item.current_status,
              created_at: item.submission_date || new Date().toISOString(),
              submission_date: item.submission_date || "",
              reviewed_at: undefined,
              teacher_name: item.teacher_name,
              teacher_email: undefined,
              teacher_comment: item.teacher_comment,
              feedback: undefined,
              report_data: undefined,
              org_name: item.org_name,
              org_id: item.org_id,
              first_name: item.first_name,
              last_name: item.last_name,
              quarter: item.quarter || 1,
              report_year: item.report_year || new Date().getFullYear(),
            };
            reportsMap.set(reportId, report);
          }
        }
        
        const uniqueReports = Array.from(reportsMap.values());
        
        uniqueReports.sort((a, b) => 
          new Date(b.submission_date || b.created_at).getTime() - 
          new Date(a.submission_date || a.created_at).getTime()
        );
        
        setReports(uniqueReports);
        
        setPagination(prev => ({
          ...prev,
          totalItems: uniqueReports.length,
          totalPages: Math.ceil(uniqueReports.length / prev.itemsPerPage),
          currentPage: 1,
        }));
        
      } else if (data.resultCode === 8213) {
        setError("Хэрэглэгчийн эрх баталгаажаагүй байна. Дахин нэвтэрнэ үү.");
        setTimeout(() => router.push("/login"), 2000);
      } else {
        setError(data.resultMessage || "Тайлан ачаалахад алдаа гарлаа");
      }
    } catch {
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
       status === "rejected" ? "Буцаасан" : "Хүлээгдэж буй");
    
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

  const getFilteredReports = () => {
    return reports.filter(report => {
      if (filterStatus !== "all" && report.status !== filterStatus) return false;
      if (filterQuarter !== "all" && report.quarter !== parseInt(filterQuarter)) return false;
      if (searchQuery && 
          !report.report_name.toLowerCase().includes(searchQuery.toLowerCase()) && 
          !report.type_name.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !(report.org_name && report.org_name.toLowerCase().includes(searchQuery.toLowerCase()))) 
        return false;
      return true;
    });
  };

  const filteredReports = getFilteredReports();
  
  const getPaginatedReports = () => {
    const startIndex = (pagination.currentPage - 1) * pagination.itemsPerPage;
    const endIndex = startIndex + pagination.itemsPerPage;
    return filteredReports.slice(startIndex, endIndex);
  };

  const paginatedReports = getPaginatedReports();
  
  useEffect(() => {
    setPagination(prev => ({
      ...prev,
      totalItems: filteredReports.length,
      totalPages: Math.ceil(filteredReports.length / prev.itemsPerPage),
      currentPage: 1,
    }));
  }, [filterStatus, filterQuarter, searchQuery, reports.length]);

  const goToPage = (page: number) => {
    if (page < 1 || page > pagination.totalPages) return;
    setPagination(prev => ({ ...prev, currentPage: page }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goToReportDetail = (reportId: number, orgId?: number) => {
    if (orgId) {
      router.push(`/student/reports/view/${reportId}?org_id=${orgId}`);
    } else {
      router.push(`/student/reports/view/${reportId}`);
    }
  };

  const quarterCounts = {
    1: reports.filter(r => r.quarter === 1).length,
    2: reports.filter(r => r.quarter === 2).length,
    3: reports.filter(r => r.quarter === 3).length,
    4: reports.filter(r => r.quarter === 4).length,
  };

  const pendingCount = reports.filter(r => r.status === "pending").length;
  const approvedCount = reports.filter(r => r.status === "approved").length;
  const rejectedCount = reports.filter(r => r.status === "rejected").length;

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
            <h1 className="text-3xl font-bold text-gray-900">Миний тайлангууд</h1>
            <p className="text-gray-600 mt-1 flex items-center gap-2">
              <FaGraduationCap className="text-blue-600" />
              {studentInfo?.name} - {studentInfo?.student_id}
            </p>
          </div>
          <Link
            href="/student/select-organization/"
            className="mt-4 md:mt-0 inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#0f172a] to-[#1e3a8a] text-white rounded-xl font-medium hover:opacity-90 transition"
          >
            <FiFileText />
            Шинэ тайлан илгээх
          </Link>
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
                <p className="text-sm text-gray-500">Буцаасан</p>
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
          </div>
          
          {/* Status Filter Buttons */}
          <div className="flex gap-2 flex-wrap mt-4">
            <button
              onClick={() => setFilterStatus("all")}
              className={`px-4 py-2 rounded-xl font-medium transition ${
                filterStatus === "all" ? "bg-[#0f172a] text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Бүгд ({reports.length})
            </button>
            <button
              onClick={() => setFilterStatus("pending")}
              className={`px-4 py-2 rounded-xl font-medium transition ${
                filterStatus === "pending" ? "bg-yellow-500 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Хүлээгдэж буй ({pendingCount})
            </button>
            <button
              onClick={() => setFilterStatus("approved")}
              className={`px-4 py-2 rounded-xl font-medium transition ${
                filterStatus === "approved" ? "bg-green-500 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Баталгаажсан ({approvedCount})
            </button>
            <button
              onClick={() => setFilterStatus("rejected")}
              className={`px-4 py-2 rounded-xl font-medium transition ${
                filterStatus === "rejected" ? "bg-red-500 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Буцаасан ({rejectedCount})
            </button>
          </div>
          
          
        </div>

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
              href="/student/select-organization"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#0f172a] to-[#1e3a8a] text-white rounded-xl font-medium hover:opacity-90 transition"
            >
              <FiFileText />
              Шинэ тайлан илгээх
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedReports.map((report, index) => (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-2xl p-5 shadow-lg border-2 border-gray-100 hover:border-blue-300 hover:shadow-xl transition cursor-pointer"
                  onClick={() => goToReportDetail(report.id, report.org_id)}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-lg mb-1 line-clamp-1">
                        {report.report_name}
                      </h3>
                      {report.org_name && (
                        <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                          <FiHome className="text-xs" /> {report.org_name}
                        </p>
                      )}
                      <p className="text-xs text-purple-500 flex items-center gap-1 mt-1">
                        <FiCalendar className="text-xs" /> {getQuarterLabel(report.quarter || 1)} / {report.report_year}
                      </p>
                    </div>
                    {getStatusBadge(report.status, report.current_status)}
                  </div>
                  
                  <div className="space-y-2 mt-3">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <FiCalendar className="text-gray-400" />
                      <span>Илгээсэн: {new Date(report.submission_date || report.created_at).toLocaleDateString()}</span>
                    </div>
                    
                    {report.status !== "pending" && report.teacher_name && (
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <FaChalkboardTeacher className="text-gray-400" />
                        <span>Багш: {report.teacher_name}</span>
                      </div>
                    )}
                    
                    {report.status === "approved" && report.teacher_comment && (
                      <div className="flex items-start gap-2 text-xs text-green-600">
                        <FiCheckCircle className="mt-0.5 flex-shrink-0" />
                        <span className="line-clamp-2">{report.teacher_comment}</span>
                      </div>
                    )}
                    
                    {report.status === "rejected" && report.teacher_comment && (
                      <div className="flex items-start gap-2 text-xs text-red-600">
                        <FiMessageSquare className="mt-0.5 flex-shrink-0" />
                        <span className="line-clamp-2">{report.teacher_comment}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <div className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center justify-center gap-1">
                      <FiEye />
                      Дэлгэрэнгүй харах
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            
            {pagination.totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <button
                  onClick={() => goToPage(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className={`p-2 rounded-xl transition ${
                    pagination.currentPage === 1
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <FiChevronLeft className="text-lg" />
                </button>
                
                <div className="flex gap-1">
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => {
                    if (pagination.totalPages > 7) {
                      if (page === 1 || page === pagination.totalPages || 
                          (page >= pagination.currentPage - 1 && page <= pagination.currentPage + 1)) {
                        return (
                          <button
                            key={page}
                            onClick={() => goToPage(page)}
                            className={`w-10 h-10 rounded-xl font-medium transition ${
                              pagination.currentPage === page
                                ? "bg-gradient-to-r from-[#0f172a] to-[#1e3a8a] text-white"
                                : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                            }`}
                          >
                            {page}
                          </button>
                        );
                      } else if (page === pagination.currentPage - 2 || page === pagination.currentPage + 2) {
                        return <span key={page} className="w-10 h-10 flex items-center justify-center text-gray-400">...</span>;
                      }
                      return null;
                    }
                    
                    return (
                      <button
                        key={page}
                        onClick={() => goToPage(page)}
                        className={`w-10 h-10 rounded-xl font-medium transition ${
                          pagination.currentPage === page
                            ? "bg-gradient-to-r from-[#0f172a] to-[#1e3a8a] text-white"
                            : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => goToPage(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className={`p-2 rounded-xl transition ${
                    pagination.currentPage === pagination.totalPages
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <FiChevronRight className="text-lg" />
                </button>
              </div>
            )}
            
            <div className="text-center text-sm text-gray-500 mt-4">
              {filteredReports.length} -ийн {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} -{" "}
              {Math.min(pagination.currentPage * pagination.itemsPerPage, filteredReports.length)} -г харуулж байна
            </div>
          </>
        )}
      </div>
    </div>
  );
}