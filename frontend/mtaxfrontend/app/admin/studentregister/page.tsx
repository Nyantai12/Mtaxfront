// app/admin/students/import/page.tsx
"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  FiUpload,
  FiDownload,
  FiFileText,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiUsers,
  FiMail,
  FiUserPlus,
  FiTrash2,
  FiRefreshCw,
  FiArrowLeft,
  FiHome,
  FiDatabase,
  FiSave,
} from "react-icons/fi";
import { FaChalkboardTeacher, FaGraduationCap } from "react-icons/fa";
import Link from "next/link";
import Header from "@/app/component/Header";

interface StudentData {
  id?: number;
  last_name: string;
  first_name: string;
  email: string;
  student_code: string;
  department: string;
  phone?: string;
  status: "pending" | "success" | "error";
  error_message?: string;
}

export default function ImportStudentsPage() {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<StudentData[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [importStatus, setImportStatus] = useState<"idle" | "preview" | "importing" | "complete">("idle");
  const [importResults, setImportResults] = useState<{ success: number; failed: number; total: number }>({ success: 0, failed: 0, total: 0 });
  
  // Sample CSV template data
  const csvTemplate = [
    ["Овог", "Нэр", "Имэйл", "Оюутны код", "Тэнхим", "Утас"],
    ["Бат", "Мөнхжин", "munkhjin@mandakh.edu.mn", "MIS2024001", "Мэдээллийн технологи", "99123456"],
    ["Ганбаатар", "Энхбаяр", "enkhbayar@mandakh.edu.mn", "BA2024002", "Бизнесийн удирдлага", "99234567"],
    ["Дорж", "Нэргүй", "nergui@mandakh.edu.mn", "CS2024003", "Компьютер шинжлэх ухаан", "99345678"],
  ];

  const departments = [
    "Мэдээллийн технологи",
    "Бизнесийн удирдлага",
    "Компьютер шинжлэх ухаан",
    "Санхүү, нягтлан бодох бүртгэл",
    "Хууль зүй",
    "Гадаад харилцаа",
  ];

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (file.type === "text/csv" || file.name.endsWith(".csv")) {
      setFile(file);
      parseCSVFile(file);
    } else {
      alert("Зөвхөн CSV файл оруулна уу!");
    }
  };

  const parseCSVFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const rows = text.split("\n").filter(row => row.trim());
      
      if (rows.length < 2) {
        alert("Файлд хангалттай өгөгдөл байхгүй байна!");
        return;
      }
      
      // Хэрэглэгч загварын дагуу parse хийх
      const headers = rows[0].split(",").map(h => h.trim().toLowerCase());
      
      const students: StudentData[] = [];
      for (let i = 1; i < rows.length; i++) {
        const values = rows[i].split(",").map(v => v.trim());
        const student: StudentData = {
          last_name: values[0] || "",
          first_name: values[1] || "",
          email: values[2] || "",
          student_code: values[3] || "",
          department: values[4] || departments[0],
          phone: values[5] || "",
          status: "pending",
        };
        
        // Validation
        if (!student.last_name) student.error_message = "Овог хоосон байна";
        else if (!student.first_name) student.error_message = "Нэр хоосон байна";
        else if (!student.email || !student.email.includes("@")) student.error_message = "Имэйл буруу байна";
        else if (!student.student_code) student.error_message = "Оюутны код хоосон байна";
        else student.status = "success";
        
        students.push(student);
      }
      
      setPreviewData(students);
      setImportStatus("preview");
    };
    reader.readAsText(file);
  };

  const downloadTemplate = () => {
    const csvContent = csvTemplate.map(row => row.join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "student_import_template.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImport = async () => {
    setIsUploading(true);
    setImportStatus("importing");
    
    // Simulate import progress
    for (let i = 0; i <= 100; i += 10) {
      setUploadProgress(i);
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    // Simulate API call
    setTimeout(() => {
      const successCount = previewData.filter(s => s.status === "success").length;
      const failedCount = previewData.filter(s => s.status === "error").length;
      setImportResults({
        success: successCount,
        failed: failedCount,
        total: previewData.length,
      });
      setImportStatus("complete");
      setIsUploading(false);
    }, 2000);
  };

  const resetImport = () => {
    setFile(null);
    setPreviewData([]);
    setImportStatus("idle");
    setUploadProgress(0);
    setImportResults({ success: 0, failed: 0, total: 0 });
  };

  const getStatusIcon = (status: string) => {
    if (status === "success") return <FiCheckCircle className="text-green-500" />;
    if (status === "error") return <FiXCircle className="text-red-500" />;
    return <FiAlertCircle className="text-yellow-500" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] via-white to-[#eef2ff]">
      <Header />
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/admin/dashboard" className="hover:text-blue-600 flex items-center gap-1">
            <FiHome className="text-sm" /> Нүүр
          </Link>
          <span>/</span>
          <Link href="/admin/students" className="hover:text-blue-600 flex items-center gap-1">
            <FiUsers className="text-sm" /> Оюутнууд
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Файлаар бүртгэх</span>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Оюутнуудыг файлаар бүртгэх</h1>
          <p className="text-gray-500 mt-1">
            CSV файл ашиглан оюутнуудыг бөөнөөр нь системд бүртгэх
          </p>
        </div>

        {/* Stats Cards */}
        {importStatus === "complete" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-green-50 rounded-2xl p-6 border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600">Амжилттай бүртгэгдсэн</p>
                  <p className="text-3xl font-bold text-green-700">{importResults.success}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <FiCheckCircle className="text-2xl text-green-600" />
                </div>
              </div>
            </div>
            <div className="bg-red-50 rounded-2xl p-6 border border-red-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-600">Амжилтгүй</p>
                  <p className="text-3xl font-bold text-red-700">{importResults.failed}</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <FiXCircle className="text-2xl text-red-600" />
                </div>
              </div>
            </div>
            <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600">Нийт</p>
                  <p className="text-3xl font-bold text-blue-700">{importResults.total}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <FiUsers className="text-2xl text-blue-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Progress Bar */}
        {importStatus === "importing" && (
          <div className="mb-8 bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-700">Импорт хийж байна...</span>
              <span className="text-sm text-gray-500">{uploadProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Main Content */}
        {importStatus === "idle" && (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Upload Section */}
            <div>
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition ${
                  dragActive 
                    ? "border-blue-500 bg-blue-50" 
                    : "border-gray-300 bg-white hover:border-blue-400"
                }`}
              >
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiUpload className="text-3xl text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  CSV файлаа энд чирж буулгах
                </h3>
                <p className="text-gray-500 text-sm mb-4">
                  эсвэл
                </p>
                <label className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition cursor-pointer">
                  <FiUpload />
                  Файл сонгох
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>
                <p className="text-xs text-gray-400 mt-4">
                  Зөвхөн CSV файл (максимум 10MB)
                </p>
              </div>
            </div>

            {/* Instructions Section */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FiFileText className="text-blue-600" />
                Зааварчилгаа
              </h3>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">1.</span>
                  <span>Доорх "Загвар татах" товчийг дарж CSV загвар файлаа татаж авна уу.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">2.</span>
                  <span>Файлыг Excel эсвэл текст засварлагчаар нээж, оюутнуудын мэдээллийг бөглөнө үү.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">3.</span>
                  <span>Заавал бөглөх баганууд: Овог, Нэр, Имэйл, Оюутны код</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">4.</span>
                  <span>Бөглөсөн файлаа дээрх хэсэгт чирж буулгах эсвэл "Файл сонгох" товчоор оруулна уу.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">5.</span>
                  <span>Өгөгдлийг шалгаад "Импорт хийх" товчийг дарж бүртгэлийг гүйцэтгэнэ.</span>
                </li>
              </ul>
              
              <div className="mt-6 pt-4 border-t border-gray-100">
                <button
                  onClick={downloadTemplate}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm"
                >
                  <FiDownload />
                  Загвар татах (.csv)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Preview Section */}
        {importStatus === "preview" && previewData.length > 0 && (
          <div className="mt-8">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-[#0f172a] to-[#1e3a8a] px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-white">Өгөгдлийн урьдчилсан харах</h2>
                    <p className="text-blue-100 text-sm mt-1">
                      {previewData.length} мөр өгөгдөл олдлоо
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={resetImport}
                      className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition text-sm flex items-center gap-2"
                    >
                      <FiRefreshCw />
                      Буцах
                    </button>
                    <button
                      onClick={handleImport}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm flex items-center gap-2"
                    >
                      <FiSave />
                      Импорт хийх
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="overflow-x-auto max-h-[500px]">
                <table className="w-full">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Төлөв</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Овог</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Нэр</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Имэйл</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Оюутны код</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Тэнхим</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Утас</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {previewData.map((student, index) => (
                      <tr key={index} className={`${student.status === "error" ? "bg-red-50" : "bg-white"} hover:bg-gray-50 transition`}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            {getStatusIcon(student.status)}
                            {student.error_message && (
                              <span className="text-xs text-red-500 ml-1" title={student.error_message}>
                                !
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">{student.last_name}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{student.first_name}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{student.email}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{student.student_code}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{student.department}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{student.phone || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex gap-4 text-sm">
                    <span className="flex items-center gap-1">
                      <FiCheckCircle className="text-green-500" /> 
                      Бүртгэх боломжтой: {previewData.filter(s => s.status === "success").length}
                    </span>
                    <span className="flex items-center gap-1">
                      <FiXCircle className="text-red-500" /> 
                      Алдаатай: {previewData.filter(s => s.status === "error").length}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={resetImport}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition text-sm"
                    >
                      Цуцлах
                    </button>
                    <button
                      onClick={handleImport}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm flex items-center gap-2"
                    >
                      <FiUpload />
                      Импорт хийх ({previewData.filter(s => s.status === "success").length})
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Complete Section */}
        {importStatus === "complete" && (
          <div className="mt-8 bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
              <div className="flex items-center gap-3">
                <FiCheckCircle className="text-white text-xl" />
                <h2 className="text-lg font-bold text-white">Импорт амжилттай дууслаа</h2>
              </div>
            </div>
            <div className="p-6">
              <div className="flex flex-wrap gap-4 justify-between items-center">
                <div>
                  <p className="text-gray-600">
                    Нийт <strong className="text-blue-600">{importResults.total}</strong> оюутны мэдээллээс 
                    <strong className="text-green-600"> {importResults.success}</strong> нь амжилттай,
                    <strong className="text-red-600"> {importResults.failed}</strong> нь амжилтгүй бүртгэгдлээ.
                  </p>
                  {importResults.failed > 0 && (
                    <p className="text-sm text-red-600 mt-2">
                      Алдаатай мөрүүдийг шалгаад дахин оролдоно уу.
                    </p>
                  )}
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={resetImport}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                  >
                    <FiUpload />
                    Шинэ файл оруулах
                  </button>
                  <Link
                    href="/admin/students"
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center gap-2"
                  >
                    <FiUsers />
                    Оюутны жагсаалт
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}