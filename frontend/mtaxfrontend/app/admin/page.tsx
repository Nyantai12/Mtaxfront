"use client";

import { useState, useEffect } from "react";
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
  FiHome,
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
import Header from "../component/Header";
import { API_BASE_URL } from "@/api_base_url/page";

interface WeeklyReport {
  day: string;
  total: number;
  name?: string;
  count?: number;
}

interface ReportStatus {
  name: string;
  value: number;
  color: string;
}

interface Student {
  name: string;
  reports: number;
  avgGrade: number;
}

interface Activity {
  user: string;
  action: string;
  time: string;
  type: string;
}

interface Stat {
  title: string;
  value: number;
  change: string;
  icon: any;
  color: string;
}

export default function AdminDashboard() {
  const [dateRange, setDateRange] = useState("week");
  const [weeklyReports, setWeeklyReports] = useState<WeeklyReport[]>([]);
  const [stats, setStats] = useState<Stat[]>([
    {
      title: "Нийт оюутан",
      value: 0,
      change: "",
      icon: FiUsers,
      color: "bg-blue-500",
    },
    {
      title: "Нийт багш",
      value: 0,
      change: "",
      icon: FiAward,
      color: "bg-green-500",
    },
    
  ]);
  
  const [reportStatus, setReportStatus] = useState<ReportStatus[]>([
    { name: "Баталгаажсан", value: 0, color: "#10b981" },
    { name: "Хүлээгдэж буй", value: 0, color: "#f59e0b" },
    { name: "Хянаж буй", value: 0, color: "#3b82f6" },
    { name: "Татгалзсан", value: 0, color: "#ef4444" },
  ]);
  
  const [topStudents, setTopStudents] = useState<Student[]>([
    { name: "Б. Мөнхжин", reports: 0, avgGrade: 0 },
    { name: "С. Номин", reports: 0, avgGrade: 0 },
    { name: "Д. Тэмүүлэн", reports: 0, avgGrade: 0 },
    { name: "Э. Маралмаа", reports: 0, avgGrade: 0 },
    { name: "Г. Ангирмаа", reports: 0, avgGrade: 0 },
  ]);
  
  const [recentActivities, setRecentActivities] = useState<Activity[]>([
    { user: "Б. Мөнхжин", action: "тайлан илгээсэн", time: "5 минутын өмнө", type: "submit" },
    { user: "Г. Батбаяр багш", action: "тайлан баталгаажуулсан", time: "10 минутын өмнө", type: "approve" },
    { user: "С. Номин", action: "тайлан илгээсэн", time: "15 минутын өмнө", type: "submit" },
    { user: "Д. Энхтуяа багш", action: "тайланд татгалзсан", time: "25 минутын өмнө", type: "reject" },
  ]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Өдрийн нэрийг монгол хэлээр авах функц
  const getDayName = (dateStr: string): string => {
    const days = ["Ням", "Даваа", "Мягмар", "Лхагва", "Пүрэв", "Баасан", "Бямба"];
    const date = new Date(dateStr);
    return days[date.getDay()];
  };

  // Долоо хоногийн тайлангийн мэдээлэл татах
  const fetchWeeklyReports = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/report/submittedreportscountlastweek/`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      console.log("Долоо хоногийн тайлангийн мэдээлэл:", data);

      if (data.resultCode === 9010 && data.data) {
        const formattedData = data.data.map((item: any) => ({
          ...item,
          name: getDayName(item.day),
          count: item.total
        }));
        setWeeklyReports(formattedData);
      } else {
        setError(data.resultMessage || "Мэдээлэл ачаалахад алдаа гарлаа");
      }
    } catch (error) {
      console.error("Мэдээлэл ачаалахад алдаа:", error);
      setError("Сервертэй холбогдоход алдаа гарлаа");
    }
  };

  // ★ Хэрэглэгчийн жагсаалтаас оюутан, багш нарын тоог тоолох
  const fetchUsersStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/user/userlist/`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      console.log("Хэрэглэгчийн жагсаалт:", data);

      let usersList: any[] = [];
      if (data.resultCode === 7620 && data.data) {
        usersList = data.data;
      } else if (Array.isArray(data)) {
        usersList = data;
      } else if (data.data && Array.isArray(data.data)) {
        usersList = data.data;
      }

      // Рольоор ялгаж тоолох
      const studentCount = usersList.filter((user: any) => {
        const role = user.role?.toLowerCase();
        return role === "student" || role === "oyutan" || role === "user";
      }).length;

      const teacherCount = usersList.filter((user: any) => {
        const role = user.role?.toLowerCase();
        return role === "teacher" || role === "bagsh";
      }).length;

      const adminCount = usersList.filter((user: any) => {
        const role = user.role?.toLowerCase();
        return role === "admin" || role === "administrator";
      }).length;

      console.log(`Тооллого: Оюутан=${studentCount}, Багш=${teacherCount}, Админ=${adminCount}`);

      // Stats-ийг шинэчлэх
      setStats(prev => prev.map(stat => {
        if (stat.title === "Нийт оюутан") {
          return { ...stat, value: studentCount };
        }
        if (stat.title === "Нийт багш") {
          return { ...stat, value: teacherCount };
        }
        return stat;
      }));

      return { studentCount, teacherCount, adminCount };
    } catch (error) {
      console.error("Хэрэглэгчийн мэдээлэл татахад алдаа:", error);
      return { studentCount: 0, teacherCount: 0, adminCount: 0 };
    }
  };

  // Нийт тайлангийн статистик мэдээлэл татах
  const fetchReportStats = async () => {
    try {
      // Нийт тайлан
      const reportsRes = await fetch(`${API_BASE_URL}/api/report/totalreports/`, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      const reportsData = await reportsRes.json();
      
      // Хүлээгдэж буй тайлан
      const pendingRes = await fetch(`${API_BASE_URL}/api/report/pendingreports/`, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      const pendingData = await pendingRes.json();

      setStats(prev => prev.map(stat => {
        if (stat.title === "Нийт тайлан") {
          return { ...stat, value: reportsData.resultCode === 9010 ? reportsData.data?.total || 0 : 0 };
        }
        if (stat.title === "Хүлээгдэж буй") {
          return { ...stat, value: pendingData.resultCode === 9010 ? pendingData.data?.total || 0 : 0 };
        }
        return stat;
      }));
    } catch (error) {
      console.error("Тайлангийн статистик татахад алдаа:", error);
    }
  };

  // Тайлангийн төлөв байдлын мэдээлэл татах
  const fetchReportStatus = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/report/reportstatuscount/`, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      
      if (data.resultCode === 9010 && data.data) {
        setReportStatus([
          { name: "Баталгаажсан", value: data.data.approved || 0, color: "#10b981" },
          { name: "Хүлээгдэж буй", value: data.data.pending || 0, color: "#f59e0b" },
          { name: "Хянаж буй", value: data.data.reviewed || 0, color: "#3b82f6" },
          { name: "Татгалзсан", value: data.data.rejected || 0, color: "#ef4444" },
        ]);
      }
    } catch (error) {
      console.error("Тайлангийн төлөв татахад алдаа:", error);
    }
  };

  // Шилдэг оюутнуудын мэдээлэл татах
  const fetchTopStudents = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/report/topstudents/`, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      
      if (data.resultCode === 9010 && data.data) {
        setTopStudents(data.data);
      }
    } catch (error) {
      console.error("Шилдэг оюутнууд татахад алдаа:", error);
    }
  };

  // Сүүлийн үйлдлүүдийн мэдээлэл татах
  const fetchRecentActivities = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/report/recentactivities/`, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      
      if (data.resultCode === 9010 && data.data) {
        setRecentActivities(data.data);
      }
    } catch (error) {
      console.error("Сүүлийн үйлдлүүд татахад алдаа:", error);
    }
  };

  // Бүх мэдээллийг татах
  const fetchAllData = async () => {
    setLoading(true);
    await Promise.all([
      fetchWeeklyReports(),
      fetchUsersStats(),
      fetchReportStats(),
      fetchReportStatus(),
      fetchTopStudents(),
      fetchRecentActivities(),
    ]);
    setLoading(false);
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  if (loading) {
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
    <div className="min-h-screen bg-gray-50">
      <Header />
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-56 bg-gradient-to-b from-[#0f172a] to-[#1e3a8a] text-white">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8 mt-15">
            <div>
              <h2 className="font-bold text-xl">Админ самбар</h2>
              <p className="text-xs text-blue-200">Мандах ИС</p>
            </div>
          </div>

          <nav className="space-y-2">
            <Link href="/admin" className="flex items-center gap-3 px-4 py-3 bg-white/10 rounded-xl ">
              <FiBarChart2 /> Хянах самбар
            </Link>
            
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700">
            <FiAlertCircle className="text-xl flex-shrink-0" />
            <span>{error}</span>
            <button onClick={() => setError("")} className="ml-auto text-red-500 hover:text-red-700">×</button>
          </div>
        )}

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Хянах самбар</h1>
            <p className="text-gray-600">Системийн ерөнхий мэдээлэл</p>
          </div>
          
          
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-8">
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
              <h3 className="text-2xl font-bold text-gray-900">{stat.value.toLocaleString()}</h3>
              <p className="text-gray-600 text-sm">{stat.title}</p>
            </motion.div>
          ))}
        </div>

        {/* Charts */}
        {/* Bar Chart - Голлуулсан */}
<div className="flex justify-center items-center min-h-[400px] mb-8">
  <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100 w-full max-w-4xl">
    <div className="text-center mb-6">
      <h3 className="text-2xl font-bold text-gray-900">7 хоногийн тайлангийн ирц</h3>
      <p className="text-gray-600 mt-2">Сүүлийн 7 хоногт ирсэн тайлангуудын тойм</p>
    </div>
    
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={weeklyReports}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" fontSize={14} />
        <YAxis fontSize={14} />
        <Tooltip 
          formatter={(value: any) => [`${value} тайлан`, 'Илгээсэн']}
          labelFormatter={(label) => `${label} гараг`}
          contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb', padding: '10px' }}
        />
        <Legend wrapperStyle={{ paddingTop: '20px' }} />
        <Bar 
          dataKey="count" 
          fill="#3b82f6" 
          radius={[8, 8, 0, 0]} 
          name="Илгээсэн тайлан"
          label={{ position: 'top', fill: '#3b82f6', fontSize: 12 }}
        />
      </BarChart>
    </ResponsiveContainer>
    
    {weeklyReports.length > 0 && (
      <div className="mt-6 pt-4 border-t border-gray-100 text-center">
        <p className="text-gray-700">
          <span className="font-bold text-2xl text-blue-600">
            {weeklyReports.reduce((sum, item) => sum + (item.count || 0), 0)}
          </span>
          <span className="text-gray-500 ml-2">нийт тайлан</span>
        </p>
      </div>
    )}
  </div>
</div>

      </div>
    </div>
  );
}