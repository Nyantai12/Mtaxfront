// app/student/tax-report/page.tsx
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
} from "react-icons/fi";
import { FaChalkboardTeacher, FaGraduationCap } from "react-icons/fa";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/app/component/Header";

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
}

interface Section {
  id: string;
  title: string;
  fields: Field[];
  columns?: any[];
}

interface ReportData {
  sections: Section[];
}

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

export default function TaxReportPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [showTeacherList, setShowTeacherList] = useState(false);
  const [isLoadingTeachers, setIsLoadingTeachers] = useState(true);
  const [isLoadingReport, setIsLoadingReport] = useState(false);
  
  // Хэрэглэгчийн мэдээлэл
  const [studentInfo, setStudentInfo] = useState({
    id: "",
    name: "",
  });

  // Багш нарын жагсаалт
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);

  // Формын өгөгдөл
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
    // Хэрэглэгчийн мэдээллийг авах
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

    // Багш нарын жагсаалтыг татах
    fetchTeachers();

    // URL-аас report ID шалгах
    const urlParams = new URLSearchParams(window.location.search);
    const reportId = urlParams.get('id');
    if (reportId) {
      fetchReportData(parseInt(reportId));
    } else {
      // Шинэ тайлан бол анхны утгуудыг тохируулах
      initializeValues();
    }
  }, []);

  // app/student/tax-report/page.tsx - fetchReportData функцийг шинэчлэх

