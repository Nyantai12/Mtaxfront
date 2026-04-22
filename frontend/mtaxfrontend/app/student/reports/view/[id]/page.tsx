// app/student/tax-report/page.tsx
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams } from "next/navigation";
import {
  FiSave,
  FiSend,
  FiRefreshCw,
  FiAlertCircle,
  FiCheckCircle,
  FiHome,
  FiFileText,
  FiMessageSquare,
  FiSearch,
  FiX,
  FiUser,
  FiMail,
  FiBookOpen,
} from "react-icons/fi";
import { FaChalkboardTeacher, FaGraduationCap, FaUserCheck } from "react-icons/fa";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/app/component/Header";
import { API_BASE_URL } from "@/api_base_url/page";
import { 
  reportStructure, 
  parseInputValue, 
  formatAsMoney,
  type Field,
} from "@/maygt/page";

interface Teacher {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  department?: string;
}

interface FormData {
  student_id: string;
  report_type_id: number;
  report_type_name?: string;
  report_status?: string;
  tax_period_year: number;
  tax_period_month: number;
  values: Record<string, string>;
  teacher_id?: number;
  report_id?: number;
  is_draft?: boolean;
  report_name?: string;
}

type ReportStatus = "Илгээгээгүй" | "Хүлээгдэж буй" | "Буцаасан" | "Баталгаажсан";

const mapApiStatusToDisplayStatus = (apiStatus: string | undefined): ReportStatus => {
  if (!apiStatus) return "Илгээгээгүй";
  
  const statusLower = apiStatus.toLowerCase();
  
  if (statusLower === "pending" || statusLower === "хүлээгдэж буй" || statusLower === "submitted") {
    return "Хүлээгдэж буй";
  }
  if (statusLower === "approved" || statusLower === "баталгаажсан") {
    return "Баталгаажсан";
  }
  if (statusLower === "rejected" || statusLower === "буцаасан") {
    return "Буцаасан";
  }
  
  return "Илгээгээгүй";
};

