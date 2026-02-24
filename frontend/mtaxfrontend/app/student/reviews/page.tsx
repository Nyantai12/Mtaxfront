"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  FiFileText,
  FiDownload,
  FiEye,
  FiSearch,
  FiFilter,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiXCircle,
  FiArrowLeft,
  FiPrinter,
  FiShare2,
} from "react-icons/fi";
import { FaGraduationCap } from "react-icons/fa";
import Link from "next/link";
import Header from "@/app/component/Header";

export default function MyReportsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const myReports = [
    {
      id: 1,
      title: "Дадлагын тайлан 1",
      type: "daily",
      course: "Программ хангамж",
      teacher: "Г. Батбаяр",
      submittedAt: "2026-02-23",
      status: "approved",
      grade: 5,
      feedback: "Сайн ажилласан. Тайлан тодорхой, ойлгомжтой.",
    },
    {
      id: 2,
      title: "Төслийн тайлан",
      type: "project",
      course: "Вэб хөгжүүлэлт",
      teacher: "С. Одгэрэл",
      submittedAt: "2026-02-22",
      status: "pending",
    },
    {
      id: 3,
      title: "Долоо хоногийн тайлан",
      type: "weekly",
      course: "Мэдээллийн аюулгүй байдал",
      teacher: "Д. Энхтуяа",
      submittedAt: "2026-02-21",
      status: "reviewed",
    },
    {
      id: 4,
      title: "Сарын тайлан",
      type: "monthly",
      course: "Өгөгдлийн сан",
      teacher: "Л. Нарантуяа",
      submittedAt: "2026-02-20",
      status: "rejected",
      feedback: "Тайлангийн агуулга хангалтгүй байна. Дахин бичиж илгээнэ үү.",
    },
  ];

  const getStatusIcon = (status: string) => {
    switch(status) {
      case "approved":
        return <FiCheckCircle className="text-green-500" />;
      case "pending":
        return <FiClock className="text-yellow-500" />;
      case "reviewed":
        return <FiEye className="text-blue-500" />;
      case "rejected":
        return <FiXCircle className="text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    switch(status) {
      case "approved": return "Баталгаажсан";
      case "pending": return "Хүлээгдэж буй";
      case "reviewed": return "Хянаж буй";
      case "rejected": return "Татгалзсан";
      default: return "";
    }
  };

  const getStatusClass = (status: string) => {
    switch(status) {
      case "approved": return "bg-green-100 text-green-700";
      case "pending": return "bg-yellow-100 text-yellow-700";
      case "reviewed": return "bg-blue-100 text-blue-700";
      case "rejected": return "bg-red-100 text-red-700";
      default: return "";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] via-white to-[#eef2ff]">
      <Header />
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header with Stats */}
        <div className="flex flex-wrap justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Тайлангууд</h1>
            <p className="text-gray-600">Нийт 12 тайлан илгээснээс 8 нь баталгаажсан</p>
          </div>
          
          <Link
            href="/report"
            className="px-6 py-3 bg-gradient-to-r from-[#0f172a] to-[#1e3a8a] text-white rounded-xl font-semibold shadow-lg hover:opacity-95 transition"
          >
            + Шинэ тайлан
          </Link>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 mb-8">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Тайлан хайх..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <select className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                <option>Бүх төрөл</option>
                <option>Өдрийн тайлан</option>
                <option>Долоо хоногийн</option>
                <option>Сарын тайлан</option>
                <option>Дадлагын тайлан</option>
              </select>
              
              <button className="px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition">
                <FiFilter />
              </button>
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
            {["all", "approved", "pending", "reviewed", "rejected"].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  filterStatus === status
                    ? status === "all" ? "bg-[#0f172a] text-white"
                    : status === "approved" ? "bg-green-500 text-white"
                    : status === "pending" ? "bg-yellow-500 text-white"
                    : status === "reviewed" ? "bg-blue-500 text-white"
                    : "bg-red-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {status === "all" ? "Бүгд" 
                  : status === "approved" ? "Баталгаажсан"
                  : status === "pending" ? "Хүлээгдэж буй"
                  : status === "reviewed" ? "Хянаж буй"
                  : "Татгалзсан"}
              </button>
            ))}
          </div>
        </div>

        {/* Reports List */}
        <div className="space-y-4">
          {myReports.map((report) => (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                {/* Left side - Report info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <FiFileText className="text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-900">{report.title}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusClass(report.status)}`}>
                      {getStatusIcon(report.status)}
                      {getStatusText(report.status)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Хичээл</p>
                      <p className="font-medium text-gray-900">{report.course}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Багш</p>
                      <p className="font-medium text-gray-900">{report.teacher}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Төрөл</p>
                      <p className="font-medium text-gray-900">{report.type}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Илгээсэн огноо</p>
                      <p className="font-medium text-gray-900 flex items-center gap-1">
                        <FiCalendar className="text-gray-400" />
                        {report.submittedAt}
                      </p>
                    </div>
                  </div>

                  {report.feedback && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-xl text-sm">
                      <p className="text-gray-700">
                        <span className="font-medium text-gray-900">Багшийн сэтгэгдэл:</span> {report.feedback}
                      </p>
                    </div>
                  )}
                </div>

                {/* Right side - Actions */}
                <div className="flex gap-2">
                  <button className="p-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition">
                    <FiEye className="text-gray-700" />
                  </button>
                  <button className="p-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition">
                    <FiDownload className="text-gray-700" />
                  </button>
                  <button className="p-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition">
                    <FiPrinter className="text-gray-700" />
                  </button>
                </div>
              </div>

              {/* Grade if approved */}
              {report.status === "approved" && report.grade && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Үнэлгээ:</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          className={`text-lg ${
                            star <= report.grade ? "text-yellow-400" : "text-gray-300"
                          }`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex justify-center gap-2 mt-8">
          <button className="w-10 h-10 border border-gray-200 rounded-xl hover:bg-gray-50 transition">
            1
          </button>
          <button className="w-10 h-10 bg-[#0f172a] text-white rounded-xl">
            2
          </button>
          <button className="w-10 h-10 border border-gray-200 rounded-xl hover:bg-gray-50 transition">
            3
          </button>
          <button className="w-10 h-10 border border-gray-200 rounded-xl hover:bg-gray-50 transition">
            4
          </button>
        </div>
      </div>
    </div>
  );
}