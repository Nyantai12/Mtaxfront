"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  FiFileText,
  FiUpload,
  FiDownload,
  FiCheckCircle,
  FiAlertCircle,
  FiX,
  FiPaperclip,
  FiSend,
  FiSave,
  FiEye,
  FiTrash2,
  FiArrowLeft,
} from "react-icons/fi";
import { FaGraduationCap } from "react-icons/fa";
import Link from "next/link";
import Header from "../component/Header";

export default function SubmitReportPage() {
  const [formData, setFormData] = useState({
    title: "",
    type: "daily",
    course: "",
    teacher: "",
    content: "",
    attachments: [] as File[],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Mock data - энэ хэсгийг API-аас авах
  const studentInfo = {
    name: "Б. Мандах",
    id: "MT2024001",
    department: "Мэдээллийн технологи",
    year: 3,
    semester: "2025-2026"
  };

  const reportTypes = [
    { value: "daily", label: "Өдрийн тайлан" },
    { value: "weekly", label: "Долоо хоногийн тайлан" },
    { value: "monthly", label: "Сарын тайлан" },
    { value: "internship", label: "Дадлагын тайлан" },
    { value: "project", label: "Төслийн тайлан" },
  ];

  const courses = [
    "Программ хангамж",
    "Вэб хөгжүүлэлт",
    "Мэдээллийн аюулгүй байдал",
    "Өгөгдлийн сан",
    "Компьютерийн сүлжээ",
  ];

  const teachers = [
    "Г. Батбаяр",
    "С. Одгэрэл",
    "Д. Энхтуяа",
    "Л. Нарантуяа",
    "Ч. Мөнх-Оргил",
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setFormData(prev => ({
        ...prev,
        attachments: [...prev.attachments, ...files]
      }));
    }
  };

  const removeFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError("");

    // Validation
    if (!formData.title.trim()) {
      setSubmitError("Тайлангийн гарчиг оруулна уу");
      setIsSubmitting(false);
      return;
    }

    if (!formData.content.trim()) {
      setSubmitError("Тайлангийн агуулга оруулна уу");
      setIsSubmitting(false);
      return;
    }

    try {
      // Энд API руу илгээх
      await new Promise(resolve => setTimeout(resolve, 2000));
      setSubmitSuccess(true);
      
      // Form-оо цэвэрлэх
      setFormData({
        title: "",
        type: "daily",
        course: "",
        teacher: "",
        content: "",
        attachments: [],
      });

      // 3 секундийн дараа success мессежийг арилгах
      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (error) {
      setSubmitError("Тайлан илгээхэд алдаа гарлаа. Дахин оролдоно уу.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] via-white to-[#eef2ff]">
      <Header />
      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Success Message */}
        {submitSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 text-green-700"
          >
            <FiCheckCircle className="text-xl flex-shrink-0" />
            <span>Тайлан амжилттай илгээгдлээ. Багш тань удахгүй хянаж баталгаажуулах болно.</span>
          </motion.div>
        )}

        {/* Error Message */}
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

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Form */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden"
            >
              {/* Form Header */}
              <div className="p-6 border-b border-gray-200 bg-gray-50/50">
                <h2 className="text-xl font-bold text-gray-900">Шинэ тайлан илгээх</h2>
                <p className="text-sm text-gray-600 mt-1">Тайлангийн мэдээллийг бөглөнө үү</p>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Тайлангийн гарчиг <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Тайлангийн гарчиг оруулна уу"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  />
                </div>

                {/* Report Type and Course */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Тайлангийн төрөл
                    </label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-white"
                    >
                      {reportTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Хичээл
                    </label>
                    <select
                      name="course"
                      value={formData.course}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-white"
                    >
                      <option value="">Сонгох</option>
                      {courses.map(course => (
                        <option key={course} value={course}>{course}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Teacher */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Багш
                  </label>
                  <select
                    name="teacher"
                    value={formData.teacher}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-white"
                  >
                    <option value="">Сонгох</option>
                    {teachers.map(teacher => (
                      <option key={teacher} value={teacher}>{teacher}</option>
                    ))}
                  </select>
                </div>

                {/* Content */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Тайлангийн агуулга <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="content"
                    value={formData.content}
                    onChange={handleInputChange}
                    rows={8}
                    placeholder="Тайлангийн агуулгаа бичнэ үү..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none"
                  />
                </div>

                {/* File Attachments */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Хавсралт файлууд
                  </label>
                  
                  {/* File List */}
                  {formData.attachments.length > 0 && (
                    <div className="mb-3 space-y-2">
                      {formData.attachments.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                          <div className="flex items-center gap-3">
                            <FiPaperclip className="text-blue-600" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">{file.name}</div>
                              <div className="text-xs text-gray-500">
                                {(file.size / 1024).toFixed(1)} KB
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="p-1 hover:bg-gray-200 rounded-lg transition"
                          >
                            <FiX className="text-gray-500" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Upload Button */}
                  <div className="relative">
                    <input
                      type="file"
                      id="file-upload"
                      multiple
                      onChange={handleFileChange}
                      className="hidden"
                      accept=".pdf,.doc,.docx,.jpg,.png"
                    />
                    <label
                      htmlFor="file-upload"
                      className="flex items-center justify-center gap-2 w-full p-4 border-2 border-dashed border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50/50 transition cursor-pointer"
                    >
                      <FiUpload className="text-blue-600" />
                      <span className="text-sm text-gray-600">Файл хавсаргах</span>
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Дэмжих формат: PDF, DOC, DOCX, JPG, PNG (Макс: 10MB)
                  </p>
                </div>

                {/* Submit Buttons */}
                <div className="flex items-center gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-[#0f172a] to-[#1e3a8a] text-white rounded-xl font-semibold shadow-lg hover:opacity-95 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Илгээж байна...
                      </>
                    ) : (
                      <>
                        <FiSend />
                        Тайлан илгээх
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    className="px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition flex items-center gap-2"
                  >
                    <FiSave />
                    Ноорог
                  </button>
                </div>
              </form>
            </motion.div>
          </div>

          {/* Right Column - Info & Tips */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-6"
            >
              {/* Recent Reports */}
              <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FiFileText className="text-blue-600" />
                  Сүүлийн илгээсэн тайлангууд
                </h3>
                <div className="space-y-3">
                  {[1, 2, 3].map((item) => (
                    <div key={item} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition cursor-pointer">
                      <div>
                        <div className="text-sm font-medium text-gray-900">Дадлагын тайлан {item}</div>
                        <div className="text-xs text-gray-500">2026.02.{10 + item}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          item === 1 ? 'bg-green-100 text-green-700' : 
                          item === 2 ? 'bg-yellow-100 text-yellow-700' : 
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {item === 1 ? 'Баталгаажсан' : item === 2 ? 'Хянаж байгаа' : 'Илгээсэн'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <Link 
                  href="/student/reviews" 
                  className="mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 justify-center"
                >
                  Бүх тайлангууд
                  <FiFileText className="text-sm" />
                </Link>
              </div>

              {/* Tips */}
              <div className="bg-gradient-to-br from-[#0f172a] to-[#1e3a8a] rounded-2xl p-6 shadow-xl text-white">
                <h3 className="font-semibold mb-4"> Зөвлөмж</h3>
                <ul className="space-y-3 text-sm text-blue-100">
                  <li className="flex items-start gap-2">
                    <FiCheckCircle className="mt-0.5 flex-shrink-0" />
                    <span>Тайлангийн гарчиг тодорхой байх</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FiCheckCircle className="mt-0.5 flex-shrink-0" />
                    <span>Шаардлагатай файлуудаа хавсаргах</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FiCheckCircle className="mt-0.5 flex-shrink-0" />
                    <span>Багшаа зөв сонгосон эсэхээ шалгах</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FiCheckCircle className="mt-0.5 flex-shrink-0" />
                    <span>Тайлангаа илгээхээс өмнө сайн шалгах</span>
                  </li>
                </ul>
              </div>

            
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}