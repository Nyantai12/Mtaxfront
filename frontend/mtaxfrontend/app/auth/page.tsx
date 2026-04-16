"use client";

import { useState, useEffect } from "react";
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
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { API_BASE_URL } from "@/api_base_url/page";

interface UserData {
  id: number;
  email: string;
  user_role: string;
  first_name: string;
  last_name: string;
}

interface LoginResponse {
  resultCode: number;
  resultMessage: string;
  data: Array<{
    id: number;
    email: string;
    user_role: string;
    first_name: string;
    last_name: string;
  }>;
}



export default function AuthPage() {
  const searchParams = useSearchParams();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (searchParams.get('register') === 'true') {
      setIsLogin(false);
    }
  }, [searchParams]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

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

    const apiUrl = isLogin
      ? `${API_BASE_URL}/api/auth/login/`
      : `${API_BASE_URL}/api/auth/register/`;

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
      console.log("Sending request to:", apiUrl);
      console.log("Request body:", requestBody);

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
        credentials: "include", // Cookie-г хүлээн авах/илгээх
      });

      // Response headers-ээс cookie ирсэн эсэхийг шалгах
      const setCookieHeader = response.headers.get('set-cookie');
      console.log("Set-Cookie header:", setCookieHeader);

      const responseText = await response.text();
      console.log("Login response:", responseText);

      let data: LoginResponse;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error("JSON parse error:", e);
        throw new Error("Серверээс JSON хариу ирсэнгүй");
      }

      if (data.resultCode === 8110 || data.resultCode === 8010) {
        if (data.data && data.data.length > 0) {
          const userData = data.data[0];
          
          // Хэрэглэгчийн мэдээллийг хадгалах (токен хадгалахгүй, cookie-д байгаа)
          localStorage.setItem("user", JSON.stringify(userData));
          localStorage.setItem("userRole", userData.user_role);
          localStorage.setItem("userId", userData.id.toString());
          
          console.log("Login successful, redirecting...");
          
          // Бага зэрэг хүлээгээд нүүр хуудас руу шилжих
          setTimeout(() => {
            router.push("/");
          }, 500);
        } else {
          throw new Error("Хэрэглэгчийн мэдээлэл олдсонгүй");
        }
      } else {
        throw new Error(data.resultMessage || "Алдаа гарлаа");
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      setError(err.message || "Серверт холбогдоход алдаа гарлаа");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f8fafc] via-white to-[#eef2ff] px-6 relative overflow-hidden">
      <div className="absolute top-[-120px] left-[-120px] w-[350px] h-[350px] bg-blue-500/20 rounded-full blur-3xl" />
      <div className="absolute bottom-[-120px] right-[-120px] w-[350px] h-[350px] bg-yellow-400/20 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-6xl relative z-10"
      >
        <div className="grid lg:grid-cols-5 bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-gray-200">
          {/* LEFT PANEL */}
          <div className="lg:col-span-2 bg-gradient-to-br from-[#0f172a] to-[#1e3a8a] p-12 text-white">
            <div className="flex items-center gap-3 mb-12">
              <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center">
                <Image 
                  src="/images/logomandah.png" 
                  alt="Mandakh University" 
                  width={60}
                  height={60}
                  className="object-contain"
                />
              </div>
              <div>
                <h2 className="text-xl font-bold">МАНДАХ ИХ СУРГУУЛЬ</h2>
                <p className="text-sm text-blue-200">Тайлангийн цахим систем</p>
              </div>
            </div>

            <h1 className="text-4xl font-extrabold leading-tight mb-5">
              Тайлангийн <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-amber-400">
                Цахим Систем
              </span>
            </h1>

            <p className="text-blue-100/90 text-lg mb-10">
              Оюутан болон багш нар тайлан илгээх, хянах, баталгаажуулах нэгдсэн платформ.
            </p>

            <div className="space-y-4">
              {[
                "✔ Тайлан илгээх хялбар систем",
                "✔ Багшийн хяналт баталгаажуулалт",
                "✔ PDF болон Online маягт",
                "✔ Нэгдсэн мэдээллийн сан",
              ].map((txt, i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm">
                  {txt}
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="lg:col-span-3 p-12 bg-white">
            <div className="max-w-md mx-auto">
              {/* Toggle Buttons */}
              <div className="flex bg-gray-100 rounded-2xl p-1 mb-10">
                <button
                  onClick={() => {
                    setIsLogin(true);
                    setError("");
                    const url = new URL(window.location.href);
                    url.searchParams.delete('register');
                    window.history.pushState({}, '', url.toString());
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
                  onClick={() => {
                    setIsLogin(false);
                    setError("");
                    const url = new URL(window.location.href);
                    url.searchParams.set('register', 'true');
                    window.history.pushState({}, '', url.toString());
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
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700"
                >
                  <FiAlertCircle />
                  <span>{error}</span>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {!isLogin && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Овог</label>
                      <div className="relative mt-2">
                        <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          name="last_name"
                          value={formData.last_name}
                          onChange={handleInputChange}
                          placeholder="Баттулга"
                          className="w-full pl-12 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-600 outline-none text-gray-600"
                          disabled={isLoading}
                          required={!isLogin}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Нэр</label>
                      <div className="relative mt-2">
                        <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          name="first_name"
                          value={formData.first_name}
                          onChange={handleInputChange}
                          placeholder="Мөнхжин"
                          className="w-full pl-12 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-600 outline-none text-gray-600"
                          disabled={isLoading}
                          required={!isLogin}
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-black">Имэйл</label>
                  <div className="relative mt-2">
                    <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-black" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="example@mandakh.edu.mn"
                      className="w-full pl-12 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-600 outline-none text-gray-600"
                      disabled={isLoading}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Нууц үг</label>
                  <div className="relative mt-2">
                    <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="••••••••"
                      className="w-full pl-12 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-600 outline-none text-gray-600"
                      disabled={isLoading}
                      required
                    />
                  </div>
                </div>

                {isLogin && (
                  <div className="text-right">
                    <button type="button" className="text-sm text-blue-600 hover:text-blue-700">
                      Нууц үгээ мартсан уу?
                    </button>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-[#0f172a] to-[#1e3a8a] text-white font-semibold shadow-xl hover:opacity-95 transition flex items-center justify-center gap-2 disabled:opacity-50"
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

              <div className="mt-6 text-center">
                <Link href="/" className="text-sm text-gray-500 hover:text-gray-700 transition">
                  ← Нүүр хуудас руу буцах
                </Link>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}