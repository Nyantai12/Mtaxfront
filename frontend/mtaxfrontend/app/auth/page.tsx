"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  FiMail,
  FiLock,
  FiUser,
  FiBookOpen,
  FiChevronRight,
  FiAlertCircle,
} from "react-icons/fi";
import { FaGraduationCap } from "react-icons/fa";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

// Session интерфейс
interface UserData {
  id: number;
  email: string;
  user_role: string;
  first_name: string;
  last_name: string;
}

export default function MandakhAuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  // Form state
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    first_name: "",
    last_name: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError("");
  };

  // Session хадгалах функц
  const saveSession = (userData: UserData) => {
    try {
      // Хэрэглэгчийн мэдээллийг хадгалах
      localStorage.setItem("user", JSON.stringify(userData));
      
      // Хэрэглэгчийн роль хадгалах
      if (userData.user_role) {
        localStorage.setItem("userRole", userData.user_role);
      }
      
      // Хэрэглэгчийн ID хадгалах
      if (userData.id) {
        localStorage.setItem("userId", userData.id.toString());
      }
      
      // Session token (хэрэв байгаа бол)
      // localStorage.setItem("token", "dummy-token");
      
      // Session-ийг бусад компонентууд мэдэхийн тулд custom event dispatch
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('auth-change'));
      }
      
      console.log("Session saved successfully:", userData);
      return true;
    } catch (error) {
      console.error("Error saving session:", error);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Validation
    if (!formData.email || !formData.password) {
      setError("Имэйл болон нууц үгээ оруулна уу");
      setIsLoading(false);
      return;
    }

    if (!isLogin && (!formData.first_name || !formData.last_name)) {
      setError("Овог нэрээ оруулна уу");
      setIsLoading(false);
      return;
    }

    // Determine the API endpoint based on action
    const apiUrl = isLogin
      ? "https://bmtax.mandakh.org/api/auth/login/"
      : "https://bmtax.mandakh.org/api/auth/register/";

    // Prepare request body
    const requestBody = isLogin
      ? {
          email: formData.email,
          password: formData.password,
        }
      : {
          email: formData.email,
          password: formData.password,
          first_name: formData.first_name,
          last_name: formData.last_name,
        };

    try {
      console.log(`Sending request to: ${apiUrl}`);
      console.log("Request body:", requestBody);

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      // Log response status
      console.log("Response status:", response.status);

      // Get response text
      const responseText = await response.text();
      console.log("Raw response:", responseText);

      // Parse as JSON
      let data;
      try {
        data = JSON.parse(responseText);
        console.log("Parsed data:", data);
      } catch (e) {
        console.error("Failed to parse JSON:", e);
        throw new Error(`Серверээс JSON хариу ирсэнгүй: ${responseText.substring(0, 100)}`);
      }

      // Check if response was successful
      if (!response.ok) {
        const errorMessage = 
          data.resultMessage || 
          data.message || 
          data.error || 
          data.detail ||
          `Алдаа (${response.status})`;
        throw new Error(errorMessage);
      }

      // Check resultCode for success (8110 амжилттай гэсэн үг)
      if (data.resultCode === 8110 || data.resultCode === 0 || data.resultCode === 200) {
        
        // Хэрэглэгчийн мэдээллийг хадгалах
        if (data.data && data.data.length > 0) {
          const userData = data.data[0]; // Эхний хэрэглэчийн мэдээллийг авах
          
          // Session хадгалах
          const sessionSaved = saveSession(userData);
          
          if (sessionSaved) {
            // Амжилттай бол  руу шилжих
            router.push("/");
          } else {
            throw new Error("Session хадгалахад алдаа гарлаа");
          }
        } else {
          throw new Error("Хэрэглэгчийн мэдээлэл олдсонгүй");
        }
      } else {
        // Бусад resultCode ирвэл алдаа гэж үзэх
        throw new Error(data.resultMessage || "Үл мэдэгдэх алдаа гарлаа");
      }

    } catch (err: any) {
      console.error("Auth error:", err);
      setError(err.message || "Серверт холбогдоход алдаа гарлаа. Дахин оролдоно уу.");
    } finally {
      setIsLoading(false);
    }
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
            <div className="flex items-center gap-3 mb-12">
              <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20">
                <div className="relative w-15 h-15">
                  <Image 
                    src="/images/logomandah.png" 
                    alt="Mandakh University Logo" 
                    width={60}
                    height={60}
                    className="object-contain"
                  />
                </div>
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
            <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-black/40 to-transparent" />
          </div>

          {/* RIGHT FORM PANEL */}
          <div className="lg:col-span-3 p-12 bg-white">
            <div className="max-w-md mx-auto">

              {/* Toggle Buttons */}
              <div className="flex bg-gray-100 rounded-2xl p-1 mb-10">
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(true);
                    setError("");
                  }}
                  className={`flex-1 py-3 rounded-xl font-semibold transition ${
                    isLogin
                      ? "bg-gradient-to-r from-[#0f172a] to-[#1e3a8a] text-white shadow-lg"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Нэвтрэх
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(false);
                    setError("");
                  }}
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

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700 text-sm"
                >
                  <FiAlertCircle className="flex-shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}

              {/* Form */}
              <form className="space-y-5" onSubmit={handleSubmit}>

                {/* Name Fields - Only for Register */}
                {!isLogin && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Овог
                      </label>
                      <div className="relative mt-2">
                        <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          name="last_name"
                          value={formData.last_name}
                          onChange={handleInputChange}
                          placeholder="Баттулга"
                          className="w-full pl-12 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-600 outline-none"
                          disabled={isLoading}
                          required={!isLogin}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Нэр
                      </label>
                      <div className="relative mt-2">
                        <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          name="first_name"
                          value={formData.first_name}
                          onChange={handleInputChange}
                          placeholder="Мөнхжин"
                          className="w-full pl-12 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-600 outline-none"
                          disabled={isLoading}
                          required={!isLogin}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Email */}
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Имэйл
                  </label>
                  <div className="relative mt-2">
                    <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="example@mandakh.edu.mn"
                      className="w-full pl-12 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-600 outline-none"
                      disabled={isLoading}
                      required
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
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="••••••••"
                      className="w-full pl-12 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-600 outline-none"
                      disabled={isLoading}
                      required
                    />
                  </div>
                </div>

                {/* Forgot Password - Only for Login */}
                {isLogin && (
                  <div className="text-right">
                    <button
                      type="button"
                      className="text-sm text-blue-600 hover:text-blue-700"
                      onClick={() => {
                        alert("Нууц үг сэргээх холбоос таны имэйл рүү илгээгдсэн");
                      }}
                    >
                      Нууц үгээ мартсан уу?
                    </button>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl 
                    bg-gradient-to-r from-[#0f172a] to-[#1e3a8a]
                    text-white font-semibold shadow-xl 
                    hover:opacity-95 transition 
                    flex items-center justify-center gap-2
                    disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Түр хүлээнэ үү...
                    </>
                  ) : (
                    <>
                      {isLogin ? "Нэвтрэх" : "Бүртгүүлэх"}
                      <FiChevronRight />
                    </>
                  )}
                </button>

              </form>

              {/* Home Link */}
              <div className="mt-6 text-center">
                <Link 
                  href="/" 
                  className="text-sm text-gray-500 hover:text-gray-700 transition"
                >
                  ← Нүүр хуудас руу буцах
                </Link>
              </div>

              {/* Footer */}
              <div className="mt-8 text-center text-xs text-gray-400">
                © 2026 Мандах Их Сургууль · Тайлангийн цахим систем
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}