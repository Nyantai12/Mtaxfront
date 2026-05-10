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
  FiChevronLeft,
  FiChevronRight as FiChevronRightIcon,
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
  const [duplicateError, setDuplicateError] = useState("");
  const [isDuplicate, setIsDuplicate] = useState(false);
  
  // Хуудаслалтын state-ууд
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

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
  }, []);

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
        setCurrentPage(1); // Шинэ өгөгдөл ирэхэд эхний хуудас руу буцах
        // Дахин давхардсан эсэхийг шалгах
        if (newOrgName.trim()) {
          checkDuplicateInRealTime(newOrgName);
        }
      } else if (data.resultCode === 8213) {
        if (!isRetry) {
          console.log("Token expired, attempting refresh...");
          const refreshed = await refreshToken();
          
          if (refreshed) {
            return fetchOrganizations(true);
          } else {
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

  // Давхардсан нэрийг шалгах функц
  const checkDuplicateInRealTime = (name: string) => {
    if (!name.trim()) {
      setDuplicateError("");
      setIsDuplicate(false);
      return;
    }

    const isNameDuplicate = organizations.some(
      (org) => org.org_name.toLowerCase() === name.trim().toLowerCase()
    );

    if (isNameDuplicate) {
      setDuplicateError(`"${name}" нэртэй байгууллага аль хэдийн бүртгэгдсэн байна.`);
      setIsDuplicate(true);
    } else {
      setDuplicateError("");
      setIsDuplicate(false);
    }
  };

  // Нэрийг өөрчлөх үед шалгах
  const handleOrgNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewOrgName(value);
    
    // Бодит цагийн давхардсан шалгалт
    if (value.trim()) {
      const isNameDuplicate = organizations.some(
        (org) => org.org_name.toLowerCase() === value.trim().toLowerCase()
      );
      
      if (isNameDuplicate) {
        setDuplicateError(`"${value}" нэртэй байгууллага аль хэдийн бүртгэгдсэн байна.`);
        setIsDuplicate(true);
      } else {
        setDuplicateError("");
        setIsDuplicate(false);
      }
    } else {
      setDuplicateError("");
      setIsDuplicate(false);
    }
  };

  const handleCreateOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Нэрийг шалгах
    if (!newOrgName.trim()) {
      setError("Байгууллагын нэр оруулна уу");
      return;
    }

    // Давхардсан эсэхийг дахин шалгах
    const isNameDuplicate = organizations.some(
      (org) => org.org_name.toLowerCase() === newOrgName.trim().toLowerCase()
    );

    if (isNameDuplicate) {
      setError(`"${newOrgName}" нэртэй байгууллага аль хэдийн бүртгэгдсэн байна.`);
      setIsDuplicate(true);
      return;
    }

    setIsCreating(true);
    setError("");
    setDuplicateError("");
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/organization/addorganization/`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ org_name: newOrgName.trim() }),
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
        setDuplicateError("");
        setIsDuplicate(false);
        await fetchOrganizations();
        setTimeout(() => setSuccess(""), 3000);
      } else if (data.resultCode === 8213) {
        const refreshed = await refreshToken();
        
        if (refreshed) {
          setError("");
          await handleCreateOrganization(e);
        } else {
          setError("Таны нэвтрэлт дууссан байна. Дахин нэвтрэнэ үү.");
          localStorage.clear();
          setTimeout(() => {
            router.push("/auth");
          }, 2000);
        }
      } else if (data.resultCode === 7321) {
        // Серверээс давхардсан нэрийн алдаа
        setError(data.resultMessage || "Энэ нэртэй байгууллага аль хэдийн бүртгэгдсэн байна.");
        setIsDuplicate(true);
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

  // Хуудасны хайлт
  const filteredOrganizations = organizations.filter(org =>
    org.org_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Хуудаслалтын тооцоолол
  const totalPages = Math.ceil(filteredOrganizations.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentOrganizations = filteredOrganizations.slice(startIndex, endIndex);

  // Хуудас солих функцууд
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goToPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Хуудасны дугааруудыг үүсгэх функц
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      }
    }
    
    return pageNumbers;
  };

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
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-black"
            />
          </div>
          <button
            onClick={() => {
              setShowCreateForm(!showCreateForm);
              setDuplicateError("");
              setIsDuplicate(false);
              setNewOrgName("");
              setError("");
            }}
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
                  onChange={handleOrgNameChange}
                  placeholder="Жишээ: Мандах ХХК, Глобал Солюшнс ..."
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-black transition ${
                    duplicateError 
                      ? "border-red-500 bg-red-50" 
                      : newOrgName && !isDuplicate && newOrgName.trim()
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200"
                  }`}
                  disabled={isCreating}
                  autoComplete="off"
                />
                
                {/* Давхардсан нэрийн warning мессеж */}
                {duplicateError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2 flex items-center gap-2 text-red-600 text-sm"
                  >
                    <FiAlertCircle className="text-red-500" />
                    <span>{duplicateError}</span>
                  </motion.div>
                )}
                
                {/* Боломжтой нэрийн амжилттай мессеж */}
                {!duplicateError && newOrgName && newOrgName.trim() && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2 flex items-center gap-2 text-green-600 text-sm"
                  >
                    <FiCheckCircle className="text-green-500" />
                    <span>Энэ нэр ашиглах боломжтой</span>
                  </motion.div>
                )}
                
                {/* Тайлбар текст */}
                <p className="mt-2 text-xs text-gray-500">
                  Байгууллагын нэр давхардаж болохгүй. Жижиг том үсэг ялгахгүйгээр шалгана.
                </p>
              </div>
              
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={isCreating || isDuplicate || !newOrgName.trim()}
                  className={`px-6 py-3 bg-gradient-to-r from-[#0f172a] to-[#1e3a8a] text-white rounded-xl font-medium shadow-lg transition flex items-center gap-2 ${
                    isCreating || isDuplicate || !newOrgName.trim()
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:opacity-90"
                  }`}
                >
                  {isCreating ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Үүсгэж байна...
                    </>
                  ) : (
                    <>
                      <FiPlus />
                      Байгууллага үүсгэх
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    setDuplicateError("");
                    setIsDuplicate(false);
                    setNewOrgName("");
                    setError("");
                  }}
                  className="px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition"
                  disabled={isCreating}
                >
                  Болих
                </button>
              </div>
              
              {/* Давхардсан нэрийн талаарх мэдээлэл */}
              {organizations.length > 0 && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-800 mb-2">📋 Бүртгэлтэй байгууллагууд:</p>
                  <div className="flex flex-wrap gap-2">
                    {organizations.slice(0, 5).map((org) => (
                      <span key={org.org_id} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {org.org_name}
                      </span>
                    ))}
                    {organizations.length > 5 && (
                      <span className="text-xs text-blue-600">+{organizations.length - 5} бусад</span>
                    )}
                  </div>
                </div>
              )}
            </form>
          </motion.div>
        )}

        {isLoading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Түр хүлээнэ үү...</p>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentOrganizations.length > 0 ? (
                currentOrganizations.map((org) => (
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
                  <p className="text-gray-500 mb-4">
                    {searchTerm ? "Таны хайлтад тохирох байгууллага олдсонгүй" : "Танд одоогоор байгууллага байхгүй байна"}
                  </p>
                  {!searchTerm && (
                    <button
                      onClick={() => setShowCreateForm(true)}
                      className="px-6 py-3 bg-gradient-to-r from-[#0f172a] to-[#1e3a8a] text-white rounded-xl font-medium shadow-lg hover:opacity-90 transition inline-flex items-center gap-2"
                    >
                      <FiPlus />
                      Шинэ байгууллага үүсгэх
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Хуудаслалтын хэсэг */}
            {totalPages > 1 && (
              <div className="mt-12 flex justify-center items-center gap-2">
                <button
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                  className={`p-2 rounded-lg transition ${
                    currentPage === 1
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-blue-300"
                  }`}
                >
                  <FiChevronLeft className="text-lg" />
                </button>

                <div className="flex gap-2">
                  {getPageNumbers().map((page, index) => (
                    <button
                      key={index}
                      onClick={() => typeof page === 'number' && goToPage(page)}
                      className={`px-4 py-2 rounded-lg transition ${
                        currentPage === page
                          ? "bg-gradient-to-r from-[#0f172a] to-[#1e3a8a] text-white shadow-md"
                          : page === '...'
                          ? "bg-transparent text-gray-500 cursor-default"
                          : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-blue-300"
                      }`}
                      disabled={page === '...'}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className={`p-2 rounded-lg transition ${
                    currentPage === totalPages
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-blue-300"
                  }`}
                >
                  <FiChevronRightIcon className="text-lg" />
                </button>
              </div>
            )}

            {/* Мэдээллийн текст */}
            {filteredOrganizations.length > 0 && (
              <div className="mt-4 text-center text-sm text-gray-500">
                Нийт {filteredOrganizations.length} байгууллагаас {startIndex + 1} - {Math.min(endIndex, filteredOrganizations.length)} харуулж байна
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}