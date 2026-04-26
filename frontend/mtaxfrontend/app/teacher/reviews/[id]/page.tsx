// app/teacher/report/[id]/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  FiArrowLeft,
  FiHome,
  FiFileText,
  FiCalendar,
  FiMail,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiMessageSquare,
  FiPrinter,
  FiAlertCircle,
  FiBriefcase,
  FiUser,
  FiSend,
} from "react-icons/fi";
import { FaGraduationCap, FaChalkboardTeacher, FaUser } from "react-icons/fa";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import Header from "@/app/component/Header";
import { API_BASE_URL } from "@/api_base_url/page";

interface StudentInfo {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
}

interface OrganizationInfo {
  org_id: number;
  org_name: string;
}

interface Comment {
  id?: number;
  user_id?: number;
  email: string;
  first_name: string;
  last_name?: string;
  comment_text: string;
  created_at: string;
  user_role?: string;
}

interface ReportInfo {
  id: number;
  report_name: string;
  created_at: string;
  updated_at: string;
  submitted_at?: string;
  current_status: string;
  student: StudentInfo;
  organization?: OrganizationInfo;
  feedback?: string;
  reviewed_at?: string;
  teacher_name?: string;
}

// Render fields recursively from backend structure
const RenderFields = ({ fields, level = 0 }: { fields: any[]; level?: number }) => {
  if (!fields || fields.length === 0) return null;

  return (
    <>
      {fields.map((field) => (
        <div key={field.id}>
          <div className={`grid grid-cols-12 gap-4 p-3 ${field.isCalculated ? "bg-blue-50" : ""} border-b border-gray-200`}>
            <div className="col-span-1 font-medium text-gray-700 text-center">
              {field.id}
            </div>
            <div className="col-span-8">
              <div className="text-sm text-gray-900" style={{ paddingLeft: `${level * 20}px` }}>
                {field.label}
                {field.isCalculated && field.calculationRule && (
                  <span className="ml-2 text-xs text-blue-600">
                    (Томьёо: {field.calculationRule})
                  </span>
                )}
              </div>
            </div>
            <div className="col-span-3">
              <div className={`w-full px-3 py-2 border border-gray-200 rounded-lg text-right font-medium ${
                field.isCalculated ? "bg-blue-100/50 text-blue-800" : "bg-gray-50 text-gray-900"
              }`}>
                {field.result || "0.00 ₮"}
              </div>
            </div>
          </div>
          {field.children && field.children.length > 0 && (
            <RenderFields fields={field.children} level={level + 1} />
          )}
        </div>
      ))}
    </>
  );
};

