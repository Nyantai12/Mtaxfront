// app/teacher/reviews/[id]/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
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

interface Field {
  id: string;
  type: string;
  label: string;
  order: number;
  result: string;
  isCalculated?: boolean;
  calculationRule?: string;
  children?: Field[];
}

interface Section {
  id: string;
  title: string;
  fields: Field[];
}

interface ReportData {
  sections: Section[];
}

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

const reportStructure: ReportData = {
  sections: [
    {
      id: "A",
      title: "А. Нийтлэг хувь хэмжээгээр ногдуулах татварын тооцоолол",
      fields: [
        {
          id: "1",
          type: "number",
          label: "1. Нийт орлогын дүн (мөр 2+3+4+5)",
          order: 1,
          result: "0.00",
          isCalculated: true,
          calculationRule: "2+3+4+5",
          children: [
            {
              id: "2",
              type: "number",
              label: "1.1. Татвараас чөлөөлөгдөх орлогын дүн",
              order: 2,
              result: "0.00",
              isCalculated: false,
            },
            {
              id: "3",
              type: "number",
              label: "1.2. Тусгай хувь хэмжээгээр татвар ногдох орлого (32)",
              order: 3,
              result: "0.00",
              isCalculated: false,
            },
            {
              id: "4",
              type: "number",
              label: "1.3. Бусад орлогын дүн",
              order: 4,
              result: "0.00",
              isCalculated: false,
            },
            {
              id: "5",
              type: "number",
              label: "1.4. Нийтлэг хувь хэмжээгээр татвар ногдох орлого",
              order: 5,
              result: "0.00",
              isCalculated: true,
              calculationRule: "6+7+8+9+10+11+12+13+14+15+16",
              children: [
                { id: "6", type: "number", label: "Бараа, ажил, үйлчилгээний борлуулалтын орлого", order: 6, result: "0.00", isCalculated: false },
                { id: "7", type: "number", label: "Техникийн, удирдлагын, зөвлөхийн болон бусад үйлчилгээний орлого", order: 7, result: "0.00", isCalculated: false },
                { id: "8", type: "number", label: "Үл хөдлөх эд хөрөнгө ашиглуулсан болон түрээслүүлсний орлого", order: 8, result: "0.00", isCalculated: false },
                { id: "9", type: "number", label: "Хөдлөх эд хөрөнгө ашиглуулсан болон түрээслүүлсний орлого", order: 9, result: "0.00", isCalculated: false },
                { id: "10", type: "number", label: "Үнэ төлбөргүйгээр бусдаас авсан бараа, ажил, үйлчилгээний орлого", order: 10, result: "0.00", isCalculated: false },
                { id: "11", type: "number", label: "Гэрээгээр хүлээсэн үүргээ биелүүлээгүй этгээдээс авсан хүү, анз", order: 11, result: "0.00", isCalculated: false },
                { id: "12", type: "number", label: "Төлбөрт таавар, бооцоот тоглоом, эд мөнгөний хонжворт сугалааны орлого", order: 12, result: "0.00", isCalculated: false },
                { id: "13", type: "number", label: "Хувьцаа, үнэт цаас, санхүүгийн бусад хэрэгсэл борлуулсны орлого", order: 13, result: "0.00", isCalculated: false },
                { id: "14", type: "number", label: "Бусад биет бус хөрөнгө болон хөдлөх эд хөрөнгө борлуулсан, шилжүүлсний орлого", order: 14, result: "0.00", isCalculated: false },
                { id: "15", type: "number", label: "Гадаад валютын ханшийн зөрүүгийн бодит орлого", order: 15, result: "0.00", isCalculated: false },
                { id: "16", type: "number", label: "Албан татвар ногдох бусад орлого", order: 16, result: "0.00", isCalculated: false },
              ],
            },
          ],
        },
        {
          id: "17",
          type: "number",
          label: "2. Нийт зардлын дүн (18+19+20)",
          order: 17,
          result: "0.00",
          isCalculated: true,
          calculationRule: "18+19+20",
          children: [
            { id: "18", type: "number", label: "2.1. Борлуулсан бүтээгдэхүүний өртөг", order: 18, result: "0.00", isCalculated: false },
            { id: "19", type: "number", label: "2.2. Удирдлагын болон борлуулалтын үйл ажиллагааны зардал", order: 19, result: "0.00", isCalculated: false },
            { id: "20", type: "number", label: "2.3. Үндсэн бус үйл ажиллагааны зардал", order: 20, result: "0.00", isCalculated: false },
          ],
        },
        { id: "21", type: "number", label: "3. Татвар төлөхийн өмнөх ашиг +, алдагдал - (1-17)", order: 21, result: "0.00", isCalculated: true, calculationRule: "1-17" },
        { id: "22", type: "number", label: "4. Татвар төлөхийн өмнөх ашиг, алдагдлыг нэмэгдүүлэх дүн", order: 22, result: "0.00", isCalculated: false },
        { id: "23", type: "number", label: "5. Татвар төлөхийн өмнөх ашиг, алдагдлыг бууруулах дүн", order: 23, result: "0.00", isCalculated: false },
        { id: "24", type: "number", label: "6. Татвар ногдуулах орлого (21+22-23)", order: 24, result: "0.00", isCalculated: true, calculationRule: "21+22-23" },
        { id: "25", type: "number", label: "7. Сайн дурын даатгалын хураамжийн хэтрэлт", order: 25, result: "0.00", isCalculated: false },
        { id: "26", type: "number", label: "8. Зохицуулагдсан татвар ногдуулах орлогын дүн (24+25)", order: 26, result: "0.00", isCalculated: true, calculationRule: "24+25" },
        { id: "27", type: "number", label: "9. Өмнөх жилүүдийн татварын тайлангаар гарсан татварын албаар баталгаажуулсан алдагдлаас тайлант хугацаанд шилжүүлсэн дүн", order: 27, result: "0.00", isCalculated: false },
        { id: "28", type: "number", label: "10. Нийтлэг хувь хэмжээгээр татвар ногдуулах орлого (26-27)", order: 28, result: "0.00", isCalculated: true, calculationRule: "26-27" },
        { id: "29", type: "number", label: "11. Ногдуулсан төлбөл зохих албан татвар (28 * 25%)", order: 29, result: "0.00", isCalculated: false },
        { id: "30", type: "number", label: "12. Хуулийн 22.5, 22.9-д заасны дагуу хөнгөлөгдөх татвар", order: 30, result: "0.00", isCalculated: false },
        { id: "31", type: "number", label: "13. НИЙТЛЭГ ХУВЬ ХЭМЖЭЭГЭЭР НОГДУУЛСАН ТӨЛБӨЛ ЗОХИХ АЛБАН ТАТВАР (29-30)", order: 31, result: "0.00", isCalculated: true, calculationRule: "29-30" },
      ],
    },
    {
      id: "Б",
      title: "Б. Тусгай хувь хэмжээгээр ногдуулах татварын тооцоолол:",
      fields: [
        { id: "32", type: "number", label: "14.Тусгай хувь хэмжээгээр татвар ногдох орлого (33+38+39+40+41+42+44+45+47+49)", order: 32, result: "0.00", isCalculated: true, calculationRule: "33+38+39+40+41+42+44+45+47+49" },
        {
          id: "33",
          type: "number",
          label: "15. Төрийн байгууллагаас олгосон эрх борлуулсан, шилжүүлсний орлого",
          order: 33,
          result: "0.00",
          isCalculated: false,
          children: [
            { id: "34", type: "number", label: "Төрийн байгууллагад төлсөн төлбөр", order: 34, result: "0.00", isCalculated: false },
            { id: "35", type: "number", label: "Бусдаас худалдаж авахад төлсөн төлбөр", order: 35, result: "0.00", isCalculated: false },
            { id: "36", type: "number", label: "Татвар ногдуулах орлого (33-34-35)", order: 36, result: "0.00", isCalculated: true, calculationRule: "33-34-35" },
            { id: "37", type: "number", label: "Ногдуулсан татвар (36 * 10%)", order: 37, result: "0.00", isCalculated: true, calculationRule: "36 * 10%" },
          ],
        },
        { id: "38", type: "number", label: "16. Эрхийн шимтгэлийн орлого", order: 38, result: "0.00", isCalculated: false },
        { id: "39", type: "number", label: "17. Ногдол ашгийн орлого", order: 39, result: "0.00", isCalculated: false },
        { id: "40", type: "number", label: "18. Буцаан олгосон мөнгөн хөрөнгө", order: 40, result: "0.00", isCalculated: false },
        { id: "41", type: "number", label: "19. Даатгалын нөхөн төлбөрийн орлого", order: 41, result: "0.00", isCalculated: false },
        {
          id: "42",
          type: "number",
          label: "20. Хүүгийн орлого",
          order: 42,
          result: "0.00",
          isCalculated: false,
          children: [
            { id: "43", type: "number", label: "Ногдуулсан татвар ((38+39+40+41+42) * 10%)", order: 43, result: "0.00", isCalculated: true, calculationRule: "(38+39+40+41+42) * 0.10" },
          ],
        },
        { id: "44", type: "number", label: "21. Зээл, өрийн хэрэгслийн хүүгийн орлого", order: 44, result: "0.00", isCalculated: false },
        {
          id: "45",
          type: "number",
          label: "22. Үнэт цаасны хүүгийн орлого",
          order: 45,
          result: "0.00",
          isCalculated: false,
          children: [
            { id: "46", type: "number", label: "Ногдуулсан татвар ((44+45) * 5%)", order: 46, result: "0.00", isCalculated: true, calculationRule: "(44+45) * 0.05" },
          ],
        },
        {
          id: "47",
          type: "number",
          label: "23. Үл хөдлөх эд хөрөнгө борлуулсан, шилжүүлсний орлого",
          order: 47,
          result: "0.00",
          isCalculated: false,
          children: [
            { id: "48", type: "number", label: "Ногдуулсан татвар (47 * 2%)", order: 48, result: "0.00", isCalculated: true, calculationRule: "47 * 0.02" },
          ],
        },
        {
          id: "49",
          type: "number",
          label: "24. Төлбөрт таавар, бооцоот тоглоом, сугалаанаас хожсон орлого",
          order: 49,
          result: "0.00",
          isCalculated: false,
          children: [
            { id: "50", type: "number", label: "Ногдуулсан татвар (49 * 40%)", order: 50, result: "0.00", isCalculated: true, calculationRule: "49 * 0.40" },
          ],
        },
        { id: "51", type: "number", label: "25. ТУСГАЙ ХУВЬ ХЭМЖЭЭГЭЭР НОГДУУЛСАН АЛБАН ТАТВАР (37+43+46+48+50)", order: 51, result: "0.00", isCalculated: true, calculationRule: "37+43+46+48+50" },
      ],
    },
    {
      id: "В",
      title: "В. Албан татвар ногдуулах тооцоолол",
      fields: [
        { id: "52", type: "number", label: "26. Хуулийн дагуу бусдад суутгуулсан албан татвар", order: 52, result: "0.00", isCalculated: false },
        { id: "53", type: "number", label: "27. Гадаад улсад ногдуулан төлсөн албан татвар", order: 53, result: "0.00", isCalculated: false },
        { id: "54", type: "number", label: "28. ТӨЛБӨЛ ЗОХИХ ТАТВАРЫН ДҮН (31+51-52-53)", order: 54, result: "0.00", isCalculated: true, calculationRule: "31+51-52-53" },
        { id: "55", type: "number", label: "29. Хөнгөлөн буцаан авахаар тооцсон дүн", order: 55, result: "0.00", isCalculated: false },
      ],
    },
    {
      id: "Г",
      title: "Г. Аж ахуйн нэгжийн орлогын албан татвараас хөнгөлөх, чөлөөлөх тухай хуулийн дагуу албан татвараас хөнгөлөх, чөлөөлөх татварын тооцоолол",
      fields: [
        { id: "56", type: "number", label: "30. Түрээсийн төлбөрийг бууруулсан аж ахуйн нэгжийг орлогын албан татвараас хөнгөлөх", order: 56, result: "0.00", isCalculated: false },
        { id: "57", type: "number", label: "31. Аж ахуйн нэгжийн орлогын албан татвараас чөлөөлөх мэдээ", order: 57, result: "0.00", isCalculated: false },
        { id: "58", type: "number", label: "32. Нийт төлбөл зохих татварын дүн (31+51-52-53-56-57)", order: 58, result: "0.00", isCalculated: true, calculationRule: "31+51-52-53-56-57" },
      ],
    },
  ],
};

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
  switch(status) {
    case "pending":
      return <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium flex items-center gap-1"><FiClock /> Хүлээгдэж буй</span>;
    case "reviewed":
      return <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium flex items-center gap-1"><FiMessageSquare /> Хянаж буй</span>;
    case "approved":
      return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center gap-1"><FiCheckCircle /> Баталгаажсан</span>;
    case "rejected":
      return <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium flex items-center gap-1"><FiXCircle /> Татгалзсан</span>;
    default:
      return <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">{status}</span>;
  }
};

