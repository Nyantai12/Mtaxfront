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
  FiBriefcase,
} from "react-icons/fi";
import { FaGraduationCap, FaChalkboardTeacher } from "react-icons/fa";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import Header from "@/app/component/Header";
import { API_BASE_URL } from "@/api_base_url/page";
import { 
  reportStructure, 
  ALL_FIELD_IDS, 
  parseBackendValue,
  formatAsMoney as formatMoney,
  type Field 
} from "@/maygt/page";

interface StudentInfo {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  student_code?: string;
  department?: string;
}

interface OrganizationInfo {
  org_id: number;
  org_name: string;
  org_type?: string;
  org_register?: string;
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
  current_status: string;
  values: Record<string, string>;
  student: StudentInfo;
  organization?: OrganizationInfo;
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

const getStatusBadge = (current_status: string) => {
  const status = current_status?.toLowerCase() || "";
  
  if (status === "хүлээгдэж буй" || status === "pending" || status === "submitted") {
    return (
      <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium flex items-center gap-1">
        <FiClock className="text-yellow-600" /> Хүлээгдэж буй
      </span>
    );
  } 
  else if (status === "хянаж буй" || status === "reviewing" || status === "in_review" || status === "reviewed") {
    return (
      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium flex items-center gap-1">
        <FiMessageSquare className="text-blue-600" /> Хянаж буй
      </span>
    );
  } 
  else if (status === "баталгаажсан" || status === "approved" || status === "accepted" || status === "completed") {
    return (
      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center gap-1">
        <FiCheckCircle className="text-green-600" /> Баталгаажсан
      </span>
    );
  } 
  else if (status === "буцаасан" || status === "татгалзсан" || status === "rejected" || status === "returned" || status === "declined") {
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

// Тооцооллын дүрмүүд
const getCalculationRules = () => ({
  "1": (getValue: (id: string) => number) => getValue("2") + getValue("3") + getValue("4") + getValue("5"),
  "5": (getValue: (id: string) => number) => getValue("6") + getValue("7") + getValue("8") + getValue("9") + getValue("10") + 
        getValue("11") + getValue("12") + getValue("13") + getValue("14") + getValue("15") + getValue("16"),
  "17": (getValue: (id: string) => number) => getValue("18") + getValue("19") + getValue("20"),
  "21": (getValue: (id: string) => number) => getValue("1") - getValue("17"),
  "24": (getValue: (id: string) => number) => getValue("21") + getValue("22") - getValue("23"),
  "26": (getValue: (id: string) => number) => getValue("24") + getValue("25"),
  "28": (getValue: (id: string) => number) => getValue("26") - getValue("27"),
  "29": (getValue: (id: string) => number) => getValue("28") * 0.25,
  "31": (getValue: (id: string) => number) => getValue("29") - getValue("30"),
  "32": (getValue: (id: string) => number) => getValue("33") + getValue("38") + getValue("39") + getValue("40") + getValue("41") + 
          getValue("42") + getValue("44") + getValue("45") + getValue("47") + getValue("49"),
  "36": (getValue: (id: string) => number) => getValue("33") - getValue("34") - getValue("35"),
  "37": (getValue: (id: string) => number) => getValue("36") * 0.10,
  "43": (getValue: (id: string) => number) => (getValue("38") + getValue("39") + getValue("40") + getValue("41") + getValue("42")) * 0.10,
  "46": (getValue: (id: string) => number) => (getValue("44") + getValue("45")) * 0.05,
  "48": (getValue: (id: string) => number) => getValue("47") * 0.02,
  "50": (getValue: (id: string) => number) => getValue("49") * 0.40,
  "51": (getValue: (id: string) => number) => getValue("37") + getValue("43") + getValue("46") + getValue("48") + getValue("50"),
  "54": (getValue: (id: string) => number) => getValue("31") + getValue("51") - getValue("52") - getValue("53"),
  "58": (getValue: (id: string) => number) => getValue("31") + getValue("51") - getValue("52") - getValue("53") - getValue("56") - getValue("57"),
});

const calculateField = (fieldId: string, values: Record<string, string>): number => {
  const getValue = (id: string): number => {
    const val = values[id];
    if (!val || val === "") return 0;
    const num = parseFloat(val);
    return isNaN(num) ? 0 : num;
  };

  const rules = getCalculationRules();
  const rule = rules[fieldId as keyof ReturnType<typeof getCalculationRules>];
  
  if (rule) {
    return rule(getValue);
  }
  
  return getValue(fieldId);
};

const extractValuesFromStructure = (sections: any[]): Record<string, string> => {
  const extractedValues: Record<string, string> = {};
  
  const extractFromFields = (fields: any[]) => {
    for (const field of fields) {
      if (field.id && field.result !== undefined && field.result !== null) {
        const numericValue = parseBackendValue(field.result);
        extractedValues[field.id] = numericValue.toString();
      }
      if (field.children && field.children.length > 0) {
        extractFromFields(field.children);
      }
    }
  };
  
  for (const section of sections) {
    if (section.fields) {
      extractFromFields(section.fields);
    }
  }
  
  return extractedValues;
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
          if (typeof reportData.report_data === "object" && reportData.report_data.sections) {
            reportValues = extractValuesFromStructure(reportData.report_data.sections);
          } else if (typeof reportData.report_data === "object" && !reportData.report_data.sections) {
            reportValues = reportData.report_data;
          } else if (typeof reportData.report_data === "string") {
            try {
              const parsed = JSON.parse(reportData.report_data);
              if (parsed.sections) {
                reportValues = extractValuesFromStructure(parsed.sections);
              } else {
                reportValues = parsed;
              }
            } catch (e) {
              console.error("JSON parse error:", e);
            }
          }
        }

        const calculated: Record<string, number> = {};
        ALL_FIELD_IDS.forEach(id => {
          calculated[id] = calculateField(id, reportValues);
        });

        setValues(reportValues);
        setCalculatedValues(calculated);

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

        // Байгууллагын мэдээлэл авах
        let organizationInfo: OrganizationInfo | undefined = undefined;
        if (reportData.org_id && reportData.org_name) {
          organizationInfo = {
            org_id: reportData.org_id,
            org_name: reportData.org_name,
          };
        } else if (reportData.organization) {
          organizationInfo = {
            org_id: reportData.organization.org_id,
            org_name: reportData.organization.org_name,
          };
        }

        let finalStatus = reportData.current_status;
        if (!finalStatus || finalStatus === "") {
          finalStatus = reportData.report_status;
        }
        if (!finalStatus || finalStatus === "") {
          finalStatus = "pending";
        }

        setReport({
          id: reportData.report_id || reportData.id || parseInt(reportId),
          report_name: reportData.type_name || reportData.report_name || "Татварын тайлан",
          report_type_id: reportData.report_type_id || 1,
          tax_period_year: reportData.tax_period_year || new Date().getFullYear(),
          tax_period_month: reportData.tax_period_month || new Date().getMonth() + 1,
          created_at: reportData.created_at || new Date().toISOString(),
          updated_at: reportData.updated_at || new Date().toISOString(),
          submitted_at: reportData.submission_date || reportData.submitted_at,
          current_status: finalStatus,
          values: reportValues,
          organization: organizationInfo,
          feedback: reportData.feedback || reportData.teacher_comment,
          reviewed_at: reportData.checked_date || reportData.reviewed_at,
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
      date: `${year} оны ${month}н ${day}`,
      time: `${hours}:${minutes}`,
    };
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

  // Буцах функц - статусаас хамаарч filter параметр нэмэх
  const handleGoBack = () => {
    if (!report) {
      router.push("/teacher/reviews");
      return;
    }
    
    let statusFilter = "all";
    const status = report.current_status?.toLowerCase() || "";
    
    if (status === "хүлээгдэж буй" || status === "pending" || status === "submitted") {
      statusFilter = "pending";
    } else if (status === "баталгаажсан" || status === "approved" || status === "accepted" || status === "completed") {
      statusFilter = "approved";
    } else if (status === "буцаасан" || status === "татгалзсан" || status === "rejected" || status === "returned" || status === "declined") {
      statusFilter = "rejected";
    }
    
    router.push(`/teacher/reviews?reportId=${report.id}&filter=${statusFilter}`);
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
              {/* 1. Оюутны мэдээлэл */}
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
              
              {/* 2. Байгууллагын мэдээлэл (Төлөвийн оронд) */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                    <FiBriefcase className="text-indigo-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Байгууллага</h3>
                </div>
                {report.organization ? (
                  <>
                    <p className="text-gray-800 font-medium">
                      {report.organization.org_name}
                    </p>
                    {report.organization.org_type && (
                      <p className="text-gray-500 text-sm mt-1">
                        Төрөл: {report.organization.org_type}
                      </p>
                    )}
                    {report.organization.org_register && (
                      <p className="text-gray-500 text-sm mt-1">
                        РД: {report.organization.org_register}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-gray-500 text-sm">Мэдээлэл байхгүй</p>
                )}
              </div>
              
              {/* 3. Илгээсэн огноо */}
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
              
              {/* 4. Хянасан мэдээлэл */}
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

        {/* Report Sections */}
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