export default function TeacherReportViewPage() {
  const router = useRouter();
  const params = useParams();
  const reportId = params.id as string;
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<ReportInfo | null>(null);
  const [sections, setSections] = useState<any[]>([]);
  const [teacherName, setTeacherName] = useState<string>("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isSendingComment, setIsSendingComment] = useState(false);
  const [userInfo, setUserInfo] = useState<{ id: number; first_name: string; last_name: string; email: string; role: string } | null>(null);
  
  const commentInputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      const userData = JSON.parse(user);
      setUserInfo({
        id: userData.id,
        first_name: userData.first_name || "",
        last_name: userData.last_name || "",
        email: userData.email || "",
        role: userData.role || "teacher",
      });
      setTeacherName(`${userData.last_name || ""} ${userData.first_name || ""}`);
    }
  }, []);

  useEffect(() => {
    if (reportId) {
      fetchReportData();
      fetchComments();
    }
  }, [reportId]);

  const fetchComments = async () => {
    setIsLoadingComments(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/comment/reportcommentlist/${reportId}/`, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" }
      });
      const data = await response.json();
      console.log("Comments data:", data);
      
      if (data.resultCode === 9050 && data.data) {
        setComments(data.data);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setIsLoadingComments(false);
    }
  };

  const sendComment = async () => {
    const commentText = commentInputRef.current?.value || "";
    
    if (!commentText.trim()) {
      setError("Сэтгэгдэл бичнэ үү");
      return;
    }
    
    setIsSendingComment(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/comment/addcomment/${reportId}/`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          comment_text: commentText,
        }),
      });
      const data = await response.json();
      console.log("Send comment response:", data);
      
      if (data.resultCode === 9020) {
        if (commentInputRef.current) {
          commentInputRef.current.value = "";
        }
        await fetchComments();
      } else {
        setError(data.resultMessage || "Сэтгэгдэл илгээхэд алдаа гарлаа");
      }
    } catch (error) {
      console.error("Error sending comment:", error);
      setError("Сэтгэгдэл илгээхэд алдаа гарлаа");
    } finally {
      setIsSendingComment(false);
    }
  };

  const fetchReportData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/report/teacherdetailreport/${reportId}/`, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();
      console.log("=== Тайлангийн мэдээлэл ===");
      console.log("resultCode:", data.resultCode);
      console.log("data.data:", data.data);
      console.log("report_data type:", typeof data.data?.report_data);
      console.log("report_data:", data.data?.report_data);
      console.log("sections:", data.data?.report_data?.sections);

      if (data.resultCode === 6140 && data.data) {
        const reportData = data.data;
        
        let reportSections: any[] = [];
        
        if (reportData.report_data) {
          let parsedReportData = reportData.report_data;
          if (typeof reportData.report_data === "string") {
            try {
              parsedReportData = JSON.parse(reportData.report_data);
              console.log("Parsed report_data:", parsedReportData);
            } catch (e) {
              console.error("Parse error:", e);
            }
          }
          
          if (parsedReportData && parsedReportData.sections) {
            reportSections = parsedReportData.sections;
            console.log(`✅ ${reportSections.length} sections олдлоо`);
          } else {
            console.log("report_data sections олдсонгүй, report_data keys:", Object.keys(parsedReportData || {}));
          }
        }
        
        setSections(reportSections);
        
        let studentInfo: StudentInfo = {
          id: reportData.student_id || 0,
          first_name: reportData.student_first_name || "",
          last_name: reportData.student_last_name || "",
          email: reportData.student_email || "",
        };
        
        let organizationInfo: OrganizationInfo | undefined = undefined;
        if (reportData.org_id && reportData.org_name) {
          organizationInfo = {
            org_id: reportData.org_id,
            org_name: reportData.org_name,
          };
        }
        
        setReport({
          id: reportData.report_id,
          report_name: reportData.type_name || "Татварын тайлан",
          created_at: reportData.created_at || new Date().toISOString(),
          updated_at: reportData.updated_at || new Date().toISOString(),
          submitted_at: reportData.submission_date,
          current_status: reportData.current_status || reportData.report_status || "pending",
          student: studentInfo,
          organization: organizationInfo,
          feedback: reportData.feedback,
          reviewed_at: reportData.checked_date,
          teacher_name: reportData.teacher_name,
        });
        
      } else {
        setError(data.resultMessage || "Тайлангийн мэдээлэл олдсонгүй");
      }
    } catch (error: any) {
      console.error("Error:", error);
      setError(error.message || "Сервертэй холбогдоход алдаа гарлаа");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDateToMongolian = (dateString: string) => {
    const date = new Date(dateString);
    const months = [
      "Нэгдүгээр сар", "Хоёрдугаар сар", "Гуравдугаар сар", "Дөрөвдүгээр сар",
      "Тавдугаар сар", "Зургаадугаар сар", "Долдугаар сар", "Наймдугаар сар",
      "Есдүгээр сар", "Аравдугаар сар", "Арван нэгдүгээр сар", "Арван хоёрдугаар сар"
    ];
    
    const year = date.getFullYear();
    const month = months[date.getMonth()];
    const day = date.getDate();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return {
      date: `${year} оны ${month}ын ${day}`,
      time: `${hours}:${minutes} минут`,
    };
  };

  const getStatusBadge = (current_status: string) => {
    const status = current_status?.toLowerCase() || "";
    
    if (status === "хүлээгдэж буй" || status === "pending" || status === "submitted") {
      return (
        <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium flex items-center gap-1">
          <FiClock className="text-yellow-600" /> Хүлээгдэж буй
        </span>
      );
    } 
    else if (status === "баталгаажсан" || status === "approved" || status === "accepted") {
      return (
        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center gap-1">
          <FiCheckCircle className="text-green-600" /> Баталгаажсан
        </span>
      );
    } 
    else if (status === "буцаасан" || status === "rejected" || status === "returned") {
      return (
        <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium flex items-center gap-1">
          <FiXCircle className="text-red-600" /> Буцаасан
        </span>
      );
    }
    
    return (
      <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium flex items-center gap-1">
        <FiClock /> {current_status || "Тодорхойгүй"}
      </span>
    );
  };

  const handlePrint = () => {
    window.print();
  };

  const handleGoBack = () => {
    router.push("/teacher/reviews");
  };

  // Comments section component
  const CommentsSection = () => {
    const currentUserId = userInfo?.id;
    
    // Separate teacher feedback from regular comments
    const teacherFeedback = report?.feedback ? {
      comment_text: report.feedback,
      created_at: report.reviewed_at,
      first_name: report.teacher_name?.split(" ")[1] || "",
      last_name: report.teacher_name?.split(" ")[0] || "",
      email: report.teacher_name || "",
      user_role: "teacher",
    } : null;
    
    const regularComments = comments.filter(c => c.comment_text !== report?.feedback);
    
    return (
      <div className="mt-8 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-700 to-gray-800 px-6 py-4">
          <div className="flex items-center gap-2">
            <FiMessageSquare className="text-white text-xl" />
            <h2 className="text-lg font-bold text-white">Санал хүсэлт, сэтгэгдэл</h2>
          </div>
        </div>
        <div className="p-6 space-y-4">
          {/* Write new comment section */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <FaChalkboardTeacher className="text-white text-lg" />
              </div>
              <div className="flex-1">
                <div className="mb-2">
                  <span className="font-semibold text-gray-800">
                    {userInfo?.last_name} {userInfo?.first_name} (Та - Багш)
                  </span>
                </div>
                <textarea
                  ref={commentInputRef}
                  rows={3}
                  placeholder="Сэтгэгдлээ бичнэ үү..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none text-black bg-white"
                />
                <div className="flex justify-end mt-2">
                  <button
                    onClick={sendComment}
                    disabled={isSendingComment}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSendingComment ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <FiSend />
                    )}
                    Илгээх
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Teacher's feedback (from status change) */}
          {teacherFeedback && teacherFeedback.comment_text && (
            <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <FaChalkboardTeacher className="text-white text-lg" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
                    <span className="font-semibold text-gray-800">
                      {report?.teacher_name || "Багш"} 
                      <span className="ml-2 text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">Хянасан багш</span>
                    </span>
                    {teacherFeedback.created_at && (
                      <span className="text-xs text-gray-500">
                        {new Date(teacherFeedback.created_at).toLocaleString()}
                      </span>
                    )}
                  </div>
                  <div className="bg-white rounded-lg p-3 mt-2">
                    <p className="text-gray-700 whitespace-pre-wrap">{teacherFeedback.comment_text}</p>
                  </div>
                  <div className="mt-2">
                    <span className={`text-xs font-medium ${
                      report?.current_status === "Баталгаажсан" ? "text-green-600" : 
                      report?.current_status === "Буцаасан" ? "text-red-600" : "text-orange-600"
                    }`}>
                      {report?.current_status === "Баталгаажсан" ? "✅ Баталгаажуулсан" : 
                       report?.current_status === "Буцаасан" ? "❌ Буцаасан" : "📝 Сэтгэгдэл"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Regular comments from all users */}
          {regularComments.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-600 flex items-center gap-2">
                <FiMessageSquare className="text-sm" />
                Бусад сэтгэгдлүүд ({regularComments.length})
              </h3>
              {regularComments.map((comment, index) => {
                const isCurrentUser = comment.user_id === currentUserId;
                const isTeacher = comment.user_role === "teacher";
                
                return (
                  <div key={index} className={`rounded-xl p-4 border ${
                    isCurrentUser 
                      ? "bg-green-50 border-green-200" 
                      : "bg-blue-50 border-blue-200"
                  }`}>
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isCurrentUser ? "bg-green-500" : isTeacher ? "bg-orange-500" : "bg-blue-500"
                      }`}>
                        {isTeacher ? (
                          <FaChalkboardTeacher className="text-white text-lg" />
                        ) : (
                          <FaUser className="text-white text-lg" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
                          <span className="font-semibold text-gray-800">
                            {comment.last_name ? `${comment.last_name} ${comment.first_name}` : comment.first_name}
                            {isTeacher && !isCurrentUser && (
                              <span className="ml-2 text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">Багш</span>
                            )}
                            {!isTeacher && (
                              <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Оюутан</span>
                            )}
                            {isCurrentUser && (
                              <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Та</span>
                            )}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(comment.created_at).toLocaleString()}
                          </span>
                        </div>
                        <div className="bg-white rounded-lg p-3 mt-2">
                          <p className="text-gray-700 whitespace-pre-wrap">{comment.comment_text}</p>
                        </div>
                        <div className="mt-2">
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <FiMail className="text-xs" /> {comment.email}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          
          {regularComments.length === 0 && !teacherFeedback && (
            <div className="text-center text-gray-400 text-sm py-4">
              <FiMessageSquare className="inline mr-1" />
              Одоогоор сэтгэгдэл байхгүй байна. Та хамгийн түрүүнд сэтгэгдэл үлдээгээрэй!
            </div>
          )}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
            <FiAlertCircle className="text-red-500 text-5xl mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-red-700 mb-2">Алдаа гарлаа</h2>
            <p className="text-red-600">{error || "Тайлангийн мэдээлэл олдсонгүй"}</p>
            <button
              onClick={() => router.push("/teacher/reviews")}
              className="mt-6 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
            >
              Буцах
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] via-white to-[#eef2ff]">
      <Header />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-blue-600 flex items-center gap-1">
              <FiHome className="text-sm" /> Нүүр
            </Link>
            <span>/</span>
            <Link href="/teacher/reviews" className="hover:text-blue-600 flex items-center gap-1">
              <FiFileText className="text-sm" /> Тайлан хянах
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">Тайлан харах</span>
          </div>
          
          <div className="flex items-center gap-3 no-print">
            <button
              onClick={handlePrint}
              className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition flex items-center gap-2 text-sm"
            >
              <FiPrinter /> Хэвлэх
            </button>
            <button
              onClick={handleGoBack}
              className="px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-200 transition flex items-center gap-2 text-sm"
            >
              <FiArrowLeft /> Буцах
            </button>
          </div>
        </div>

        {/* Report Header */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-[#0f172a] to-[#1e3a8a] px-6 py-5">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                  <FiFileText className="text-white" />
                  {report.report_name}
                </h1>
                <p className="text-blue-100 mt-1 text-sm">Тайлан ID: {report.id}</p>
              </div>
              {getStatusBadge(report.current_status)}
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Student Info */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <FaGraduationCap className="text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Оюутны мэдээлэл</h3>
                </div>
                <p className="text-gray-800 font-medium">
                  {report.student.last_name} {report.student.first_name}
                </p>
                <p className="text-gray-500 text-sm flex items-center gap-1 mt-1">
                  <FiMail className="text-xs" /> {report.student.email}
                </p>
              </div>
              
              {/* Organization Info */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                    <FiBriefcase className="text-indigo-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Байгууллага</h3>
                </div>
                {report.organization ? (
                  <p className="text-gray-800 font-medium">{report.organization.org_name}</p>
                ) : (
                  <p className="text-gray-500 text-sm">Мэдээлэл байхгүй</p>
                )}
              </div>
              
              {/* Submitted Date */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <FiCalendar className="text-green-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Илгээсэн огноо</h3>
                </div>
                {report.submitted_at ? (
                  <>
                    <p className="text-gray-800 font-medium">
                      {formatDateToMongolian(report.submitted_at).date}
                    </p>
                    <p className="text-gray-500 text-sm mt-1">
                      {formatDateToMongolian(report.submitted_at).time}
                    </p>
                  </>
                ) : (
                  <p className="text-gray-500 text-sm">Илгээгүй байна</p>
                )}
              </div>
              
              {/* Reviewed By */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <FaChalkboardTeacher className="text-orange-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Хянасан</h3>
                </div>
                {report.reviewed_at ? (
                  <>
                    <p className="text-gray-800 font-medium">{report.teacher_name || teacherName}</p>
                    <p className="text-gray-500 text-sm mt-1">
                      {new Date(report.reviewed_at).toLocaleString()}
                    </p>
                  </>
                ) : (
                  <p className="text-gray-500 text-sm">Хянаагүй байна</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Report Sections */}
        <div className="space-y-6">
          {sections && sections.length > 0 ? (
            sections.map((section, sectionIndex) => (
              <motion.div
                key={section.id || sectionIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: sectionIndex * 0.1 }}
                className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden"
              >
                <div className="bg-gradient-to-r from-[#0f172a] to-[#1e3a8a] px-6 py-4">
                  <h2 className="text-lg font-bold text-white">{section.title}</h2>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-12 gap-4 px-3 py-2 bg-gray-100 rounded-t-lg font-medium text-sm text-gray-700">
                    <div className="col-span-1">Мөр</div>
                    <div className="col-span-8">Үзүүлэлтүүд</div>
                    <div className="col-span-3">Дүн (₮)</div>
                  </div>
                  
                  <div className="border-x border-b border-gray-200 rounded-b-lg">
                    <RenderFields fields={section.fields || []} level={0} />
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-8 text-center">
              <FiAlertCircle className="text-yellow-500 text-4xl mx-auto mb-3" />
              <p className="text-yellow-700">Тайлангийн бүтэц олдсонгүй</p>
              <p className="text-yellow-500 text-sm mt-2">Тайлангийн ID: {reportId}</p>
            </div>
          )}
        </div>

        {/* Comments Section */}
        <CommentsSection />

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-gray-400">
          <p>Энэхүү тайлан нь системээр автоматаар үүсгэгдсэн бөгөөд цахим гарын үсэгтэй адилтгах болно.</p>
          <p className="mt-1">Тайлан үүсгэсэн огноо: {new Date(report.created_at).toLocaleString()}</p>
          <p>Сүүлд шинэчлэгдсэн: {new Date(report.updated_at).toLocaleString()}</p>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          header, .no-print {
            display: none !important;
          }
          body {
            background: white;
            padding: 0;
            margin: 0;
          }
          .bg-gradient-to-r {
            background: #0f172a !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}</style>
    </div>
  );
}