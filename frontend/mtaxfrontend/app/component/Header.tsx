// components/Header.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiUser,
  FiLogOut,
  FiSettings,
  FiFileText,
  FiBell,
  FiChevronDown,
  FiPlus,
  FiBriefcase,
  FiCheck,
  FiAlertCircle,
  FiUsers,
  FiBarChart2,
  FiShield,
  FiBookOpen,
} from "react-icons/fi";
import { FaGraduationCap, FaChalkboardTeacher } from "react-icons/fa";
import { API_BASE_URL } from "@/api_base_url/page";
interface UserData {
  id: number;
  email: string;
  user_role: string;
  first_name: string;
  last_name: string;
  is_admin?: boolean;
  role?: string;
}

interface Organization {
  org_id: number;
  org_name: string;
  created_at: string;
}

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<UserData | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isOrgMenuOpen, setIsOrgMenuOpen] = useState(false);
  const [isAddOrgModalOpen, setIsAddOrgModalOpen] = useState(false);
  const [newOrgName, setNewOrgName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);

  // Check if user is logged in
  useEffect(() => {
    const checkAuth = () => {
      const userData = localStorage.getItem("user");
      if (userData) {
        try {
          const parsedUser = JSON.parse(userData);
          console.log("User data from localStorage:", parsedUser);
          
          const isUserAdmin = 
            parsedUser.is_admin === true || 
            parsedUser.user_role?.toLowerCase() === "admin" ||
            parsedUser.role?.toLowerCase() === "admin";
          
          setUser({
            ...parsedUser,
            is_admin: isUserAdmin
          });
          
          if (!isUserAdmin) {
            fetchOrganizations();
          }
          
          const savedOrg = localStorage.getItem("selectedOrganization");
          if (savedOrg && !isUserAdmin) {
            setSelectedOrg(JSON.parse(savedOrg));
          }
        } catch (e) {
          console.error("Error parsing user data:", e);
          setUser(null);
        }
      } else {
        setUser(null);
        setOrganizations([]);
        setSelectedOrg(null);
      }
    };

    checkAuth();

    const handleAuthChange = () => {
      checkAuth();
    };

    window.addEventListener('auth-change', handleAuthChange);
    
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('auth-change', handleAuthChange);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const fetchOrganizations = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/organization/organizationlist/`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const responseText = await response.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error("Failed to parse JSON:", e);
        return;
      }

      if (data.resultCode === 7220 && data.data) {
        setOrganizations(data.data);
        
        if (!selectedOrg && data.data.length > 0) {
          setSelectedOrg(data.data[0]);
          localStorage.setItem("selectedOrganization", JSON.stringify(data.data[0]));
        }
      }
    } catch (error) {
      console.error("Error fetching organizations:", error);
    }
  };

  const handleAddOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!newOrgName.trim()) {
      setError("Байгууллагын нэр оруулна уу");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/organization/addorganization/`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ org_name: newOrgName }),
      });

      const responseText = await response.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error("Failed to parse JSON:", e);
        throw new Error("Серверээс JSON хариу ирсэнгүй");
      }

      if (data.resultCode === 7320 && data.data && data.data.length > 0) {
        await fetchOrganizations();
        
        const newOrg = { 
          org_id: data.data[0].org_id, 
          org_name: newOrgName,
          created_at: new Date().toISOString()
        };
        setSelectedOrg(newOrg);
        localStorage.setItem("selectedOrganization", JSON.stringify(newOrg));
        
        setIsAddOrgModalOpen(false);
        setNewOrgName("");
        
        window.dispatchEvent(new CustomEvent('organization-change', { detail: newOrg }));
      } else {
        throw new Error(data.resultMessage || "Алдаа гарлаа");
      }
    } catch (err: any) {
      console.error("Error adding organization:", err);
      setError(err.message || "Байгууллага нэмэхэд алдаа гарлаа");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectOrganization = (org: Organization) => {
    setSelectedOrg(org);
    localStorage.setItem("selectedOrganization", JSON.stringify(org));
    setIsOrgMenuOpen(false);
    
    window.dispatchEvent(new CustomEvent('organization-change', { detail: org }));
    router.refresh();
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userId");
    localStorage.removeItem("token");
    localStorage.removeItem("selectedOrganization");

    window.dispatchEvent(new Event('auth-change'));
    setIsMenuOpen(false);
    router.push("/");
  };

  const getUserDisplayName = () => {
    if (user?.first_name && user?.last_name) {
      return `${user.last_name} ${user.first_name}`;
    }
    return user?.email || "Хэрэглэгч";
  };

  const getUserInitials = () => {
    if (user?.first_name && user?.last_name) {
      return `${user.last_name.charAt(0)}${user.first_name.charAt(0)}`;
    }
    return user?.email?.charAt(0).toUpperCase() || "Х";
  };

  const isAdmin = () => {
    if (!user) return false;
    return user.is_admin === true || 
           user.user_role?.toLowerCase() === "admin" ||
           user.role?.toLowerCase() === "admin";
  };

  const isStudent = () => {
    if (!user || isAdmin()) return false;
    const role = user.user_role?.toLowerCase();
    return role === "student" || role === "оюутан";
  };

  const isTeacher = () => {
    if (!user || isAdmin()) return false;
    const role = user.user_role?.toLowerCase();
    return role === "teacher" || role === "багш" || role === "professor";
  };

  const getRoleName = () => {
    if (isAdmin()) return "Админ";
    if (isTeacher()) return "Багш";
    return "Оюутан";
  };

  const getRoleIcon = () => {
    if (isAdmin()) return <FiShield className="text-purple-600" />;
    if (isTeacher()) return <FaChalkboardTeacher className="text-blue-600" />;
    return <FaGraduationCap className="text-green-600" />;
  };

  const isActive = (path: string) => {
    return pathname === path;
  };

  const adminStatus = isAdmin();

  return (
    <>
      <header
        className={`sticky top-0 z-50 w-full transition-all duration-300 ${
          isScrolled
            ? "bg-white/95 backdrop-blur-md shadow-lg py-2"
            : "bg-transparent py-4"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          {/* Logo and Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-12 h-12 bg-gradient-to-br from-[#0f172a] to-[#1e3a8a] rounded-xl flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform duration-300">
              <Image
                src="/images/logomandah.png"
                alt="Mandakh University Logo"
                width={32}
                height={32}
                className="object-contain"
              />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-gray-900 leading-tight">
                МАНДАХ ИХ СУРГУУЛЬ
              </h1>
              <p className="text-xs text-gray-500">Тайлангийн цахим систем</p>
            </div>
          </Link>

          

          {/* Navigation - Center */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/"
              className={`px-4 py-2 rounded-lg transition font-medium ${
                isActive("/")
                  ? "text-blue-600 bg-blue-50"
                  : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
              }`}
            >
              Нүүр
            </Link>
            
            {/* Student Navigation */}
            {user && isStudent() && (
              <>
                <Link
                  href="/student/select-organization"
                  className={`px-4 py-2 rounded-lg transition font-medium flex items-center gap-2 ${
                    isActive("/student/select-organization")
                      ? "text-blue-600 bg-blue-50"
                      : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                  }`}
                >
                  <FiFileText />
                  Тайлан илгээх
                </Link>
                <Link
                  href="/student/reports"
                  className={`px-4 py-2 rounded-lg transition font-medium flex items-center gap-2 ${
                    isActive("/student/reports")
                      ? "text-blue-600 bg-blue-50"
                      : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                  }`}
                >
                  <FiBookOpen />
                  Миний тайлангууд
                </Link>
              </>
            )}
            
            {/* Teacher Navigation */}
            {user && isTeacher() && (
              <>
                <Link
                  href="/teacher/reviews"
                  className={`px-4 py-2 rounded-lg transition font-medium flex items-center gap-2 ${
                    isActive("/teacher/reviews")
                      ? "text-blue-600 bg-blue-50"
                      : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                  }`}
                >
                  <FaChalkboardTeacher />
                  Тайлан хянах
                </Link>
                <Link
                  href="/teacher/reviews/"
                  className={`px-4 py-2 rounded-lg transition font-medium flex items-center gap-2 ${
                    isActive("/teacher/reports")
                      ? "text-blue-600 bg-blue-50"
                      : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                  }`}
                >
                  <FiFileText />
                  Бүх тайлангууд
                </Link>
              </>
            )}
            
            {/* Admin Navigation Links */}
            {adminStatus && (
              <>
                <Link
                  href="/admin/"
                  className={`px-4 py-2 rounded-lg transition font-medium flex items-center gap-2 ${
                    isActive("/admin/")
                      ? "text-purple-600 bg-purple-50"
                      : "text-gray-700 hover:text-purple-600 hover:bg-purple-50"
                  }`}
                >
                  <FiBarChart2 />
                  Самбар
                </Link>
                <Link
                  href="/admin/users"
                  className={`px-4 py-2 rounded-lg transition font-medium flex items-center gap-2 ${
                    isActive("/admin/users")
                      ? "text-purple-600 bg-purple-50"
                      : "text-gray-700 hover:text-purple-600 hover:bg-purple-50"
                  }`}
                >
                  <FiUsers />
                  Хэрэглэгчид
                </Link>
                <Link
                  href="/admin/reports"
                  className={`px-4 py-2 rounded-lg transition font-medium flex items-center gap-2 ${
                    isActive("/admin/reports")
                      ? "text-purple-600 bg-purple-50"
                      : "text-gray-700 hover:text-purple-600 hover:bg-purple-50"
                  }`}
                >
                  <FiFileText />
                  Тайлангууд
                </Link>
              </>
            )}
            
            <Link
              href="/about"
              className={`px-4 py-2 rounded-lg transition font-medium ${
                isActive("/about")
                  ? "text-blue-600 bg-blue-50"
                  : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
              }`}
            >
              Бидний тухай
            </Link>
          </nav>

          {/* Right Section - User Info or Auth Buttons */}
          <div className="flex items-center gap-4">
            {user ? (
              <>
                {/* Notification Bell */}
                {!adminStatus && (
                  <button className="relative p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition">
                    <FiBell className="text-xl" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                  </button>
                )}

                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className={`flex items-center gap-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-full pl-2 pr-4 py-1 hover:shadow-md transition group ${
                      adminStatus ? "border-purple-200 hover:border-purple-300" : ""
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${
                      adminStatus 
                        ? "from-purple-600 to-purple-800" 
                        : "from-[#0f172a] to-[#1e3a8a]"
                    } text-white flex items-center justify-center font-semibold text-sm`}>
                      {getUserInitials()}
                    </div>
                    <div className="hidden lg:block text-left">
                      <p className="text-sm font-semibold text-gray-900">
                        {getUserDisplayName()}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        {getRoleIcon()}
                        <span>{getRoleName()}</span>
                      </div>
                    </div>
                    <FiChevronDown
                      className={`text-gray-500 transition-transform duration-200 ${
                        isMenuOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* Dropdown Menu */}
                  <AnimatePresence>
                    {isMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50"
                      >
                        {/* User Info - Mobile */}
                        <div className="lg:hidden px-4 py-3 border-b border-gray-100">
                          <p className="font-semibold text-gray-900">
                            {getUserDisplayName()}
                          </p>
                          <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                            {getRoleIcon()}
                            <span>{getRoleName()}</span>
                          </div>
                          <p className="text-xs text-gray-400 mt-1">{user.email}</p>
                        </div>

                        {/* Organizations - Mobile */}
                        {!adminStatus && organizations.length > 0 && (
                          <div className="lg:hidden px-4 py-3 border-b border-gray-100">
                            <p className="text-xs text-gray-500 mb-2">Байгууллагууд</p>
                            {organizations.map((org) => (
                              <button
                                key={org.org_id}
                                onClick={() => {
                                  handleSelectOrganization(org);
                                  setIsMenuOpen(false);
                                }}
                                className="w-full text-left px-2 py-1 text-sm hover:bg-blue-50 rounded flex items-center justify-between"
                              >
                                <span className="truncate">{org.org_name}</span>
                                {selectedOrg?.org_id === org.org_id && (
                                  <FiCheck className="text-green-500 flex-shrink-0" />
                                )}
                              </button>
                            ))}
                            <button
                              onClick={() => {
                                setIsMenuOpen(false);
                                setIsAddOrgModalOpen(true);
                              }}
                              className="w-full text-left px-2 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded flex items-center gap-2 mt-1"
                            >
                              <FiPlus className="text-xs" />
                              <span>Шинэ байгууллага</span>
                            </button>
                          </div>
                        )}

                        {/* Menu Items */}
                        {adminStatus ? (
                          <>
                            <Link
                              href="/admin/"
                              className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-purple-50 transition"
                              onClick={() => setIsMenuOpen(false)}
                            >
                              <FiBarChart2 className="text-gray-400" />
                              <span>Админ самбар</span>
                            </Link>
                            <Link
                              href="/admin/users"
                              className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-purple-50 transition"
                              onClick={() => setIsMenuOpen(false)}
                            >
                              <FiUsers className="text-gray-400" />
                              <span>Хэрэглэгчид</span>
                            </Link>
                            <Link
                              href="/admin/reports"
                              className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-purple-50 transition"
                              onClick={() => setIsMenuOpen(false)}
                            >
                              <FiFileText className="text-gray-400" />
                              <span>Тайлангууд</span>
                            </Link>
                          </>
                        ) : (
                          <>
                            {isStudent() && (
                              <>
                                <Link
                                  href="/student/select-organization/"
                                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 transition"
                                  onClick={() => setIsMenuOpen(false)}
                                >
                                  <FiFileText className="text-gray-400" />
                                  <span>Тайлан илгээх</span>
                                </Link>
                                <Link
                                  href="/student/reports"
                                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 transition"
                                  onClick={() => setIsMenuOpen(false)}
                                >
                                  <FiBookOpen className="text-gray-400" />
                                  <span>Миний тайлангууд</span>
                                </Link>
                              </>
                            )}
                            {isTeacher() && (
                              <>
                                <Link
                                  href="/teacher/review"
                                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 transition"
                                  onClick={() => setIsMenuOpen(false)}
                                >
                                  <FaChalkboardTeacher className="text-gray-400" />
                                  <span>Тайлан хянах</span>
                                </Link>
                                <Link
                                  href="/teacher/reports"
                                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 transition"
                                  onClick={() => setIsMenuOpen(false)}
                                >
                                  <FiFileText className="text-gray-400" />
                                  <span>Бүх тайлангууд</span>
                                </Link>
                              </>
                            )}
                            <Link
                              href="/student/profile"
                              className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 transition"
                              onClick={() => setIsMenuOpen(false)}
                            >
                              <FiUser className="text-gray-400" />
                              <span>Хувийн мэдээлэл</span>
                            </Link>
                            <Link
                              href="/settings"
                              className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 transition"
                              onClick={() => setIsMenuOpen(false)}
                            >
                              <FiSettings className="text-gray-400" />
                              <span>Тохиргоо</span>
                            </Link>
                          </>
                        )}

                        <hr className="my-2 border-gray-100" />

                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 transition"
                        >
                          <FiLogOut />
                          <span>Гарах</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/auth"
                  className="hidden md:block px-5 py-2 text-gray-700 hover:text-blue-600 font-medium transition"
                >
                  Нэвтрэх
                </Link>
                <Link
                  href="/auth?register=true"
                  className="px-5 py-2 bg-gradient-to-r from-[#0f172a] to-[#1e3a8a] text-white rounded-lg font-medium hover:opacity-90 transition shadow-lg hover:shadow-xl"
                >
                  Бүртгүүлэх
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Add Organization Modal */}
      <AnimatePresence>
        {isAddOrgModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setIsAddOrgModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Шинэ байгууллага нэмэх
              </h3>
              
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700 text-sm">
                  <FiAlertCircle className="flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleAddOrganization}>
                <div className="mb-4">
                  <label className="text-sm font-medium text-gray-700">
                    Байгууллагын нэр
                  </label>
                  <input
                    type="text"
                    value={newOrgName}
                    onChange={(e) => setNewOrgName(e.target.value)}
                    placeholder="Жишээ ХХК"
                    className="w-full mt-2 px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-600 outline-none"
                    disabled={isLoading}
                    autoFocus
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsAddOrgModalOpen(false)}
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition"
                    disabled={isLoading}
                  >
                    Цуцлах
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-[#0f172a] to-[#1e3a8a] text-white rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? "Хадгалж байна..." : "Нэмэх"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}