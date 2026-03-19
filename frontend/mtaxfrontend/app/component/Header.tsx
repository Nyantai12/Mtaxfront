"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiUser,
  FiLogOut,
  FiFileText,
  FiBell,
  FiChevronDown,
  FiBriefcase,
} from "react-icons/fi";
import { FaGraduationCap, FaChalkboardTeacher } from "react-icons/fa";

interface UserData {
  id: number;
  email: string;
  user_role: string;
  first_name: string;
  last_name: string;
}

export default function Header() {
  const [user, setUser] = useState<UserData | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      const userData = localStorage.getItem("user");
      if (userData) {
        try {
          setUser(JSON.parse(userData));
        } catch (e) {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };

    checkAuth();

    const handleAuthChange = () => checkAuth();
    window.addEventListener('auth-change', handleAuthChange);
    
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('auth-change', handleAuthChange);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("https://bmtax.mandakh.org/api/auth/logout/", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.clear();
      document.cookie.split(";").forEach(function(c) {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=; expires=" + new Date().toUTCString() + "; path=/");
      });
      window.dispatchEvent(new Event('auth-change'));
      router.push("/auth");
    }
  };

  const getUserInitials = () => {
    if (user?.first_name && user?.last_name) {
      return `${user.last_name.charAt(0)}${user.first_name.charAt(0)}`;
    }
    return user?.email?.charAt(0).toUpperCase() || "Х";
  };

  const getRoleIcon = () => {
    if (user?.user_role?.toLowerCase() === "teacher") {
      return <FaChalkboardTeacher className="text-blue-600" />;
    }
    return <FaGraduationCap className="text-green-600" />;
  };

  return (
    <header className={`sticky top-0 z-50 w-full transition-all duration-300 ${
      isScrolled ? "bg-white/95 backdrop-blur-md shadow-lg py-2" : "bg-transparent py-4"
    }`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-12 h-12 bg-gradient-to-br from-[#0f172a] to-[#1e3a8a] rounded-xl flex items-center justify-center overflow-hidden">
            <Image
              src="/images/logomandah.png"
              alt="Mandakh University"
              width={40}
              height={40}
              className="object-contain filter brightness-0 invert"
            />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-lg font-bold text-gray-900">МАНДАХ ИХ СУРГУУЛЬ</h1>
            <p className="text-xs text-gray-500">Тайлангийн цахим систем</p>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          <Link href="/" className="px-4 py-2 text-gray-700 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition">
            Нүүр
          </Link>
          {user && (
            <>
              <Link href="/reports" className="px-4 py-2 text-gray-700 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition flex items-center gap-2">
                <FiFileText />
                Тайлангууд
              </Link>
            </>
          )}
          <Link href="/company" className="px-4 py-2 text-gray-700 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition">
            Бидний тухай
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <button className="relative p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition">
                <FiBell className="text-xl" />
              </button>

              <div className="relative">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center gap-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-full pl-2 pr-4 py-1 hover:shadow-md transition"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0f172a] to-[#1e3a8a] text-white flex items-center justify-center font-semibold">
                    {getUserInitials()}
                  </div>
                  <FiChevronDown className={`text-gray-500 transition-transform ${isMenuOpen ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence>
                  {isMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50"
                    >
                      <Link href="/profile" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 transition" onClick={() => setIsMenuOpen(false)}>
                        <FiUser className="text-gray-400" />
                        <span>Хувийн мэдээлэл</span>
                      </Link>
                      <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 transition">
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
              <Link href="/auth" className="hidden md:block px-5 py-2 text-gray-700 hover:text-blue-600 font-medium transition">
                Нэвтрэх
              </Link>
              <Link href="/auth?register=true" className="px-5 py-2 bg-gradient-to-r from-[#0f172a] to-[#1e3a8a] text-white rounded-lg font-medium hover:opacity-90 transition shadow-lg">
                Бүртгүүлэх
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}