// app/student/tax-report/page.tsx
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useSearchParams } from "next/navigation";
import {
  FiSave,
  FiSend,
  FiRefreshCw,
  FiAlertCircle,
  FiCheckCircle,
  FiUser,
  FiCalendar,
  FiArrowLeft,
  FiHome,
  FiFileText,
  FiLock,
} from "react-icons/fi";
import { FaChalkboardTeacher, FaGraduationCap } from "react-icons/fa";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/app/component/Header";
import { API_BASE_URL } from "@/api_base_url/page";
import { 
  reportStructure, 
  parseInputValue,
  formatAsMoney,
  type Field,
  type Section
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
  tax_period_year: number;
  tax_period_month: number;
  values: Record<string, string>;
  teacher_id?: number;
  report_id?: number;
  is_draft?: boolean;
  report_name?: string;
}

interface ReportStatus {
  is_submitted: boolean;
  status: string;
  submitted_at?: string;
  teacher_name?: string;
  feedback?: string;
}

export default function TaxReportPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [showTeacherList, setShowTeacherList] = useState(false);
  const [isLoadingTeachers, setIsLoadingTeachers] = useState(true);
  const [isLoadingReport, setIsLoadingReport] = useState(false);
  const [reportStatus, setReportStatus] = useState<ReportStatus | null>(null);

  const recalculateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const inputFocusRef = useRef<{ [key: string]: boolean }>({});
  const tempInputValueRef = useRef<{ [key: string]: string }>({});
  const params = useParams();
  const searchParams = useSearchParams();
  const reportIdFromUrl = params.id as string;
  const orgId = searchParams.get("org_id");

  const reportIdRef = useRef<number | undefined>(undefined);

  const [studentInfo, setStudentInfo] = useState({ id: "", name: "" });
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);

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

  // Тайлан илгээгдсэн эсэхийг шалгах
  const isReportLocked = reportStatus?.is_submitted === true || 
    reportStatus?.status === "Хүлээгдэж байна" || 
    reportStatus?.status === "Баталгаажсан" ||
    reportStatus?.status === "Буцаагдсан";

  const getStatusMessage = () => {
    if (!reportStatus) return null;
    
    switch (reportStatus.status) {
      case "Хүлээгдэж байна":
        return {
          message: "Энэ тайлан аль хэдийн илгээгдсэн байна. Дахин илгээх боломжгүй.",
          color: "bg-blue-50 border-blue-200 text-blue-700",
          icon: <FiCheckCircle className="text-blue-600" />
        };
      case "Баталгаажсан":
        return {
          message: "Энэ тайлан баталгаажсан байна. Өөрчлөлт оруулах боломжгүй.",
          color: "bg-green-50 border-green-200 text-green-700",
          icon: <FiCheckCircle className="text-green-600" />
        };
      case "Буцаагдсан":
        return {
          message: "Энэ тайлан татгалзсан байна. Багшийн санал шүүмжийг харна уу.",
          color: "bg-red-50 border-red-200 text-red-700",
          icon: <FiAlertCircle className="text-red-600" />
        };
      default:
        return null;
    }
  };

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

    if (reportIdFromUrl) {
      const parsedId = parseInt(reportIdFromUrl);
      if (!isNaN(parsedId)) {
        reportIdRef.current = parsedId;
        setFormData((prev) => ({ ...prev, report_id: parsedId }));
        fetchReportData(parsedId);
        fetchReportStatus(parsedId);
      }
    } else {
      initializeValues();
    }
  }, [reportIdFromUrl]);

  // Тайлангийн статусыг шалгах
  const fetchReportStatus = async (reportId: number) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/report/${reportId}/status/`,
        {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        }
      );

      const data = await response.json();
      console.log("Тайлангийн статус:", data);

      if (data.resultCode === 7520 && data.data) {
        setReportStatus({
          is_submitted: data.data.is_submitted || false,
          status: data.data.status || "draft",
          submitted_at: data.data.submitted_at,
          teacher_name: data.data.teacher_name,
          feedback: data.data.feedback,
        });
      }
    } catch (error) {
      console.error("Тайлангийн статус татахад алдаа:", error);
    }
  };

  const fetchReportData = async (reportId: number) => {
    setIsLoadingReport(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/report/${reportId}/`,
        {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        }
      );

      const data = await response.json();
      console.log("Тайлангийн мэдээлэл:", data);

      if (data.resultCode === 7520 && data.data) {
        const report = data.data;
        let reportValues: Record<string, string> = {};

        if (report.report_data) {
          if (typeof report.report_data === "object") {
            reportValues = report.report_data;
          } else if (typeof report.report_data === "string") {
            try {
              reportValues = JSON.parse(report.report_data);
            } catch (e) {
              console.error("JSON parse error:", e);
            }
          }
        }

        // Хэрэв тайлан илгээгдсэн бол input-уудыг readOnly болгох
        const isSubmitted = report.status === "Хүлээгдэж буй" || 
                           report.status === "Баталгаажсан" || 
                           report.status === "Буцаагдсан";

        setFormData((prev) => ({
          ...prev,
          values: { ...reportValues },
          report_id: reportId,
          report_name: report.type_name || "",
        }));

        setTimeout(() => recalculateAll(), 100);
      } else {
        initializeValues();
      }
    } catch (error) {
      console.error("Тайлангийн мэдээлэл татахад алдаа:", error);
      initializeValues();
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
      } else {
        console.error("API Error:", data.resultMessage);
      }
    } catch (error) {
      console.error("Багш нар татахад алдаа:", error);
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
      if (
        inputFocusRef.current[fieldId] &&
        tempInputValueRef.current[fieldId] !== undefined
      ) {
        return tempInputValueRef.current[fieldId];
      }
      if (inputFocusRef.current[fieldId]) {
        const rawValue = formData.values[fieldId];
        return rawValue === undefined || rawValue === null || rawValue === ""
          ? ""
          : rawValue;
      }
      const value = formData.values[fieldId];
      if (value === undefined || value === null || value === "") return "0.00 ₮";
      return formatAsMoney(value);
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
        return getValue(match).toString();
      });
      try {
        const result = Function('"use strict"; return (' + expression + ")")();
        return isNaN(result) ? 0 : result;
      } catch (error) {
        console.error("Томьёо бодоход алдаа:", rule, error);
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
        fields.sort((a, b) => a.order - b.order);
        for (const field of fields) {
          if (field.isCalculated && field.calculationRule)
            calculatedFields.push(field);
          if (field.children?.length) collectCalculatedFields(field.children);
        }
      };
      collectCalculatedFields(reportStructure.sections.flatMap((s) => s.fields));
      for (let i = 0; i < 5; i++) {
        for (const field of calculatedFields) {
          if (field.calculationRule) {
            const result = evaluateRule(field.calculationRule);
            if (newValues[field.id] !== result.toString()) {
              newValues[field.id] = result.toString();
            }
          }
        }
      }
      return { ...prev, values: newValues };
    });
  }, [evaluateRule]);

  const handleFocus = useCallback((fieldId: string) => {
    if (isReportLocked) return; // Түгжигдсэн бол фокус авахгүй
    inputFocusRef.current[fieldId] = true;
    tempInputValueRef.current[fieldId] = "";
    setFormData((prev) => ({ ...prev }));
  }, [isReportLocked]);

  const handleBlur = useCallback(
    (fieldId: string) => {
      if (isReportLocked) return;
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
      if (isReportLocked) return; // Түгжигдсэн бол өөрчлөх боломжгүй
      tempInputValueRef.current[fieldId] = displayValue;
      const cleanValue = parseInputValue(displayValue);
      setFormData((prev) => ({
        ...prev,
        values: { ...prev.values, [fieldId]: cleanValue },
      }));
      if (recalculateTimeoutRef.current)
        clearTimeout(recalculateTimeoutRef.current);
      recalculateTimeoutRef.current = setTimeout(() => recalculateAll(), 100);
    },
    [recalculateAll, isReportLocked]
  );

  const resetAllValues = () => {
    if (isReportLocked) {
      setSubmitError("Тайлан илгээгдсэн тул утгуудыг өөрчлөх боломжгүй.");
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

  const getAllFields = useCallback((): Field[] => {
    const allFields: Field[] = [];
    const collectFields = (fields: Field[]) => {
      for (const field of fields) {
        allFields.push(field);
        if (field.children?.length) collectFields(field.children);
      }
    };
    collectFields(reportStructure.sections.flatMap((s) => s.fields));
    return allFields;
  }, []);

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

  const saveReport = async (isDraft: boolean = false) => {
    // Тайлан түгжигдсэн эсэхийг шалгах
    if (isReportLocked) {
      setSubmitError("Энэ тайлан аль хэдийн илгээгдсэн эсвэл баталгаажсан тул өөрчлөлт оруулах боломжгүй.");
      return;
    }

    if (!isDraft && !selectedTeacher) {
      setSubmitError("Тайлан илгээх багшаа сонгоно уу");
      return;
    }

    const currentReportId = reportIdRef.current;
    if (!currentReportId) {
      setSubmitError("Тайлангийн ID олдсонгүй. URL дээр id= параметр шаардлагатай.");
      return;
    }

    if (isDraft) {
      setIsSavingDraft(true);
    } else {
      setIsSubmitting(true);
    }
    setSubmitError("");

    try {
      const allFields = getAllFields();

      const valuesToSave: Record<string, string> = {};
      for (const field of allFields) {
        const value = formData.values[field.id];
        const num = parseFloat(value);
        valuesToSave[field.id] =
          value === undefined || value === null || value === ""
            ? "0"
            : isNaN(num)
            ? "0"
            : num.toString();
      }

      const savePayload = { report_data: valuesToSave };

      console.log("1. savereportfields хүсэлт:", {
        report_id: currentReportId,
        payload: savePayload,
      });

      const saveResponse = await fetch(
        `${API_BASE_URL}/api/report/savereportfields/${currentReportId}/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(savePayload),
        }
      );

      const saveData = await saveResponse.json();
      console.log("savereportfields хариу:", saveData);

      if (isDraft) {
        if (saveData.resultCode === 7820 || saveData.resultCode === 7220) {
          showNotification("Тайлан ноорог хэлбэрээр амжилттай хадгалагдлаа.", "success");
          setSubmitSuccess(true);
          setTimeout(() => setSubmitSuccess(false), 5000);
        } else {
          handleSaveError(saveData);
        }
        setIsSavingDraft(false);
        return;
      }

      if (saveData.resultCode !== 7820 && saveData.resultCode !== 7220) {
        handleSaveError(saveData);
        setIsSubmitting(false);
        return;
      }

      const submissionPayload = {
        report_id: currentReportId,
        teacher_id: selectedTeacher?.id,
      };

      console.log("2. addsubmission хүсэлт:", submissionPayload);

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
      console.log("addsubmission хариу:", submissionData);

      if (submissionData.resultCode === 6120) {
        showNotification("Тайлан амжилттай илгээгдлээ.", "success");
        setSubmitSuccess(true);
        setReportStatus({
          is_submitted: true,
          status: "Хүлээгдэж буй",
          submitted_at: new Date().toISOString(),
          teacher_name: selectedTeacher?.first_name + " " + selectedTeacher?.last_name,
        });
        setTimeout(() => setSubmitSuccess(false), 5000);
        // 2 секундын дараа тайлангийн жагсаалт руу буцах
        setTimeout(() => router.push("/student/reports"), 2000);
      } else if (submissionData.resultCode === 6121) {
        setSubmitError("Шаардлагатай талбарууд дутуу байна.");
      } else if (submissionData.resultCode === 6122) {
        setSubmitError("Мэдээллийн сангийн алдаа гарлаа.");
      } else if (submissionData.resultCode === 6123) {
        setSubmitError("Серверийн алдаа гарлаа.");
      } else if (submissionData.resultCode === 6124) {
        setSubmitError("Method буруу. Зөвхөн POST хүсэлт илгээнэ үү.");
      } else if (submissionData.resultCode === 6125) {
        setSubmitError("Хүсэлтийн бие (body) JSON форматтай биш байна.");
      } else if (submissionData.resultCode === 6126) {
        setSubmitError("Энэ тайлан аль хэдийн илгээгдсэн байна. Дахин илгээх боломжгүй.");
      } else {
        setSubmitError(
          submissionData.resultMessage || `Алдаа гарлаа (Код: ${submissionData.resultCode})`
        );
      }
    } catch (error: any) {
      console.error("Хадгалахад алдаа:", error);
      setSubmitError(error.message || "Тайлан хадгалахад алдаа гарлаа");
    } finally {
      setIsSubmitting(false);
      setIsSavingDraft(false);
    }
  };

  const renderFields = (fields: Field[], level: number = 0) => {
    return fields
      .sort((a, b) => a.order - b.order)
      .map((field) => (
        <div key={field.id}>
          <div
            className={`grid grid-cols-12 gap-4 p-3 ${
              field.isCalculated ? "bg-blue-50" : ""
            } border-b border-gray-200 hover:bg-gray-50/50 transition ${
              isReportLocked && !field.isCalculated ? "bg-gray-50" : ""
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
                readOnly={field.isCalculated || isReportLocked}
                placeholder="0.00 ₮"
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-right text-gray-900 font-normal ${
                  field.isCalculated
                    ? "bg-blue-100/50 font-medium cursor-not-allowed"
                    : isReportLocked
                    ? "bg-gray-100 cursor-not-allowed text-gray-500"
                    : "bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                } ${
                  (!formData.values[field.id] ||
                    formData.values[field.id] === "") &&
                  !field.isCalculated && !isReportLocked
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] via-white to-[#eef2ff]">
      <Header />

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

        {/* Тайлан түгжигдсэн үзүүлэх мэдэгдэл */}
        {statusInfo && (
          <div className={`mb-6 p-4 ${statusInfo.color} rounded-xl border flex items-center gap-3`}>
            {statusInfo.icon}
            <span>{statusInfo.message}</span>
            {reportStatus?.status === "rejected" && reportStatus?.feedback && (
              <div className="ml-4 p-3 bg-white rounded-lg">
                <p className="text-sm font-medium">Багшийн санал:</p>
                <p className="text-sm text-gray-600">{reportStatus.feedback}</p>
              </div>
            )}
          </div>
        )}

        {isReportLocked && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3 text-amber-700">
            <FiLock className="text-xl flex-shrink-0" />
            <span>Энэ тайлан түгжигдсэн байна. Зөвхөн харах боломжтой.</span>
          </div>
        )}

        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Татварын тайлангийн маягт
            </h1>
            <p className="text-gray-600 mt-1 flex items-center gap-2">
              <FaGraduationCap className="text-blue-600" />
              {studentInfo.name} - {studentInfo.id}
              {!isReportLocked && (
                <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                  Ноорог
                </span>
              )}
              {reportStatus?.status === "Хүлээгдэж буй" && (
                <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                  Хүлээгдэж буй
                </span>
              )}
              {reportStatus?.status === "Баталгаажсан" && (
                <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                  Баталгаажсан
                </span>
              )}
              {reportStatus?.status === "Буцаагдсан" && (
                <span className="ml-2 px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                  Буцаагдсан
                </span>
              )}
            </p>
          </div>

          <div className="flex items-center gap-3 mt-4 md:mt-0">
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-200">
              <FiCalendar className="text-gray-400" />
              <select
                value={formData.tax_period_year}
                onChange={(e) =>
                  !isReportLocked && setFormData((prev) => ({ ...prev, tax_period_year: parseInt(e.target.value) }))
                }
                disabled={isReportLocked}
                className="border-none focus:ring-0 text-sm bg-transparent text-gray-900 disabled:text-gray-400"
              >
                {[2023, 2024, 2025, 2026].map((year) => (
                  <option key={year} value={year}>{year} он</option>
                ))}
              </select>
              <span className="text-gray-300">|</span>
              <select
                value={formData.tax_period_month}
                onChange={(e) =>
                  !isReportLocked && setFormData((prev) => ({ ...prev, tax_period_month: parseInt(e.target.value) }))
                }
                disabled={isReportLocked}
                className="border-none focus:ring-0 text-sm bg-transparent text-gray-900 disabled:text-gray-400"
              >
                {[1,2,3,4,5,6,7,8,9,10,11,12].map((month) => (
                  <option key={month} value={month}>{month} сар</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {!reportIdRef.current && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3 text-amber-700">
            <FiAlertCircle className="text-xl flex-shrink-0" />
            <span>
              Тайлангийн ID олдсонгүй. Тайлан жагсаалтаас тайлан дээрээ дарж орно уу.
            </span>
          </div>
        )}

        {/* Багш сонгох хэсэг - Зөвхөн түгжигдээгүй үед л харагдана */}
        {!isReportLocked && (
          <div className="mb-6">
            {!showTeacherList ? (
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-5">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <FaChalkboardTeacher className="text-white text-xl" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Тайлан илгээх багш <span className="text-red-500">*</span>
                    </label>
                    {selectedTeacher ? (
                      <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-200">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 text-white flex items-center justify-center font-bold text-lg">
                            {selectedTeacher.first_name?.charAt(0) || selectedTeacher.email?.charAt(0).toUpperCase() || "Б"}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">
                              {selectedTeacher.last_name} {selectedTeacher.first_name}
                            </p>
                            <p className="text-sm text-gray-500 flex items-center gap-1">
                              <FiUser className="text-xs" />
                              {selectedTeacher.email}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => setShowTeacherList(true)}
                          className="px-4 py-2 text-sm text-blue-600 hover:bg-blue-100 rounded-lg transition font-medium"
                        >
                          Өөрчлөх
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowTeacherList(true)}
                        className="w-full md:w-96 px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl text-left text-gray-500 hover:border-blue-400 hover:bg-blue-50 transition flex items-center gap-3 group"
                      >
                        <FiUser className="text-gray-400 group-hover:text-blue-500" />
                        <span className="group-hover:text-blue-600">Багш сонгоно уу...</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="p-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FaChalkboardTeacher className="text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Багш сонгох</h3>
                        <p className="text-sm text-gray-500">Нийт {teachers.length} багш бүртгэлтэй</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowTeacherList(false)}
                      className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700 transition flex items-center gap-1"
                    >
                      <FiArrowLeft /> Буцах
                    </button>
                  </div>
                </div>
                <div className="p-5">
                  {isLoadingTeachers ? (
                    <div className="flex justify-center items-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  ) : teachers.length === 0 ? (
                    <div className="text-center py-12">
                      <FaChalkboardTeacher className="text-gray-300 text-5xl mx-auto mb-3" />
                      <p className="text-gray-500">Багш олдсонгүй</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {teachers.map((teacher) => (
                        <motion.div
                          key={teacher.id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          whileHover={{ scale: 1.02 }}
                          onClick={() => {
                            setSelectedTeacher(teacher);
                            setFormData((prev) => ({ ...prev, teacher_id: teacher.id }));
                            setShowTeacherList(false);
                          }}
                          className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                            selectedTeacher?.id === teacher.id
                              ? "border-blue-500 bg-blue-50 shadow-md"
                              : "border-gray-200 hover:border-blue-300 hover:shadow-md"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center font-bold text-lg flex-shrink-0">
                              {teacher.first_name?.charAt(0) || teacher.email?.charAt(0).toUpperCase() || "Б"}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-gray-900 truncate">
                                {teacher.last_name} {teacher.first_name}
                              </h4>
                              <p className="text-sm text-gray-500 truncate">{teacher.email}</p>
                            </div>
                            {selectedTeacher?.id === teacher.id && (
                              <FiCheckCircle className="text-green-500 flex-shrink-0" />
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Илгээгдсэн үед багшийн мэдээллийг харуулах */}
        {isReportLocked && reportStatus?.teacher_name && (
          <div className="mb-6 bg-white rounded-xl shadow-lg border border-gray-200 p-5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <FaChalkboardTeacher className="text-white text-xl" />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Илгээсэн багш
                </label>
                <div className="flex items-center gap-3">
                  <div>
                    <p className="font-semibold text-gray-900">{reportStatus.teacher_name}</p>
                    {reportStatus.submitted_at && (
                      <p className="text-sm text-gray-500">
                        Илгээсэн огноо: {new Date(reportStatus.submitted_at).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
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
              <div className="text-2xl font-bold text-gray-900">
                {formatAsMoney(item.value)}
              </div>
              <div className="text-xs text-gray-400 mt-1">{item.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Үйлдлийн товчнууд - Түгжигдсэн үед нуугдах эсвэл идэвхгүй болох */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <button
            onClick={resetAllValues}
            disabled={isReportLocked}
            className={`px-4 py-2 rounded-xl transition flex items-center gap-2 ${
              isReportLocked
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            <FiRefreshCw /> Бүгдийг 0 болгох
          </button>

          <button
            onClick={() => saveReport(true)}
            disabled={isSavingDraft || !reportIdRef.current || isReportLocked}
            className={`px-5 py-2 rounded-xl transition flex items-center gap-2 ${
              isSavingDraft || !reportIdRef.current || isReportLocked
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
            disabled={isSubmitting || !selectedTeacher || !reportIdRef.current || isReportLocked}
            className={`px-6 py-2 rounded-xl font-medium shadow-lg transition flex items-center gap-2 ${
              isSubmitting || !selectedTeacher || !reportIdRef.current || isReportLocked
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
                <FiSend /> Тайлан илгээх
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
    </div>
  );
}