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
  FiBriefcase,
  FiStar,
  FiBarChart2,
  FiArrowLeft,
  FiUsers,
} from "react-icons/fi";
import { FaChalkboardTeacher } from "react-icons/fa";
import Link from "next/link";
import Header from "@/app/component/Header";

export default function TeacherProfilePage() {
  const [activeTab, setActiveTab] = useState("profile");

  // Mock teacher data - static for UI
  const teacherData = {
    firstName: "Батбаяр",
    lastName: "Ганбат",
    email: "batbayar.g@mandakh.edu.mn",
    phone: "+976 99112233",
    department: "Нягтлан бодох бүртгэл",
    position: "Доктор",
    employeeId: "T2021001",
    joinDate: "2021",   
    education: "Магистр, Компьютерийн шинжлэх ухаан",
    university: "МУИС",
    specialization: "Нягтлан бодох бүртгэл",
    office: "Б байр, 307 тоот",
    bio: "10+ жилийн туршлагатай програм хангамж хөгжүүлэгч, багш. Веб технологи, програмчлалын хэлний чиглэлээр судалгаа хийж байгаа.",
  };

  const courses = [
    {
      name: "Программ хангамж",
      code: "CS201",
      students: 45,
      semester: "2025-2026",
      schedule: "Даваа, Лхагва 14:00-15:30",
      status: "active",
    },
    {
      name: "Вэб хөгжүүлэлт",
      code: "CS305",
      students: 38,
      semester: "2025-2026",
      schedule: "Мягмар, Баасан 10:00-11:30",
      status: "active",
    },
    {
      name: "Өгөгдлийн сан",
      code: "CS210",
      students: 42,
      semester: "2025-2026",
      schedule: "Лхагва, Баасан 13:00-14:30",
      status: "active",
    },
    {
      name: "Програмчлалын үндэс",
      code: "CS101",
      students: 52,
      semester: "2024-2025",
      schedule: "Даваа, Пүрэв 09:00-10:30",
      status: "completed",
    },
  ];
  const activities = [
    {
      title: "Дадлагын тайлан хянасан",
      student: "Б. Мөнхжин",
      time: "2 цагийн өмнө",
      icon: FiFileText,
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Төслийн тайлан баталгаажуулсан",
      student: "С. Номин",
      time: "5 цагийн өмнө",
      icon: FiCheckCircle,
      color: "bg-green-100 text-green-600",
    },
    {
      title: "Санал шүүмж өгсөн",
      student: "Д. Тэмүүлэн",
      time: "Өчигдөр",
      icon: FiEdit2,
      color: "bg-purple-100 text-purple-600",
    },
    {
      title: "Дадлагын тайлан хянасан",
      student: "Э. Маралмаа",
      time: "Өчигдөр",
      icon: FiFileText,
      color: "bg-blue-100 text-blue-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] via-white to-[#eef2ff]">
      <Header />
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden mb-8">
          <div className="h-32 bg-gradient-to-r from-[#0f172a] to-[#1e3a8a] relative">
            {/* Empty div for background only */}
          </div>
          <div className="px-8 pb-6">
            <div className="flex items-end gap-6 -mt-12">
              <div className="relative">
                <div className="w-28 h-28 bg-white rounded-2xl shadow-lg flex items-center justify-center border-4 border-white">
                  <FaChalkboardTeacher className="text-5xl text-[#1e3a8a]" />
                </div>
                {/* Camera button is just for UI - no functionality */}
                <div className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center opacity-60 cursor-not-allowed">
                  <FiCamera />
                </div>
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900">{teacherData.lastName} {teacherData.firstName}</h1>
                <p className="text-gray-600">{teacherData.position} · {teacherData.department}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {[
            { id: "profile", label: "Үндсэн мэдээлэл", icon: FiUser },
            { id: "courses", label: "Хичээлүүд", icon: FiBookOpen },
            { id: "activities", label: "Үйлдлүүд", icon: FiClock },
            { id: "stats", label: "Статистик", icon: FiBarChart2 },
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
          {/* Left Column - Profile Info */}
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
                      <p className="text-gray-900 p-2 bg-gray-50 rounded-lg">{teacherData.lastName}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Нэр</label>
                      <p className="text-gray-900 p-2 bg-gray-50 rounded-lg">{teacherData.firstName}</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <FiMail className="inline mr-2" /> И-мэйл
                      </label>
                      <p className="text-gray-900 p-2 bg-gray-50 rounded-lg">{teacherData.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <FiPhone className="inline mr-2" /> Утас
                      </label>
                      <p className="text-gray-900 p-2 bg-gray-50 rounded-lg">{teacherData.phone}</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ажил эрхлэлт</label>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Албан тушаал</p>
                        <p className="text-gray-900 p-2 bg-gray-50 rounded-lg">{teacherData.position}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Тэнхим</p>
                        <p className="text-gray-900 p-2 bg-gray-50 rounded-lg">{teacherData.department}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Боловсрол</label>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Зэрэг</p>
                        <p className="text-gray-900 p-2 bg-gray-50 rounded-lg">{teacherData.education}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Төгссөн сургууль</p>
                        <p className="text-gray-900 p-2 bg-gray-50 rounded-lg">{teacherData.university}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <FiMapPin className="inline mr-2" /> Өрөө
                    </label>
                    <p className="text-gray-900 p-2 bg-gray-50 rounded-lg">{teacherData.office}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Товч намтар</label>
                    <p className="text-gray-700 p-4 bg-gray-50 rounded-lg leading-relaxed">{teacherData.bio}</p>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "courses" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white rounded-2xl p-6 shadow-xl border border-gray-200"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Заасан хичээлүүд</h3>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm opacity-60 cursor-not-allowed" disabled>
                    + Шинэ хичээл нэмэх
                  </button>
                </div>

                <div className="space-y-4">
                  {courses.map((course, index) => (
                    <div key={index} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-900">{course.name}</h4>
                          <p className="text-sm text-gray-600">{course.code} · {course.semester}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          course.status === 'active' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {course.status === 'active' ? 'Идэвхтэй' : 'Дууссан'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <FiUsers className="text-gray-400" />
                          <span>{course.students} оюутан</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FiClock className="text-gray-400" />
                          <span>{course.schedule}</span>
                        </div>
                      </div>

                      <div className="mt-3 flex gap-2">
                        <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm opacity-60 cursor-not-allowed" disabled>
                          Оюутнууд
                        </button>
                        <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm opacity-60 cursor-not-allowed" disabled>
                          Тайлангууд
                        </button>
                        <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm opacity-60 cursor-not-allowed" disabled>
                          Үнэлгээ
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === "activities" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white rounded-2xl p-6 shadow-xl border border-gray-200"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Сүүлийн үйлдлүүд</h3>

                <div className="space-y-4">
                  {activities.map((activity, index) => (
                    <div key={index} className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                      <div className={`w-10 h-10 ${activity.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                        <activity.icon />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{activity.title}</p>
                        <p className="text-sm text-gray-600">Оюутан: {activity.student}</p>
                        <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <button className="w-full mt-4 px-4 py-2 border border-gray-200 rounded-xl text-gray-600 bg-white opacity-60 cursor-not-allowed" disabled>
                  Бүх үйлдлүүд харах
                </button>
              </motion.div>
            )}

            {activeTab === "stats" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white rounded-2xl p-6 shadow-xl border border-gray-200"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Статистик мэдээлэл</h3>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-blue-50 rounded-xl">
                      <p className="text-sm text-blue-600">Нийт тайлан</p>
                      <p className="text-3xl font-bold text-blue-700">156</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-xl">
                      <p className="text-sm text-green-600">Баталгаажуулсан</p>
                      <p className="text-3xl font-bold text-green-700">134</p>
                    </div>
                    <div className="p-4 bg-yellow-50 rounded-xl">
                      <p className="text-sm text-yellow-600">Хүлээгдэж буй</p>
                      <p className="text-3xl font-bold text-yellow-700">12</p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-xl">
                      <p className="text-sm text-purple-600">Тайлан илгээсэн оюутнууд</p>
                      <p className="text-3xl font-bold text-purple-700">48</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Right Column - Additional Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Work Info */}
            <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FiBriefcase className="text-blue-600" />
                Ажлын мэдээлэл
              </h3>
              
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500">Ажилтны код</p>
                  <p className="font-medium text-gray-900 p-2 bg-gray-50 rounded-lg">{teacherData.employeeId}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Ажилд орсон огноо</p>
                  <p className="font-medium text-gray-900 p-2 bg-gray-50 rounded-lg">{teacherData.joinDate}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Мэргэжил</p>
                  <p className="font-medium text-gray-900 p-2 bg-gray-50 rounded-lg">{teacherData.specialization}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}