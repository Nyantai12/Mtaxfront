"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import checkAuth from "../../../authcheck/page"  
import {
  FiPlus,
  FiSearch,
  FiHome,
  FiChevronRight,
  FiAlertCircle,
  FiCheckCircle,
  FiRefreshCw,
  FiLogOut,
} from "react-icons/fi";
import Header from "../../component/Header";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/api_base_url/page";
interface Organization {
  org_id: number;
  org_name: string;
  created_at: string;
}

interface ApiResponse {
  resultCode: number;
  resultMessage: string;
  data: Organization[];
}


export default function SelectOrganizationPage() {
  const router = useRouter();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newOrgName, setNewOrgName] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  

  // Token шинэчлэх функц
  const refreshToken = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/token/refresh/`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        return true;
      }
      return false;
    } catch (error) {
      console.error("Token refresh error:", error);
      return false;
    }
  };

  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        const result = await checkAuth();
        
        if (!mounted) return;

        if (!result.isAuthenticated) {
          router.push("/auth");
          return;
        }

        // Амжилттай нэвтэрсэн бол organizations-ийг ачаална
        await fetchOrganizations();
      } catch (error) {
        console.error("Auth check error:", error);
        if (mounted) {
          setError("Нэвтрэх эрх шалгахад алдаа гарлаа");
        }
      } finally {
        if (mounted) {
          setIsAuthChecking(false);
        }
      }
    }

    init();

    return () => {
      mounted = false;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchOrganizations = async (isRetry = false) => {
    setIsLoading(true);
    setError("");
    
    try {
      console.log("Fetching organizations with cookies");
      
      const response = await fetch(`${API_BASE_URL}/api/organization/organizationlist/`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const responseText = await response.text();
      console.log("Organizations response:", responseText);
      
      let data: ApiResponse;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        throw new Error("Серверээс JSON хариу ирсэнгүй");
      }

      if (data.resultCode === 7220) {
        setOrganizations(data.data || []);
      } else if (data.resultCode === 8213) {
        // Token expired - token шинэчлэх
        if (!isRetry) {
          console.log("Token expired, attempting refresh...");
          const refreshed = await refreshToken();
          
          if (refreshed) {
            // Token амжилттай шинэчлэгдсэн бол дахин оролдох
            return fetchOrganizations(true);
          } else {
            // Token шинэчлэгдэхгүй бол logout
            setError("Таны нэвтрэлт дууссан байна. Дахин нэвтрэнэ үү.");
            localStorage.clear();
            setTimeout(() => {
              router.push("/auth");
            }, 2000);
          }
        } else {
          setError("Таны нэвтрэлт дууссан байна. Дахин нэвтрэнэ үү.");
          localStorage.clear();
          setTimeout(() => {
            router.push("/auth");
          }, 2000);
        }
      } else {
        setError(data.resultMessage || "Алдаа гарлаа");
      }
    } catch (error) {
      console.error("Fetch error:", error);
      setError("Серверт холбогдоход алдаа гарлаа");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleCreateOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrgName.trim()) {
      setError("Байгууллагын нэр оруулна уу");
      return;
    }

    setIsCreating(true);
    setError("");
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/organization/addorganization/`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ org_name: newOrgName }),
      });

      const responseText = await response.text();
      console.log("Create response:", responseText);
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        throw new Error("Серверээс JSON хариу ирсэнгүй");
      }

      if (data.resultCode === 7320) {
        setSuccess("Байгууллага амжилттай үүсгэгдлээ");
        setNewOrgName("");
        setShowCreateForm(false);
        await fetchOrganizations();
        setTimeout(() => setSuccess(""), 3000);
      } else if (data.resultCode === 8213) {
        // Token expired - token шинэчлэх
        const refreshed = await refreshToken();
        
        if (refreshed) {
          // Token амжилттай шинэчлэгдсэн бол дахин оролдох
          setError(""); // Clear error
          await handleCreateOrganization(e); // Retry
        } else {
          setError("Таны нэвтрэлт дууссан байна. Дахин нэвтрэнэ үү.");
          localStorage.clear();
          setTimeout(() => {
            router.push("/auth");
          }, 2000);
        }
      } else {
        setError(data.resultMessage || "Алдаа гарлаа");
      }
    } catch (error) {
      console.error("Create error:", error);
      setError("Серверт холбогдоход алдаа гарлаа");
    } finally {
      setIsCreating(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchOrganizations();
  };

  const handleSelectOrganization = (orgId: number) => {
    localStorage.setItem("selectedOrgId", orgId.toString());
    router.push(`/student/reports/new?org_id=${orgId}`);
  };

  const filteredOrganizations = organizations.filter(org =>
    org.org_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Эхний ачааллалт хийж байгаа эсэхийг шалгах
  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] via-white to-[#eef2ff]">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600 text-lg">Түр хүлээнэ үү...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] via-white to-[#eef2ff]">
      <Header />
      
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Тайлан илгээх</h1>
            <p className="text-gray-600 mt-2">
              Эхлээд байгууллагаа сонгох эсвэл шинээр үүсгэнэ үү
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing || isLoading}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition disabled:opacity-50"
              title="Шинэчлэх"
            >
              <FiRefreshCw className={`text-xl ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
            
          </div>
        </div>

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 text-green-700"
          >
            <FiCheckCircle className="text-xl" />
            <span>{success}</span>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700"
          >
            <FiAlertCircle className="text-xl" />
            <span>{error}</span>
          </motion.div>
        )}

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Байгууллага хайх..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-black"
            />
          </div>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="px-6 py-3 bg-gradient-to-r from-[#0f172a] to-[#1e3a8a] text-white rounded-xl font-medium shadow-lg hover:opacity-90 transition flex items-center gap-2 disabled:opacity-50"
            disabled={isCreating}
          >
            <FiPlus />
            Шинэ байгууллага
          </button>
        </div>

        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8 p-6 bg-white rounded-2xl shadow-xl border border-gray-200"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Шинэ байгууллага үүсгэх</h3>
            <form onSubmit={handleCreateOrganization} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Байгууллагын нэр <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newOrgName}
                  onChange={(e) => setNewOrgName(e.target.value)}
                  placeholder="Жишээ: Мандах ХХК, Глобал Солюшнс ..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-black"
                  disabled={isCreating}
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-6 py-3 bg-gradient-to-r from-[#0f172a] to-[#1e3a8a] text-white rounded-xl font-medium shadow-lg hover:opacity-90 transition disabled:opacity-50"
                >
                  {isCreating ? "Үүсгэж байна..." : "Байгууллага үүсгэх"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition"
                  disabled={isCreating}
                >
                  Болих
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {isLoading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Түр хүлээнэ үү...</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOrganizations.length > 0 ? (
              filteredOrganizations.map((org) => (
                <motion.div
                  key={org.org_id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => handleSelectOrganization(org.org_id)}
                  className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 cursor-pointer hover:shadow-2xl transition"
                >
                  <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
                    <FiHome className="text-blue-700 text-2xl" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{org.org_name}</h3>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      {org.created_at ? new Date(org.created_at).toLocaleDateString() : 'Тодорхойгүй'}
                    </div>
                    <FiChevronRight className="text-blue-600" />
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <FiHome className="text-6xl text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">Танд одоогоор байгууллага байхгүй байна</p>
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="px-6 py-3 bg-gradient-to-r from-[#0f172a] to-[#1e3a8a] text-white rounded-xl font-medium shadow-lg hover:opacity-90 transition inline-flex items-center gap-2"
                >
                  <FiPlus />
                  Шинэ байгууллага үүсгэх
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}