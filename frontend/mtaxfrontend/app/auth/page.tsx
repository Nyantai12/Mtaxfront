"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  FiMail,
  FiLock,
  FiUser,
  FiBookOpen,
  FiChevronRight,
} from "react-icons/fi";
import { FaUniversity, FaGraduationCap } from "react-icons/fa";
import { useRouter } from "next/navigation";

export default function MandakhAuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const router = useRouter();
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Энд жинхэнэ login API дуудаж болно
    // Одоогоор тестэд шууд redirect хийж байна
    router.push("/home");          // ← "/" гэдэг бол таны home page (app/page.tsx)
    // эсвэл router.replace("/") гэж бас болно (history-д нэмэхгүй)
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f8fafc] via-white to-[#eef2ff] px-6 relative overflow-hidden">

      {/* Background Decorative Blur */}
      <div className="absolute top-[-120px] left-[-120px] w-[350px] h-[350px] bg-blue-500/20 rounded-full blur-3xl" />
      <div className="absolute bottom-[-120px] right-[-120px] w-[350px] h-[350px] bg-yellow-400/20 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-6xl relative z-10"
      >
        <div className="grid lg:grid-cols-5 bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-gray-200">

          {/* LEFT BRAND PANEL */}
          <div className="lg:col-span-2 bg-gradient-to-br from-[#0f172a] to-[#1e3a8a] p-12 text-white relative">

            {/* Logo */}
            <div className="flex items-center gap-3 mb-12">
              <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20">
                <img src="images/logomandah.png" alt="Mandakh University Logo" className="w-15 h-15 object-contain" />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-wide">
                  МАНДАХ ИХ СУРГУУЛЬ
                </h2>
                <p className="text-sm text-blue-200">
                  Тайлангийн цахим систем
                </p>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-4xl font-extrabold leading-tight mb-5">
              Тайлангийн <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-amber-400">
                Цахим Систем
              </span>
            </h1>

            <p className="text-blue-100/90 text-lg mb-10 leading-relaxed">
              Оюутан болон багш нар тайлан илгээх, хянах, баталгаажуулах
              нэгдсэн платформ.
            </p>

            {/* Features */}
            <div className="space-y-4">
              {[
                "✔ Тайлан илгээх хялбар систем",
                "✔ Багшийн хяналт баталгаажуулалт",
                "✔ PDF болон Online маягт",
                "✔ Нэгдсэн мэдээллийн сан",
              ].map((txt, i) => (
                <div
                  key={i}
                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm"
                >
                  {txt}
                </div>
              ))}
            </div>

            {/* Bottom Glow */}
            <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-black/40 to-transparent" />
          </div>

          {/* RIGHT FORM PANEL */}
          <div className="lg:col-span-3 p-12 bg-white">
            <div className="max-w-md mx-auto">

              {/* Toggle */}
              <div className="flex bg-gray-100 rounded-2xl p-1 mb-10">
                <button
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-3 rounded-xl font-semibold transition ${
                  isLogin
                    ? "bg-gradient-to-r from-[#0f172a] to-[#1e3a8a] text-white shadow-lg"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Нэвтрэх
              </button>

              <button
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-3 rounded-xl font-semibold transition ${
                  !isLogin
                    ? "bg-gradient-to-r from-[#0f172a] to-[#1e3a8a] text-white shadow-lg"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Бүртгүүлэх
              </button>

              </div>

              {/* Header */}
              <div className="text-center mb-10">
                <div className="w-20 h-20 mx-auto bg-blue-50 rounded-2xl flex items-center justify-center shadow-sm mb-4">
                  {isLogin ? (
                    <FiBookOpen className="text-blue-700 text-4xl" />
                  ) : (
                    <FaGraduationCap className="text-blue-700 text-4xl" />
                  )}
                </div>

                <h2 className="text-2xl font-bold text-gray-900">
                  {isLogin ? "Системд нэвтрэх" : "Шинэ хэрэглэгч бүртгүүлэх"}
                </h2>

                <p className="text-gray-500 text-sm mt-2">
                  Мандах их сургуулийн оюутнууд болон багш нарын тайлангийн цахим систем
                </p>
              </div>

              {/* Form */}
              <form className="space-y-5" onSubmit={handleSubmit}>

                {/* Name */}
                {!isLogin && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Овог Нэр
                    </label>
                    <div className="relative mt-2"> 
                      <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Нянтай Бумандэмбэрэл"
                        className="w-full pl-12 py-3 rounded-xl text-gray-400 border border-gray-200 focus:ring-2 focus:ring-blue-600 outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* Email */}
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Их сургуулийн имэйл
                  </label>
                  <div className="relative mt-2">
                    <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="email"
                      placeholder="Оюутны-код@mandakh.edu.mn"
                      className="w-full pl-12 py-3 rounded-xl text-gray-400 border border-gray-200 focus:ring-2 focus:ring-blue-600 outline-none"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Нууц үг
                  </label>
                  <div className="relative mt-2">
                    <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="w-full pl-12 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-600 outline-none text-gray-400"
                    />
                  </div>
                </div>

                {/* Submit */}
                <button
                type="submit"
                className="w-full py-3 rounded-xl 
                bg-gradient-to-r from-[#0f172a] to-[#1e3a8a]
                text-white font-semibold shadow-xl 
                hover:opacity-95 transition 
                flex items-center justify-center gap-2"
              >
                {isLogin ? "Нэвтрэх" : "Бүртгүүлэх"}
                <FiChevronRight />
              </button>

              </form>

              {/* Footer Links */}
              <div className="mt-10 text-center text-xs text-gray-400">
                © 2026 Мандах Их Сургууль · Тайлангийн цахим систем
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