// Одoo байгаа тайлангийн мэдээллийг татах (GET /api/report/<rid>/)
const fetchReportData = async (reportId: number) => {
  setIsLoadingReport(true);
  try {
    const response = await fetch(`http://localhost:8000/api/report/${reportId}/`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    console.log("Тайлангийн мэдээлэл:", data);
    
    if (data.resultCode === 7520 && data.data) {
      const report = data.data;
      
      let reportValues = {};
      
      if (report.report_data) {
        if (typeof report.report_data === 'object') {
          reportValues = report.report_data;
        } 
        else if (typeof report.report_data === 'string') {
          try {
            reportValues = JSON.parse(report.report_data);
          } catch (e) {
            console.error("JSON parse error:", e);
            reportValues = {};
          }
        }
      }
      
      // Хадгалсан утгуудыг авах - дутуу талбаруудыг undefined хэвээр үлдээх
      // 0.00 гэж тохируулахгүй
      const existingValues = { ...reportValues };
      
      // Тайлангийн өгөгдлийг formData-д тохируулах
      setFormData({
        student_id: formData.student_id,
        report_type_id: formData.report_type_id,
        tax_period_year: formData.tax_period_year,
        tax_period_month: formData.tax_period_month,
        values: existingValues, // Хадгалсан утгуудыг шууд ашиглах
        teacher_id: undefined,
        report_id: report.report_id,
        is_draft: true,
        report_name: report.type_name || "",
      });

      // Тооцооллыг дахин хийх
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

  // Анхны утгуудыг тохируулах
  const initializeValues = () => {
    const initialValues: Record<string, string> = {};
    
    const setInitialValues = (fields: Field[]) => {
      for (const field of fields) {
        if (!field.isCalculated) {
          initialValues[field.id] = "0.00";
        }
        if (field.children?.length) {
          setInitialValues(field.children);
        }
      }
    };
    
    setInitialValues(reportStructure.sections.flatMap(s => s.fields));
    
    setFormData(prev => ({
      ...prev,
      values: initialValues,
    }));
  };

  // Багш нарын жагсаалт татах
  const fetchTeachers = async () => {
    setIsLoadingTeachers(true);
    try {
      const response = await fetch("http://localhost:8000/api/users/teachers/", {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      
      if (data.resultCode === 7920 && data.data) {
        setTeachers(data.data);
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

  // Томьёог бодох
  const evaluateRule = (rule?: string): number => {
    if (!rule) return 0;
    
    let expression = rule;
    
    // Хувиар бодох (10%, 5%, 2%, 40% гэх мэт)
    expression = expression.replace(/(\d+(?:\.\d+)?)%/g, (match, p1) => {
      return `(${parseFloat(p1) / 100})`;
    });
    
    // Талбарын ID-г утгаар солих
    expression = expression.replace(/\b(\d+)\b/g, (match) => {
      return getValue(match).toString();
    });
    
    try {
      const result = Function('"use strict"; return (' + expression + ')')();
      return isNaN(result) ? 0 : result;
    } catch (error) {
      console.error('Томьёо бодоход алдаа гарлаа:', rule, error);
      return 0;
    }
  };

  // Бүх утгыг дахин тооцоолох
  const recalculateAll = () => {
    const newValues = { ...formData.values };
    
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
    setFormData(prev => ({
      ...prev,
      values: {
        ...prev.values,
        [fieldId]: value,
      },
    }));
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

  // app/student/tax-report/page.tsx - saveReport функцийг шинэчлэх

// Тайлан хадгалах (дутуу бөглөсөн ч хадгалах)
const saveReport = async (isDraft: boolean = false) => {
  // Багш сонгох шаардлагагүй - ноорог хадгалах үед
  if (!isDraft && !selectedTeacher) {
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
    let response;
    
    // Хэрэв report_id байгаа бол savereportfields endpoint ашиглах
    if (formData.report_id) {
      // report_data-г JSONB төрлөөр хадгалах
      // Дутуу бөглөсөн утгуудыг хадгалах (хоосон утгуудыг 0.00 гэж хадгалахгүй)
      const valuesToSave = { ...formData.values };
      
      // Хоосон утгуудыг арилгах (null эсвэл undefined)
      Object.keys(valuesToSave).forEach(key => {
        if (valuesToSave[key] === undefined || valuesToSave[key] === null) {
          delete valuesToSave[key];
        }
      });
      
      const payload = {
        report_data: valuesToSave
      };

      console.log("Хадгалах утгууд (дутуу бөглөсөн):", payload);
      console.log("Report ID:", formData.report_id);

      response = await fetch(`http://localhost:8000/api/report/savereportfields/${formData.report_id}/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });
    } else {
      // Шинэ тайлан үүсгэх
      const payload = {
        student_id: parseInt(formData.student_id),
        report_type_id: formData.report_type_id,
        tax_period_year: formData.tax_period_year,
        tax_period_month: formData.tax_period_month,
        values: formData.values,
        teacher_id: selectedTeacher?.id,
        is_draft: isDraft,
      };

      console.log("Шинэ тайлангийн өгөгдөл:", payload);

      response = await fetch("http://localhost:8000/api/reports/add/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });
    }

    const data = await response.json();

    console.log("Серверийн хариу:", data);

    // resultCode шалгах
    if (data.resultCode === 7820 || data.resultCode === 7220) {
      let successMessage = "";
      if (isDraft) {
        successMessage = "Тайлан ноорог хэлбэрээр амжилттай хадгалагдлаа. Дараа үргэлжлүүлж бөглөх боломжтой.";
      } else {
        successMessage = "Тайлан амжилттай илгээгдлээ.";
      }
      
      setSubmitSuccess(true);
      // Success message-ийг дэлгэрэнгүй харуулах
      const successDiv = document.createElement('div');
      successDiv.className = 'fixed top-4 right-4 z-50 animate-slide-in';
      successDiv.innerHTML = `
        <div class="bg-green-50 border border-green-200 rounded-xl p-4 shadow-lg">
          <div class="flex items-center gap-3">
            <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <div>
              <p class="text-green-800 font-medium">${successMessage}</p>
              ${isDraft ? '<p class="text-green-600 text-sm mt-1">Та дараа нь нэвтэрч үргэлжлүүлж бөглөх боломжтой.</p>' : ''}
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(successDiv);
      setTimeout(() => {
        successDiv.remove();
      }, 5000);
      
      setTimeout(() => setSubmitSuccess(false), 5000);

      if (!isDraft) {
        setTimeout(() => {
          router.push("/student/reports");
        }, 2000);
      }
    } else {
      throw new Error(data.resultMessage || `Алдаа гарлаа (Код: ${data.resultCode})`);
    }
  } catch (error: any) {
    console.error("Хадгалахад алдаа:", error);
    setSubmitError(error.message || "Тайлан хадгалахад алдаа гарлаа");
  } finally {
    setIsSubmitting(false);
    setIsSavingDraft(false);
  }
};

  // app/student/tax-report/page.tsx - Input рендерлэх хэсэг

// Input-ын утгыг харуулах
const getDisplayValue = (fieldId: string): string => {
  const value = formData.values[fieldId];
  // Хэрэв утга байхгүй эсвэл хоосон бол хоосон string харуулах
  if (value === undefined || value === null || value === "") {
    return "";
  }
  return value;
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
            value={getDisplayValue(field.id)}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            readOnly={field.isCalculated}
            placeholder="0.00"
            className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-right ${
              field.isCalculated 
                ? 'bg-blue-100/50 font-medium text-blue-900 cursor-not-allowed' 
                : 'bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            } ${!formData.values[field.id] && !field.isCalculated ? 'border-yellow-300 bg-yellow-50/30' : ''}`}
          />
          {/* Дутуу бөглөсөн талбарын тэмдэглэгээ */}
          {!formData.values[field.id] && !field.isCalculated && (
            <div className="text-xs text-yellow-600 mt-1 text-right">
              ⚠️ Бөглөх шаардлагатай
            </div>
          )}
        </div>
      </div>
      {field.children && renderFields(field.children, level + 1)}
    </div>
  ));
};

  // Summary утгууд
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] via-white to-[#eef2ff]">
      <Header />
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/student/dashboard" className="hover:text-blue-600 flex items-center gap-1">
            <FiHome className="text-sm" />
            Нүүр
          </Link>
          <span>/</span>
          <Link href="/student/reports" className="hover:text-blue-600 flex items-center gap-1">
            <FiFileText className="text-sm" />
            Тайлангууд
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">
            {formData.report_id ? `Тайлан засварлах${formData.report_name ? ` - ${formData.report_name}` : ''}` : "Татварын тайлан"}
          </span>
        </div>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {formData.report_id ? "Тайлан засварлах" : "Татварын тайлангийн маягт"}
            </h1>
            <p className="text-gray-600 mt-1 flex items-center gap-2">
              <FaGraduationCap className="text-blue-600" />
              {studentInfo.name} - {studentInfo.id}
              {formData.report_id && (
                <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                  Ноорог
                </span>
              )}
            </p>
          </div>
          
          <div className="flex items-center gap-3 mt-4 md:mt-0">
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-200">
              <FiCalendar className="text-gray-400" />
              <select
                value={formData.tax_period_year}
                onChange={(e) => setFormData(prev => ({ ...prev, tax_period_year: parseInt(e.target.value) }))}
                className="border-none focus:ring-0 text-sm bg-transparent"
              >
                {[2023, 2024, 2025, 2026].map(year => (
                  <option key={year} value={year}>{year} он</option>
                ))}
              </select>
              <span className="text-gray-300">|</span>
              <select
                value={formData.tax_period_month}
                onChange={(e) => setFormData(prev => ({ ...prev, tax_period_month: parseInt(e.target.value) }))}
                className="border-none focus:ring-0 text-sm bg-transparent"
              >
                {[1,2,3,4,5,6,7,8,9,10,11,12].map(month => (
                  <option key={month} value={month}>{month} сар</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Багш сонгох хэсэг */}
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
                          {selectedTeacher.first_name?.charAt(0) || selectedTeacher.email?.charAt(0).toUpperCase() || 'Б'}
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
                    <FiArrowLeft />
                    Буцах
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
                          setFormData(prev => ({ ...prev, teacher_id: teacher.id }));
                          setShowTeacherList(false);
                        }}
                        className={`
                          p-4 rounded-xl border-2 cursor-pointer transition-all
                          ${selectedTeacher?.id === teacher.id 
                            ? 'border-blue-500 bg-blue-50 shadow-md' 
                            : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
                          }
                        `}
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center font-bold text-lg flex-shrink-0">
                            {teacher.first_name?.charAt(0) || teacher.email?.charAt(0).toUpperCase() || 'Б'}
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

        {/* Success/Error Messages */}
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

        {/* Summary Cards */}
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
                {item.value.toFixed(2).toLocaleString()} ₮
              </div>
              <div className="text-xs text-gray-400 mt-1">{item.label}</div>
            </motion.div>
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
            onClick={() => saveReport(true)}
            disabled={isSavingDraft || !formData.report_id}
            className="px-5 py-2 bg-white border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
            onClick={() => saveReport(false)}
            disabled={isSubmitting || !formData.report_id || !selectedTeacher}
            className="px-6 py-2 bg-gradient-to-r from-[#0f172a] to-[#1e3a8a] text-white rounded-xl font-medium shadow-lg hover:opacity-90 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ml-auto"
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
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-4 px-3 py-2 bg-gray-100 rounded-t-lg font-medium text-sm text-gray-700">
                  <div className="col-span-1">Мөр</div>
                  <div className="col-span-8">Үзүүлэлтүүд</div>
                  <div className="col-span-3">Дүн (₮)</div>
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
          <p>Тооцоолол автоматаар шинэчлэгдэнэ. Цэнхэр мөрүүд нь томьёотой мөрүүд.</p>
          <p className="mt-1">Бүх дүнг MNT (төгрөг)-өөр бөглөнө үү.</p>
          {formData.report_id && (
            <p className="mt-2 text-blue-500">
              Тайлан ID: {formData.report_id}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}