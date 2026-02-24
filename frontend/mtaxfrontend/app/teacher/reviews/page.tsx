"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  FiFileText,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiDownload,
  FiEye,
  FiSearch,
  FiFilter,
  FiStar,
  FiMessageSquare,
  FiArrowLeft,
  FiUser,
  FiCalendar,
  FiPaperclip,
} from "react-icons/fi";
import { FaChalkboardTeacher } from "react-icons/fa";
import Link from "next/link";
import Header from "@/app/component/Header";

export default function TeacherReviewPage() {
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Mock teacher info
  const teacherInfo = {
    name: "Г. Батбаяр",
    department: "Мэдээллийн технологи",
    reportsToReview: 12,
    reviewedToday: 5
  };

  // Mock reports data
  const reports = [
    {
      id: 1,
      title: "Дадлагын тайлан 1",
      student: "Б. Мөнхжин",
      studentId: "MT2024001",
      type: "Өдрийн тайлан",
      course: "Программ хангамж",
      submittedAt: "2026-02-23 10:30",
      status: "pending",
      content: "Өнөөдрийн дадлагын ажлын тайлан...",
      attachments: ["report1.pdf", "images.zip"]
    },
    {
      id: 2,
      title: "Төслийн тайлан",
      student: "С. Номин",
      studentId: "MT2024002",
      type: "Төслийн тайлан",
      course: "Вэб хөгжүүлэлт",
      submittedAt: "2026-02-23 09:15",
      status: "reviewed",
      content: "Вэб сайтын төслийн явцын тайлан...",
      attachments: ["project.docx"]
    },
    {
      id: 3,
      title: "Долоо хоногийн тайлан",
      student: "Д. Тэмүүлэн",
      studentId: "MT2024003",
      type: "Долоо хоногийн тайлан",
      course: "Мэдээллийн аюулгүй байдал",
      submittedAt: "2026-02-22 16:45",
      status: "approved",
      content: "7-р долоо хоногийн судалгааны ажил...",
      attachments: ["weekly_report.pdf"]
    },
    {
      id: 4,
      title: "Сарын тайлан",
      student: "Э. Маралмаа",
      studentId: "MT2024004",
      type: "Сарын тайлан",
      course: "Өгөгдлийн сан",
      submittedAt: "2026-02-22 14:20",
      status: "rejected",
      content: "2-р сарын гүйцэтгэлийн тайлан...",
      attachments: ["monthly_report.docx"]
    },
    {
      id: 5,
      title: "Дадлагын тайлан 2",
      student: "Б. Мөнхжин",
      studentId: "MT2024001",
      type: "Өдрийн тайлан",
      course: "Программ хангамж",
      submittedAt: "2026-02-21 14:20",
      status: "approved",
      content: "Дадлагын хоёр дахь өдрийн тайлан...",
      attachments: ["report2.pdf"]
    },
  ];

  const filteredReports = reports.filter(report => {
    if (filterStatus !== "all" && report.status !== filterStatus) return false;
    if (searchQuery && !report.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !report.student.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch(status) {
      case "pending":
        return <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium flex items-center gap-1"><FiClock /> Хүлээгдэж буй</span>;
      case "reviewed":
        return <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium flex items-center gap-1"><FiEye /> Хянаж буй</span>;
      case "approved":
        return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center gap-1"><FiCheckCircle /> Баталгаажсан</span>;
      case "rejected":
        return <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium flex items-center gap-1"><FiXCircle /> Татгалзсан</span>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] via-white to-[#eef2ff]">
        <Header />
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Нийт тайлан</p>
                <p className="text-3xl font-bold text-gray-900">24</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <FiFileText className="text-blue-600 text-xl" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Хүлээгдэж буй</p>
                <p className="text-3xl font-bold text-yellow-600">{teacherInfo.reportsToReview}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <FiClock className="text-yellow-600 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Өнөөдөр хянасан</p>
                <p className="text-3xl font-bold text-green-600">{teacherInfo.reviewedToday}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <FiCheckCircle className="text-green-600 text-xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 mb-8">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Тайлан эсвэл оюутны нэрээр хайх..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setFilterStatus("all")}
                className={`px-4 py-2 rounded-xl font-medium transition ${
                  filterStatus === "all" 
                    ? "bg-[#0f172a] text-white" 
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Бүгд
              </button>
              <button
                onClick={() => setFilterStatus("pending")}
                className={`px-4 py-2 rounded-xl font-medium transition ${
                  filterStatus === "pending" 
                    ? "bg-yellow-500 text-white" 
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Хүлээгдэж буй
              </button>
              <button
                onClick={() => setFilterStatus("approved")}
                className={`px-4 py-2 rounded-xl font-medium transition ${
                  filterStatus === "approved" 
                    ? "bg-green-500 text-white" 
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Баталгаажсан
              </button>
            </div>
          </div>

          {/* Filter chips */}
          <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
            <span className="text-sm text-gray-500 flex items-center gap-1">
              <FiFilter className="text-gray-400" />
              Шүүлт:
            </span>
          </div>
        </div>

        {/* Reports List */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Reports List */}
          <div className="lg:col-span-1 space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-900">Тайлангууд ({filteredReports.length})</h3>
              <button className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
                <FiFilter /> Шүүх
              </button>
            </div>
            
            {filteredReports.map((report) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => setSelectedReport(report)}
                className={`bg-white rounded-2xl p-4 shadow-lg border-2 cursor-pointer transition ${
                  selectedReport?.id === report.id 
                    ? "border-blue-500" 
                    : "border-gray-100 hover:border-blue-300"
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{report.title}</h3>
                    <p className="text-sm text-gray-600">{report.student}</p>
                  </div>
                  {getStatusBadge(report.status)}
                </div>
                
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <FiUser /> {report.studentId}
                  </span>
                  <span className="flex items-center gap-1">
                    <FiCalendar /> {report.submittedAt}
                  </span>
                </div>

                <div className="mt-3 flex gap-2">
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs">
                    {report.course}
                  </span>
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs">
                    {report.type}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Right Column - Report Detail */}
          <div className="lg:col-span-2">
            {selectedReport ? (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-2xl p-6 shadow-xl border border-gray-200"
              >
                {/* Report Header */}
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedReport.title}</h2>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <FiUser /> {selectedReport.student} ({selectedReport.studentId})
                      </span>
                      <span className="flex items-center gap-1">
                        <FiCalendar /> Илгээсэн: {selectedReport.submittedAt}
                      </span>
                    </div>
                  </div>
                  {getStatusBadge(selectedReport.status)}
                </div>

                {/* Course Info */}
                <div className="bg-gray-50 rounded-xl p-4 mb-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Хичээл</p>
                      <p className="font-medium text-gray-900">{selectedReport.course}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Тайлангийн төрөл</p>
                      <p className="font-medium text-gray-900">{selectedReport.type}</p>
                    </div>
                  </div>
                </div>

                {/* Report Content */}
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Тайлангийн агуулга</h3>
                  <div className="bg-gray-50 rounded-xl p-4 text-gray-700 whitespace-pre-line min-h-[150px]">
                    {selectedReport.content}
                  </div>
                </div>

                {/* Attachments */}
                {selectedReport.attachments && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-900 mb-3">Хавсралт файлууд</h3>
                    <div className="space-y-2">
                      {selectedReport.attachments.map((file: string, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                          <div className="flex items-center gap-3">
                            <FiPaperclip className="text-blue-600" />
                            <span className="text-sm text-gray-700">{file}</span>
                          </div>
                          <button className="p-2 hover:bg-gray-200 rounded-lg transition">
                            <FiDownload className="text-gray-600" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Review Section UI - Static */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Тайланд хариу өгөх</h3>
                  
                  {/* Feedback */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FiMessageSquare className="inline mr-2" />
                      Санал шүүмж
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Оюутанд хандаж санал шүүмжээ бичнэ үү..."
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                      defaultValue={selectedReport.status === "approved" ? "Тайлан сайн байна. Баталгаажууллаа." : 
                                   selectedReport.status === "rejected" ? "Тайлангийн агуулга хангалтгүй байна. Дахин бичиж илгээнэ үү." : ""}
                      readOnly
                    />
                  </div>

                  

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <button className="flex-1 px-6 py-3 bg-green-600 text-white rounded-xl font-semibold opacity-60 cursor-not-allowed flex items-center justify-center gap-2">
                      <FiCheckCircle />
                      Баталгаажуулах
                    </button>
                    <button className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl font-semibold opacity-60 cursor-not-allowed flex items-center justify-center gap-2">
                      <FiXCircle />
                      Татгалзах
                    </button>
                  </div>
                </div>

                {/* Review Info */}
                {selectedReport.status !== "pending" && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Хянасан багш:</span>
                        <span className="font-medium text-gray-900">Г. Батбаяр</span>
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Хянасан огноо:</span>
                        <span className="font-medium text-gray-900">2026-02-23 14:30</span>
                      </div>
                      
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              <div className="bg-white rounded-2xl p-12 shadow-xl border border-gray-200 text-center">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiFileText className="text-3xl text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Тайлан сонгоогүй байна</h3>
                <p className="text-gray-500 mb-4">Зүүн талаас хянах тайлангаа сонгоно уу</p>
                <div className="flex justify-center gap-2 text-sm text-gray-400">
                  <span className="flex items-center gap-1"><FiClock /> Хүлээгдэж буй: 12</span>
                  <span className="flex items-center gap-1"><FiCheckCircle /> Баталгаажсан: 8</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Pagination */}
        <div className="flex justify-center gap-2 mt-8">
          <button className="w-10 h-10 bg-[#0f172a] text-white rounded-xl">1</button>
          <button className="w-10 h-10 border border-gray-200 rounded-xl hover:bg-gray-50 transition">2</button>
          <button className="w-10 h-10 border border-gray-200 rounded-xl hover:bg-gray-50 transition">3</button>
          <button className="w-10 h-10 border border-gray-200 rounded-xl hover:bg-gray-50 transition">4</button>
          <span className="w-10 h-10 flex items-center justify-center">...</span>
          <button className="w-10 h-10 border border-gray-200 rounded-xl hover:bg-gray-50 transition">10</button>
        </div>
      </div>
    </div>
  );
}