"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { checkAuth } from "../../../authcheck/page";
import {
  FiFileText,
  FiSearch,
  FiCalendar,
  FiChevronLeft,
  FiHome,
  FiAlertCircle,
} from "react-icons/fi";
import Header from "../../../component/Header";
import Link from "next/link";
import { API_BASE_URL } from "@/app/api/page";
interface Report {
  report_id: number;
  type_name: string;
  // Backend-ээс ирэх бусад талбарууд байхгүй
}

interface ApiResponse {
  resultCode: number;
  resultMessage: string;
  data: Report[];
}



export default function ReportsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orgId = searchParams.get('org_id');

  const [reports, setReports] = useState<Report[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [organizationName, setOrganizationName] = useState("");

  useEffect(() => {
    if (!orgId) {
      router.push('/student/organizations');
      return;
    }

    async function init() {
      const result = await checkAuth();
      if (!result.isAuthenticated) {
        router.push("/auth");
        return;
      }
      fetchReports();
    }
    init();
  }, [orgId]);

  // Хайлт хийх функц
  useEffect(() => {
    if (searchTerm) {
      const filtered = reports.filter(report => 
        report.type_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredReports(filtered);
    } else {
      setFilteredReports(reports);
    }
  }, [searchTerm, reports]);

  const fetchReports = async () => {
    setIsLoading(true);
    setError("");

    try {
      const url = `${API_BASE_URL}/api/report/orgreportlist/${orgId}/`;
      console.log("Fetching reports from:", url);

      const response = await fetch(url, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const responseText = await response.text();
      console.log("Reports response:", responseText);

      let data: ApiResponse;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        throw new Error("Серверээс JSON хариу ирсэнгүй");
      }

      if (data.resultCode === 7420) {
        setReports(data.data || []);
        setFilteredReports(data.data || []);
        
        // Байгууллагын нэрийг localStorage-аас авах эсвэл түр зуурын нэр өгөх
        setOrganizationName(`Байгууллага #${orgId}`);
      } else if (data.resultCode === 8213) {
        setError("Таны нэвтрэлт дууссан байна. Дахин нэвтрэнэ үү.");
        setTimeout(() => router.push("/auth"), 2000);
      } else {
        setError(data.resultMessage || "Алдаа гарлаа");
      }
    } catch (error) {
      console.error("Fetch error:", error);
      setError("Серверт холбогдоход алдаа гарлаа");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReportClick = (reportId: number) => {
    // Тайлан дээр дарахад харах хуудас руу шилжих
    router.push(`/student/reports/view/${reportId}?org_id=${orgId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] via-white to-[#eef2ff]">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Буцах товч */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition mb-4"
        >
          <FiChevronLeft />
          Буцах
        </button>

        {/* Гарчиг */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {organizationName}
          </h1>
          <p className="text-gray-600 mt-1">
            Нийт {filteredReports.length} тайлан
          </p>
        </div>

        {/* Хайлт */}
        <div className="mb-6">
          <div className="relative">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Тайлангийн төрлөөр хайх..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-black"
            />
          </div>
        </div>

        {/* Алдаа */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700">
            <FiAlertCircle className="text-xl" />
            <span>{error}</span>
          </div>
        )}

        {/* Тайлангууд */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Түр хүлээнэ үү...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReports.length > 0 ? (
              filteredReports.map((report, index) => (
                <motion.div
                  key={report.report_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleReportClick(report.report_id)}
                  className="bg-white rounded-xl shadow-md border border-gray-200 p-5 hover:shadow-lg transition cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    {/* Icon */}
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                      <FiFileText className="text-white text-2xl" />
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {report.type_name || `Тайлан #${report.report_id}`}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <FiCalendar className="text-gray-400" />
                          <span>Огноо тодорхойгүй</span>
                        </div>
                      </div>
                    </div>

                    {/* Arrow */}
                    <div className="text-gray-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                <FiFileText className="text-5xl text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">
                  {searchTerm 
                    ? 'Хайлтын үр дүн олдсонгүй' 
                    : 'Тайлан байхгүй байна'}
                </p>
                <p className="text-sm text-gray-400">
                  Тайлан ID: {reports.map(r => r.report_id).join(', ') || 'хоосон'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Debug info - зөвхөн хөгжүүлэлтийн үед */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 p-4 bg-gray-100 rounded-xl text-xs">
            <p className="font-mono">API Response: {JSON.stringify(reports, null, 2)}</p>
          </div>
        )}
      </div>
    </div>
  );
}