export default function TeacherReportViewPage() {
  const router = useRouter();
  const params = useParams();
  const reportId = params.id as string;
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<ReportInfo | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
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
      const response = await fetch(`http://localhost:8000/api/report/${reportId}/`, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();
      console.log("Тайлангийн мэдээлэл:", data);

      if (data.resultCode === 7520 && data.data) {
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
          student: {
            id: reportData.student_id,
            first_name: reportData.student_first_name || reportData.student_name?.split(" ")[1] || "",
            last_name: reportData.student_last_name || reportData.student_name?.split(" ")[0] || "",
            email: reportData.student_email || "",
            student_code: reportData.student_code,
            department: reportData.department,
          },
        });
        setValues(reportValues);
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
      const value = values[fieldId];
      if (value === undefined || value === null || value === "") return 0;
      const num = Number(value);
      return isNaN(num) ? 0 : num;
    },
    [values]
  );

  const getDisplayValue = useCallback(
    (fieldId: string): string => {
      const value = values[fieldId];
      if (value === undefined || value === null || value === "") return "0.00 ₮";
      return formatAsMoney(value);
    },
    [values]
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
                className={`w-full px-3 py-2 border border-gray-200 rounded-lg text-right text-gray-900 font-medium ${
                  field.isCalculated ? "bg-blue-100/50" : "bg-gray-50"
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
    // CSV экспорт хийх
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
            <Link href="/teacher/dashboard" className="hover:text-blue-600 flex items-center gap-1">
              <FiHome className="text-sm" /> Нүүр
            </Link>
            <span>/</span>
            <Link href="/teacher/review" className="hover:text-blue-600 flex items-center gap-1">
              <FiFileText className="text-sm" /> Тайлан хянах
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">Тайлан харах</span>
          </div>
          
          <div className="flex items-center gap-3">
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
              onClick={() => router.push("/teacher/review")}
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
              {/* Оюутны мэдээлэл */}
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
              
              {/* Тайлангийн хугацаа */}
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
              
              {/* Илгээсэн огноо */}
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
              
              {/* Хянасан мэдээлэл */}
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
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-4 px-3 py-2 bg-gray-100 rounded-t-lg font-medium text-sm text-gray-700">
                  <div className="col-span-1">Мөр</div>
                  <div className="col-span-8">Үзүүлэлтүүд</div>
                  <div className="col-span-3">Дүн (₮)</div>
                </div>
                
                {/* Fields - Read Only */}
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
        }
      `}</style>
    </div>
  );
}