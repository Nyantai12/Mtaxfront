"use client";

import Link from "next/link";
import Image from "next/image";
import { FaGraduationCap } from "react-icons/fa6";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();

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

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/"
              className={`font-medium pb-1 ${
                pathname === "/" 
                  ? "text-gray-900 border-b-2 border-blue-600" 
                  : "text-gray-600 hover:text-gray-900 transition"
              }`}
            >
              Нүүр
            </Link>
            <Link
              href="/teacher/profile"
              className={`transition ${
                pathname === "/teacher/profile" || pathname.startsWith("/teacher/")
                  ? "text-gray-900 font-medium border-b-2 border-blue-600 pb-1"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Мэдээлэл
            </Link>
            <Link
              href="/teacher/reviews"
              className={`transition ${
                pathname === "/teacher/reviews"
                  ? "text-gray-900 font-medium border-b-2 border-blue-600 pb-1"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Холбоо барих
            </Link>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center gap-3">
            <Link
              href="/auth/"
              className="px-5 py-2 text-gray-700 hover:text-gray-900 font-medium transition"
            >
              Нэвтрэх
            </Link>
            <Link
              href="/auth/"
              className="px-5 py-2 bg-gradient-to-r from-[#0f172a] to-[#1e3a8a] text-white rounded-xl font-medium shadow-lg hover:opacity-90 transition"
            >
              Бүртгүүлэх
            </Link>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">Б. Бат</div>
                <div className="text-xs text-gray-500">MT2024001</div>
              </div>
              <div className="w-10 h-10 bg-gradient-to-r from-[#0f172a] to-[#1e3a8a] rounded-xl flex items-center justify-center">
                <FaGraduationCap className="text-white text-lg" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}