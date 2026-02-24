"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiBookOpen,
  FiClock,
  FiCheckCircle,
  FiFileText,
  FiEdit2,
  FiSave,
  FiCamera,
  FiAward,
  FiCalendar,
  FiMapPin,
  FiStar,
  FiBarChart2,
  FiArrowLeft,
  FiCreditCard,
  FiBookmark,
  FiTrendingUp,
} from "react-icons/fi";
import { FaGraduationCap, FaUniversity } from "react-icons/fa";
import Link from "next/link";
import Header from "@/app/component/Header";

export default function StudentProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  // Mock student data
  const [studentData, setStudentData] = useState({
    firstName: "Мөнхжин",
    lastName: "Баттулга",
    email: "munkhjin.b@student.mandakh.edu.mn",
    phone: "+976 99112233",
    department: "Мэдээллийн технологи",
    major: "Программ хангамж",
    studentId: "MT2024001",
    enrollDate: "2024-09-01",
    expectedGraduation: "2028-06-15",
    status: "active",
    gpa: 3.8,
    totalCredits: 72,
    completedCredits: 24,
    address: "Улаанбаатар, Сүхбаатар дүүрэг, 8-р хороо",
    birthDate: "2004-05-15",
    nationality: "Монгол",
    bio: "Программ хангамжийн ангийн 2-р курсын оюутан. Веб хөгжүүлэлт, хиймэл оюун ухааны чиглэлээр сонирхолтой.",
    skills: ["JavaScript", "React", "Python", "Java", "SQL"],
    interests: ["Веб хөгжүүлэлт", "Хиймэл оюун", "Мобайл апп"],
    socialLinks: {
      github: "https://github.com/munkhjin",
      linkedin: "https://linkedin.com/in/munkhjin",
    },
  });

  // Recent reports
  const recentReports = [
    {
      title: "Дадлагын тайлан 1",
      course: "Программ хангамж",
      submittedAt: "2026-02-23",
      status: "approved",
      grade: 5,
    },
    {
      title: "Төслийн тайлан",
      course: "Вэб хөгжүүлэлт",
      submittedAt: "2026-02-22",
      status: "pending",
    },
    {
      title: "Долоо хоногийн тайлан",
      course: "Өгөгдлийн сан",
      submittedAt: "2026-02-21",
      status: "reviewed",
    },
  ];
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setStudentData(prev => ({ ...prev, [name]: value }));
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] via-white to-[#eef2ff]">
      <Header />
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden mb-8">
          <div className="h-32 bg-gradient-to-r from-blue-600 to-blue-800 relative">
            {/* This empty div is just the background */}
          </div>
          <div className="px-8 pb-6">
            <div className="flex items-end gap-6 -mt-12">
              <div className="relative">
                <div className="w-28 h-28 bg-white rounded-2xl shadow-lg flex items-center justify-center border-4 border-white">
                  <FaGraduationCap className="text-5xl text-blue-600" />
                </div>
                <button className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center hover:bg-blue-700 transition">
                  <FiCamera />
                </button>
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900">{studentData.lastName} {studentData.firstName}</h1>
                <p className="text-gray-600">{studentData.major} · {studentData.department}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {[
            { id: "profile", label: "Үндсэн мэдээлэл", icon: FiUser },
            { id: "reports", label: "Тайлангууд", icon: FiFileText },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 rounded-xl font-medium transition flex items-center gap-2 ${
                activeTab === tab.id
                  ? "bg-[#0f172a] text-white"
                  : "bg-white text-gray-600 hover:bg-gray-100"
              }`}
            >
              <tab.icon />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2">
            {activeTab === "profile" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white rounded-2xl p-6 shadow-xl border border-gray-200"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Хувийн мэдээлэл</h3>
                
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Овог</label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="lastName"
                          value={studentData.lastName}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      ) : (
                        <p className="text-gray-900">{studentData.lastName}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Нэр</label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="firstName"
                          value={studentData.firstName}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      ) : (
                        <p className="text-gray-900">{studentData.firstName}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <FiMail className="inline mr-2" /> И-мэйл
                      </label>
                      {isEditing ? (
                        <input
                          type="email"
                          name="email"
                          value={studentData.email}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      ) : (
                        <p className="text-gray-900">{studentData.email}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <FiPhone className="inline mr-2" /> Утас
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="phone"
                          value={studentData.phone}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      ) : (
                        <p className="text-gray-900">{studentData.phone}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Төрсөн огноо</label>
                      <p className="text-gray-900">{studentData.birthDate}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ургийн овог</label>
                      <p className="text-gray-900">Боржигон</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Товч намтар</label>
                    {isEditing ? (
                      <textarea
                        name="bio"
                        value={studentData.bio}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                      />
                    ) : (
                      <p className="text-gray-700">{studentData.bio}</p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "reports" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white rounded-2xl p-6 shadow-xl border border-gray-200"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Сүүлийн тайлангууд</h3>
                  <Link
                    href="/submit-report"
                    className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm hover:bg-blue-700 transition"
                  >
                    + Шинэ тайлан
                  </Link>
                </div>

                <div className="space-y-3">
                  {recentReports.map((report, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          report.status === 'approved' ? 'bg-green-100 text-green-600' :
                          report.status === 'pending' ? 'bg-yellow-100 text-yellow-600' :
                          'bg-blue-100 text-blue-600'
                        }`}>
                          <FiFileText />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{report.title}</div>
                          <div className="text-sm text-gray-600">{report.course}</div>
                          <div className="text-xs text-gray-500">{report.submittedAt}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          report.status === 'approved' ? 'bg-green-100 text-green-700' :
                          report.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {report.status === 'approved' ? 'Баталгаажсан' :
                           report.status === 'pending' ? 'Хүлээгдэж буй' :
                           'Хянаж буй'}
                        </span>
                        {report.grade && (
                          <p className="text-sm font-medium text-gray-900 mt-1">Үнэлгээ: {report.grade}/5</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <Link
                  href="/my-reports"
                  className="block text-center mt-4 text-blue-600 hover:text-blue-700 font-medium"
                >
                  Бүх тайлангууд харах →
                </Link>
              </motion.div>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Student Info Card */}
            <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FaUniversity className="text-blue-600" />
                Оюутны мэдээлэл
              </h3>
              
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500">Оюутны код</p>
                  <p className="font-medium text-gray-900">{studentData.studentId}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Тэнхим</p>
                  <p className="text-gray-900">{studentData.department}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Мэргэжил</p>
                  <p className="text-gray-900">{studentData.major}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}