"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FiSave,
  FiSend,
  FiDownload,
  FiRefreshCw,
  FiAlertCircle,
  FiCheckCircle,
  FiFileText,
  FiUser,
} from "react-icons/fi";
import Header from "../../../../component/Header";
import { useRouter } from "next/navigation";

// Интерфейсүүд
interface Field {
  id: string;
  type: string;
  label: string;
  order: number;
  result: string;
  isCalculated?: boolean;
  calculationRule?: string;
  children?: Field[];
  level?: number;
}

interface Section {
  id: string;
  title: string;
  fields: Field[];
}

interface ReportData {
  sections: Section[];
}

// Багшийн интерфейс
interface Teacher {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  department?: string;
}

// Формын өгөгдлийн интерфейс
interface FormData {
  student_id: string;
  report_type_id: number;
  tax_period_year: number;
  tax_period_month: number;
  report_data: ReportData;
  values: Record<string, string>;
  teacher_id?: number; // Сонгосон багшийн ID
}

const API_BASE_URL = "http://localhost:8000";

export default function TaxReportPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  
  // Багш нарын жагсаалт
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoadingTeachers, setIsLoadingTeachers] = useState(true);
  
  // Хэрэглэгчийн мэдээлэл
  const [studentInfo, setStudentInfo] = useState({
    id: "",
    name: "",
  });

  // Формын өгөгдөл
  const [formData, setFormData] = useState<FormData>({
    student_id: "",
    report_type_id: 1, // Татварын тайлангийн төрөл ID
    tax_period_year: new Date().getFullYear(),
    tax_period_month: new Date().getMonth() + 1,
    report_data: { sections: [] },
    values: {},
    teacher_id: undefined,
  });

  // Тайлангийн бүтэц (HTML-оос авсан) - өмнөхтэй ижил
  const reportStructure: ReportData = {
    "sections": [
      {
        "id": "A",
        "title": "А. Нийтлэг хувь хэмжээгээр ногдуулах татварын тооцоолол",
        "fields": [
          {
            "id": "1",
            "type": "number",
            "label": "1. Нийт орлогын дүн (мөр 2+3+4+5)",
            "order": 1,
            "result": "0.00",
            "isCalculated": true,
            "calculationRule": "2+3+4+5",
            "children": [
              {
                "id": "2",
                "type": "number",
                "label": "1.1. Татвараас чөлөөлөгдөх орлогын дүн",
                "order": 2,
                "result": "0.00",
                "isCalculated": false
              },
              {
                "id": "3",
                "type": "number",
                "label": "1.2. Тусгай хувь хэмжээгээр татвар ногдох орлого (32)",
                "order": 3,
                "result": "0.00",
                "isCalculated": false
              },
              {
                "id": "4",
                "type": "number",
                "label": "1.3. Бусад орлогын дүн",
                "order": 4,
                "result": "0.00",
                "isCalculated": false
              },
              {
                "id": "5",
                "type": "number",
                "label": "1.4. Нийтлэг хувь хэмжээгээр татвар ногдох орлого",
                "order": 5,
                "result": "0.00",
                "isCalculated": true,
                "calculationRule": "6+7+8+9+10+11+12+13+14+15+16",
                "children": [
                  { "id": "6", "type": "number", "label": "Бараа, ажил, үйлчилгээний борлуулалтын орлого", "order": 6, "result": "0.00", "isCalculated": false },
                  { "id": "7", "type": "number", "label": "Техникийн, удирдлагын, зөвлөхийн болон бусад үйлчилгээний орлого", "order": 7, "result": "0.00", "isCalculated": false },
                  { "id": "8", "type": "number", "label": "Үл хөдлөх эд хөрөнгө ашиглуулсан болон түрээслүүлсний орлого", "order": 8, "result": "0.00", "isCalculated": false },
                  { "id": "9", "type": "number", "label": "Хөдлөх эд хөрөнгө ашиглуулсан болон түрээслүүлсний орлого", "order": 9, "result": "0.00", "isCalculated": false },
                  { "id": "10", "type": "number", "label": "Үнэ төлбөргүйгээр бусдаас авсан бараа, ажил, үйлчилгээний орлого", "order": 10, "result": "0.00", "isCalculated": false },
                  { "id": "11", "type": "number", "label": "Гэрээгээр хүлээсэн үүргээ биелүүлээгүй этгээдээс авсан хүү, анз", "order": 11, "result": "0.00", "isCalculated": false },
                  { "id": "12", "type": "number", "label": "Төлбөрт таавар, бооцоот тоглоом, эд мөнгөний хонжворт сугалааны орлого", "order": 12, "result": "0.00", "isCalculated": false },
                  { "id": "13", "type": "number", "label": "Хувьцаа, үнэт цаас, санхүүгийн бусад хэрэгсэл борлуулсны орлого", "order": 13, "result": "0.00", "isCalculated": false },
                  { "id": "14", "type": "number", "label": "Бусад биет бус хөрөнгө болон хөдлөх эд хөрөнгө борлуулсан, шилжүүлсний орлого", "order": 14, "result": "0.00", "isCalculated": false },
                  { "id": "15", "type": "number", "label": "Гадаад валютын ханшийн зөрүүгийн бодит орлого", "order": 15, "result": "0.00", "isCalculated": false },
                  { "id": "16", "type": "number", "label": "Албан татвар ногдох бусад орлого", "order": 16, "result": "0.00", "isCalculated": false }
                ]
              }
            ]
          },
          {
            "id": "17",
            "type": "number",
            "label": "2. Нийт зардлын дүн (18+19+20)",
            "order": 17,
            "result": "0.00",
            "isCalculated": true,
            "calculationRule": "18+19+20",
            "children": [
              { "id": "18", "type": "number", "label": "2.1. Борлуулсан бүтээгдэхүүний өртөг", "order": 18, "result": "0.00", "isCalculated": false },
              { "id": "19", "type": "number", "label": "2.2. Удирдлагын болон борлуулалтын үйл ажиллагааны зардал", "order": 19, "result": "0.00", "isCalculated": false },
              { "id": "20", "type": "number", "label": "2.3. Үндсэн бус үйл ажиллагааны зардал", "order": 20, "result": "0.00", "isCalculated": false }
            ]
          },
          { "id": "21", "type": "number", "label": "3. Татвар төлөхийн өмнөх ашиг +, алдагдал - (1-17 )", "order": 21, "result": "0.00", "isCalculated": true, "calculationRule": "1-17" },
          { "id": "22", "type": "number", "label": "4. Татвар төлөхийн өмнөх ашиг, алдагдлыг нэмэгдүүлэх дүн", "order": 22, "result": "0.00", "isCalculated": false },
          { "id": "23", "type": "number", "label": "5. Татвар төлөхийн өмнөх ашиг, алдагдлыг бууруулах дүн", "order": 23, "result": "0.00", "isCalculated": false },
          { "id": "24", "type": "number", "label": "6. Татвар ногдуулах орлого (21+22-23)", "order": 24, "result": "0.00", "isCalculated": true, "calculationRule": "21+22-23" },
          { "id": "25", "type": "number", "label": "7. Сайн дурын даатгалын хураамжийн хэтрэлт", "order": 25, "result": "0.00", "isCalculated": false },
          { "id": "26", "type": "number", "label": "8. Зохицуулагдсан татвар ногдуулах орлогын дүн (24+25)", "order": 26, "result": "0.00", "isCalculated": true, "calculationRule": "24+25" },
          { "id": "27", "type": "number", "label": "9. Өмнөх жилүүдийн татварын тайлангаар гарсан татварын албаар баталгаажуулсан алдагдлаас тайлант хугацаанд шилжүүлсэн дүн", "order": 27, "result": "0.00", "isCalculated": false },
          { "id": "28", "type": "number", "label": "10. Нийтлэг хувь хэмжээгээр татвар ногдуулах орлого (26-27)", "order": 28, "result": "0.00", "isCalculated": true, "calculationRule": "26-27" },
          { "id": "29", "type": "number", "label": "11. Ногдуулсан төлбөл зохих албан татвар (28 * 25%)", "order": 29, "result": "0.00", "isCalculated": false },
          { "id": "30", "type": "number", "label": "12. Хуулийн 22.5, 22.9-д заасны дагуу хөнгөлөгдөх татвар", "order": 30, "result": "0.00", "isCalculated": false },
          { "id": "31", "type": "number", "label": "13. НИЙТЛЭГ ХУВЬ ХЭМЖЭЭГЭЭР НОГДУУЛСАН ТӨЛБӨЛ ЗОХИХ АЛБАН ТАТВАР (29-30)", "order": 31, "result": "0.00", "isCalculated": true, "calculationRule": "29-30" }
        ]
      },
      {
        "id": "B",
        "title": "Б. Тусгай хувь хэмжээгээр ногдуулах татварын тооцоолол",
        "fields": [
          { "id": "32", "type": "number", "label": "14.Тусгай хувь хэмжээгээр татвар ногдох орлого (33+38+39+40+41+42+44+45+47+49)", "order": 32, "result": "0.00", "isCalculated": true, "calculationRule": "33+38+39+40+41+42+44+45+47+49" },
          { "id": "33", "type": "number", "label": "15. Төрийн байгууллагаас олгосон эрх борлуулсан, шилжүүлсний орлого", "order": 33, "result": "0.00", "isCalculated": false },
          { "id": "38", "type": "number", "label": "16. Эрхийн шимтгэлийн орлого", "order": 38, "result": "0.00", "isCalculated": false },
          { "id": "39", "type": "number", "label": "17. Ногдол ашгийн орлого", "order": 39, "result": "0.00", "isCalculated": false },
          { "id": "40", "type": "number", "label": "18. Байгаль орчинд нөлөөлөх байдлын үнэлгээний тухай хуулийн дагуу буцаан олгосон мөнгөн хөрөнгө", "order": 40, "result": "0.00", "isCalculated": false },
          { "id": "41", "type": "number", "label": "19. Даатгалын нөхөн төлбөрийн орлого", "order": 41, "result": "0.00", "isCalculated": false },
          { "id": "42", "type": "number", "label": "20. Хүүгийн орлого", "order": 42, "result": "0.00", "isCalculated": false },
          { "id": "44", "type": "number", "label": "21. Монгол Улсын арилжааны банкны гадаад, дотоодын эх үүсвэрээс татсан зээл, өрийн хэрэгслийн хүүгийн орлого", "order": 44, "result": "0.00", "isCalculated": false },
          { "id": "45", "type": "number", "label": "22. Ашигт малтмал, цацраг идэвхт ашигт малтмал, газрын тосны хайгуулын болон ашиглалтын тусгай зөвшөөрөл эзэмшдэггүй", "order": 45, "result": "0.00", "isCalculated": false },
          { "id": "47", "type": "number", "label": "23. Үл хөдлөх эд хөрөнгө борлуулсан, шилжүүлсний орлого", "order": 47, "result": "0.00", "isCalculated": false },
          { "id": "49", "type": "number", "label": "24. Төлбөрт таавар, бооцоот тоглоом, эд мөнгөний хонжворт сугалаанаас хожсон орлого", "order": 49, "result": "0.00", "isCalculated": false },
          { "id": "51", "type": "number", "label": "25. ТУСГАЙ ХУВЬ ХЭМЖЭЭГЭЭР НОГДУУЛСАН АЛБАН ТАТВАР", "order": 51, "result": "0.00", "isCalculated": true, "calculationRule": "37+43+46+48+50" }
        ]
      },
      {
        "id": "C",
        "title": "В. Албан татвар ногдуулах тооцоолол",
        "fields": [
          { "id": "52", "type": "number", "label": "26. Хуулийн дагуу бусдад суутгуулсан албан татвар", "order": 52, "result": "0.00", "isCalculated": false },
          { "id": "53", "type": "number", "label": "27. Төлбөл зохих албан татвараас хасагдах гадаад улсад ногдуулан төлсөн албан татвар", "order": 53, "result": "0.00", "isCalculated": false },
          { "id": "54", "type": "number", "label": "28. ТӨЛБӨЛ ЗОХИХ ТАТВАРЫН ДҮН (31+51-52-53)", "order": 54, "result": "0.00", "isCalculated": true, "calculationRule": "31+51-52-53" },
          { "id": "55", "type": "number", "label": "29. Хуулийн 22.1-т заасны дагуу албан татварыг хөнгөлөн буцаан авахаар тооцсон дүн", "order": 55, "result": "0.00", "isCalculated": false }
        ]
      },
      {
        "id": "D",
        "title": "Г. Аж ахуйн нэгжийн орлогын албан татвараас хөнгөлөх, чөлөөлөх тухай хуулийн дагуу албан татвараас хөнгөлөх, чөлөөлөх татварын тооцоолол",
        "fields": [
          { "id": "56", "type": "number", "label": "30. Түрээсийн төлбөрийг бууруулсан аж ахуйн нэгжийг орлогын албан татвараас хөнгөлөх", "order": 56, "result": "0.00", "isCalculated": false },
          { "id": "57", "type": "number", "label": "31. Аж ахуйн нэгжийн орлогын албан татвараас чөлөөлөх мэдээ", "order": 57, "result": "0.00", "isCalculated": false },
          { "id": "58", "type": "number", "label": "32. Нийт төлбөл зохих татварын дүн (31+51-52-53-56-57)", "order": 58, "result": "0.00", "isCalculated": true, "calculationRule": "31+51-52-53-56-57" }
        ]
      }
    ]
  };

  useEffect(() => {
    // Хэрэглэгчийн мэдээллийг localStorage-аас авах
    const user = localStorage.getItem("user");
    if (user) {
      const userData = JSON.parse(user);
      setStudentInfo({
        id: userData.id?.toString() || "",
        name: `${userData.last_name || ""} ${userData.first_name || ""}`,
      });
      setFormData(prev => ({
        ...prev,
        student_id: userData.id?.toString() || "",
      }));
    }

    // Тайлангийн бүтцийг тохируулах
    setFormData(prev => ({
      ...prev,
      report_data: reportStructure,
    }));

    // Багш нарын жагсаалтыг татах
    fetchTeachers();
  }, []);

  // Багш нарын жагсаалт татах
  const fetchTeachers = async () => {
    setIsLoadingTeachers(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/teachers/`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      
      if (data.resultCode === 7220) {
        setTeachers(data.data || []);
      } else {
        console.error("Багш нар татахад алдаа:", data.resultMessage);
      }
    } catch (error) {
      console.error("Багш нар татахад алдаа:", error);
    } finally {
      setIsLoadingTeachers(false);
    }
  };

  // Талбарын утгыг авах
  const getValue = (fieldId: string): number => {
    return Number(formData.values[fieldId] || 0);
  };

  // Талбарын утгыг тохируулах
  const setValue = (fieldId: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      values: {
        ...prev.values,
        [fieldId]: value,
      },
    }));
  };

  // Томьёог бодох
  const evaluateRule = (rule?: string): number => {
    if (!rule) return 0;
    
    let expression = rule.replace(/(\d+(?:\.\d+)?)%/g, '($1/100)');
    expression = expression.replace(/\b\d+\b/g, (match) => {
      return getValue(match).toString();
    });
    
    try {
      return Function('return ' + expression)() || 0;
    } catch (error) {
      console.error('Томьёо бодоход алдаа гарлаа:', rule, error);
      return 0;
    }
  };

  // Бүх утгыг дахин тооцоолох
  const recalculateAll = () => {
    const newValues = { ...formData.values };
    
    // Тооцоололт мөрүүдийг олж, эрэмбэлэх
    const calculatedFields: Field[] = [];
    
    const collectCalculatedFields = (fields: Field[]) => {
      fields.sort((a, b) => a.order - b.order);
      for (const field of fields) {
        if (field.isCalculated && field.calculationRule) {
          calculatedFields.push(field);
        }
        if (field.children?.length) {
          collectCalculatedFields(field.children);
        }
      }
    };
    
    collectCalculatedFields(reportStructure.sections.flatMap(s => s.fields));
    
    // Хэд хэдэн удаа давтан бодох (хамааралтай томьёонуудын хувьд)
    for (let i = 0; i < 5; i++) {
      for (const field of calculatedFields) {
        const result = evaluateRule(field.calculationRule);
        newValues[field.id] = result.toFixed(2);
      }
    }
    
    setFormData(prev => ({
      ...prev,
      values: newValues,
    }));
  };

  // Input өөрчлөгдөхөд
  const handleInputChange = (fieldId: string, value: string) => {
    setValue(fieldId, value);
    setTimeout(() => recalculateAll(), 0);
  };

  // Бүх утгыг 0 болгох
  const resetAllValues = () => {
    const newValues: Record<string, string> = {};
    
    const resetFields = (fields: Field[]) => {
      for (const field of fields) {
        if (!field.isCalculated) {
          newValues[field.id] = "0.00";
        }
        if (field.children?.length) {
          resetFields(field.children);
        }
      }
    };
    
    resetFields(reportStructure.sections.flatMap(s => s.fields));
    
    setFormData(prev => ({
      ...prev,
      values: newValues,
    }));
    
    setTimeout(() => recalculateAll(), 0);
  };

  // Тайлан илгээх
  const handleSubmit = async (isDraft: boolean = false) => {
    // Багш сонгосон эсэхийг шалгах
    if (!isDraft && !formData.teacher_id) {
      setSubmitError("Тайлан илгээх багшаа сонгоно уу");
      return;
    }

    if (isDraft) {
      setIsSavingDraft(true);
    } else {
      setIsSubmitting(true);
    }
    setSubmitError("");

    try {
      // Утгуудыг цуглуулах
      const allValues = { ...formData.values };
      
      // Тооцоололт мөрүүдийг оруулахгүй байх (заавал)
      const payload = {
        student_id: parseInt(formData.student_id),
        report_type_id: formData.report_type_id,
        tax_period_year: formData.tax_period_year,
        tax_period_month: formData.tax_period_month,
        report_data: formData.report_data,
        values: allValues,
        teacher_id: formData.teacher_id, // Багшийн ID нэмсэн
        is_draft: isDraft,
      };

      console.log("Илгээх өгөгдөл:", payload);

      // API руу илгээх
      const response = await fetch("https://bmtax.mandakh.org/api/reports/add/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Алдаа гарлаа");
      }

      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 5000);

      if (!isDraft) {
        // Амжилттай илгээсний дараа тайлангийн жагсаалт руу шилжих
        setTimeout(() => {
          router.push("/student/reports");
        }, 2000);
      }
    } catch (error: any) {
      setSubmitError(error.message || "Тайлан илгээхэд алдаа гарлаа");
    } finally {
      setIsSubmitting(false);
      setIsSavingDraft(false);
    }
  };

  // Тайлангийн мөрүүдийг рендерлэх
  const renderFields = (fields: Field[], level: number = 0) => {
    return fields.sort((a, b) => a.order - b.order).map((field) => (
      <div key={field.id}>
        <div className={`grid grid-cols-12 gap-4 p-3 ${field.isCalculated ? 'bg-blue-50' : ''} border-b border-gray-200 hover:bg-gray-50/50 transition`}>
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
            <input
              type="number"
              step="0.01"
              value={formData.values[field.id] || "0.00"}
              onChange={(e) => handleInputChange(field.id, e.target.value)}
              readOnly={field.isCalculated}
              className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-right ${
                field.isCalculated 
                  ? 'bg-blue-100/50 font-medium text-blue-900 cursor-not-allowed' 
                  : 'bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              }`}
            />
          </div>
        </div>
        {field.children && renderFields(field.children, level + 1)}
      </div>
    ));
  };

  // Summary утгууд
  const summaryValues = [
    { id: 54, label: "Төлбөл зохих татварын дүн", value: getValue("54") },
    { id: 58, label: "Нийт төлбөл зохих татварын дүн", value: getValue("58") },
    { id: 31, label: "Нийтлэг хувь хэмжээгээр ногдуулсан татвар", value: getValue("31") },
    { id: 51, label: "Тусгай хувь хэмжээгээр ногдуулсан татвар", value: getValue("51") },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] via-white to-[#eef2ff]">
      <Header />
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Татварын тайлангийн маягт</h1>
            <p className="text-gray-600 mt-1">
              {studentInfo.name} - {studentInfo.id}
            </p>
          </div>
          
          <div className="flex items-center gap-3 mt-4 md:mt-0">
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-200">
              <select
                value={formData.tax_period_year}
                onChange={(e) => setFormData(prev => ({ ...prev, tax_period_year: parseInt(e.target.value) }))}
                className="border-none focus:ring-0 text-sm"
              >
                {[2024, 2025, 2026].map(year => (
                  <option key={year} value={year}>{year} он</option>
                ))}
              </select>
              <span className="text-gray-400">|</span>
              <select
                value={formData.tax_period_month}
                onChange={(e) => setFormData(prev => ({ ...prev, tax_period_month: parseInt(e.target.value) }))}
                className="border-none focus:ring-0 text-sm"
              >
                {[1,2,3,4,5,6,7,8,9,10,11,12].map(month => (
                  <option key={month} value={month}>{month} сар</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Багш сонгох хэсэг */}
        <div className="mb-6 bg-white rounded-xl shadow-lg border border-gray-200 p-5">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <FiUser className="text-blue-700 text-xl" />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Тайлан илгээх багш <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.teacher_id || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, teacher_id: parseInt(e.target.value) || undefined }))}
                className="w-full md:w-96 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                disabled={isLoadingTeachers}
              >
                <option value="">Багш сонгоно уу...</option>
                {teachers.map(teacher => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.last_name} {teacher.first_name} {teacher.department ? `- ${teacher.department}` : ''}
                  </option>
                ))}
              </select>
              {isLoadingTeachers && (
                <p className="text-sm text-gray-500 mt-2">Багш нарын жагсаалт татаж байна...</p>
              )}
            </div>
          </div>
        </div>

        {/* Success/Error Messages */}
        {submitSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 text-green-700"
          >
            <FiCheckCircle className="text-xl flex-shrink-0" />
            <span>Тайлан амжилттай илгээгдлээ.</span>
          </motion.div>
        )}

        {submitError && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700"
          >
            <FiAlertCircle className="text-xl flex-shrink-0" />
            <span>{submitError}</span>
          </motion.div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {summaryValues.map(item => (
            <div key={item.id} className="bg-white rounded-xl shadow-lg border border-gray-200 p-5">
              <div className="text-sm text-gray-600 mb-2">Мөр {item.id}</div>
              <div className="text-2xl font-bold text-gray-900">
                {item.value.toFixed(2)} ₮
              </div>
              <div className="text-xs text-gray-500 mt-1">{item.label}</div>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <button
            onClick={resetAllValues}
            className="px-4 py-2 bg-white border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition flex items-center gap-2"
          >
            <FiRefreshCw />
            Бүгдийг 0 болгох
          </button>
          <button
            onClick={() => handleSubmit(true)}
            disabled={isSavingDraft}
            className="px-4 py-2 bg-white border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition flex items-center gap-2 disabled:opacity-50"
          >
            {isSavingDraft ? (
              <>
                <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
                Хадгалж байна...
              </>
            ) : (
              <>
                <FiSave />
                Ноорог хадгалах
              </>
            )}
          </button>
          <button
            onClick={() => handleSubmit(false)}
            disabled={isSubmitting}
            className="px-6 py-2 bg-gradient-to-r from-[#0f172a] to-[#1e3a8a] text-white rounded-xl font-medium shadow-lg hover:opacity-90 transition flex items-center gap-2 disabled:opacity-50 ml-auto"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Илгээж байна...
              </>
            ) : (
              <>
                <FiSend />
                Тайлан илгээх
              </>
            )}
          </button>
        </div>

        {/* Report Sections - өмнөхтэй ижил */}
        <div className="space-y-6">
          {reportStructure.sections.map((section) => (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
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
                  <div className="col-span-3">Дүн</div>
                </div>
                
                {/* Fields */}
                <div className="border-x border-b border-gray-200 rounded-b-lg divide-y divide-gray-200">
                  {renderFields(section.fields)}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-gray-400">
          Тооцоолол автоматаар шинэчлэгдэнэ. Цэнхэр мөрүүд нь томьёотой мөрүүд.
        </div>
      </div>
    </div>
  );
}