export default function TaxReportPage() {
  const params = useParams();
  const reportId = params.id as string;
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [isLoadingTeachers, setIsLoadingTeachers] = useState(true);
  const [isLoadingReport, setIsLoadingReport] = useState(false);
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [teacherSearchTerm, setTeacherSearchTerm] = useState("");
  
  const [currentStatus, setCurrentStatus] = useState<ReportStatus>("Илгээгээгүй");
  const [submittedAt, setSubmittedAt] = useState<string | undefined>();
  const [teacherName, setTeacherName] = useState<string | undefined>();
  const [teacherId, setTeacherId] = useState<number | undefined>();
  const [feedback, setFeedback] = useState<string | undefined>();
  const [hasSubmission, setHasSubmission] = useState<boolean>(false);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);

  const recalculateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const inputFocusRef = useRef<{ [key: string]: boolean }>({});
  const tempInputValueRef = useRef<{ [key: string]: string }>({});
  const reportIdRef = useRef<number | undefined>(undefined);
  const [teacherComment, setTeacherComment] = useState<string | undefined>();

  const [studentInfo, setStudentInfo] = useState({ id: "", name: "" });
  const [formData, setFormData] = useState<FormData>({
    student_id: "",
    report_type_id: 1,
    tax_period_year: new Date().getFullYear(),
    tax_period_month: new Date().getMonth() + 1,
    values: {},
    teacher_id: undefined,
    report_id: undefined,
    is_draft: true,
    report_name: "",
  });

  useEffect(() => {
    if (reportId) {
      const parsedId = parseInt(reportId);
      reportIdRef.current = parsedId;
      fetchReportDataAndStatus(parsedId);
    }
  }, [reportId]);

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      const userData = JSON.parse(user);
      setStudentInfo({
        id: userData.id?.toString() || "",
        name: `${userData.last_name || ""} ${userData.first_name || ""}`,
      });
      setFormData((prev) => ({
        ...prev,
        student_id: userData.id?.toString() || "",
      }));
    }

    fetchTeachers();

    if (reportId && !isNaN(parseInt(reportId))) {
      const parsedId = parseInt(reportId);
      reportIdRef.current = parsedId;
      setFormData((prev) => ({ ...prev, report_id: parsedId }));
    } else {
      initializeValues();
    }
  }, [reportId]);

  const filteredTeachers = teachers.filter(teacher => {
    const searchLower = teacherSearchTerm.toLowerCase();
    const fullName = `${teacher.last_name} ${teacher.first_name}`.toLowerCase();
    return (
      fullName.includes(searchLower) ||
      teacher.email.toLowerCase().includes(searchLower) ||
      teacher.first_name?.toLowerCase().includes(searchLower) ||
      teacher.last_name?.toLowerCase().includes(searchLower)
    );
  });

  const isReportLocked = useCallback(() => {
    const lockedStatuses: ReportStatus[] = ["Хүлээгдэж буй", "Баталгаажсан"];
    return lockedStatuses.includes(currentStatus);
  }, [currentStatus]);

  const canSubmit = useCallback(() => {
    return currentStatus === "Илгээгээгүй" || currentStatus === "Буцаасан";
  }, [currentStatus]);

  const showTeacherSelection = useCallback(() => {
    return currentStatus === "Илгээгээгүй";
  }, [currentStatus]);

  const getStatusMessage = () => {
    switch (currentStatus) {
      case "Хүлээгдэж буй":
        return {
          message: "Энэ тайлан аль хэдийн илгээгдсэн байна. Багшийн хариуг хүлээж байна.",
          color: "bg-yellow-50 border-yellow-200 text-yellow-700",
          icon: <FiCheckCircle className="text-yellow-600" />,
        };
      case "Баталгаажсан":
        return {
          message: "Энэ тайлан баталгаажсан байна. Өөрчлөлт оруулах боломжгүй.",
          color: "bg-green-50 border-green-200 text-green-700",
          icon: <FiCheckCircle className="text-green-600" />,
        };
      case "Буцаасан":
        return {
          message: "Энэ тайлан багшаар буцаагдсан байна. Та засварлаж дахин илгээх боломжтой.",
          color: "bg-yellow-50 border-yellow-200 text-yellow-700",
          icon: <FiAlertCircle className="text-yellow-600" />,
        };
      default:
        return {
          message: "Энэ тайлан илгээгдээгүй байна. Та маягтаа бөглөж илгээнэ үү.",
          color: "bg-gray-50 border-gray-200 text-gray-700",
          icon: <FiFileText className="text-gray-600" />,
        };
    }
  };

  const fetchReportDataAndStatus = async (reportId: number) => {
    setIsLoadingReport(true);
    try {
      let submissionStatus = null;
      let submissionTeacherId = null;
      let submissionTeacherName = null;
      let submissionComment = null;
      let submissionDate = null;
      
      try {
        const submissionListResponse = await fetch(`${API_BASE_URL}/api/report/submissionlist/`, {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });
        const submissionListData = await submissionListResponse.json();
        
        if (submissionListData.resultCode === 6130 && submissionListData.data) {
          const foundSubmission = submissionListData.data.find(
            (item: any) => item.report_id === reportId
          );
          if (foundSubmission) {
            submissionStatus = foundSubmission.current_status;
            submissionTeacherId = foundSubmission.teacher_id;
            submissionTeacherName = foundSubmission.teacher_name;
            submissionComment = foundSubmission.teacher_comment;
            submissionDate = foundSubmission.submission_date;
          }
        }
      } catch {
        // Submission list fetch error - ignore
      }
      
      let reportData = null;
      try {
        const reportResponse = await fetch(`${API_BASE_URL}/api/report/${reportId}/`, {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });
        const data = await reportResponse.json();
        
        if (data.resultCode === 7520 && data.data) {
          reportData = data.data;
        }
      } catch {
        // Report detail fetch error - ignore
      }
      
      let determinedStatus: ReportStatus = "Илгээгээгүй";
      
      if (submissionStatus) {
        determinedStatus = mapApiStatusToDisplayStatus(submissionStatus);
      } else if (reportData?.current_status) {
        determinedStatus = mapApiStatusToDisplayStatus(reportData.current_status);
      } else if (reportData?.submission_date) {
        determinedStatus = "Хүлээгдэж буй";
      }
      
      setCurrentStatus(determinedStatus);
      
      if (submissionDate) {
        setSubmittedAt(submissionDate);
        setHasSubmission(true);
      } else if (reportData?.submission_date) {
        setSubmittedAt(reportData.submission_date);
        setHasSubmission(true);
      } else {
        setHasSubmission(false);
      }
      
      if (submissionComment) {
        setTeacherComment(submissionComment);
        setFeedback(submissionComment);
      } else if (reportData?.teacher_comment) {
        setTeacherComment(reportData.teacher_comment);
        setFeedback(reportData.teacher_comment);
      } else {
        setTeacherComment(undefined);
        setFeedback(undefined);
      }
      
      if (submissionTeacherId) {
        setTeacherId(submissionTeacherId);
      } else if (reportData?.teacher_id) {
        setTeacherId(reportData.teacher_id);
      }
      
      if (submissionTeacherName) {
        setTeacherName(submissionTeacherName);
      } else if (reportData?.teacher_first_name || reportData?.teacher_last_name) {
        const fullName = `${reportData?.teacher_last_name || ""} ${reportData?.teacher_first_name || ""}`.trim();
        setTeacherName(fullName);
      }
      
      if (reportData?.report_data && reportData.report_data.sections) {
        const loadedValues: Record<string, string> = {};
        
        const extractValuesFromFields = (fields: any[]) => {
          for (const field of fields) {
            if (field.id && field.result !== undefined) {
              const cleanValue = field.result.toString().replace(/[₮,]/g, '').trim();
              loadedValues[field.id] = cleanValue;
            }
            if (field.children && field.children.length > 0) {
              extractValuesFromFields(field.children);
            }
          }
        };
        
        for (const section of reportData.report_data.sections) {
          if (section.fields) {
            extractValuesFromFields(section.fields);
          }
        }
        
        if (Object.keys(loadedValues).length > 0) {
          setFormData(prev => ({
            ...prev,
            values: loadedValues
          }));
          setTimeout(() => recalculateAll(), 100);
        } else {
          initializeValues();
        }
      } else {
        initializeValues();
      }
      
      if (reportData?.report_name) {
        setFormData(prev => ({ ...prev, report_name: reportData.report_name }));
      }
      
      if (determinedStatus === "Буцаасан" && submissionTeacherId && teachers.length > 0) {
        const teacher = teachers.find(t => t.id === submissionTeacherId);
        if (teacher) {
          setSelectedTeacher(teacher);
          setFormData(prev => ({ ...prev, teacher_id: teacher.id }));
        }
      }
      
    } catch {
      initializeValues();
      setCurrentStatus("Илгээгээгүй");
    } finally {
      setIsLoadingReport(false);
    }
  };

  const initializeValues = () => {
    const initialValues: Record<string, string> = {};
    const setInitialValues = (fields: Field[]) => {
      for (const field of fields) {
        if (!field.isCalculated) initialValues[field.id] = "";
        if (field.children?.length) setInitialValues(field.children);
      }
    };
    setInitialValues(reportStructure.sections.flatMap((s) => s.fields));
    setFormData((prev) => ({ ...prev, values: initialValues }));
  };

  const fetchTeachers = async () => {
    setIsLoadingTeachers(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/user/teacher/`, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();

      if (data.resultCode === 7630 && data.data) {
        setTeachers(data.data);
      }
    } catch {
      // Error fetching teachers - ignore
    } finally {
      setIsLoadingTeachers(false);
    }
  };

  const getValue = useCallback(
    (fieldId: string): number => {
      const value = formData.values[fieldId];
      if (value === undefined || value === null || value === "") return 0;
      const num = Number(value);
      return isNaN(num) ? 0 : num;
    },
    [formData.values]
  );

  const getDisplayValue = useCallback(
    (fieldId: string): string => {
      if (inputFocusRef.current[fieldId] && tempInputValueRef.current[fieldId] !== undefined) {
        return tempInputValueRef.current[fieldId];
      }
      if (inputFocusRef.current[fieldId]) {
        const rawValue = formData.values[fieldId];
        return rawValue === undefined || rawValue === null || rawValue === "" ? "" : rawValue;
      }
      const value = formData.values[fieldId];
      if (value === undefined || value === null || value === "") return "0.00 ₮";
      const num = parseFloat(value);
      if (isNaN(num)) return "0.00 ₮";
      return formatAsMoney(num.toString());
    },
    [formData.values]
  );

  const evaluateRule = useCallback(
    (rule?: string): number => {
      if (!rule) return 0;
      
      let expression = rule;
      expression = expression.replace(/(\d+(?:\.\d+)?)%/g, (_, p1) => {
        return `(${parseFloat(p1) / 100})`;
      });
      expression = expression.replace(/\b(\d+)\b/g, (match) => {
        const value = getValue(match);
        return value.toString();
      });
      
      try {
        const result = Function('"use strict"; return (' + expression + ')')();
        return isNaN(result) ? 0 : result;
      } catch {
        return 0;
      }
    },
    [getValue]
  );

  const recalculateAll = useCallback(() => {
    setFormData((prev) => {
      const newValues = { ...prev.values };
      
      const calculatedFields: Field[] = [];
      const collectCalculatedFields = (fields: Field[]) => {
        for (const field of fields) {
          if (field.isCalculated && field.calculationRule) {
            calculatedFields.push(field);
          }
          if (field.children?.length) collectCalculatedFields(field.children);
        }
      };
      
      collectCalculatedFields(reportStructure.sections.flatMap((s) => s.fields));
      
      for (let iteration = 0; iteration < 10; iteration++) {
        for (const field of calculatedFields) {
          if (field.calculationRule) {
            const result = evaluateRule(field.calculationRule);
            const currentValue = parseFloat(newValues[field.id] || "0");
            if (Math.abs(currentValue - result) > 0.001) {
              newValues[field.id] = result.toString();
            }
          }
        }
      }
      
      return { ...prev, values: newValues };
    });
  }, [evaluateRule]);

  const handleFocus = useCallback((fieldId: string) => {
    if (isReportLocked()) return;
    inputFocusRef.current[fieldId] = true;
    tempInputValueRef.current[fieldId] = "";
    setFormData((prev) => ({ ...prev }));
  }, [isReportLocked]);

  const handleBlur = useCallback(
    (fieldId: string) => {
      if (isReportLocked()) return;
      inputFocusRef.current[fieldId] = false;
      delete tempInputValueRef.current[fieldId];
      const currentValue = formData.values[fieldId];
      if (currentValue && currentValue !== "") {
        const num = parseFloat(currentValue);
        if (!isNaN(num)) {
          setFormData((prev) => ({
            ...prev,
            values: { ...prev.values, [fieldId]: num.toString() },
          }));
        }
      }
      setFormData((prev) => ({ ...prev }));
    },
    [formData.values, isReportLocked]
  );

  const handleInputChange = useCallback(
    (fieldId: string, displayValue: string) => {
      if (isReportLocked()) return;
      tempInputValueRef.current[fieldId] = displayValue;
      const cleanValue = parseInputValue(displayValue);
      setFormData((prev) => ({
        ...prev,
        values: { ...prev.values, [fieldId]: cleanValue },
      }));
      if (recalculateTimeoutRef.current) clearTimeout(recalculateTimeoutRef.current);
      recalculateTimeoutRef.current = setTimeout(() => recalculateAll(), 100);
    },
    [recalculateAll, isReportLocked]
  );

  const resetAllValues = () => {
    if (isReportLocked()) {
      setSubmitError("Тайлан илгээгдсэн эсвэл баталгаажсан тул утгуудыг өөрчлөх боломжгүй.");
      return;
    }
    const newValues: Record<string, string> = {};
    const resetFields = (fields: Field[]) => {
      for (const field of fields) {
        if (!field.isCalculated) newValues[field.id] = "";
        if (field.children?.length) resetFields(field.children);
      }
    };
    resetFields(reportStructure.sections.flatMap((s) => s.fields));
    setFormData((prev) => ({ ...prev, values: newValues }));
    setTimeout(() => recalculateAll(), 0);
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
    setTimeout(() => notificationDiv.remove(), 5000);
  };

  const handleSaveError = (data: any) => {
    if (data.resultCode === 7824) {
      setSubmitError("Method буруу. Зөвхөн POST хүсэлт илгээнэ үү.");
    } else if (data.resultCode === 7825) {
      setSubmitError("Хүсэлтийн бие (body) JSON форматтай биш байна.");
    } else if (data.resultCode === 7826) {
      setSubmitError("report_data хоосон байна.");
    } else if (data.resultCode === 7822) {
      setSubmitError("Мэдээллийн сангийн алдаа гарлаа.");
    } else if (data.resultCode === 7823) {
      setSubmitError("Серверийн алдаа гарлаа.");
    } else if (data.resultCode === 8213) {
      setSubmitError("Токен хүчингүй эсвэл хугацаа нь дууссан. Дахин нэвтэрнэ үү.");
      setTimeout(() => router.push("/login"), 2000);
    } else {
      setSubmitError(data.resultMessage || `Алдаа гарлаа (Код: ${data.resultCode})`);
    }
  };

  const updateReportStructureWithValues = (structure: any, values: Record<string, string>): any => {
    const updateFields = (fields: any[]): any[] => {
      return fields.map(field => {
        const updatedField = { ...field };
        
        if (field.id && values[field.id] !== undefined) {
          const numValue = parseFloat(values[field.id]);
          updatedField.result = formatAsMoney(isNaN(numValue) ? 0 : numValue);
        }
        
        if (field.children && field.children.length > 0) {
          updatedField.children = updateFields(field.children);
        }
        
        return updatedField;
      });
    };
    
    return {
      ...structure,
      sections: structure.sections.map((section: any) => ({
        ...section,
        fields: updateFields(section.fields)
      }))
    };
  };

  const saveReport = async (isDraft: boolean = false) => {
    if (isReportLocked()) {
      setSubmitError("Энэ тайлан аль хэдийн илгээгдсэн эсвэл баталгаажсан тул өөрчлөлт оруулах боломжгүй.");
      return;
    }

    const isFirstSubmission = currentStatus === "Илгээгээгүй";
    const isRejected = currentStatus === "Буцаасан";
    
    if (!isDraft && isFirstSubmission && !selectedTeacher) {
      setSubmitError("Тайлан илгээх багшаа сонгоно уу");
      setShowTeacherModal(true);
      return;
    }
    
    if (!isDraft && isRejected && !teacherId && !selectedTeacher) {
      setSubmitError("Тайлан илгээх багшаа сонгоно уу");
      setShowTeacherModal(true);
      return;
    }

    const currentReportId = reportIdRef.current;
    if (!currentReportId) {
      setSubmitError("Тайлангийн ID олдсонгүй.");
      return;
    }

    if (isDraft) {
      setIsSavingDraft(true);
    } else {
      setIsSubmitting(true);
    }
    setSubmitError("");

    try {
      const updatedReportStructure = updateReportStructureWithValues(reportStructure, formData.values);
      
      const savePayload = { report_data: updatedReportStructure };

      const saveResponse = await fetch(
        `${API_BASE_URL}/api/report/savereportfields/${currentReportId}/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(savePayload),
        }
      );

      if (!saveResponse.ok) {
        throw new Error(`HTTP ${saveResponse.status}: ${saveResponse.statusText}`);
      }

      const saveData = await saveResponse.json();

      if (isDraft) {
        if (saveData.resultCode === 7820) {
          showNotification("Тайлан ноорог хэлбэрээр амжилттай хадгалагдлаа.", "success");
          setSubmitSuccess(true);
          setTimeout(() => setSubmitSuccess(false), 3000);
        } else {
          handleSaveError(saveData);
        }
        setIsSavingDraft(false);
        return;
      }

      if (saveData.resultCode !== 7820) {
        handleSaveError(saveData);
        setIsSubmitting(false);
        return;
      }

      let targetTeacherId: number | undefined;
      if (isRejected && teacherId) {
        targetTeacherId = teacherId;
      } else if (selectedTeacher) {
        targetTeacherId = selectedTeacher.id;
      }
      
      if (!targetTeacherId) {
        setSubmitError("Багшийн мэдээлэл олдсонгүй");
        setIsSubmitting(false);
        return;
      }

      const submissionPayload = {
        report_id: currentReportId,
        teacher_id: targetTeacherId,
      };

      const submissionResponse = await fetch(
        `${API_BASE_URL}/api/report/addsubmission/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(submissionPayload),
        }
      );

      const submissionData = await submissionResponse.json();

      if (submissionData.resultCode === 6120) {
        showNotification("Тайлан амжилттай илгээгдлээ.", "success");
        setSubmitSuccess(true);
        
        setCurrentStatus("Хүлээгдэж буй");
        setHasSubmission(true);
        setSubmittedAt(new Date().toISOString());
        
        const teacher = teachers.find(t => t.id === targetTeacherId);
        if (teacher) {
          setTeacherName(`${teacher.last_name} ${teacher.first_name}`);
          setTeacherId(teacher.id);
        }
        
        setTeacherComment(undefined);
        setFeedback(undefined);
        
        setTimeout(() => {
          setSubmitSuccess(false);
          router.push("/student/reports");
        }, 2000);
      } else if (submissionData.resultCode === 6126) {
        setSubmitError("Энэ тайлан аль хэдийн илгээгдсэн байна. Дахин илгээх боломжгүй.");
      } else {
        setSubmitError(submissionData.resultMessage || `Алдаа гарлаа (Код: ${submissionData.resultCode})`);
      }
    } catch (error: any) {
      setSubmitError(error.message || "Тайлан хадгалахад алдаа гарлаа");
    } finally {
      setIsSubmitting(false);
      setIsSavingDraft(false);
    }
  };

  const renderFields = (fields: Field[], level: number = 0) => {
    const locked = isReportLocked();
    return fields
      .sort((a, b) => a.order - b.order)
      .map((field) => (
        <div key={field.id}>
          <div
            className={`grid grid-cols-12 gap-4 p-3 ${
              field.isCalculated ? "bg-blue-50" : ""
            } border-b border-gray-200 hover:bg-gray-50/50 transition ${
              locked && !field.isCalculated ? "bg-gray-50" : ""
            }`}
          >
            <div className="col-span-1 font-medium text-gray-700 text-center">
              {field.id}
            </div>
            <div className="col-span-8">
              <div
                className="text-sm text-gray-900"
                style={{ paddingLeft: `${level * 20}px` }}
              >
                {field.label}
                {field.isCalculated && field.calculationRule && (
                  <span className="ml-2 text-xs text-blue-600">
                    (Томьёо: {field.calculationRule})
                  </span>
                )}
              </div>
            </div>
            <div className="col-span-3">
              <input
                type="text"
                inputMode="decimal"
                value={getDisplayValue(field.id)}
                onChange={(e) => handleInputChange(field.id, e.target.value)}
                onFocus={() => handleFocus(field.id)}
                onBlur={() => handleBlur(field.id)}
                readOnly={field.isCalculated || locked}
                disabled={locked && !field.isCalculated}
                placeholder="0.00 ₮"
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-right text-gray-900 font-normal ${
                  field.isCalculated
                    ? "bg-blue-100/50 font-medium cursor-not-allowed"
                    : locked
                    ? "bg-gray-100 cursor-not-allowed text-gray-500"
                    : "bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                } ${
                  (!formData.values[field.id] || formData.values[field.id] === "") &&
                  !field.isCalculated && !locked
                    ? "border-yellow-300 bg-yellow-50/30"
                    : ""
                }`}
              />
            </div>
          </div>
          {field.children && renderFields(field.children, level + 1)}
        </div>
      ));
  };

  const summaryValues = [
    { id: "31", label: "Нийтлэг хувь хэмжээгээр ногдуулсан татвар", value: getValue("31") },
    { id: "51", label: "Тусгай хувь хэмжээгээр ногдуулсан татвар", value: getValue("51") },
    { id: "54", label: "Төлбөл зохих татварын дүн", value: getValue("54") },
    { id: "58", label: "Нийт төлбөл зохих татварын дүн", value: getValue("58") },
  ];

  const TeacherSelectionModal = () => (
    <AnimatePresence>
      {showTeacherModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowTeacherModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
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
                <button
                  onClick={() => setShowTeacherModal(false)}
                  className="text-white/80 hover:text-white transition p-2"
                >
                  <FiX className="text-2xl" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(85vh-140px)] custom-scrollbar">
              <div className="relative mb-6">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                <input
                  type="text"
                  placeholder="Нэр, овог, эмэйлээр хайх..."
                  value={teacherSearchTerm}
                  onChange={(e) => setTeacherSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  autoFocus
                />
                {teacherSearchTerm && (
                  <button
                    onClick={() => setTeacherSearchTerm("")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <FiX />
                  </button>
                )}
              </div>

              {selectedTeacher && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-200"
                >
                  <div className="flex items-center gap-3">
                    <FaUserCheck className="text-green-600 text-2xl" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">Сонгосон багш</p>
                      <p className="font-semibold text-gray-900 text-lg">
                        {selectedTeacher.last_name} {selectedTeacher.first_name}
                      </p>
                      <p className="text-sm text-gray-500">{selectedTeacher.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedTeacher(null);
                        setFormData(prev => ({ ...prev, teacher_id: undefined }));
                      }}
                      className="text-red-500 hover:text-red-700 p-2"
                    >
                      <FiX />
                    </button>
                  </div>
                </motion.div>
              )}

              <div className="space-y-3">
                {isLoadingTeachers ? (
                  <div className="text-center py-12">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-500">Багш нар ачааллаж байна...</p>
                  </div>
                ) : filteredTeachers.length > 0 ? (
                  filteredTeachers.map((teacher, index) => (
                    <motion.div
                      key={teacher.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => {
                        setSelectedTeacher(teacher);
                        setFormData(prev => ({ ...prev, teacher_id: teacher.id }));
                        setTeacherSearchTerm("");
                        setShowTeacherModal(false);
                      }}
                      className={`p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                        selectedTeacher?.id === teacher.id
                          ? "bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-500 shadow-md"
                          : "bg-gray-50 border-2 border-transparent hover:border-blue-300 hover:shadow-md hover:bg-white"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                          selectedTeacher?.id === teacher.id
                            ? "bg-gradient-to-br from-blue-500 to-indigo-600"
                            : "bg-gray-400"
                        }`}>
                          <span className="text-white font-bold text-lg">
                            {teacher.first_name?.charAt(0)}{teacher.last_name?.charAt(0)}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-gray-900 text-lg">
                              {teacher.last_name} {teacher.first_name}
                            </h3>
                            {selectedTeacher?.id === teacher.id && (
                              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                                Сонгогдсон
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <FiMail className="text-xs" />
                              {teacher.email}
                            </span>
                            {teacher.department && (
                              <span className="flex items-center gap-1">
                                <FiBookOpen className="text-xs" />
                                {teacher.department}
                              </span>
                            )}
                          </div>
                        </div>
                        {selectedTeacher?.id === teacher.id && (
                          <FiCheckCircle className="text-green-500 text-xl flex-shrink-0" />
                        )}
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <FiUser className="text-6xl text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">Багш олдсонгүй</p>
                    <p className="text-gray-400 text-sm mt-1">
                      {teacherSearchTerm ? `"${teacherSearchTerm}" -тай тохирох багш байхгүй` : "Бүртгэлтэй багш байхгүй байна"}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => setShowTeacherModal(false)}
                className="px-5 py-2 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition"
              >
                Хаах
              </button>
              {selectedTeacher && (
                <button
                  onClick={() => setShowTeacherModal(false)}
                  className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:opacity-90 transition"
                >
                  Сонгох
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (isLoadingReport) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusMessage();
  const locked = isReportLocked();
  const showTeacherSection = showTeacherSelection();
  
  const isSubmitButtonDisabled = () => {
    if (isSubmitting) return true;
    if (!reportIdRef.current) return true;
    if (!canSubmit()) return true;
    if (currentStatus === "Илгээгээгүй" && !selectedTeacher) return true;
    if (currentStatus === "Буцаасан" && !teacherId && !selectedTeacher) return true;
    return false;
  };

  const getSubmitButtonText = () => {
    if (isSubmitting) return "Илгээж байна...";
    if (currentStatus === "Буцаасан") return "Дахин илгээх";
    return "Тайлан илгээх";
  };

  const getDisplayStatus = () => {
    switch (currentStatus) {
      case "Хүлээгдэж буй": return "Хүлээгдэж буй";
      case "Баталгаажсан": return "Баталгаажсан";
      case "Буцаасан": return "Буцаасан";
      default: return "Илгээгээгүй";
    }
  };

  const getStatusColor = () => {
    switch (currentStatus) {
      case "Хүлээгдэж буй": return "bg-yellow-100 text-yellow-700";
      case "Баталгаажсан": return "bg-green-100 text-green-700";
      case "Буцаасан": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] via-white to-[#eef2ff]">
      <Header />
      <TeacherSelectionModal />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/student/dashboard" className="hover:text-blue-600 flex items-center gap-1">
            <FiHome className="text-sm" /> Нүүр
          </Link>
          <span>/</span>
          <Link href="/student/reports" className="hover:text-blue-600 flex items-center gap-1">
            <FiFileText className="text-sm" /> Тайлангууд
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">
            {formData.report_name ? `Тайлан засварлах - ${formData.report_name}` : "Татварын тайлан"}
          </span>
        </div>

        {statusInfo && (
          <div className={`mb-6 p-4 ${statusInfo.color} rounded-xl border flex flex-col gap-3`}>
            <div className="flex items-center gap-3">
              {statusInfo.icon}
              <span>{statusInfo.message}</span>
            </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Татварын тайлангийн маягт</h1>
            <p className="text-black mt-1 flex items-center gap-2">
              <FaGraduationCap className="text-blue-600" />
              Тайлангийн төлөв :  
              <span className={`ml-2 px-3 py-1 text-xs rounded-full ${getStatusColor()}`}>
                {getDisplayStatus()}
              </span>
            </p>
          </div>
        </div>

        {!reportIdRef.current && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3 text-amber-700">
            <FiAlertCircle className="text-xl flex-shrink-0" />
            <span>Тайлангийн ID олдсонгүй.</span>
          </div>
        )}

        {(currentStatus === "Хүлээгдэж буй" || currentStatus === "Баталгаажсан") && teacherName && (
          <div className="mb-6 bg-white rounded-xl shadow-lg border border-gray-200 p-5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <FaChalkboardTeacher className="text-white text-xl" />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Илгээсэн багш</label>
                <div>
                  <p className="font-semibold text-gray-900">{teacherName}</p>
                  {submittedAt && (
                    <p className="text-sm text-gray-500">Илгээсэн огноо: {new Date(submittedAt).toLocaleString()}</p>
                  )}
                </div>
                {teacherComment && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <FiMessageSquare className="text-blue-600" />
                      <h3 className="font-semibold text-gray-900">Багшийн сэтгэгдэл</h3>
                    </div>
                    <p className="text-gray-700 whitespace-pre-wrap">{teacherComment}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {currentStatus === "Буцаасан" && teacherName && (
          <div className="mb-6 bg-white rounded-xl shadow-lg border border-gray-200 p-5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <FaChalkboardTeacher className="text-white text-xl" />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Өмнө нь илгээсэн багш</label>
                <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-xl border border-orange-200">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-600 to-orange-700 text-white flex items-center justify-center font-bold">
                    {teacherName.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{teacherName}</p>
                    <p className="text-xs text-gray-500">Энэ багш руу дахин илгээх болно</p>
                  </div>
                </div>
                {teacherComment && (
                  <div className="mt-4 p-4 bg-red-50 rounded-xl border border-red-200">
                    <div className="flex items-center gap-2 mb-2">
                      <FiMessageSquare className="text-red-600" />
                      <h3 className="font-semibold text-gray-900">Багшийн буцаасан шалтгаан</h3>
                    </div>
                    <p className="text-gray-700 whitespace-pre-wrap">{teacherComment}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {showTeacherSection && (
          <div className="mb-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden"
            >
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                      <FaChalkboardTeacher className="text-white text-xl" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-lg">Тайлан илгээх багш</h3>
                      <p className="text-blue-100 text-sm">Тайлангаа хянах багшаа сонгоно уу</p>
                    </div>
                  </div>
                  {!selectedTeacher && (
                    <span className="px-3 py-1 bg-red-500 text-white text-xs rounded-full font-medium">Заавал сонгох</span>
                  )}
                </div>
              </div>
              
              <div className="p-6">
                {selectedTeacher ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-xl">
                            {selectedTeacher.first_name?.charAt(0)}{selectedTeacher.last_name?.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 text-lg">
                            {selectedTeacher.last_name} {selectedTeacher.first_name}
                          </h4>
                          <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                            <FiMail className="text-xs" />
                            {selectedTeacher.email}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedTeacher(null);
                          setFormData(prev => ({ ...prev, teacher_id: undefined }));
                        }}
                        className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition"
                      >
                        <FiX className="text-xl" />
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <button
                    onClick={() => setShowTeacherModal(true)}
                    className="w-full p-4 border-2 border-dashed border-gray-300 rounded-xl text-center hover:border-blue-400 hover:bg-blue-50 transition group"
                  >
                    <FaChalkboardTeacher className="text-4xl text-gray-400 mx-auto mb-2 group-hover:text-blue-500 transition" />
                    <p className="text-gray-500 group-hover:text-blue-600 transition">Багш сонгох</p>
                    <p className="text-xs text-gray-400 mt-1">Сонгох товч дарж багшаа сонгоно уу</p>
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}

        <AnimatePresence>
          {submitSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 text-green-700"
            >
              <FiCheckCircle className="text-xl flex-shrink-0" />
              <span>Тайлан амжилттай хадгалагдлаа.</span>
            </motion.div>
          )}
          {submitError && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700"
            >
              <FiAlertCircle className="text-xl flex-shrink-0" />
              <span>{submitError}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {summaryValues.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-lg border border-gray-200 p-5 hover:shadow-xl transition"
            >
              <div className="text-sm text-gray-500 mb-2">Мөр {item.id}</div>
              <div className="text-2xl font-bold text-gray-900">{formatAsMoney(item.value)}</div>
              <div className="text-xs text-gray-400 mt-1">{item.label}</div>
            </motion.div>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-6">
          <button
            onClick={resetAllValues}
            disabled={locked}
            className={`px-4 py-2 rounded-xl transition flex items-center gap-2 ${
              locked ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            <FiRefreshCw /> Бүгдийг 0 болгох
          </button>

          <button
            onClick={() => saveReport(true)}
            disabled={locked || isSavingDraft || !reportIdRef.current}
            className={`px-5 py-2 rounded-xl transition flex items-center gap-2 ${
              locked || isSavingDraft || !reportIdRef.current
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            {isSavingDraft ? (
              <>
                <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
                Хадгалж байна...
              </>
            ) : (
              <>
                <FiSave /> Ноорог хадгалах
              </>
            )}
          </button>

          <button
            onClick={() => saveReport(false)}
            disabled={isSubmitButtonDisabled()}
            className={`px-6 py-2 rounded-xl font-medium shadow-lg transition flex items-center gap-2 ${
              isSubmitButtonDisabled()
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-[#0f172a] to-[#1e3a8a] text-white hover:opacity-90"
            } ml-auto`}
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Илгээж байна...
              </>
            ) : (
              <>
                <FiSend /> {getSubmitButtonText()}
              </>
            )}
          </button>
        </div>

        <div className="space-y-6">
          {reportStructure.sections.map((section, sectionIndex) => (
            <motion.div
              key={section.id}
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
                <div className="border-x border-b border-gray-200 rounded-b-lg divide-y divide-gray-200">
                  {renderFields(section.fields)}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 text-center text-xs text-gray-400">
          <p>Тооцоолол автоматаар шинэчлэгдэнэ. Цэнхэр мөрүүд нь томьёотой мөрүүд.</p>
          <p className="mt-1">Бүх дүнг MNT (төгрөг)-өөр бөглөнө үү.</p>
          {reportIdRef.current && (
            <p className="mt-2 text-blue-500">Тайлан ID: {reportIdRef.current}</p>
          )}
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
}