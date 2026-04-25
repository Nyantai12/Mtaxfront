"use client";

import { useState, useEffect } from "react";
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
  FiAlertCircle,
  FiX,
} from "react-icons/fi";
import { FaGraduationCap, FaUniversity } from "react-icons/fa";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/app/component/Header";
import { API_BASE_URL } from "@/api_base_url/page";

interface UserData {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  user_status: string;
  created_at: string;
  last_login: string;
  phone?: string;
  student_id?: string;
  department?: string;
  major?: string;
  enroll_date?: string;
  expected_graduation?: string;
  address?: string;
  birth_date?: string;
  nationality?: string;
  bio?: string;
  gpa?: number;
  total_credits?: number;
  completed_credits?: number;
}

interface Report {
  id: number;
  title: string;
  report_name: string;
  type_name: string;
  submitted_at: string;
  current_status: string;
  teacher_name?: string;
  org_name?: string;
}

export default function StudentProfilePage() {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const [studentData, setStudentData] = useState<UserData>({
    id: 0,
    email: "",
    first_name: "",
    last_name: "",
    role: "",
    user_status: "",
    created_at: "",
    last_login: "",
    phone: "",
    student_id: "",
    department: "",
    major: "",
    enroll_date: "",
    expected_graduation: "",
    address: "",
    birth_date: "",
    nationality: "Монгол",
    bio: "",
    gpa: 0,
    total_credits: 0,
    completed_credits: 0,
  });

  const [recentReports, setRecentReports] = useState<Report[]>([]);
  const [isLoadingReports, setIsLoadingReports] = useState(true);

  useEffect(() => {
    fetchUserProfile();
    fetchRecentReports();
  }, []);

  const fetchUserProfile = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Эхлээд localStorage-аас хэрэглэгчийн ID-г авах
      const localUser = localStorage.getItem("user");
      let userId = null;
      
      if (localUser) {
        const userData = JSON.parse(localUser);
        userId = userData.id;
        setStudentData(prev => ({
          ...prev,
          id: userData.id || 0,
          email: userData.email || "",
          first_name: userData.first_name || "",
          last_name: userData.last_name || "",
          role: userData.role || userData.user_role || "student",
        }));
      }
      
      if (!userId) {
        throw new Error("Хэрэглэгчийн мэдээлэл олдсонгүй");
      }
      
      // Серверээс хэрэглэгчийн дэлгэрэнгүй мэдээлэл авах
      const response = await fetch(`${API_BASE_URL}/api/me/`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: userId }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.resultCode === 6020 && data.data && data.data.length > 0) {
        const profileData = data.data[0];
        setStudentData(prev => ({
          ...prev,
          id: profileData.id || prev.id,
          email: profileData.email || prev.email,
          first_name: profileData.first_name || prev.first_name,
          last_name: profileData.last_name || prev.last_name,
          role: profileData.role || prev.role,
          user_status: profileData.user_status || prev.user_status,
          created_at: profileData.created_at || prev.created_at,
          last_login: profileData.last_login || prev.last_login,
        }));
        
        // localStorage-г шинэчлэх
        if (localUser) {
          const userData = JSON.parse(localUser);
          userData.first_name = profileData.first_name;
          userData.last_name = profileData.last_name;
          userData.email = profileData.email;
          userData.role = profileData.role;
          localStorage.setItem("user", JSON.stringify(userData));
        }
      } else {
        throw new Error(data.resultMessage || "Хэрэглэгчийн мэдээлэл авахад алдаа гарлаа");
      }
    } catch (err: any) {
      console.error("Error fetching user profile:", err);
      setError(err.message || "Хэрэглэгчийн мэдээлэл авахад алдаа гарлаа");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRecentReports = async () => {
    setIsLoadingReports(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/report/submissionlist/`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      
      if (data.resultCode === 6130 && data.data) {
        // Хамгийн сүүлийн 5 тайланг авч, огноогоор буураар эрэмбэлэх
        const sortedReports = [...data.data]
          .sort((a, b) => new Date(b.submission_date).getTime() - new Date(a.submission_date).getTime())
          .slice(0, 5);
        
        setRecentReports(sortedReports);
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setIsLoadingReports(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setStudentData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/user/edituser/`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: studentData.id,
          first_name: studentData.first_name,
          last_name: studentData.last_name,
          phone: studentData.phone,
          address: studentData.address,
          bio: studentData.bio,
          department: studentData.department,
          major: studentData.major,
        }),
      });

      const data = await response.json();
      
      if (data.resultCode === 7420) {
        setSuccessMessage("Мэдээлэл амжилттай хадгалагдлаа");
        setIsEditing(false);
        
        // localStorage-г шинэчлэх
        const localUser = localStorage.getItem("user");
        if (localUser) {
          const userData = JSON.parse(localUser);
          userData.first_name = studentData.first_name;
          userData.last_name = studentData.last_name;
          localStorage.setItem("user", JSON.stringify(userData));
        }
        
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        throw new Error(data.resultMessage || "Мэдээлэл хадгалахад алдаа гарлаа");
      }
    } catch (err: any) {
      console.error("Error saving profile:", err);
      setError(err.message || "Мэдээлэл хадгалахад алдаа гарлаа");
      setTimeout(() => setError(null), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusLower = status?.toLowerCase() || "";
    
    if (statusLower === "approved" || statusLower === "баталгаажсан") {
      return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Баталгаажсан</span>;
    } else if (statusLower === "pending" || statusLower === "хүлээгдэж буй" || statusLower === "илгээсэн") {
      return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">Хүлээгдэж буй</span>;
    } else if (statusLower === "rejected" || statusLower === "буцаасан") {
      return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">Буцаасан</span>;
    } else if (statusLower === "reviewed" || statusLower === "хянаж буй") {
      return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">Хянаж буй</span>;
    }
    return <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">{status || "Тодорхойгүй"}</span>;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  const getRoleName = (role: string) => {
    const roleLower = role?.toLowerCase() || "";
    if (roleLower === "admin") return "Админ";
    if (roleLower === "teacher") return "Багш";
    return "Оюутан";
  };

  if (isLoading && !studentData.first_name) {
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
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Error and Success Messages */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between text-red-700">
            <div className="flex items-center gap-2">
              <FiAlertCircle />
              <span>{error}</span>
            </div>
            <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
              <FiX />
            </button>
          </div>
        )}
        
        {successMessage && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center justify-between text-green-700">
            <div className="flex items-center gap-2">
              <FiCheckCircle />
              <span>{successMessage}</span>
            </div>
            <button onClick={() => setSuccessMessage(null)} className="text-green-500 hover:text-green-700">
              <FiX />
            </button>
          </div>
        )}

        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden mb-8">
          <div className="h-10 bg-gradient-to-r from-[#0f172a] to-[#1e3a8a] relative">
            {/* This empty div is just the background */}
          </div>
          <div className="px-8 pb-6">
            <div className="flex items-end gap-6 mt-3">
              <div className="relative">
                <div className="w-28 h-28 bg-white rounded-2xl shadow-lg flex items-center justify-center border-4 border-white">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                    <span className="text-white text-3xl font-bold">
                      {studentData.first_name?.charAt(0)}{studentData.last_name?.charAt(0)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-3xl font-bold text-gray-900">
                    {studentData.last_name} {studentData.first_name}
                  </h1>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    studentData.user_status === 'verified' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {studentData.user_status === 'verified' ? 'Баталгаажсан' : 'Баталгаажаагүй'}
                  </span>
                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    >
                      <FiEdit2 />
                    </button>
                  )}
                </div>
                <p className="text-gray-600">
                  {getRoleName(studentData.role)} · {studentData.major || "Мэргэжил мэдээлэл байхгүй"} · {studentData.department || "Тэнхим мэдээлэл байхгүй"}
                </p>
                <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                  <FiMail className="text-xs" /> {studentData.email}
                </p>
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
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Хувийн мэдээлэл</h3>
                  {isEditing && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => setIsEditing(false)}
                        className="px-4 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition"
                      >
                        Цуцлах
                      </button>
                      <button
                        onClick={handleSaveProfile}
                        disabled={isLoading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition flex items-center gap-2"
                      >
                        {isLoading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <FiSave />}
                        Хадгалах
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Овог</label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="last_name"
                          value={studentData.last_name}
                          onChange={handleInputChange}
                          className="w-full  text-black px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      ) : (
                        <p className="text-gray-900">{studentData.last_name || "-"}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Нэр</label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="first_name"
                          value={studentData.first_name}
                          onChange={handleInputChange}
                          className="w-full px-4 text-black py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      ) : (
                        <p className="text-gray-900">{studentData.first_name || "-"}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <FiMail className="inline mr-2" /> И-мэйл
                      </label>
                      <p className="text-gray-900">{studentData.email || "-"}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <FiPhone className="inline mr-2" /> Утас
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="phone"
                          value={studentData.phone || ""}
                          onChange={handleInputChange}
                          placeholder="Утасны дугаар"
                          className="w-full text-black px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      ) : (
                        <p className="text-black">{studentData.phone || "-"}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <FaUniversity className="inline mr-2" /> Тэнхим
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="department"
                          value={studentData.department || ""}
                          onChange={handleInputChange}
                          placeholder="Тэнхим"
                          className="w-full text-black px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      ) : (
                        <p className="text-gray-900">{studentData.department || "-"}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <FiBookOpen className="inline mr-2" /> Мэргэжил
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="major"
                          value={studentData.major || ""}
                          onChange={handleInputChange}
                          placeholder="Мэргэжил"
                          className="w-full text-black px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      ) : (
                        <p className="text-gray-900">{studentData.major || "-"}</p>
                      )}
                    </div>
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
                    href="/student/select-organization"
                    className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm hover:bg-blue-700 transition"
                  >
                    + Шинэ тайлан
                  </Link>
                </div>

                {isLoadingReports ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : recentReports.length > 0 ? (
                  <div className="space-y-3">
                    {recentReports.map((report) => (
                      <Link
                        key={report.id}
                        href={`/student/reports/view/${report.id}`}
                        className="block"
                      >
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition cursor-pointer">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              report.current_status === 'Буцаасан' ? 'bg-red-100 text-red-600' :
                              report.current_status === 'Хүлээгдэж буй' ? 'bg-yellow-100 text-yellow-600' :
                              report.current_status === 'Илгээсэн' ? 'bg-yellow-100 text-yellow-600' :
                              report.current_status === 'Баталгаажсан' ? 'bg-green-100 text-green-600' :
                              'bg-blue-100 text-blue-600'
                            }`}>
                              <FiFileText />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{report.type_name || report.report_name}</div>
                              <div className="text-xs text-gray-500">{formatDate(report.submitted_at)}</div>
                              {report.org_name && (
                                <div className="text-xs text-gray-400 mt-1">{report.org_name}</div>
                              )}
                            </div>
                          </div>
                          <div>
                            {getStatusBadge(report.current_status)}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <FiFileText className="text-2xl text-gray-400" />
                    </div>
                    <p className="text-gray-500">Тайлан илгээгээгүй байна</p>
                    <Link
                      href="/student/select-organization"
                      className="mt-3 inline-block text-sm text-blue-600 hover:text-blue-800"
                    >
                      Тайлан илгээх
                    </Link>
                  </div>
                )}

                {recentReports.length > 0 && (
                  <Link
                    href="/student/reports"
                    className="block text-center mt-4 text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Бүх тайлангууд харах →
                  </Link>
                )}
              </motion.div>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Student Info Card */}
            <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FaUniversity className="text-blue-600" />
                Хэрэглэгчийн мэдээлэл
              </h3>
              
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500">Хэрэглэгчийн ID</p>
                  <p className="font-medium text-gray-900">{studentData.id || "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Эрх</p>
                  <p className="text-gray-900">{getRoleName(studentData.role)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Төлөв</p>
                  <p className={`text-gray-900 ${studentData.user_status === 'verified' ? 'text-green-600' : 'text-yellow-600'}`}>
                    {studentData.user_status === 'verified' ? 'Баталгаажсан' : 'Баталгаажаагүй'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Бүртгүүлсэн огноо</p>
                  <p className="text-gray-900">{formatDateTime(studentData.created_at)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Сүүлд нэвтэрсэн</p>
                  <p className="text-gray-900">{formatDateTime(studentData.last_login)}</p>
                </div>
              </div>
            </div>

            
          </div>
        </div>
      </div>
    </div>
  );
}