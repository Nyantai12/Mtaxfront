"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  FiUsers,
  FiFileText,
  FiCheckCircle,
  FiClock,
  FiBarChart2,
  FiSettings,
  FiUserPlus,
  FiBookOpen,
  FiAward,
  FiAlertCircle,
  FiTrendingUp,
  FiCalendar,
  FiDownload,
  FiMoreVertical,
} from "react-icons/fi";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import Link from "next/link";

export default function AdminDashboard() {
  const [dateRange, setDateRange] = useState("week");

  // Mock data
  const stats = [
    {
      title: "Нийт оюутан",
      value: 548,
      change: "+12",
      icon: FiUsers,
      color: "bg-blue-500",
    },
    {
      title: "Нийт багш",
      value: 48,
      change: "+3",
      icon: FiAward,
      color: "bg-green-500",
    },
    {
      title: "Нийт тайлан",
      value: 1247,
      change: "+156",
      icon: FiFileText,
      color: "bg-purple-500",
    },
    {
      title: "Хүлээгдэж буй",
      value: 23,
      change: "-5",
      icon: FiClock,
      color: "bg-yellow-500",
    },
  ];

  const weeklyReports = [
    { name: "Даваа", count: 45 },
    { name: "Мягмар", count: 52 },
    { name: "Лхагва", count: 48 },
    { name: "Пүрэв", count: 61 },
    { name: "Баасан", count: 55 },
    { name: "Бямба", count: 23 },
    { name: "Ням", count: 12 },
  ];

  const reportStatus = [
    { name: "Баталгаажсан", value: 856, color: "#10b981" },
    { name: "Хүлээгдэж буй", value: 123, color: "#f59e0b" },
    { name: "Хянаж буй", value: 234, color: "#3b82f6" },
    { name: "Татгалзсан", value: 34, color: "#ef4444" },
  ];

  const topStudents = [
    { name: "Б. Мөнхжин", reports: 24, avgGrade: 4.8 },
    { name: "С. Номин", reports: 22, avgGrade: 4.9 },
    { name: "Д. Тэмүүлэн", reports: 21, avgGrade: 4.7 },
    { name: "Э. Маралмаа", reports: 20, avgGrade: 4.6 },
    { name: "Г. Ангирмаа", reports: 19, avgGrade: 4.8 },
  ];

  const recentActivities = [
    {
      user: "Б. Мөнхжин",
      action: "тайлан илгээсэн",
      time: "5 минутын өмнө",
      type: "submit",
    },
    {
      user: "Г. Батбаяр багш",
      action: "тайлан баталгаажуулсан",
      time: "10 минутын өмнө",
      type: "approve",
    },
    {
      user: "С. Номин",
      action: "тайлан илгээсэн",
      time: "15 минутын өмнө",
      type: "submit",
    },
    {
      user: "Д. Энхтуяа багш",
      action: "тайланд татгалзсан",
      time: "25 минутын өмнө",
      type: "reject",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-gradient-to-b from-[#0f172a] to-[#1e3a8a] text-white">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <img src="images/logomandah.png" alt="Logo" className="w-10 h-10" />
            <div>
              <h2 className="font-bold">Админ самбар</h2>
              <p className="text-xs text-blue-200">Мандах ИС</p>
            </div>
          </div>

          <nav className="space-y-2">
            <Link href="/admin" className="flex items-center gap-3 px-4 py-3 bg-white/10 rounded-xl">
              <FiBarChart2 /> Хянах самбар
            </Link>
            <Link href="/admin/users" className="flex items-center gap-3 px-4 py-3 hover:bg-white/10 rounded-xl transition">
              <FiUsers /> Хэрэглэгчид
            </Link>
            <Link href="/admin/reports" className="flex items-center gap-3 px-4 py-3 hover:bg-white/10 rounded-xl transition">
              <FiFileText /> Тайлангууд
            </Link>
            <Link href="/admin/courses" className="flex items-center gap-3 px-4 py-3 hover:bg-white/10 rounded-xl transition">
              <FiBookOpen /> Хичээлүүд
            </Link>
            <Link href="/admin/settings" className="flex items-center gap-3 px-4 py-3 hover:bg-white/10 rounded-xl transition">
              <FiSettings /> Тохиргоо
            </Link>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Хянах самбар</h1>
            <p className="text-gray-600">Системийн ерөнхий мэдээлэл</p>
          </div>
          
          <div className="flex gap-3">
            <select className="px-4 py-2 border border-gray-200 rounded-xl bg-white">
              <option value="week">7 хоног</option>
              <option value="month">Сар</option>
              <option value="year">Жил</option>
            </select>
            <button className="px-4 py-2 bg-[#0f172a] text-white rounded-xl flex items-center gap-2">
              <FiDownload /> Тайлан татах
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${stat.color} bg-opacity-10 rounded-xl flex items-center justify-center`}>
                  <stat.icon className={`text-2xl ${stat.color.replace('bg-', 'text-')}`} />
                </div>
                <span className="text-green-500 text-sm font-medium">{stat.change}</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
              <p className="text-gray-600 text-sm">{stat.title}</p>
            </motion.div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          {/* Bar Chart */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">7 хоногийн тайлангийн ирц</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyReports}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Тайлангийн төлөв</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={reportStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }: { name?: string; percent?: number }) => `${name ?? ""} ${((percent ?? 0) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {reportStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tables */}
        <div className="grid grid-cols-2 gap-6">
          {/* Top Students */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Оюутнууд</h3>
            <div className="space-y-3">
              {topStudents.map((student, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 bg-[#0f172a] text-white rounded-lg flex items-center justify-center text-sm">
                      {index + 1}
                    </span>
                    <div>
                      <div className="font-medium text-gray-900">{student.name}</div>
                      <div className="text-xs text-gray-500">{student.reports} тайлан</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-500">★</span>
                    <span className="font-medium">{student.avgGrade}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activities */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Сүүлийн үйлдлүүд</h3>
            <div className="space-y-3">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      activity.type === 'submit' ? 'bg-blue-100 text-blue-600' :
                      activity.type === 'approve' ? 'bg-green-100 text-green-600' :
                      'bg-red-100 text-red-600'
                    }`}>
                      {activity.type === 'submit' ? <FiFileText /> :
                       activity.type === 'approve' ? <FiCheckCircle /> :
                       <FiAlertCircle />}
                    </div>
                    <div>
                      <div className="text-sm">
                        <span className="font-medium text-gray-900">{activity.user}</span>
                        <span className="text-gray-600"> {activity.action}</span>
                      </div>
                      <div className="text-xs text-gray-500">{activity.time}</div>
                    </div>
                  </div>
                  <button className="p-2 hover:bg-gray-200 rounded-lg transition">
                    <FiMoreVertical className="text-gray-500" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* System Status
        <div className="mt-8 bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Системийн төлөв</h3>
          <div className="grid grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-gray-500 mb-1">Системийн ачаалал</p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '45%' }}></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">45%</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Серверийн хариу үйлдэл</p>
              <p className="font-medium text-gray-900">120ms</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Өнөөдрийн идэвхтэй хэрэглэгч</p>
              <p className="font-medium text-gray-900">89</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Сануулах тайлан</p>
              <p className="font-medium text-yellow-600">3</p>
            </div>
          </div>
        </div> */}
      </div>
    </div>
  );
}