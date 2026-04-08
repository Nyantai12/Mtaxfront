// app/teacher/reviews/[id]/page.tsx
"use client";

import { useState, useEffect, useCallback, JSX } from "react";
import { motion } from "framer-motion";
import {
  FiArrowLeft,
  FiHome,
  FiFileText,
  FiUser,
  FiCalendar,
  FiMail,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiMessageSquare,
  FiDownload,
  FiPrinter,
  FiAlertCircle,
} from "react-icons/fi";
import { FaGraduationCap, FaChalkboardTeacher } from "react-icons/fa";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import Header from "@/app/component/Header";
import { API_BASE_URL } from "@/app/api/page";
import { 
  reportStructure, 
  ALL_FIELD_IDS, 
  getCalculationRules,
  type Field 
} from "@/app/maygt/page";

interface StudentInfo {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  student_code?: string;
  department?: string;
}

interface ReportInfo {
  id: number;
  report_name: string;
  report_type_id: number;
  tax_period_year: number;
  tax_period_month: number;
  created_at: string;
  updated_at: string;
  submitted_at?: string;
  status: string;
  values: Record<string, string>;
  student: StudentInfo;
  feedback?: string;
  reviewed_at?: string;
  teacher_id?: number;
  teacher_name?: string;
}

const formatAsMoney = (value: string | number): string => {
  if (value === "" || value === undefined || value === null) return "0.00 ₮";
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "0.00 ₮";
  const formatted = num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${formatted} ₮`;
};

const getMonthName = (month: number): string => {
  const months = [
    "Нэгдүгээр сар", "Хоёрдугаар сар", "Гуравдугаар сар", "Дөрөвдүгээр сар",
    "Тавдугаар сар", "Зургаадугаар сар", "Долдугаар сар", "Наймдугаар сар",
    "Есдүгээр сар", "Аравдугаар сар", "Арван нэгдүгээр сар", "Арван хоёрдугаар сар"
  ];
  return months[month - 1] || `${month} сар`;
};

const getStatusBadge = (status: string) => {
  const statusMap: Record<string, { label: string; color: string; icon: JSX.Element }> = {
    pending: { label: "Хүлээгдэж буй", color: "bg-yellow-100 text-yellow-700", icon: <FiClock /> },
    reviewed: { label: "Хянаж буй", color: "bg-blue-100 text-blue-700", icon: <FiMessageSquare /> },
    approved: { label: "Баталгаажсан", color: "bg-green-100 text-green-700", icon: <FiCheckCircle /> },
    rejected: { label: "Татгалзсан", color: "bg-red-100 text-red-700", icon: <FiXCircle /> },
  };
  
  const info = statusMap[status] || { label: status, color: "bg-gray-100 text-gray-700", icon: <FiClock /> };
  
  return (
    <span className={`px-3 py-1 ${info.color} rounded-full text-xs font-medium flex items-center gap-1`}>
      {info.icon} {info.label}
    </span>
  );
};

// Тооцоолол хийх функц
const calculateField = (fieldId: string, values: Record<string, string>): number => {
  const getValue = (id: string): number => {
    const val = values[id];
    if (!val || val === "") return 0;
    const num = parseFloat(val);
    return isNaN(num) ? 0 : num;
  };

  const rules = getCalculationRules();
  const rule = rules[fieldId as keyof typeof rules];
  
  if (rule) {
    return rule(getValue);
  }
  
  return getValue(fieldId);
};

export default function TeacherReportViewPage() {
  const router = useRouter();
  const params = useParams();
  const reportId = params.id as string;
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<ReportInfo | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [calculatedValues, setCalculatedValues] = useState<Record<string, number>>({});
  const [teacherName, setTeacherName] = useState<string>("");

  // Хэрэглэгчийн мэдээлэл авах
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      const userData = JSON.parse(user);
      setTeacherName(`${userData.last_name || ""} ${userData.first_name || ""}`);
    }
  }, []);

  useEffect(() => {
    if (reportId) {
      fetchReportData();
    }
  }, [reportId]);

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
      console.log("Тайлангийн мэдээлэл:", data);

      if ((data.resultCode === 6140 || data.resultCode === 7520) && data.data) {
        const reportData = data.data;
        let reportValues: Record<string, string> = {};

        if (reportData.report_data) {
          if (typeof reportData.report_data === "object") {
            reportValues = reportData.report_data;
          } else if (typeof reportData.report_data === "string") {
            try {
              reportValues = JSON.parse(reportData.report_data);
            } catch (e) {
              console.error("JSON parse error:", e);
            }
          }
        }

        // Тооцоолсон утгуудыг үүсгэх
        const calculated: Record<string, number> = {};
        ALL_FIELD_IDS.forEach(id => {
          calculated[id] = calculateField(id, reportValues);
        });

        setValues(reportValues);
        setCalculatedValues(calculated);

        // Оюутны мэдээллийг бүрдүүлэх
        let studentInfo: StudentInfo = {
          id: reportData.student_id || 0,
          first_name: "",
          last_name: "",
          email: reportData.student_email || "",
          student_code: reportData.student_code,
          department: reportData.department,
        };

        if (reportData.student_first_name && reportData.student_last_name) {
          studentInfo.first_name = reportData.student_first_name;
          studentInfo.last_name = reportData.student_last_name;
        } else if (reportData.student_name) {
          const nameParts = reportData.student_name.split(" ");
          if (nameParts.length >= 2) {
            studentInfo.last_name = nameParts[0];
            studentInfo.first_name = nameParts.slice(1).join(" ");
          } else {
            studentInfo.first_name = reportData.student_name;
          }
        }

        setReport({
          id: reportData.report_id,
          report_name: reportData.type_name || "Татварын тайлан",
          report_type_id: reportData.report_type_id || 1,
          tax_period_year: reportData.tax_period_year || new Date().getFullYear(),
          tax_period_month: reportData.tax_period_month || new Date().getMonth() + 1,
          created_at: reportData.created_at || new Date().toISOString(),
          updated_at: reportData.updated_at || new Date().toISOString(),
          submitted_at: reportData.submitted_at,
          status: reportData.status || "pending",
          values: reportValues,
          feedback: reportData.feedback,
          reviewed_at: reportData.reviewed_at,
          teacher_id: reportData.teacher_id,
          teacher_name: reportData.teacher_name,
          student: studentInfo,
        });
      } else {
        setError(data.resultMessage || "Тайлангийн мэдээлэл олдсонгүй");
      }
    } catch (error: any) {
      console.error("Тайлангийн мэдээлэл татахад алдаа:", error);
      setError(error.message || "Сервертэй холбогдоход алдаа гарлаа");
    } finally {
      setIsLoading(false);
    }
  };

  const getValue = useCallback(
    (fieldId: string): number => {
      if (calculatedValues[fieldId] !== undefined) {
        return calculatedValues[fieldId];
      }
      const value = values[fieldId];
      if (value === undefined || value === null || value === "") return 0;
      const num = Number(value);
      return isNaN(num) ? 0 : num;
    },
    [values, calculatedValues]
  );

  const getDisplayValue = useCallback(
    (fieldId: string): string => {
      const value = getValue(fieldId);
      return formatAsMoney(value);
    },
    [getValue]
  );

  const renderFields = (fields: Field[], level: number = 0) => {
    return fields
      .sort((a, b) => a.order - b.order)
      .map((field) => (
        <div key={field.id}>
          <div
            className={`grid grid-cols-12 gap-4 p-3 ${
              field.isCalculated ? "bg-blue-50" : ""
            } border-b border-gray-200`}
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
              <div
                className={`w-full px-3 py-2 border border-gray-200 rounded-lg text-right font-medium ${
                  field.isCalculated ? "bg-blue-100/50 text-blue-800" : "bg-gray-50 text-gray-900"
                }`}
              >
                {getDisplayValue(field.id)}
              </div>
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

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    const headers = ["Мөр", "Үзүүлэлт", "Дүн (₮)"];
    const rows: string[][] = [];
    
    const collectFields = (fields: Field[], level: number = 0) => {
      fields.sort((a, b) => a.order - b.order).forEach((field) => {
        rows.push([
          field.id,
          " ".repeat(level * 2) + field.label,
          getDisplayValue(field.id).replace(" ₮", ""),
        ]);
        if (field.children?.length) {
          collectFields(field.children, level + 1);
        }
      });
    };
    
    collectFields(reportStructure.sections.flatMap((s) => s.fields));
    
    const csvContent = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `report_${reportId}_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
              onClick={() => router.push("/teacher/review")}
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
              onClick={handleExport}
              className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition flex items-center gap-2 text-sm"
            >
              <FiDownload /> CSV
            </button>
            <button
              onClick={handlePrint}
              className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition flex items-center gap-2 text-sm"
            >
              <FiPrinter /> Хэвлэх
            </button>
            <button
              onClick={() => router.push("/teacher/reviews")}
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
              {getStatusBadge(report.status)}
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                {report.student.student_code && (
                  <p className="text-gray-500 text-sm mt-1">Код: {report.student.student_code}</p>
                )}
              </div>
              
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <FiCalendar className="text-green-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Тайлангийн хугацаа</h3>
                </div>
                <p className="text-gray-800 font-medium">
                  {getMonthName(report.tax_period_month)}, {report.tax_period_year} он
                </p>
                <p className="text-gray-500 text-sm mt-1">
                  {report.tax_period_year} оны {report.tax_period_month}-р сар
                </p>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <FiFileText className="text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Илгээсэн огноо</h3>
                </div>
                <p className="text-gray-800 font-medium">
                  {report.submitted_at 
                    ? new Date(report.submitted_at).toLocaleDateString()
                    : new Date(report.created_at).toLocaleDateString()}
                </p>
                <p className="text-gray-500 text-sm mt-1">
                  {report.submitted_at 
                    ? new Date(report.submitted_at).toLocaleTimeString()
                    : new Date(report.created_at).toLocaleTimeString()}
                </p>
              </div>
              
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

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {summaryValues.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-lg border border-gray-200 p-5"
            >
              <div className="text-sm text-gray-500 mb-2">Мөр {item.id}</div>
              <div className="text-2xl font-bold text-gray-900">
                {formatAsMoney(item.value)}
              </div>
              <div className="text-xs text-gray-400 mt-1">{item.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Report Sections - Read Only */}
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

        {/* Feedback Section */}
        {report.feedback && (
          <div className="mt-8 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-gray-700 to-gray-800 px-6 py-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <FiMessageSquare /> Багшийн санал шүүмж
              </h2>
            </div>
            <div className="p-6">
              <div className="bg-gray-50 rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-500">Хянасан багш:</span>
                  <span className="font-medium text-gray-900">{report.teacher_name || teacherName}</span>
                </div>
                {report.reviewed_at && (
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-gray-500">Хянасан огноо:</span>
                    <span className="font-medium text-gray-900">{new Date(report.reviewed_at).toLocaleString()}</span>
                  </div>
                )}
                <div className="mt-3 p-4 bg-white rounded-lg border border-gray-200">
                  <p className="text-gray-700 whitespace-pre-wrap">{report.feedback}</p>
                </div>
              </div>
            </div>
          </div>
        )}

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