// app/verify-email/page.tsx
"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FiCheckCircle, FiXCircle, FiAlertCircle } from "react-icons/fi";
import { API_BASE_URL } from "@/api_base_url/page";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isVerifying, setIsVerifying] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState<{
    success: boolean;
    message: string;
    code?: number;
  } | null>(null);

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      setVerificationStatus({
        success: false,
        message: "Баталгаажуулах холбоос буруу байна.",
        code: 400
      });
      setIsVerifying(false);
      return;
    }

    const verifyEmail = async () => {
      setIsVerifying(true);
      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/verifyuser/${token}/`, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();
        console.log("Verification response:", data);
        
        if (data.resultCode === 7920) {
          setVerificationStatus({
            success: true,
            message: "Таны имэйл хаяг амжилттай баталгаажлаа! Та одоо системд нэвтрэх боломжтой.",
            code: data.resultCode
          });
        } else if (data.resultCode === 8213) {
          setVerificationStatus({
            success: false,
            message: "Баталгаажуулах холбоосны хугацаа дууссан эсвэл буруу байна. Дахин бүртгүүлнэ үү.",
            code: data.resultCode
          });
        } else {
          setVerificationStatus({
            success: false,
            message: data.resultMessage || "Баталгаажуулахад алдаа гарлаа. Дахин оролдоно уу.",
            code: data.resultCode
          });
        }
      } catch (error) {
        console.error("Verification error:", error);
        setVerificationStatus({
          success: false,
          message: "Серверт холбогдоход алдаа гарлаа. Дахин оролдоно уу.",
          code: 500
        });
      } finally {
        setIsVerifying(false);
      }
    };

    verifyEmail();
  }, [searchParams]);

  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f8fafc] via-white to-[#eef2ff]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Имэйл хаяг баталгаажиж байна...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f8fafc] via-white to-[#eef2ff] px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full"
      >
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {verificationStatus?.success ? (
            <>
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiCheckCircle className="text-green-600 text-4xl" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Баталгаажлаа!</h1>
              <p className="text-gray-600 mb-6">{verificationStatus.message}</p>
              <button
                onClick={() => router.push("/auth")}
                className="px-6 py-3 bg-gradient-to-r from-[#0f172a] to-[#1e3a8a] text-white rounded-xl font-semibold hover:opacity-95 transition"
              >
                Нэвтрэх
              </button>
            </>
          ) : (
            <>
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiXCircle className="text-red-600 text-4xl" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Алдаа гарлаа</h1>
              <p className="text-gray-600 mb-6">{verificationStatus?.message}</p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => router.push("/auth?register=true")}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition"
                >
                  Дахин бүртгүүлэх
                </button>
                <button
                  onClick={() => router.push("/")}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition"
                >
                  Нүүр хуудас
                </button>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}