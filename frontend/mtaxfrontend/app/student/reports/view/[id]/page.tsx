// app/student/report/[id]/page.tsx
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams } from "next/navigation";
import {
  FiSave, FiSend, FiRefreshCw, FiAlertCircle, FiCheckCircle,
  FiHome, FiFileText, FiMessageSquare, FiSearch, FiX, FiMail, FiClock,
  FiXCircle, FiUser, FiSend as FiSendIcon,
  FiArrowRight,
  FiCalendar,
} from "react-icons/fi";
import { FaChalkboardTeacher, FaUserCheck } from "react-icons/fa";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/app/component/Header";
import { API_BASE_URL } from "@/api_base_url/page";
import { useDynamicForm, formatAsMoney } from "@/hooks/useDynamicForm";
import { DynamicForm } from "@/components/DynamicForm";
import { reportTypeService } from "@/services/reportTypeService";

interface Teacher {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
}

interface Organization {
  id: number;
  name: string;
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

type ReportStatus = "Илгээгээгүй" | "Хүлээгдэж буй" | "Буцаасан" | "Баталгаажсан";

const mapApiStatusToDisplayStatus = (apiStatus: string | undefined): ReportStatus => {
  if (!apiStatus) return "Илгээгээгүй";
  if (apiStatus === "Буцаасан") return "Буцаасан";
  if (apiStatus === "Pending" || apiStatus === "Хүлээгдэж буй") return "Хүлээгдэж буй";
  if (apiStatus === "Approved" || apiStatus === "Баталгаажсан") return "Баталгаажсан";
  const statusLower = apiStatus.toLowerCase();
  if (statusLower === "pending") return "Хүлээгдэж буй";
  if (statusLower === "approved") return "Баталгаажсан";
  if (statusLower === "rejected") return "Буцаасан";
  return "Илгээгээгүй";
};

export default function DynamicReportPage() {
  const params = useParams();
  const reportId = params.id as string;
  const router = useRouter();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [isLoadingTeachers, setIsLoadingTeachers] = useState(true);
  const [isLoadingReport, setIsLoadingReport] = useState(true);
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [teacherSearchTerm, setTeacherSearchTerm] = useState("");
  
  const [currentStatus, setCurrentStatus] = useState<ReportStatus>("Илгээгээгүй");
  const [submittedAt, setSubmittedAt] = useState<string | undefined>();
  const [teacherName, setTeacherName] = useState<string | undefined>();
  const [teacherId, setTeacherId] = useState<number | undefined>();
  const [feedback, setFeedback] = useState<string | undefined>();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [reportTypeId, setReportTypeId] = useState<number | undefined>(undefined);
  const [reportName, setReportName] = useState<string>("");
  const [isClearedAndLocked, setIsClearedAndLocked] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isSendingComment, setIsSendingComment] = useState(false);
  const [userInfo, setUserInfo] = useState<{ id: number; first_name: string; last_name: string; email: string; role: string } | null>(null);
  const [extractedFormValues, setExtractedFormValues] = useState<Record<string, string>>({});
  const [selectedQuarter, setSelectedQuarter] = useState<number>(1);
  const [reportYear, setReportYear] = useState<number>(new Date().getFullYear());
  
  const commentInputRef = useRef<HTMLTextAreaElement>(null);
  const reportIdRef = useRef<number | undefined>(undefined);

  const quarters = [
    { value: 1, label: "1-р улирал" },
    { value: 2, label: "2-р улирал" },
    { value: 3, label: "3-р улирал" },
    { value: 4, label: "4-р улирал" },
  ];

  const formHook = useDynamicForm({
    reportTypeId: reportTypeId,
    initialValues: extractedFormValues,
    autoLoad: true
  });
  
