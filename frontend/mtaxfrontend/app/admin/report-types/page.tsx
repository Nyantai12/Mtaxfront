// app/admin/report-types/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  FiFileText, FiEdit2, FiEye, FiPlus, FiSearch, 
  FiCheckCircle, FiXCircle, FiRefreshCw, FiCode,
  FiCalendar, FiUser
} from "react-icons/fi";
import Header from "@/app/component/Header";
import { API_BASE_URL } from "@/api_base_url/page";
import type { ReportType } from "@/services/reportTypeService";

export default function AdminReportTypesPage() {
  const router = useRouter();
  const [reportTypes, setReportTypes] = useState<ReportType[]>([]);
  const [filteredTypes, setFilteredTypes] = useState<ReportType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");

  // Тайлангийн төрлүүдийг авах
  const fetchReportTypes = async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_BASE_URL}/api/report-types/`, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      
      if (data.resultCode === 200) {
        setReportTypes(data.data);
        setFilteredTypes(data.data);
      } else {
        setError(data.resultMessage || "Мэдээлэл ачаалахад алдаа гарлаа");
      }
    } catch (error) {
      console.error("Error fetching report types:", error);
      setError("Сервертэй холбогдоход алдаа гарлаа");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReportTypes();
  }, []);

  // Хайлт хийх
  useEffect(() => {
    if (searchTerm) {
      const filtered = reportTypes.filter(rt => 
        rt.type_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rt.type_code?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredTypes(filtered);
    } else {
      setFilteredTypes(reportTypes);
    }
  }, [searchTerm, reportTypes]);

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center gap-1">
        <FiCheckCircle className="text-xs" /> Идэвхтэй
      </span>
    ) : (
      <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium flex items-center gap-1">
        <FiXCircle className="text-xs" /> Идэвхгүй
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] via-white to-[#eef2ff]">
      <Header />
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Тайлангийн төрлүүд</h1>
            <p className="text-gray-500 mt-1">Бүх тайлангийн төрлийн жагсаалт</p>
          </div>
          <button
            onClick={() => router.push("/admin/report-types/create")}
            className="px-4 py-2 bg-gradient-to-r from-[#0f172a] to-[#1e3a8a] text-white rounded-xl font-medium hover:opacity-90 transition flex items-center gap-2"
          >
            <FiPlus /> Шинэ төрөл
          </button>
        </div>

        {/* Search */}
        <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-200 mb-6">
          <div className="relative">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Тайлангийн нэр, кодоор хайх..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
            {error}
          </div>
        )}

        {/* Loading */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredTypes.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-lg border border-gray-200">
            <FiFileText className="text-5xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Тайлангийн төрөл байхгүй</h3>
            <p className="text-gray-500">Шинэ тайлангийн төрөл үүсгэх</p>
            <button
              onClick={() => router.push("/admin/report-types/create")}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <FiPlus className="inline mr-1" /> Шинэ төрөл
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTypes.map((type, index) => (
              <motion.div
                key={type.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition"
              >
                <div className="bg-gradient-to-r from-[#0f172a] to-[#1e3a8a] px-5 py-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-bold text-white">{type.type_name}</h3>
                      <p className="text-blue-200 text-xs mt-1">Код: {type.type_code}</p>
                    </div>
                    {getStatusBadge(type.is_active)}
                  </div>
                </div>
                
                <div className="p-5">
                  <div className="space-y-3">
                    {/* Version */}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 flex items-center gap-1">
                        <FiRefreshCw className="text-xs" /> Version:
                      </span>
                      <span className="font-medium text-gray-700">v{type.schema_version || 1}</span>
                    </div>
                    
                    {/* Created at */}
                    {type.created_at && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500 flex items-center gap-1">
                          <FiCalendar className="text-xs" /> Үүсгэсэн:
                        </span>
                        <span className="text-gray-700">
                          {new Date(type.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-2 mt-5 pt-4 border-t border-gray-100">
                    
                    <button
                      onClick={() => router.push(`/admin/report-types/${type.id}/edit-schema`)}
                      className="flex-1 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition flex items-center justify-center gap-1 text-sm"
                    >
                      <FiCode /> Бүтэц засварлах
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}