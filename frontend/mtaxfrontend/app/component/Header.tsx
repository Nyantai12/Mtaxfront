"use client";

import Link from "next/link";
import Image from "next/image";
import { FaGraduationCap } from "react-icons/fa6";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";

interface UserData {
  id: number;
  email: string;
  user_role: string;
  first_name: string;
  last_name: string;
}

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const checkAuth = () => {
      try {
        const user = localStorage.getItem("user");
        
        if (user) {
          const parsedUser = JSON.parse(user);
          setIsLoggedIn(true);
          setUserData(parsedUser);
          console.log("User logged in:", parsedUser);
        } else {
          setIsLoggedIn(false);
          setUserData(null);
          console.log("No user found");
        }
      } catch (error) {
        console.error("Auth check error:", error);
        setIsLoggedIn(false);
        setUserData(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user' || e.key === null) {
        checkAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('auth-change', checkAuth);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth-change', checkAuth);
    };
  }, []);

  // Гадна товшход menu хаах
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current && 
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current && 
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Escape товч дархад menu хаах
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, []);

  // Гарах функц
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userId");
    
    setIsLoggedIn(false);
    setUserData(null);
    setIsMenuOpen(false);
    
    window.dispatchEvent(new Event('auth-change'));
    window.location.href = '/';
  };

  // Рольоос хамаарч профайл хуудас руу шилжих
  const handleProfileClick = () => {
    setIsMenuOpen(false);
    
    if (!userData) return;
    
    switch (userData.user_role) {
      case 'student':
        router.push('/student/profile');
        break;
      case 'teacher':
        router.push('/teacher/profile');
        break;
      case 'admin':
        router.push('/admin/profile');
        break;
      default:
        router.push('/');
    }
  };

  // Dashboard руу шилжих (рольоос хамаарч)
  const handleDashboardClick = () => {
    setIsMenuOpen(false);
    
    if (!userData) return;
    
    switch (userData.user_role) {
      case 'student':
        router.push('/student');
        break;
      case 'teacher':
        router.push('/teacher');
        break;
      case 'admin':
        router.push('/admin');
        break;
      default:
        router.push('/dashboard');
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const isAuthPage = pathname?.startsWith('/auth');

  if (isLoading) {
    return (
      <nav className="sticky top-0 z-50 border-b border-gray-200/50 bg-white/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-200 rounded-xl animate-pulse" />
              <div>
                <div className="h-5 w-48 bg-gray-200 rounded animate-pulse mb-1" />
                <div className="h-3 w-32 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200/50 bg-white/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 bg-gradient-to-br from-[#0f172a] to-[#1e3a8a] rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition">
              <Image
                src="/images/logomandah.png"
                alt="Mandakh University Logo"
                width={32}
                height={32}
                className="object-contain"
              />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 leading-tight">
                МАНДАХ ИХ СУРГУУЛЬ
              </h2>
              <p className="text-xs text-blue-600">
                Тайлангийн цахим систем
              </p>
            </div>
          </Link>

          {/* Navigation Links - Рольоос хамаарч өөрчлөгдөх */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/"
              className={`font-medium pb-1 transition ${
                pathname === "/" 
                  ? "text-gray-900 border-b-2 border-blue-600" 
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Нүүр
            </Link>
            
            {isLoggedIn && userData && (
              <>
                {userData.user_role === 'student' && (
                  <Link
                    href="/student/reviews"
                    className={`transition pb-1 ${
                      pathname.startsWith("/student/reviews")
                        ? "text-gray-900 font-medium border-b-2 border-blue-600"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Тайлангууд
                  </Link>
                )}
                
                {userData.user_role === 'teacher' && (
                  <>
                    <Link
                      href="/teacher/reviews"
                      className={`transition pb-1 ${
                        pathname.startsWith("/teacher/reviews")
                          ? "text-gray-900 font-medium border-b-2 border-blue-600"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      Оюутнууд
                    </Link>
                    <Link
                      href="/teacher/reviews"
                      className={`transition pb-1 ${
                        pathname.startsWith("/teacher/reviews")
                          ? "text-gray-900 font-medium border-b-2 border-blue-600"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      Үнэлгээ
                    </Link>
                  </>
                )}
              </>
            )}
            
            <Link
              href="/teacher/reviews"
              className={`transition pb-1 ${
                pathname === "/contact"
                  ? "text-gray-900 font-medium border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Холбоо барих
            </Link>
          </div>

          {/* Auth Buttons / User Info */}
          <div className="flex items-center gap-3">
            {!isLoggedIn ? (
              !isAuthPage && (
                <>
                  <Link
                    href="/auth/"
                    className="px-5 py-2 text-gray-700 hover:text-gray-900 font-medium transition"
                  >
                    Нэвтрэх
                  </Link>
                  <Link
                    href="/auth/?register=true"
                    className="px-5 py-2 bg-gradient-to-r from-[#0f172a] to-[#1e3a8a] text-white rounded-xl font-medium shadow-lg hover:opacity-90 transition"
                  >
                    Бүртгүүлэх
                  </Link>
                </>
              )
            ) : (
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {userData?.first_name} {userData?.last_name?.charAt(0)}.
                  </div>
                  <div className="text-xs text-gray-500">
                    {userData?.user_role === 'student' ? ' Оюутан' : 
                     userData?.user_role === 'teacher' ? ' Багш' : 
                     userData?.user_role === 'admin' ? ' Админ' : 
                     userData?.email || 'Хэрэглэгч'}
                  </div>
                </div>
                
                {/* User Menu */}
                <div className="relative">
                  <button
                    ref={buttonRef}
                    onClick={toggleMenu}
                    className="w-10 h-10 bg-gradient-to-r from-[#0f172a] to-[#1e3a8a] rounded-xl flex items-center justify-center cursor-pointer focus:outline-none hover:opacity-90 transition transform hover:scale-105"
                    aria-label="User menu"
                    aria-expanded={isMenuOpen}
                  >
                    <FaGraduationCap className="text-white text-lg" />
                  </button>
                  
                  {/* Dropdown menu */}
                  {isMenuOpen && (
                    <div
                      ref={menuRef}
                      className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 animate-fadeIn"
                    >
                      {/* Profile - рольоос хамаарч өөр өөр хуудас руу */}
                      <button
                        onClick={handleProfileClick}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-base">👤</span>
                          <div>
                            <div className="font-medium">Профайл</div>
                            <div className="text-xs text-gray-500">
                              {userData?.user_role === 'student' ? 'Оюутны профайл' : 
                               userData?.user_role === 'teacher' ? 'Багшийн профайл' : 
                               'Хэрэглэгчийн профайл'}
                            </div>
                          </div>
                        </div>
                      </button>

                      {/* Dashboard - рольоос хамаарч өөр өөр хуудас руу */}
                      <button
                        onClick={handleDashboardClick}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-base">📊</span>
                          <div>
                            <div className="font-medium">Хянах самбар</div>
                            <div className="text-xs text-gray-500">
                              {userData?.user_role === 'student' ? 'Тайлангийн түүх' : 
                               userData?.user_role === 'teacher' ? 'Оюутнуудын тайлан' : 
                               'Статистик мэдээлэл'}
                            </div>
                          </div>
                        </div>
                      </button>

                      {/* Settings - бүх хэрэглэгчдэд ижил */}
                      <Link
                        href="/settings"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-base">⚙️</span>
                          <div>
                            <div className="font-medium">Тохиргоо</div>
                            <div className="text-xs text-gray-500">Нууц үг солих</div>
                          </div>
                        </div>
                      </Link>

                      <hr className="my-2 border-gray-100" />

                      {/* Role badge */}
                      <div className="px-4 py-2">
                        <div className="bg-blue-50 text-blue-700 text-xs rounded-full px-2 py-1 inline-block">
                          {userData?.user_role === 'student' ? ' Оюутан' : 
                           userData?.user_role === 'teacher' ? ' Багш' : 
                           userData?.user_role === 'admin' ? ' Админ' : 
                           'Хэрэглэгч'}
                        </div>
                      </div>

                      {/* Logout */}
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-base">🚪</span>
                          <div>
                            <div className="font-medium">Гарах</div>
                            <div className="text-xs text-red-400">Системээс гаргах</div>
                          </div>
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Animation styles */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </nav>
  );
}