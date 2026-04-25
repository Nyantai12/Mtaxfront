"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams } from "next/navigation";
import {
  FiSave, FiSend, FiRefreshCw, FiAlertCircle, FiCheckCircle,
  FiHome, FiFileText, FiMessageSquare, FiSearch, FiX, FiUser, FiMail, FiBookOpen, FiClock,
  FiXCircle,
} from "react-icons/fi";
import { FaChalkboardTeacher, FaGraduationCap, FaUserCheck } from "react-icons/fa";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/app/component/Header";
import { API_BASE_URL } from "@/api_base_url/page";
import { 
  reportStructure, parseInputValue, formatAsMoney, parseBackendValue,
  type Field, ALL_FIELD_IDS
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
  if (statusLower === "pending" || statusLower === "хүлээгдэж буй" || statusLower === "submitted") return "Хүлээгдэж буй";
  if (statusLower === "approved" || statusLower === "баталгаажсан") return "Баталгаажсан";
  if (statusLower === "rejected" || statusLower === "буцаасан") return "Буцаасан";
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
  const [isLoadingReport, setIsLoadingReport] = useState(true);
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
  const [originalValues, setOriginalValues] = useState<Record<string, string>>({});
  const [fetchError, setFetchError] = useState<string | null>(null);

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
    const loadData = async () => {
      if (reportId && !isNaN(parseInt(reportId))) {
        const parsedId = parseInt(reportId);
        reportIdRef.current = parsedId;
        await fetchReportDataAndStatus(parsedId);
      } else {
        setIsLoadingReport(false);
        setFetchError("Тайлангийн ID буруу байна");
      }
    };
    loadData();
  }, [reportId]);

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      const userData = JSON.parse(user);
      setStudentInfo({
        id: userData.id?.toString() || "",
        name: `${userData.last_name || ""} ${userData.first_name || ""}`,
      });
      setFormData((prev) => ({ ...prev, student_id: userData.id?.toString() || "" }));
    }
    fetchTeachers();
  }, []);

  const filteredTeachers = teachers.filter(teacher => {
    const searchLower = teacherSearchTerm.toLowerCase();
    const fullName = `${teacher.last_name} ${teacher.first_name}`.toLowerCase();
    return fullName.includes(searchLower) || teacher.email.toLowerCase().includes(searchLower);
  });

  const isReportLocked = useCallback(() => {
    const lockedStatuses: ReportStatus[] = ["Хүлээгдэж буй", "Баталгаажсан"];
    return lockedStatuses.includes(currentStatus);
  }, [currentStatus]);

  const canSubmit = useCallback(() => {
    return currentStatus === "Илгээгээгүй" || currentStatus === "Буцаасан";
  }, [currentStatus]);

  const showTeacherSelection = useCallback(() => currentStatus === "Илгээгээгүй", [currentStatus]);

  const getStatusMessage = () => {
    switch (currentStatus) {
      case "Хүлээгдэж буй":
        return { message: "Энэ тайлан аль хэдийн илгээгдсэн байна. Багшийн хариуг хүлээж байна.", color: "bg-yellow-50 border-yellow-200 text-yellow-700", icon: <FiClock className="text-yellow-600" /> };
      case "Баталгаажсан":
        return { message: "Энэ тайлан баталгаажсан байна. Өөрчлөлт оруулах боломжгүй.", color: "bg-green-50 border-green-200 text-green-700", icon: <FiCheckCircle className="text-green-600" /> };
      case "Буцаасан":
        return { message: "Энэ тайлан багшаар буцаагдсан байна. Та засварлаж дахин илгээх боломжтой.", color: "bg-yellow-50 border-yellow-200 text-yellow-700", icon: <FiAlertCircle className="text-yellow-600" /> };
      default:
        return { message: "Энэ тайлан илгээгдээгүй байна. Та маягтаа бөглөж илгээнэ үү.", color: "bg-gray-50 border-gray-200 text-gray-700", icon: <FiFileText className="text-gray-600" /> };
    }
  };

  const extractValuesFromBackendStructure = (sections: any[]): Record<string, string> => {
    const values: Record<string, string> = {};
    const extractFromFields = (fields: any[]) => {
      for (const field of fields) {
        if (field.id && field.result !== undefined && field.result !== null) {
          values[field.id] = parseBackendValue(field.result).toString();
        }
        if (field.children?.length) extractFromFields(field.children);
      }
    };
    for (const section of sections) {
      if (section.fields) extractFromFields(section.fields);
    }
    return values;
  };

  const fetchReportDataAndStatus = async (reportId: number) => {
    setIsLoadingReport(true);
    setFetchError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/report/${reportId}/`, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      
      const data = await response.json();
      
      if (data.resultCode === 7520 && data.data) {
        const reportData = data.data;
        
        let determinedStatus: ReportStatus = "Илгээгээгүй";
        if (reportData.status) determinedStatus = mapApiStatusToDisplayStatus(reportData.status);
        setCurrentStatus(determinedStatus);
        
        if (reportData.report_name) setFormData(prev => ({ ...prev, report_name: reportData.report_name }));
        
        let backendValues: Record<string, string> = {};
        if (reportData.report_data?.sections) {
          backendValues = extractValuesFromBackendStructure(reportData.report_data.sections);
        }
        
        if (Object.keys(backendValues).length > 0) {
          setFormData(prev => ({ ...prev, values: backendValues, report_id: reportId }));
          setOriginalValues({ ...backendValues });
        } else {
          const initialValues: Record<string, string> = {};
          const initFields = (fields: Field[]) => {
            for (const field of fields) {
              if (!field.isCalculated) initialValues[field.id] = "";
              if (field.children?.length) initFields(field.children);
            }
          };
          initFields(reportStructure.sections.flatMap(s => s.fields));
          setFormData(prev => ({ ...prev, values: initialValues, report_id: reportId }));
        }
        
        try {
          const subResponse = await fetch(`${API_BASE_URL}/api/report/submissionlist/`, {
            method: "GET", credentials: "include", headers: { "Content-Type": "application/json" }
          });
          const subData = await subResponse.json();
          if (subData.resultCode === 6130 && subData.data) {
            const submission = subData.data.find((item: any) => item.report_id === reportId);
            if (submission) {
              if (submission.current_status) setCurrentStatus(mapApiStatusToDisplayStatus(submission.current_status));
              if (submission.teacher_name) setTeacherName(submission.teacher_name);
              if (submission.teacher_comment) { setTeacherComment(submission.teacher_comment); setFeedback(submission.teacher_comment); }
              if (submission.submission_date) setSubmittedAt(submission.submission_date);
              if (submission.teacher_id) setTeacherId(submission.teacher_id);
            }
          }
        } catch (error) { console.error("Submission error:", error); }
        
      } else {
        setFetchError("Тайлан олдсонгүй");
      }
    } catch (error) {
      console.error("Fetch error:", error);
      setFetchError("Тайлан ачаалахад алдаа гарлаа");
    } finally {
      setIsLoadingReport(false);
    }
  };

  const fetchTeachers = async () => {
    setIsLoadingTeachers(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/user/teacher/`, {
        method: "GET", credentials: "include", headers: { "Content-Type": "application/json" }
      });
      const data = await response.json();
      if (data.resultCode === 7630 && data.data) setTeachers(data.data);
    } catch (error) { console.error("Error fetching teachers:", error);
    } finally { setIsLoadingTeachers(false); }
  };

  const getValue = useCallback((fieldId: string): number => {
    const value = formData.values[fieldId];
    if (!value) return 0;
    const num = Number(value);
    return isNaN(num) ? 0 : num;
  }, [formData.values]);

  const getDisplayValue = useCallback((fieldId: string): string => {
    if (inputFocusRef.current[fieldId] && tempInputValueRef.current[fieldId] !== undefined) {
      return tempInputValueRef.current[fieldId];
    }
    const value = formData.values[fieldId];
    if (!value) return "0.00 ₮";
    const num = parseFloat(value);
    return isNaN(num) ? "0.00 ₮" : formatAsMoney(num);
  }, [formData.values]);

  const evaluateRule = useCallback((rule?: string): number => {
    if (!rule) return 0;
    let expression = rule.replace(/(\d+(?:\.\d+)?)%/g, (_, p1) => `(${parseFloat(p1) / 100})`);
    expression = expression.replace(/\b(\d+)\b/g, (match) => getValue(match).toString());
    try {
      const result = Function('"use strict"; return (' + expression + ')')();
      return isNaN(result) ? 0 : result;
    } catch { return 0; }
  }, [getValue]);

  const recalculateAll = useCallback(() => {
    setFormData((prev) => {
      const newValues = { ...prev.values };
      const calculatedFields: Field[] = [];
      const collect = (fields: Field[]) => {
        for (const field of fields) {
          if (field.isCalculated && field.calculationRule) calculatedFields.push(field);
          if (field.children?.length) collect(field.children);
        }
      };
      collect(reportStructure.sections.flatMap(s => s.fields));
      
      for (let i = 0; i < 10; i++) {
        let changed = false;
        for (const field of calculatedFields) {
          if (field.calculationRule) {
            const result = evaluateRule(field.calculationRule);
            const current = parseFloat(newValues[field.id] || "0");
            if (Math.abs(current - result) > 0.001) {
              newValues[field.id] = result.toString();
              changed = true;
            }
          }
        }
        if (!changed) break;
      }
      return { ...prev, values: newValues };
    });
  }, [evaluateRule]);

  const handleFocus = useCallback((fieldId: string) => {
    if (isReportLocked()) return;
    inputFocusRef.current[fieldId] = true;
    tempInputValueRef.current[fieldId] = "";
    setFormData(prev => ({ ...prev }));
  }, [isReportLocked]);

  const handleBlur = useCallback((fieldId: string) => {
    if (isReportLocked()) return;
    inputFocusRef.current[fieldId] = false;
    delete tempInputValueRef.current[fieldId];
    setTimeout(() => recalculateAll(), 50);
  }, [isReportLocked, recalculateAll]);

  const handleInputChange = useCallback((fieldId: string, displayValue: string) => {
    if (isReportLocked()) return;
    tempInputValueRef.current[fieldId] = displayValue;
    const cleanValue = parseInputValue(displayValue);
    setFormData(prev => ({ ...prev, values: { ...prev.values, [fieldId]: cleanValue } }));
    if (recalculateTimeoutRef.current) clearTimeout(recalculateTimeoutRef.current);
    recalculateTimeoutRef.current = setTimeout(() => recalculateAll(), 100);
  }, [recalculateAll, isReportLocked]);

  const resetAllValues = () => {
    if (isReportLocked()) {
      setSubmitError("Тайлан илгээгдсэн эсвэл баталгаажсан тул утгуудыг өөрчлөх боломжгүй.");
      return;
    }
    if (Object.keys(originalValues).length > 0) {
      setFormData(prev => ({ ...prev, values: { ...originalValues } }));
    } else {
      const newValues: Record<string, string> = {};
      const resetFields = (fields: Field[]) => {
        for (const field of fields) {
          if (!field.isCalculated) newValues[field.id] = "";
          if (field.children?.length) resetFields(field.children);
        }
      };
      resetFields(reportStructure.sections.flatMap(s => s.fields));
      setFormData(prev => ({ ...prev, values: newValues }));
    }
    setTimeout(() => recalculateAll(), 0);
  };

  const updateReportStructureWithValues = (structure: any, values: Record<string, string>) => {
    const updateFields = (fields: any[]): any[] => {
      return fields.map(field => {
        const updated = { ...field };
        if (field.id && values[field.id] !== undefined) {
          const num = parseFloat(values[field.id]);
          updated.result = formatAsMoney(isNaN(num) ? 0 : num);
        }
        if (field.children?.length) updated.children = updateFields(field.children);
        return updated;
      });
    };
    return {
      ...structure,
      sections: structure.sections.map((section: any) => ({ ...section, fields: updateFields(section.fields) }))
    };
  };

  const saveReport = async (isDraft: boolean = false) => {
    if (isReportLocked()) {
      setSubmitError("Энэ тайлан аль хэдийн илгээгдсэн эсвэл баталгаажсан тул өөрчлөлт оруулах боломжгүй.");
      return;
    }

    if (!isDraft && !selectedTeacher) {
      setSubmitError("Тайлан илгээх багшаа сонгоно уу");
      setShowTeacherModal(true);
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
      const updatedStructure = updateReportStructureWithValues(reportStructure, formData.values);
      const saveResponse = await fetch(`${API_BASE_URL}/api/report/savereportfields/${currentReportId}/`, {
        method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include",
        body: JSON.stringify({ report_data: updatedStructure })
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

      const submissionResponse = await fetch(`${API_BASE_URL}/api/report/addsubmission/`, {
        method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include",
        body: JSON.stringify({ report_id: currentReportId, teacher_id: selectedTeacher?.id })
      });
      const submissionData = await submissionResponse.json();

      if (submissionData.resultCode === 6120) {
        setSubmitSuccess(true);
        setCurrentStatus("Хүлээгдэж буй");
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

  const renderFields = (fields: Field[], level: number = 0) => {
    const locked = isReportLocked();
    return fields.sort((a, b) => a.order - b.order).map((field) => (
      <div key={field.id}>
        <div className={`grid grid-cols-12 gap-4 p-3 ${field.isCalculated ? "bg-blue-50" : ""} border-b border-gray-200`}>
          <div className="col-span-1 font-medium text-gray-700 text-center">{field.id}</div>
          <div className="col-span-8">
            <div className="text-sm text-gray-900" style={{ paddingLeft: `${level * 20}px` }}>
              {field.label}
              {field.isCalculated && field.calculationRule && (
                <span className="ml-2 text-xs text-blue-600">(Томьёо: {field.calculationRule})</span>
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
              placeholder="0.00 ₮"
              className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-right text-gray-900 font-normal ${
                field.isCalculated ? "bg-blue-100/50 font-medium cursor-not-allowed" :
                locked ? "bg-gray-100 cursor-not-allowed text-gray-500" :
                "bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

  // Багшийн мэдээлэл харуулах функц
  const renderTeacherInfo = () => {
    if (currentStatus === "Хүлээгдэж буй" && teacherName) {
      return (
        <div className="mb-6 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-yellow-600 to-yellow-700 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <FiClock className="text-white text-xl" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg">Хүлээгдэж буй тайлан</h3>
                <p className="text-yellow-100 text-sm">Тайланг багш хянаж байна</p>
              </div>
            </div>
          </div>
          <div className="p-5">
            <div className="flex items-center gap-4 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center">
                <FaChalkboardTeacher className="text-white text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Илгээсэн багш</p>
                <p className="font-semibold text-gray-900 text-lg">{teacherName}</p>
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
                <p className="text-green-100 text-sm">Тайланг багш баталгаажуулсан</p>
              </div>
            </div>
          </div>
          <div className="p-5">
            <div className="flex items-center gap-4 p-4 bg-green-50 rounded-xl border border-green-200">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                <FaUserCheck className="text-white text-xl" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500">Хянасан багш</p>
                <p className="font-semibold text-gray-900 text-lg">{teacherName}</p>
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
            
            {feedback && (
              <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <FiMessageSquare className="text-blue-600" />
                  <h4 className="font-semibold text-gray-900">Багшийн сэтгэгдэл</h4>
                </div>
                <p className="text-gray-700 whitespace-pre-wrap">{feedback}</p>
              </div>
            )}
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
                <p className="text-red-100 text-sm">Тайланг багш буцаасан тул дахин илгээх боломжтой</p>
              </div>
            </div>
          </div>
          <div className="p-5">
            <div className="flex items-center gap-4 p-4 bg-red-50 rounded-xl border border-red-200">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center">
                <FaChalkboardTeacher className="text-white text-xl" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500">Буцаасан багш</p>
                <p className="font-semibold text-gray-900 text-lg">{teacherName || "Тодорхойгүй"}</p>
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
            
            {(feedback || teacherComment) && (
              <div className="mt-4 p-4 bg-orange-50 rounded-xl border border-orange-200">
                <div className="flex items-center gap-2 mb-2">
                  <FiAlertCircle className="text-orange-600" />
                  <h4 className="font-semibold text-gray-900">Буцаасан шалтгаан</h4>
                </div>
                <p className="text-gray-700 whitespace-pre-wrap">{feedback || teacherComment}</p>
                <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                  <FiMessageSquare className="text-xs" />
                  Дахин илгээхдээ дээрх шалтгааныг харгалзан үзнэ үү
                </p>
              </div>
            )}
          </div>
        </div>
      );
    }

    return null;
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
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
              </div>
              <div className="space-y-3">
                {isLoadingTeachers ? (
                  <div className="text-center py-12"><div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" /><p>Багш нар ачааллаж байна...</p></div>
                ) : filteredTeachers.map((teacher) => (
                  <div key={teacher.id} onClick={() => { setSelectedTeacher(teacher); setFormData(prev => ({ ...prev, teacher_id: teacher.id })); setShowTeacherModal(false); }}
                    className={`p-4 rounded-xl cursor-pointer transition ${selectedTeacher?.id === teacher.id ? "bg-blue-50 border-2 border-blue-500" : "bg-gray-50 hover:bg-gray-100"}`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${selectedTeacher?.id === teacher.id ? "bg-blue-500" : "bg-gray-400"}`}>
                        <span className="text-white font-bold">{teacher.first_name?.charAt(0)}{teacher.last_name?.charAt(0)}</span>
                      </div>
                      <div>
                        <h3 className="font-semibold">{teacher.last_name} {teacher.first_name}</h3>
                        <p className="text-sm text-gray-500 flex items-center gap-1"><FiMail className="text-xs" /> {teacher.email}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="border-t px-6 py-4 bg-gray-50 flex justify-end">
              <button onClick={() => setShowTeacherModal(false)} className="px-5 py-2 bg-gray-200 rounded-xl hover:bg-gray-300">Хаах</button>
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

  if (fetchError) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <FiAlertCircle className="text-red-600 text-5xl mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-red-800 mb-2">Алдаа гарлаа</h2>
            <p className="text-red-600 mb-4">{fetchError}</p>
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
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/student/dashboard" className="hover:text-blue-600"><FiHome className="inline mr-1" /> Нүүр</Link>
          <span>/</span>
          <Link href="/student/reports" className="hover:text-blue-600"><FiFileText className="inline mr-1" /> Тайлангууд</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Татварын тайлан</span>
        </div>

        {statusInfo && (
          <div className={`mb-6 p-4 ${statusInfo.color} rounded-xl border flex items-center gap-3`}>
            {statusInfo.icon} <span>{statusInfo.message}</span>
          </div>
        )}

        {renderTeacherInfo()}

        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Татварын тайлангийн маягт</h1>
            <p className="text-gray-500 mt-1">
              Тайлангийн төлөв: 
              <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                currentStatus === "Баталгаажсан" ? "bg-green-100 text-green-700" :
                currentStatus === "Буцаасан" ? "bg-red-100 text-red-700" :
                currentStatus === "Хүлээгдэж буй" ? "bg-yellow-100 text-yellow-700" :
                "bg-gray-100 text-gray-700"
              }`}>
                {currentStatus}
              </span>
            </p>
          </div>
        </div>

        {showTeacherSelection() && (
          <div className="mb-6 bg-white rounded-2xl shadow-xl border p-6">
            <h3 className="font-semibold text-lg mb-4">Тайлан илгээх багш</h3>
            {selectedTeacher ? (
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">
                      {selectedTeacher.first_name?.charAt(0)}{selectedTeacher.last_name?.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{selectedTeacher.last_name} {selectedTeacher.first_name}</p>
                    <p className="text-sm text-gray-500">{selectedTeacher.email}</p>
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
                <p className="text-gray-500 group-hover:text-blue-600">Багш сонгох</p>
                <p className="text-xs text-gray-400 mt-1">Сонгох товч дарж багшаа сонгоно уу</p>
              </button>
            )}
          </div>
        )}

        {submitSuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700">
            <FiCheckCircle className="inline mr-2" /> Тайлан амжилттай хадгалагдлаа.
          </div>
        )}
        {submitError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
            <FiAlertCircle className="inline mr-2" /> {submitError}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {summaryValues.map((item) => (
            <div key={item.id} className="bg-white rounded-xl shadow-lg border p-5">
              <div className="text-sm text-gray-500 mb-2">Мөр {item.id}</div>
              <div className="text-2xl font-bold text-gray-900">{formatAsMoney(item.value)}</div>
              <div className="text-xs text-gray-400 mt-1">{item.label}</div>
            </div>
          ))}
        </div>

        <div className="flex gap-3 mb-6">
          <button onClick={resetAllValues} disabled={locked} className={`px-4 py-2 rounded-xl flex items-center gap-2 transition ${locked ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-white border hover:bg-gray-50"}`}>
            <FiRefreshCw /> Бүгдийг 0 болгох
          </button>
          {!locked && (
            <button onClick={() => saveReport(true)} disabled={isSavingDraft} className="px-5 py-2 rounded-xl flex items-center gap-2 bg-white border hover:bg-gray-50 transition">
              {isSavingDraft ? <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" /> : <><FiSave /> Ноорог хадгалах</>}
            </button>
          )}
          {canSubmit() && (
            <button onClick={() => saveReport(false)} disabled={isSubmitting || !selectedTeacher} className={`px-6 py-2 rounded-xl font-medium shadow-lg flex items-center gap-2 ml-auto transition ${isSubmitting || !selectedTeacher ? "bg-gray-400 cursor-not-allowed" : "bg-gradient-to-r from-[#0f172a] to-[#1e3a8a] text-white hover:opacity-90"}`}>
              {isSubmitting ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><FiSend /> {currentStatus === "Буцаасан" ? "Дахин илгээх" : "Тайлан илгээх"}</>}
            </button>
          )}
        </div>

        <div className="space-y-6">
          {reportStructure.sections.map((section) => (
            <div key={section.id} className="bg-white rounded-2xl shadow-xl border overflow-hidden">
              <div className="bg-gradient-to-r from-[#0f172a] to-[#1e3a8a] px-6 py-4">
                <h2 className="text-lg font-bold text-white">{section.title}</h2>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-12 gap-4 px-3 py-2 bg-gray-100 rounded-t-lg font-medium text-sm">
                  <div className="col-span-1">Мөр</div>
                  <div className="col-span-8">Үзүүлэлтүүд</div>
                  <div className="col-span-3">Дүн (₮)</div>
                </div>
                <div className="border-x border-b rounded-b-lg">{renderFields(section.fields)}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center text-xs text-gray-400">
          <p>Тооцоолол автоматаар шинэчлэгдэнэ. Цэнхэр мөрүүд нь томьёотой мөрүүд.</p>
          <p>Бүх дүнг MNT (төгрөг)-өөр бөглөнө үү.</p>
          {reportIdRef.current && (
            <p className="mt-2 text-blue-500">Тайлан ID: {reportIdRef.current}</p>
          )}
        </div>
      </div>
    </div>
  );
}