  const { 
    values, setValues, isLoading: isFormLoading, error: formError,
    clearAndLock, unlock, isLocked, 
    buildReportData, extractValuesFromReportData
  } = formHook;

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      const userData = JSON.parse(user);
      setUserInfo({
        id: userData.id,
        first_name: userData.first_name || "",
        last_name: userData.last_name || "",
        email: userData.email || "",
        role: userData.role || "student",
      });
    }
  }, []);

  const fetchComments = async (reportId: number) => {
    setIsLoadingComments(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/comment/reportcommentlist/${reportId}/`, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" }
      });
      const data = await response.json();
      
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
      setSubmitError("Сэтгэгдэл бичнэ үү");
      return;
    }
    
    if (!reportIdRef.current) {
      setSubmitError("Тайлангийн ID олдсонгүй");
      return;
    }
    
    setIsSendingComment(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/comment/addcomment/${reportIdRef.current}/`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment_text: commentText }),
      });
      const data = await response.json();
      
      if (data.resultCode === 9020) {
        if (commentInputRef.current) {
          commentInputRef.current.value = "";
        }
        await fetchComments(reportIdRef.current);
        setSubmitSuccess(true);
        setTimeout(() => setSubmitSuccess(false), 3000);
      } else {
        setSubmitError(data.resultMessage || "Сэтгэгдэл илгээхэд алдаа гарлаа");
      }
    } catch (error) {
      console.error("Error sending comment:", error);
      setSubmitError("Сэтгэгдэл илгээхэд алдаа гарлаа");
    } finally {
      setIsSendingComment(false);
    }
  };

  const saveQuarterInfo = async (quarter: number, year: number) => {
    if (!reportIdRef.current) return;
    try {
      await fetch(`${API_BASE_URL}/api/report/savereportquarter/${reportIdRef.current}/`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quarter, year }),
      });
    } catch (error) {
      console.error("Error saving quarter:", error);
    }
  };

  const handleQuarterChange = (quarter: number) => {
    setSelectedQuarter(quarter);
    if (reportIdRef.current) {
      saveQuarterInfo(quarter, reportYear);
    }
  };

  const fetchSubmissionInfo = async (reportId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/report/submissionlist/`, {
        method: "GET", 
        credentials: "include", 
        headers: { "Content-Type": "application/json" }
      });
      const data = await response.json();
      
      if (data.resultCode === 6130 && data.data) {
        const submission = data.data.find((item: any) => item.report_id === reportId);
        if (submission) {
          const mappedStatus = mapApiStatusToDisplayStatus(submission.current_status);
          setCurrentStatus(mappedStatus);
          setTeacherName(submission.teacher_name);
          setFeedback(submission.teacher_comment);
          setSubmittedAt(submission.submission_date);
          setTeacherId(submission.teacher_id);
        }
      }
    } catch (error) {
      console.error("Error fetching submission:", error);
    }
  };

  useEffect(() => {
    const fetchReportInfo = async () => {
      if (!reportId || isNaN(parseInt(reportId))) {
        setSubmitError("Тайлангийн ID буруу байна");
        setIsLoadingReport(false);
        return;
      }
      
      const parsedId = parseInt(reportId);
      reportIdRef.current = parsedId;
      
      try {
        const result = await reportTypeService.getReportWithSchema(parsedId);
        
        if (result) {
          const typeId = result.reportType?.id;
          setReportTypeId(typeId);
          setReportName(result.reportType?.type_name || "Тайлан");
          
          if (result.report.org_id && result.report.org_name) {
            setOrganization({ id: result.report.org_id, name: result.report.org_name });
          }
          
          if (result.report.quarter) {
            setSelectedQuarter(result.report.quarter);
          }
          if (result.report.report_year) {
            setReportYear(result.report.report_year);
          }
          
          if (result.report.report_data) {
            const extractedValues = extractValuesFromReportData(result.report.report_data);
            if (Object.keys(extractedValues).length > 0) {
              setExtractedFormValues(extractedValues);
              setValues(extractedValues);
            }
          }
          
          await fetchSubmissionInfo(parsedId);
          await fetchComments(parsedId);
        }
      } catch (error) {
        console.error("Error:", error);
        setSubmitError("Тайлан ачаалахад алдаа гарлаа");
      } finally {
        setIsLoadingReport(false);
      }
    };
    
    fetchReportInfo();
  }, [reportId]);

  const fetchTeachers = async () => {
    setIsLoadingTeachers(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/user/teacher/`, {
        method: "GET", 
        credentials: "include", 
        headers: { "Content-Type": "application/json" }
      });
      const data = await response.json();
      if (data.resultCode === 7630 && data.data) {
        setTeachers(data.data);
      }
    } catch (error) { 
      console.error("Error fetching teachers:", error);
    } finally { 
      setIsLoadingTeachers(false); 
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  useEffect(() => {
    if (teachers.length > 0 && teacherId && !selectedTeacher) {
      const foundTeacher = teachers.find(t => t.id === teacherId);
      if (foundTeacher) {
        setSelectedTeacher(foundTeacher);
      }
    }
  }, [teachers, teacherId, selectedTeacher]);

  const filteredTeachers = teachers.filter(teacher => {
    const searchLower = teacherSearchTerm.toLowerCase();
    const fullName = `${teacher.last_name} ${teacher.first_name}`.toLowerCase();
    return fullName.includes(searchLower) || teacher.email.toLowerCase().includes(searchLower);
  });

  const isReportLocked = useCallback(() => {
    const lockedStatuses: ReportStatus[] = ["Хүлээгдэж буй", "Баталгаажсан"];
    if (isClearedAndLocked) return true;
    return lockedStatuses.includes(currentStatus);
  }, [currentStatus, isClearedAndLocked]);

  const canSubmit = useCallback(() => {
    if (isClearedAndLocked) return true;
    return currentStatus === "Илгээгээгүй" || currentStatus === "Буцаасан";
  }, [currentStatus, isClearedAndLocked]);

  const showTeacherSelection = useCallback(() => {
    return currentStatus === "Илгээгээгүй" || isClearedAndLocked;
  }, [currentStatus, isClearedAndLocked]);

  const saveReport = async (isDraft: boolean = false) => {
    if (isDraft && isReportLocked()) {
      setSubmitError("Маягт түгжсэн тул ноорог хадгалах боломжгүй.");
      return;
    }

    const currentReportId = reportIdRef.current;
    if (!currentReportId) {
      setSubmitError("Тайлангийн ID олдсонгүй.");
      return;
    }

    if (isDraft) setIsSavingDraft(true);
    else setIsSubmitting(true);
    setSubmitError("");

    try {
      const reportData = buildReportData();
      
      const saveResponse = await fetch(`${API_BASE_URL}/api/report/savereportfields/${currentReportId}/`, {
        method: "POST", 
        headers: { "Content-Type": "application/json" }, 
        credentials: "include",
        body: JSON.stringify({ report_data: reportData, quarter: selectedQuarter, report_year: reportYear })
      });
      const saveData = await saveResponse.json();

      if (isDraft) {
        if (saveData.resultCode === 7820) {
          setSubmitSuccess(true);
          setTimeout(() => setSubmitSuccess(false), 3000);
        } else {
          setSubmitError(saveData.resultMessage || "Хадгалахад алдаа гарлаа");
        }
        setIsSavingDraft(false);
        return;
      }

      if (saveData.resultCode !== 7820) {
        setSubmitError(saveData.resultMessage || "Хадгалахад алдаа гарлаа");
        setIsSubmitting(false);
        return;
      }

      const targetTeacherId = selectedTeacher?.id || teacherId;

      const submissionResponse = await fetch(`${API_BASE_URL}/api/report/addsubmission/`, {
        method: "POST", 
        headers: { "Content-Type": "application/json" }, 
        credentials: "include",
        body: JSON.stringify({ report_id: currentReportId, teacher_id: targetTeacherId })
      });
      const submissionData = await submissionResponse.json();

      if (submissionData.resultCode === 6120) {
        setSubmitSuccess(true);
        setCurrentStatus("Хүлээгдэж буй");
        setIsClearedAndLocked(false);
        setTimeout(() => router.push("/student/reports"), 2000);
      } else {
        setSubmitError(submissionData.resultMessage || "Илгээхэд алдаа гарлаа");
      }
    } catch (error: any) {
      setSubmitError(error.message || "Тайлан хадгалахад алдаа гарлаа");
    } finally {
      setIsSubmitting(false);
      setIsSavingDraft(false);
    }
  };

  const handleClearAndLock = () => {
    clearAndLock();
    setIsClearedAndLocked(true);
  };

  const handleUnlock = () => {
    unlock();
    setIsClearedAndLocked(false);
    setSubmitError("");
  };

  const handleSubmitClick = () => {
    if (!selectedTeacher && !teacherId) {
      setSubmitError("Тайлан илгээх багшаа сонгоно уу");
      setShowTeacherModal(true);
      return;
    }
    setShowSubmitConfirm(true);
  };

  const confirmSubmit = async () => {
    setShowSubmitConfirm(false);
    await saveReport(false);
  };

  const getStatusMessage = () => {
    if (isClearedAndLocked) {
      return { 
        message: "Маягт X тайлан болсон байна. Та багшаа сонгоод тайлангаа илгээнэ үү.", 
        color: "bg-orange-50 border-orange-200 text-orange-700", 
        icon: <FiAlertCircle className="text-orange-600" /> 
      };
    }
    
    switch (currentStatus) {
      case "Хүлээгдэж буй":
        return { message: "Энэ тайлан аль хэдийн илгээгдсэн байна. Багшийн хариуг хүлээж байна.", color: "bg-yellow-50 border-yellow-200 text-yellow-800", icon: <FiClock className="text-yellow-600" /> };
      case "Баталгаажсан":
        return { message: "Энэ тайлан баталгаажсан байна. Өөрчлөлт оруулах боломжгүй.", color: "bg-green-50 border-green-200 text-green-800", icon: <FiCheckCircle className="text-green-600" /> };
      case "Буцаасан":
        return { message: "Энэ тайлан багшаар буцаагдсан байна. Та засварлаж дахин илгээх боломжтой.", color: "bg-red-50 border-red-200 text-red-800", icon: <FiAlertCircle className="text-red-600" /> };
      default:
        return { message: "Энэ тайлан илгээгдээгүй байна. Та маягтаа бөглөж илгээнэ үү.", color: "bg-gray-50 border-gray-200 text-gray-800", icon: <FiFileText className="text-gray-600" /> };
    }
  };

  const QuarterSelector = () => {
    // Хэрэв тайлан хүлээгдэж буй эсвэл баталгаажсан бол зөвхөн текст харуулах
    const showFullSelector = currentStatus === "Илгээгээгүй" || currentStatus === "Буцаасан" || isClearedAndLocked;
    
    if (!showFullSelector) {
      // Хүлээгдэж буй эсвэл Баталгаажсан үед жижиг текст харуулах
      return (
        <div className="mb-6 bg-gray-50 rounded-xl border border-gray-200 p-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <FiCalendar className="text-gray-500 text-sm" />
              <span className="text-sm text-gray-600">Тайлангийн улирал:</span>
              <span className="text-sm font-medium text-gray-800">{selectedQuarter}-р улирал</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Тайлангийн жил:</span>
              <span className="text-sm font-medium text-gray-800">{reportYear}</span>
            </div>
            {isClearedAndLocked && (
              <div className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                X тайлан
              </div>
            )}
          </div>
        </div>
      );
    }
    
    // Илгээгээгүй эсвэл Буцаасан үед бүрэн сонголт харуулах
    return (
      <div className="mb-6 bg-white rounded-2xl shadow-lg border border-gray-200 p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
            <FiCalendar className="text-purple-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Тайлангийн улирал</h3>
            <p className="text-sm text-gray-500">Тайлангаа аль улиралд илгээж байгаа сонгоно уу</p>
          </div>
          {isClearedAndLocked && (
            <div className="ml-auto px-3 py-1.5 bg-orange-100 text-orange-700 rounded-full text-xs font-medium flex items-center gap-1">
              <FiXCircle className="text-orange-600 text-sm" />
              X тайлан
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quarters.map((q) => (
            <button
              key={q.value}
              onClick={() => handleQuarterChange(q.value)}
              disabled={isReportLocked()}
              className={`py-2 px-3 rounded-xl border-2 transition flex flex-col items-center gap-1 ${
                selectedQuarter === q.value
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-200 hover:border-blue-300 hover:bg-blue-50/50"
              } ${isReportLocked() ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
            >
              <span className={`text-sm font-medium ${selectedQuarter === q.value ? "text-blue-600" : "text-gray-600"}`}>
                {q.label}
              </span>
              {selectedQuarter === q.value && (
                <FiCheckCircle className="text-blue-600 text-xs" />
              )}
            </button>
          ))}
        </div>
        
        <div className="mt-4 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">
              Сонгосон улирал: <strong className="text-gray-700">{selectedQuarter}-р улирал</strong>
            </span>
            <span className="text-sm text-gray-500">
              Тайлангийн жил: <strong className="text-gray-700">{reportYear}</strong>
            </span>
          </div>
        </div>
      </div>
    );
  };

  const CommentsSection = () => {
    const currentUserId = userInfo?.id;
    
    const teacherFeedback = feedback ? {
      comment_text: feedback,
      created_at: submittedAt,
      first_name: teacherName?.split(" ")[1] || "",
      last_name: teacherName?.split(" ")[0] || "",
      email: teacherName || "",
      user_role: "teacher",
      user_id: teacherId,
    } : null;
    
    const regularComments = comments.filter(c => c.comment_text !== feedback);
    
    return (
      <div className="mt-8 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-700 to-gray-800 px-6 py-4">
          <div className="flex items-center gap-2">
            <FiMessageSquare className="text-white text-xl" />
            <h2 className="text-lg font-bold text-white">Санал хүсэлт, сэтгэгдэл</h2>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <FiUser className="text-white text-lg" />
              </div>
              <div className="flex-1">
                <div className="mb-2">
                  <span className="font-semibold text-gray-800">
                    {userInfo?.last_name} {userInfo?.first_name} (Та)
                  </span>
                </div>
                <textarea
                  ref={commentInputRef}
                  rows={3}
                  placeholder="Санал хүсэлт, сэтгэгдлээ бичнэ үү..."
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
                      <FiSendIcon />
                    )}
                    Илгээх
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {teacherFeedback && teacherFeedback.comment_text && (
            <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <FaChalkboardTeacher className="text-white text-lg" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
                    <span className="font-semibold text-gray-800">
                      {teacherName || "Багш"} 
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
                </div>
              </div>
            </div>
          )}
          
          {regularComments.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-600 flex items-center gap-2">
                <FiMessageSquare className="text-sm" />
                Бусад сэтгэгдлүүд ({regularComments.length})
              </h3>
              {regularComments.map((comment, index) => {
                const isCurrentUser = comment.user_id === currentUserId;
                
                return (
                  <div key={index} className={`rounded-xl p-4 border ${
                    isCurrentUser 
                      ? "bg-green-50 border-green-200" 
                      : "bg-blue-50 border-blue-200"
                  }`}>
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isCurrentUser ? "bg-green-500" : "bg-blue-500"
                      }`}>
                        <FiUser className="text-white text-lg" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
                          <span className="font-semibold text-gray-800">
                            {comment.last_name ? `${comment.last_name} ${comment.first_name}` : comment.first_name}
                            {comment.user_role === "teacher" && !isCurrentUser && (
                              <span className="ml-2 text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">Багш</span>
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

  const renderTeacherInfo = () => {
    if (currentStatus === "Хүлээгдэж буй" && teacherName) {
      return (
        <div className="mb-6 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-yellow-600 to-yellow-500 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <FiClock className="text-white text-xl" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg">Тайланг багш хянаж байна...</h3>
              </div>
            </div>
          </div>
          <div className="p-5">
            <div className="flex items-center gap-4 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center">
                <FaChalkboardTeacher className="text-white text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Илгээсэн багш</p>
                <p className="font-semibold text-gray-800 text-lg">{teacherName}</p>
                {submittedAt && (
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(submittedAt).toLocaleString()} -д илгээсэн
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (currentStatus === "Баталгаажсан" && teacherName) {
      return (
        <div className="mb-6 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <FiCheckCircle className="text-white text-xl" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg">Баталгаажсан тайлан</h3>
              </div>
            </div>
          </div>
          <div className="p-5">
            <div className="flex items-center gap-4 p-4 bg-green-50 rounded-xl border border-green-200">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                <FaUserCheck className="text-white text-xl" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600">Хянасан багш</p>
                <p className="font-semibold text-gray-800 text-lg">{teacherName}</p>
                {submittedAt && (
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(submittedAt).toLocaleString()} -д баталгаажуулсан
                  </p>
                )}
              </div>
              <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                Баталгаажсан
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (currentStatus === "Буцаасан") {
      return (
        <div className="mb-6 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <FiXCircle className="text-white text-xl" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg">Буцаасан тайлан</h3>
              </div>
            </div>
          </div>
          <div className="p-5">
            <div className="flex items-center gap-4 p-4 bg-red-50 rounded-xl border border-red-200">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center">
                <FaChalkboardTeacher className="text-white text-xl" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600">Буцаасан багш</p>
                <p className="font-semibold text-gray-800 text-lg">{teacherName || "Тодорхойгүй"}</p>
                {submittedAt && (
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(submittedAt).toLocaleString()} -д буцаасан
                  </p>
                )}
              </div>
              <div className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                Буцаасан
              </div>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  const renderTeacherSelectionSection = () => {
    if (!showTeacherSelection()) return null;
    
    return (
      <div className="mb-6 bg-white rounded-2xl shadow-xl border p-6">
        <h3 className="font-semibold text-lg text-gray-800 mb-4">
          Тайлан илгээх багш
        </h3>
        {selectedTeacher ? (
          <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">
                  {selectedTeacher.first_name?.charAt(0)}{selectedTeacher.last_name?.charAt(0)}
                </span>
              </div>
              <div>
                <p className="font-semibold text-gray-800">{selectedTeacher.last_name} {selectedTeacher.first_name}</p>
                <p className="text-sm text-gray-600">{selectedTeacher.email}</p>
              </div>
            </div>
            <button onClick={() => setSelectedTeacher(null)} className="text-red-500 p-2 hover:bg-red-50 rounded-lg">
              <FiX />
            </button>
          </div>
        ) : (
          <button 
            onClick={() => setShowTeacherModal(true)} 
            className="w-full p-4 border-2 border-dashed border-gray-300 rounded-xl text-center hover:border-blue-400 hover:bg-blue-50 transition group"
          >
            <FaChalkboardTeacher className="text-4xl text-gray-400 mx-auto mb-2 group-hover:text-blue-500" />
            <p className="text-gray-600 group-hover:text-blue-600">Багш сонгох</p>
            <p className="text-xs text-gray-500 mt-1">Сонгох товч дарж багшаа сонгоно уу</p>
          </button>
        )}
      </div>
    );
  };

  const TeacherSelectionModal = () => (
    <AnimatePresence>
      {showTeacherModal && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowTeacherModal(false)}>
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <FaChalkboardTeacher className="text-white text-2xl" />
                  </div>
                  <div>
                    <h2 className="text-white text-xl font-bold">Багш сонгох</h2>
                    <p className="text-blue-100 text-sm">Тайлангаа хянах багшаа сонгоно уу</p>
                  </div>
                </div>
                <button onClick={() => setShowTeacherModal(false)} className="text-white/80 hover:text-white p-2">
                  <FiX className="text-2xl" />
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(85vh-140px)]">
              <div className="relative mb-6">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" placeholder="Нэр, овог, эмэйлээр хайх..." value={teacherSearchTerm}
                  onChange={(e) => setTeacherSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-800" />
              </div>
              <div className="space-y-3">
                {isLoadingTeachers ? (
                  <div className="text-center py-12"><div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" /><p className="text-gray-600">Багш нар ачааллаж байна...</p></div>
                ) : filteredTeachers.length === 0 ? (
                  <div className="text-center py-12">
                    <FiAlertCircle className="text-4xl text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">Багш олдсонгүй</p>
                  </div>
                ) : (
                  filteredTeachers.map((teacher) => (
                    <div key={teacher.id} onClick={() => { setSelectedTeacher(teacher); setShowTeacherModal(false); }}
                      className={`p-4 rounded-xl cursor-pointer transition ${selectedTeacher?.id === teacher.id ? "bg-blue-50 border-2 border-blue-500" : "bg-gray-50 hover:bg-gray-100"}`}>
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${selectedTeacher?.id === teacher.id ? "bg-blue-500" : "bg-gray-400"}`}>
                          <span className="text-white font-bold">{teacher.first_name?.charAt(0)}{teacher.last_name?.charAt(0)}</span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800">{teacher.last_name} {teacher.first_name}</h3>
                          <p className="text-sm text-gray-600 flex items-center gap-1"><FiMail className="text-xs" /> {teacher.email}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            <div className="border-t px-6 py-4 bg-gray-50 flex justify-end">
              <button onClick={() => setShowTeacherModal(false)} className="px-5 py-2 bg-gray-200 rounded-xl hover:bg-gray-300 text-gray-700">Хаах</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const SubmitConfirmModal = () => (
    <AnimatePresence>
      {showSubmitConfirm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowSubmitConfirm(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <FiSend className="text-white text-xl" />
                </div>
                <h2 className="text-white text-xl font-bold">Тайлан илгээх</h2>
              </div>
            </div>
            
            <div className="p-6">
              <p className="text-gray-700 text-center mb-6">
                Та тайлангаа {selectedTeacher ? `${selectedTeacher.last_name} ${selectedTeacher.first_name}` : "сонгосон"} багш руу илгээх гэж байна. Илгээсний дараа өөрчлөлт оруулах боломжгүй. Үргэлжлүүлэх үү?
              </p>
              
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowSubmitConfirm(false)}
                  className="px-5 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
                >
                  Цуцлах
                </button>
                <button
                  onClick={confirmSubmit}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium hover:opacity-90 transition"
                >
                  Тийм, илгээх
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (isLoadingReport || isFormLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (formError) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <FiAlertCircle className="text-red-600 text-5xl mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-red-800 mb-2">Алдаа гарлаа</h2>
            <p className="text-red-600 mb-4">{formError}</p>
            <button onClick={() => window.location.reload()} className="px-4 py-2 bg-red-600 text-white rounded-lg">Дахин ачаалах</button>
          </div>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusMessage();
  const locked = isReportLocked();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] via-white to-[#eef2ff]">
      <Header />
      <TeacherSelectionModal />
      <SubmitConfirmModal />
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-6 flex-wrap">
          <Link href="/" className="hover:text-blue-600 flex items-center gap-1">
            <FiHome className="text-sm" /> Нүүр
          </Link>
          <span>/</span>
          <Link href="/student/select-organization" className="hover:text-blue-600">
            Миний байгууллага
          </Link>
          <span>/</span>
          <Link href="/student/reports" className="hover:text-blue-600">
            Миний тайлангууд
          </Link>
          <span>/</span>
          <span className="text-gray-800 font-medium">
            {organization ? organization.name : reportName}
          </span>
        </div>

        {organization && (
          <div className="mb-6 bg-white rounded-2xl shadow-lg border border-gray-200 p-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <FiHome className="text-white text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Байгууллага</p>
                <h2 className="text-xl font-bold text-gray-800">{organization.name}</h2>
              </div>
            </div>
          </div>
        )}

        <QuarterSelector />

        {statusInfo && (
          <div className={`mb-6 p-4 ${statusInfo.color} rounded-xl border flex items-center gap-3`}>
            {statusInfo.icon} <span className="font-medium">{statusInfo.message}</span>
          </div>
        )}

        {renderTeacherInfo()}

        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{reportName}</h1>
            <p className="text-gray-600 mt-1">
              Тайлангийн төлөв: 
              <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                currentStatus === "Баталгаажсан" ? "bg-green-100 text-green-800" :
                currentStatus === "Буцаасан" ? "bg-red-100 text-red-800" :
                currentStatus === "Хүлээгдэж буй" ? "bg-yellow-100 text-yellow-800" :
                "bg-gray-100 text-gray-800"
              }`}>
                {currentStatus}
              </span>
              {isClearedAndLocked && (
                <span className="ml-2 px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                  X тайлан
                </span>
              )}
            </p>
          </div>
        </div>

        {renderTeacherSelectionSection()}

        {submitSuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-800">
            <FiCheckCircle className="inline mr-2" /> 
            Амжилттай хадгалагдлаа
          </div>
        )}
        {submitError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-800">
            <FiAlertCircle className="inline mr-2" /> {submitError}
          </div>
        )}

        <div className="flex gap-3 mb-6 items-center">
          {!locked && (
            <button onClick={() => saveReport(true)} disabled={isSavingDraft} className="px-5 py-2 rounded-xl flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 transition">
              {isSavingDraft ? <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" /> : <><FiSave /> Хадгалах</>}
            </button>
          )}
          <p className="flex items-center text-sm text-gray-500">Тухайн тайлант хугацаанд үйл ажиллагаа явуулаагүй бол энд тэмдэглэнэ үү. <FiArrowRight /></p>
          <button
            onClick={() => {
              if (isClearedAndLocked) {
                handleUnlock();
              } else {
                handleClearAndLock();
              }
            }}
            disabled={locked && !isClearedAndLocked}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition ${
              isClearedAndLocked 
                ? "bg-green-50 border-green-300 text-green-700" 
                : "bg-white border-gray-300 hover:bg-gray-50 text-gray-700"
            } ${locked && !isClearedAndLocked ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <FiXCircle className={isClearedAndLocked ? "text-green-600" : "text-red-600"} />
            <span className="text-sm font-medium">
              {isClearedAndLocked ? "Маягт X тайлан болсон" : "X тайлан"}
            </span>
          </button>
          
          {canSubmit() && (
            <button 
              onClick={handleSubmitClick}
              disabled={isSubmitting || (!selectedTeacher && !teacherId)} 
              className={`px-6 py-2 rounded-xl font-medium shadow-lg flex items-center gap-2 ml-auto transition ${
                isSubmitting || (!selectedTeacher && !teacherId)
                  ? "bg-gray-400 cursor-not-allowed" 
                  : "bg-gradient-to-r from-[#0f172a] to-[#1e3a8a] text-white hover:opacity-90"
              }`}
            >
              {isSubmitting ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 
                <><FiSend /> {currentStatus === "Буцаасан" ? "Дахин илгээх" : "Тайлан илгээх"}</>
              }
            </button>
          )}
        </div>

        <DynamicForm formHook={formHook} isLocked={locked} />

        <CommentsSection />

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Тооцоолол автоматаар шинэчлэгдэнэ. Цэнхэр мөрүүд нь томьёотой мөрүүд.</p>
          <p>Бүх дүнг MNT (төгрөг)-өөр бөглөнө үү.</p>
          {reportIdRef.current && (
            <p className="mt-2 text-blue-600">Тайлан ID: {reportIdRef.current}</p>
          )}
        </div>
      </div>
    </div>
  );
}