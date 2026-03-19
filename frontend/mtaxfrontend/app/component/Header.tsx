// components/Header.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
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
} from "react-icons/fi";
import { FaGraduationCap, FaChalkboardTeacher } from "react-icons/fa";

interface UserData {
  id: number;
  email: string;
  user_role: string;
  first_name: string;
  last_name: string;
}

interface Organization {
  org_id: number;
  org_name: string;
  created_at: string;
}

export default function Header() {
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
  const router = useRouter();

  // Check if user is logged in
  useEffect(() => {
    const checkAuth = () => {
      const userData = localStorage.getItem("user");
      if (userData) {
        try {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          
          // Load organizations if user is logged in
          fetchOrganizations();
          
          // Load selected organization from localStorage
          const savedOrg = localStorage.getItem("selectedOrganization");
          if (savedOrg) {
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

    // Initial check
    checkAuth();

    // Listen for auth changes
    const handleAuthChange = () => {
      checkAuth();
    };

    window.addEventListener('auth-change', handleAuthChange);
    
    // Scroll effect
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('auth-change', handleAuthChange);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Fetch organizations list
  const fetchOrganizations = async () => {
    try {
      const response = await fetch("https://bmtax.mandakh.org/api/organization/organizationlist/", {
        method: "GET",
        credentials: "include", // To include cookies
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
        
        // If no organization is selected but there are organizations, select the first one
        if (!selectedOrg && data.data.length > 0) {
          setSelectedOrg(data.data[0]);
          localStorage.setItem("selectedOrganization", JSON.stringify(data.data[0]));
        }
      }
    } catch (error) {
      console.error("Error fetching organizations:", error);
    }
  };

  // Add new organization
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
      const response = await fetch("https://bmtax.mandakh.org/api/organization/addorganization/", {
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
        // Success - refresh organizations list
        await fetchOrganizations();
        
        // Select the new organization
        const newOrg = { 
          org_id: data.data[0].org_id, 
          org_name: newOrgName,
          created_at: new Date().toISOString()
        };
        setSelectedOrg(newOrg);
        localStorage.setItem("selectedOrganization", JSON.stringify(newOrg));
        
        // Close modal and reset form
        setIsAddOrgModalOpen(false);
        setNewOrgName("");
        
        // Dispatch event for other components
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

  // Handle organization selection
  const handleSelectOrganization = (org: Organization) => {
    setSelectedOrg(org);
    localStorage.setItem("selectedOrganization", JSON.stringify(org));
    setIsOrgMenuOpen(false);
    
    // Dispatch event for other components
    window.dispatchEvent(new CustomEvent('organization-change', { detail: org }));
    
    // Refresh the page or update data based on selected organization
    router.refresh();
  };

  const handleLogout = () => {
    // Clear all user data from localStorage
    localStorage.removeItem("user");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userId");
    localStorage.removeItem("token");
    localStorage.removeItem("selectedOrganization");

    // Dispatch auth change event
    window.dispatchEvent(new Event('auth-change'));

    // Close menu
    setIsMenuOpen(false);

    // Redirect to home
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

  const getRoleIcon = () => {
    if (user?.user_role?.toLowerCase() === "teacher" || user?.user_role?.toLowerCase() === "bagsh") {
      return <FaChalkboardTeacher className="text-blue-600" />;
    }
    return <FaGraduationCap className="text-green-600" />;
  };

  const getRoleName = () => {
    if (user?.user_role?.toLowerCase() === "teacher" || user?.user_role?.toLowerCase() === "bagsh") {
      return "Багш";
    }
    return "Оюутан";
  };

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

          {/* Organization Selector - Only for logged in users */}
          {user && organizations.length > 0 && (
            <div className="hidden md:block relative mx-4">
              <button
                onClick={() => setIsOrgMenuOpen(!isOrgMenuOpen)}
                className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-4 py-2 hover:border-blue-300 transition min-w-[200px]"
              >
                <FiBriefcase className="text-gray-400" />
                <span className="flex-1 text-left truncate">
                  {selectedOrg?.org_name || "Байгууллага сонгох"}
                </span>
                <FiChevronDown
                  className={`text-gray-500 transition-transform duration-200 ${
                    isOrgMenuOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              <AnimatePresence>
                {isOrgMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute left-0 mt-2 w-full bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50"
                  >
                    {organizations.map((org) => (
                      <button
                        key={org.org_id}
                        onClick={() => handleSelectOrganization(org)}
                        className="w-full px-4 py-2 text-left hover:bg-blue-50 flex items-center justify-between"
                      >
                        <span className="truncate">{org.org_name}</span>
                        {selectedOrg?.org_id === org.org_id && (
                          <FiCheck className="text-green-500 flex-shrink-0" />
                        )}
                      </button>
                    ))}
                    <hr className="my-2 border-gray-100" />
                    <button
                      onClick={() => {
                        setIsOrgMenuOpen(false);
                        setIsAddOrgModalOpen(true);
                      }}
                      className="w-full px-4 py-2 text-left text-blue-600 hover:bg-blue-50 flex items-center gap-2"
                    >
                      <FiPlus />
                      <span>Шинэ байгууллага</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Navigation - Center */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/"
              className="px-4 py-2 text-gray-700 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition font-medium"
            >
              Нүүр
            </Link>
            {user && (
              <>
                <Link
                  href="/teacher/reviews/"
                  className="px-4 py-2 text-gray-700 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition font-medium flex items-center gap-2"
                >
                  <FiFileText />
                  Тайлангууд
                </Link>
                {user.user_role?.toLowerCase() === "teacher" && (
                  <Link
                    href="/teacher/reviews/"
                    className="px-4 py-2 text-gray-700 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition font-medium flex items-center gap-2"
                  >
                    <FiUser />
                    Оюутнууд
                  </Link>
                )}
              </>
            )}
            <Link
              href="/student/select-organization/"
              className="px-4 py-2 text-gray-700 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition font-medium"
            >
              Бидний тухай
            </Link>
          </nav>

          {/* Right Section - User Info or Auth Buttons */}
          <div className="flex items-center gap-4">
            {user ? (
              <>
                {/* Notification Bell (Optional) */}
                <button className="relative p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition">
                  <FiBell className="text-xl" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>

                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="flex items-center gap-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-full pl-2 pr-4 py-1 hover:shadow-md transition group"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0f172a] to-[#1e3a8a] text-white flex items-center justify-center font-semibold text-sm">
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
                        {organizations.length > 0 && (
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
                {/* Auth Buttons for Non-logged in Users */}
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