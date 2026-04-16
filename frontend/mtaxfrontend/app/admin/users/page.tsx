// app/admin/users/page.tsx
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FiSearch,
  FiUser,
  FiMail,
  FiCalendar,
  FiShield,
  FiEdit2,
  FiTrash2,
  FiUsers,
  FiFilter,
  FiDownload,
  FiChevronLeft,
  FiChevronRight,
  FiCheckCircle,
  FiXCircle,
} from "react-icons/fi";
import { FaGraduationCap, FaChalkboardTeacher, FaUserShield } from "react-icons/fa";
import Header from "@/app/component/Header";
import { API_BASE_URL } from "@/app/host/page";

interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string;  // 'role' field from backend
  user_status?: string;
  created_at?: string;
  last_login?: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [currentAdminId, setCurrentAdminId] = useState<number | null>(null);

  // Get current admin ID from localStorage
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setCurrentAdminId(user.id);
        console.log("Current admin:", user);
      } catch (e) {
        console.error("Error parsing user data:", e);
      }
    }
  }, []);

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter users based on search term and role
  useEffect(() => {
    let filtered = users;
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filter by role
    if (selectedRole !== "all") {
      filtered = filtered.filter(user => {
        const normalizedRole = normalizeUserRole(user.role);
        return normalizedRole === selectedRole;
      });
    }
    
    setFilteredUsers(filtered);
    setCurrentPage(1);
  }, [searchTerm, selectedRole, users]);

  // Fetch users from API
  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/user/userlist/`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseText = await response.text();
      let data;
      
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error("Failed to parse JSON:", e);
        throw new Error("Серверээс JSON хариу ирсэнгүй");
      }

      console.log("Raw users data from API:", data);

      let usersList: User[] = [];
      if (data.resultCode === 7620 && data.data) {
        usersList = data.data;
      } else if (Array.isArray(data)) {
        usersList = data;
      } else if (data.data && Array.isArray(data.data)) {
        usersList = data.data;
      } else {
        throw new Error(data.resultMessage || "Хэрэглэгчийн мэдээлэл авахад алдаа гарлаа");
      }

      // Log original roles
      console.log("Original user roles:", usersList.map(u => ({ 
        id: u.id, 
        role: u.role, 
        name: `${u.last_name} ${u.first_name}` 
      })));

      setUsers(usersList);
      setFilteredUsers(usersList);
    } catch (err: any) {
      console.error("Error fetching users:", err);
      setError(err.message || "Хэрэглэгчийн мэдээлэл авахад алдаа гарлаа");
    } finally {
      setIsLoading(false);
    }
  };

  // Normalize user role for display
  const normalizeUserRole = (role: string): string => {
    if (!role) return "student";
    
    const roleLower = role?.toLowerCase().trim();
    console.log(`Normalizing role: "${role}" -> "${roleLower}"`);
    
    // Admin шалгалт
    if (roleLower === "admin" || 
        roleLower === "administrator" || 
        roleLower === "superadmin") {
      return "admin";
    }
    
    // Teacher/Bagsh шалгалт
    if (roleLower === "teacher" || 
        roleLower === "bagsh" || 
        roleLower === "professor") {
      return "teacher";
    }
    
    // Student шалгалт
    if (roleLower === "student" || 
        roleLower === "oyutan") {
      return "student";
    }
    
    console.log(`Unknown role: "${role}", defaulting to student`);
    return "student";
  };

  // Get display role name in Mongolian
  const getDisplayRoleName = (role: string) => {
    const normalized = normalizeUserRole(role);
    console.log(`Getting display name for role: "${role}" -> normalized: "${normalized}"`);
    
    switch (normalized) {
      case "admin":
        return "Админ";
      case "teacher":
        return "Багш";
      case "student":
        return "Оюутан";
      default:
        return "Оюутан";
    }
  };

  // Get role icon
  const getRoleIcon = (role: string) => {
    const normalized = normalizeUserRole(role);
    switch (normalized) {
      case "admin":
        return <FaUserShield className="text-purple-600" />;
      case "teacher":
        return <FaChalkboardTeacher className="text-blue-600" />;
      default:
        return <FaGraduationCap className="text-green-600" />;
    }
  };

  // Get role badge color
  const getRoleColor = (role: string) => {
    const normalized = normalizeUserRole(role);
    switch (normalized) {
      case "admin":
        return "bg-purple-100 text-purple-800";
      case "teacher":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-green-100 text-green-800";
    }
  };

  // app/admin/users/page.tsx - handleUpdateRole функцийг шинэчлэх

// Update user role - Зөвхөн багш, оюутан хооронд өөрчлөх
const handleUpdateRole = async (userId: number, newRole: string) => {
  // Админ эрх өгөхөөс сэргийлэх
  if (newRole === "admin") {
    setError("Админ эрх өгөх боломжгүй. Зөвхөн багш эсвэл оюутан эрх өгч болно.");
    setTimeout(() => setError(null), 3000);
    return;
  }

  setIsLoading(true);
  setError(null);

  try {
    let endpoint = "";
    let method = "POST";
    
    // Шинэ эрхээс хамаарч endpoint сонгох
    if (newRole === "teacher") {
      endpoint = `${API_BASE_URL}/api/user/setteacher/`;
      method = "POST";
    } else if (newRole === "student") {
      endpoint = `${API_BASE_URL}/api/user/setstudent/`; // Энэ endpoint байх ёстой
      method = "POST";
    } else {
      throw new Error("Буруу эрх сонголт");
    }

    const response = await fetch(endpoint, {
      method: method,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: userId }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseText = await response.text();
    let data;
    
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error("Failed to parse JSON:", e);
      throw new Error("Серверээс JSON хариу ирсэнгүй");
    }

    // Backend-ээс ирэх resultCode-г шалгах
    // 7720: Амжилттай (teacher), 7820: Амжилттай (student) гэж үзье
    if (data.resultCode === 7720 || data.resultCode === 7820) {
      setSuccessMessage("Хэрэглэгчийн эрх амжилттай шинэчлэгдлээ");
      fetchUsers(); // Refresh the list
      setIsEditModalOpen(false);
      setSelectedUser(null);
      setTimeout(() => setSuccessMessage(null), 3000);
    } else {
      throw new Error(data.resultMessage || "Хэрэглэгчийн эрх шинэчлэхэд алдаа гарлаа");
    }
  } catch (err: any) {
    console.error("Error updating user role:", err);
    setError(err.message || "Хэрэглэгчийн эрх шинэчлэхэд алдаа гарлаа");
    setTimeout(() => setError(null), 3000);
  } finally {
    setIsLoading(false);
  }
};

  // Delete user
  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    // Өөрийгөө устгахаас сэргийлэх
    if (selectedUser.id === currentAdminId) {
      setError("Та өөрийгөө устгах боломжгүй");
      setTimeout(() => setError(null), 3000);
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/user/delete/${selectedUser.id}/`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        setSuccessMessage("Хэрэглэгч амжилттай устгагдлаа");
        fetchUsers();
        setIsDeleteModalOpen(false);
        setSelectedUser(null);
        
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        throw new Error("Хэрэглэгч устгахад алдаа гарлаа");
      }
    } catch (err: any) {
      setError(err.message);
      setTimeout(() => setError(null), 3000);
    }
  };

  // Export users to CSV
  const exportToCSV = () => {
    const headers = ["ID", "Овог", "Нэр", "Имэйл", "Эрх", "Бүртгэгдсэн огноо"];
    const csvData = filteredUsers.map(user => [
      user.id,
      user.last_name || "",
      user.first_name || "",
      user.email,
      getDisplayRoleName(user.role),
      user.created_at ? new Date(user.created_at).toLocaleDateString() : ""
    ]);
    
    const csvContent = [headers, ...csvData].map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `users_${new Date().toISOString()}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Stats
  const totalUsers = users.length;
  const adminCount = users.filter(u => normalizeUserRole(u.role) === "admin").length;
  const teacherCount = users.filter(u => normalizeUserRole(u.role) === "teacher").length;
  const studentCount = users.filter(u => normalizeUserRole(u.role) === "student").length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <FiUsers className="text-purple-600" />
            Хэрэглэгчдийн жагсаалт
          </h1>
          <p className="text-gray-600 mt-2">
            Системд бүртгэлтэй нийт хэрэглэгчдийн мэдээлэл
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Нийт хэрэглэгч</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{totalUsers}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <FiUsers className="text-blue-600 text-xl" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Админууд</p>
                <p className="text-3xl font-bold text-purple-600 mt-2">{adminCount}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <FaUserShield className="text-purple-600 text-xl" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Багш нар</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{teacherCount}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <FaChalkboardTeacher className="text-blue-600 text-xl" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Оюутнууд</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{studentCount}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <FaGraduationCap className="text-green-600 text-xl" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            {/* Search */}
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Нэр, овог, имэйлээр хайх..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-600 outline-none text-black"
              />
            </div>
            
            {/* Role Filter */}
            <div className="flex gap-3">
              <div className="relative text-gray-600">
                <FiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="pl-10 pr-8 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-600 outline-none appearance-none bg-white"
                >
                  <option value="all">Бүх эрх</option>
                  <option value="admin">Админ</option>
                  <option value="teacher">Багш</option>
                  <option value="student">Оюутан</option>
                </select>
              </div>
              
              {/* Export Button */}
              <button
                onClick={exportToCSV}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
              >
                <FiDownload />
                CSV Export
              </button>
            </div>
          </div>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 flex items-center gap-2">
            <FiCheckCircle />
            {successMessage}
          </div>
        )}
        
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center gap-2">
            <FiXCircle />
            {error}
          </div>
        )}

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-20">
              <FiUsers className="text-gray-400 text-5xl mx-auto mb-4" />
              <p className="text-gray-500">Хэрэглэгч олдсонгүй</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Хэрэглэгч
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Имэйл
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Эрх
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Бүртгэгдсэн
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Үйлдэл
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {currentUsers.map((user) => {
                      const displayRole = getDisplayRoleName(user.role);
                      const normalizedRole = normalizeUserRole(user.role);
                      
                      return (
                        <motion.tr
                          key={user.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="hover:bg-gray-50 transition"
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {user.id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                                <FiUser className="text-gray-500" />
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {user.last_name} {user.first_name}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {user.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <FiMail className="text-gray-400" />
                              <span className="text-sm text-gray-600">{user.email}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                              <div className="flex items-center gap-1">
                                {getRoleIcon(user.role)}
                                {displayRole}
                              </div>
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center gap-2">
                              <FiCalendar className="text-gray-400" />
                              {user.created_at ? new Date(user.created_at).toLocaleDateString() : "-"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end gap-2">
                              {/* Зөвхөн админ биш хэрэглэгчдийг засварлах боломжтой */}
                              {normalizedRole !== "admin" && (
                                <button
                                  onClick={() => {
                                    setSelectedUser(user);
                                    setIsEditModalOpen(true);
                                  }}
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                  title="Эрх өөрчлөх"
                                >
                                  <FiEdit2 />
                                </button>
                              )}
                              {/* Өөрийгөө биш, админ биш хэрэглэгчдийг устгах */}
                              {user.id !== currentAdminId && normalizedRole !== "admin" && (
                                <button
                                  onClick={() => {
                                    setSelectedUser(user);
                                    setIsDeleteModalOpen(true);
                                  }}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                  title="Устгах"
                                >
                                  <FiTrash2 />
                                </button>
                              )}
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between text-black">
                  <div className="text-sm text-gray-500">
                    {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredUsers.length)} / {filteredUsers.length}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      <FiChevronLeft />
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                      <button
                        key={number}
                        onClick={() => paginate(number)}
                        className={`px-3 py-1 rounded-lg ${
                          currentPage === number
                            ? "bg-purple-600 text-white"
                            : "border border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {number}
                      </button>
                    ))}
                    <button
                      onClick={() => paginate(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      <FiChevronRight />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Edit Role Modal */}
      {isEditModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
          >
            <h3 className="text-2xl font-bold text-black mb-4">
              Хэрэглэгчийн эрх өөрчлөх
            </h3>
            <p className="text-black mb-4">
              {selectedUser.last_name} {selectedUser.first_name} - {selectedUser.email}
            </p>
            <p className="text-sm text-black mb-4">
              Одоогийн эрх: {getDisplayRoleName(selectedUser.role)}
            </p>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-black mb-2">
                Шинэ эрх
              </label>
              <select
                value={normalizeUserRole(selectedUser.role)}
                onChange={(e) => {
                  const newRole = e.target.value;
                  setSelectedUser({ ...selectedUser, role: newRole });
                }}
                className="text-black w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-600 outline-none"
              >

                <option value="teacher" className="text-black">Багш</option>
              </select>
              <p className="text-xs text-black mt-2">
                *Зөвхөн оюутаны эрх өөрчлөх боломжтой
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setSelectedUser(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              >
                Цуцлах
              </button>
              <button
                onClick={() => handleUpdateRole(selectedUser.id, selectedUser.role)}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
              >
                Хадгалах
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Хэрэглэгч устгах
            </h3>
            <p className="text-gray-600 mb-6">
              Та {selectedUser.last_name} {selectedUser.first_name} ({selectedUser.email}) хэрэглэгчийг устгахдаа итгэлтэй байна уу? Энэ үйлдлийг буцаах боломжгүй.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setSelectedUser(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              >
                Цуцлах
              </button>
              <button
                onClick={handleDeleteUser}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Устгах
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}