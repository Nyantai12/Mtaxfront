// app/admin/report-types/[id]/edit-schema/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  FiSave, FiArrowLeft, FiLoader, FiCheckCircle, FiAlertCircle, 
  FiEye, FiCode, FiRefreshCw, FiDownload, FiUpload,
  FiChevronLeft, FiChevronRight
} from "react-icons/fi";
import Header from "@/app/component/Header";
import { API_BASE_URL } from "@/api_base_url/page";
import { reportTypeService } from "@/services/reportTypeService";
import type { ReportType, ReportSchema, MigrationStatus } from "@/services/reportTypeService";

export default function EditReportSchemaPage() {
  const params = useParams();
  const router = useRouter();
  const reportTypeId = parseInt(params.id as string);
  
  const [reportType, setReportType] = useState<ReportType | null>(null);
  const [schema, setSchema] = useState<ReportSchema | null>(null);
  const [originalSchema, setOriginalSchema] = useState<ReportSchema | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [migrationStatus, setMigrationStatus] = useState<MigrationStatus | null>(null);
  const [schemaHistory, setSchemaHistory] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [viewMode, setViewMode] = useState<"edit" | "preview" | "history">("edit");
  const [jsonError, setJsonError] = useState<string | null>(null);
  
  // History pagination
  const [historyCurrentPage, setHistoryCurrentPage] = useState(1);
  const [historyItemsPerPage] = useState(4);
  const [historyTotalPages, setHistoryTotalPages] = useState(1);
  
  // Тайлангийн төрлийн мэдээлэл авах
  const fetchReportType = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/report-types/${reportTypeId}/`, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      
      if (data.resultCode === 200 && data.data) {
        setReportType(data.data);
        setSchema(data.data.field_schema);
        setOriginalSchema(data.data.field_schema);
      } else {
        setError("Тайлангийн төрөл олдсонгүй");
      }
    } catch (error) {
      console.error("Error fetching report type:", error);
      setError("Мэдээлэл ачаалахад алдаа гарлаа");
    } finally {
      setIsLoading(false);
    }
  }, [reportTypeId]);
  
  // Schema түүх авах
  const fetchSchemaHistory = useCallback(async () => {
    setIsLoadingHistory(true);
    try {
      const history = await reportTypeService.getSchemaHistory(reportTypeId);
      setSchemaHistory(history);
      setHistoryTotalPages(Math.ceil(history.length / historyItemsPerPage));
      setHistoryCurrentPage(1);
    } catch (error) {
      console.error("Error fetching schema history:", error);
    } finally {
      setIsLoadingHistory(false);
    }
  }, [reportTypeId, historyItemsPerPage]);
  
  // Pagination хийсэн түүх
  const getPaginatedHistory = () => {
    const startIndex = (historyCurrentPage - 1) * historyItemsPerPage;
    const endIndex = startIndex + historyItemsPerPage;
    return schemaHistory.slice(startIndex, endIndex);
  };
  
  const goToHistoryPage = (page: number) => {
    if (page >= 1 && page <= historyTotalPages) {
      setHistoryCurrentPage(page);
    }
  };
  
  useEffect(() => {
    fetchReportType();
    fetchSchemaHistory();
  }, [fetchReportType, fetchSchemaHistory]);
  
  const handleSave = async () => {
    if (!schema) return;
    
    // Schema валидлах
    const validation = reportTypeService.validateSchema(schema);
    if (!validation.valid) {
      setError(`Schema алдаатай:\n${validation.errors.join("\n")}`);
      return;
    }
    
    setIsSaving(true);
    setError("");
    setSuccess("");
    setMigrationStatus(null);
    
    try {
      const result = await reportTypeService.updateReportSchema(reportTypeId, schema);
      
      if (result.success) {
        setSuccess(result.message || "Schema амжилттай шинэчлэгдлээ");
        setOriginalSchema(JSON.parse(JSON.stringify(schema)));
        
        // Тайлангийн төрлийн мэдээллийг дахин ачаалах
        await fetchReportType();
        await fetchSchemaHistory();
        
        // Migration төлвийг хянах
        if (result.schema_change_id) {
          const intervalId = setInterval(async () => {
            const status = await reportTypeService.getMigrationStatus(result.schema_change_id!);
            if (status) {
              setMigrationStatus(status);
              if (status.status === 'completed' || status.status === 'failed') {
                clearInterval(intervalId);
                if (status.status === 'completed') {
                  setSuccess(`Schema шинэчлэгдэж, ${status.migrated_reports_count} тайлан амжилттай шинэчлэгдлээ`);
                } else if (status.status === 'failed') {
                  setError("Зарим тайлангууд шинэчлэгдэхэд алдаа гарлаа");
                }
              }
            }
          }, 3000);
          
          // Эхний статусыг авах
          const initialStatus = await reportTypeService.getMigrationStatus(result.schema_change_id);
          setMigrationStatus(initialStatus);
        }
      } else {
        setError(result.message || "Хадгалахад алдаа гарлаа");
      }
    } catch (err: any) {
      setError(err.message || "Хадгалахад алдаа гарлаа");
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleDownloadSchema = () => {
    if (!schema) return;
    const blob = new Blob([JSON.stringify(schema, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `schema_${reportTypeId}_${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };
  
  const handleUploadSchema = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = JSON.parse(content);
        const validation = reportTypeService.validateSchema(parsed);
        if (validation.valid) {
          setSchema(parsed);
          setJsonError(null);
          setSuccess("Schema амжилттай ачаалагдлаа");
          setTimeout(() => setSuccess(""), 3000);
        } else {
          setJsonError(`Файлын schema алдаатай:\n${validation.errors.join("\n")}`);
        }
      } catch (err) {
        setJsonError("JSON файл буруу байна");
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  };
  
  const handleJsonChange = (value: string) => {
    try {
      const parsed = JSON.parse(value);
      const validation = reportTypeService.validateSchema(parsed);
      if (validation.valid) {
        setSchema(parsed);
        setJsonError(null);
      } else {
        setJsonError(`Schema алдаатай:\n${validation.errors.join("\n")}`);
        // Алдаатай ч гэсэн редакторт харагдуулах
        try {
          const parsedAny = JSON.parse(value);
          setSchema(parsedAny);
        } catch {
          // Хэрэв JSON parse хийгдэхгүй бол schema-г өөрчлөхгүй
        }
      }
    } catch (err) {
      setJsonError("JSON формат буруу байна");
      // Буруу JSON ч гэсэн редакторт харагдуулах
      try {
        const parsedAny = JSON.parse(value);
        setSchema(parsedAny);
      } catch {
        // Хэрэв JSON parse хийгдэхгүй бол schema-г өөрчлөхгүй
      }
    }
  };
  
  const getVersionBadgeColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700';
      case 'processing': return 'bg-blue-100 text-blue-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'failed': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };
  
  const getVersionStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Шинэчлэгдсэн';
      case 'processing': return 'Уншиж байна';
      case 'pending': return 'Хүлээгдэж буй';
      case 'failed': return 'Алдаатай';
      default: return 'Тодорхойгүй';
    }
  };
  
  // Pagination component
  const Pagination = ({ currentPage, totalPages, onPageChange }: { 
    currentPage: number; 
    totalPages: number; 
    onPageChange: (page: number) => void;
  }) => {
    if (totalPages <= 1) return null;
    
    const getPageNumbers = () => {
      const pages = [];
      const maxVisible = 5;
      
      if (totalPages <= maxVisible) {
        for (let i = 1; i <= totalPages; i++) pages.push(i);
      } else {
        if (currentPage <= 3) {
          for (let i = 1; i <= 4; i++) pages.push(i);
          pages.push(-1);
          pages.push(totalPages);
        } else if (currentPage >= totalPages - 2) {
          pages.push(1);
          pages.push(-1);
          for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
        } else {
          pages.push(1);
          pages.push(-1);
          for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
          pages.push(-1);
          pages.push(totalPages);
        }
      }
      return pages;
    };
    
    return (
      <div className="flex justify-center items-center gap-2 mt-4 pt-4 border-t border-gray-200">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-lg bg-white border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          <FiChevronLeft />
        </button>
        
        <div className="flex gap-1">
          {getPageNumbers().map((page, idx) => (
            page === -1 ? (
              <span key={`sep-${idx}`} className="w-10 h-10 flex items-center justify-center text-gray-400">...</span>
            ) : (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`w-10 h-10 rounded-lg font-medium transition ${
                  currentPage === page
                    ? "bg-[#0f172a] text-white"
                    : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                {page}
              </button>
            )
          ))}
        </div>
        
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg bg-white border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          <FiChevronRight />
        </button>
      </div>
    );
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] via-white to-[#eef2ff]">
      <Header />
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
            >
              <FiArrowLeft className="text-xl text-gray-700" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Тайлангийн бүтэц засварлах
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                {reportType?.type_name} (ID: {reportTypeId}) - v{reportType?.schema_version || 1}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* View mode buttons */}
            <div className="flex bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => setViewMode("edit")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${
                  viewMode === "edit" ? "bg-white shadow text-gray-900" : "text-gray-700 hover:text-gray-900"
                }`}
              >
                <FiCode className="text-gray-600" /> Засварлах
              </button>
              <button
                onClick={() => setViewMode("preview")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${
                  viewMode === "preview" ? "bg-white shadow text-gray-900" : "text-gray-700 hover:text-gray-900"
                }`}
              >
                <FiEye className="text-gray-600" /> Харах
              </button>
              <button
                onClick={() => {
                  setViewMode("history");
                  fetchSchemaHistory();
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${
                  viewMode === "history" ? "bg-white shadow text-gray-900" : "text-gray-700 hover:text-gray-900"
                }`}
              >
                <FiCode className="text-gray-600" /> Түүх
              </button>
            </div>
            
            <button
              onClick={handleDownloadSchema}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition flex items-center gap-2 text-sm"
              title="Schema татах"
            >
              <FiDownload className="text-gray-600" /> JSON Татах
            </button>
            
            <label className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition flex items-center gap-2 text-sm cursor-pointer">
              <FiUpload className="text-gray-600" /> Ачаалах
              <input
                type="file"
                accept=".json"
                onChange={handleUploadSchema}
                className="hidden"
              />
            </label>
            
            <button
              onClick={handleSave}
              disabled={isSaving || !!jsonError}
              className="px-6 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-50"
            >
              {isSaving ? <FiLoader className="animate-spin text-white" /> : <FiSave className="text-white" />}
              Хадгалах
            </button>
          </div>
        </div>
        
        {/* Error/Success Messages */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-start gap-2">
            <FiAlertCircle className="flex-shrink-0 mt-0.5 text-red-600" />
            <div className="whitespace-pre-wrap text-red-700">{error}</div>
            <button onClick={() => setError("")} className="ml-auto text-red-500 hover:text-red-700">×</button>
          </div>
        )}
        
        {jsonError && (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-yellow-700 flex items-start gap-2">
            <FiAlertCircle className="flex-shrink-0 mt-0.5 text-yellow-600" />
            <div className="whitespace-pre-wrap text-yellow-700">{jsonError}</div>
            <button onClick={() => setJsonError(null)} className="ml-auto text-yellow-500 hover:text-yellow-700">×</button>
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 flex items-center gap-2">
            <FiCheckCircle className="text-green-600" /> {success}
            <button onClick={() => setSuccess("")} className="ml-auto text-green-500 hover:text-green-700">×</button>
          </div>
        )}
        
        {/* Migration Status */}
        {migrationStatus && migrationStatus.status !== 'completed' && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <div className="flex items-center gap-3 mb-2">
              <FiLoader className="animate-spin text-blue-600" />
              <span className="font-medium text-blue-800">
                Тайлангууд шинэчлэгдэж байна...
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 text-sm">
              <div>
                <span className="text-gray-600">Хуучин version:</span>
                <span className="ml-2 font-medium text-gray-800">{migrationStatus.old_schema_version}</span>
              </div>
              <div>
                <span className="text-gray-600">Шинэ version:</span>
                <span className="ml-2 font-medium text-gray-800">{migrationStatus.new_schema_version}</span>
              </div>
              <div>
                <span className="text-gray-600">Төлөв:</span>
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${getVersionBadgeColor(migrationStatus.status)}`}>
                  {getVersionStatusText(migrationStatus.status)}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Шинэчлэгдсэн:</span>
                <span className="ml-2 font-medium text-gray-800">{migrationStatus.migrated_reports_count || 0}</span>
              </div>
            </div>
          </div>
        )}
        
        {/* Main Content */}
        {viewMode === "edit" && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 px-6 py-3 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-medium text-gray-700">JSON Schema</h3>
              <span className="text-xs text-gray-500">
                {schema ? Object.keys(schema).length : 0} keys
              </span>
            </div>
            <div className="p-4">
              <textarea
                value={JSON.stringify(schema, null, 2)}
                onChange={(e) => handleJsonChange(e.target.value)}
                className="w-full h-[600px] font-mono text-sm p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-800 bg-white"
                spellCheck={false}
              />
            </div>
          </div>
        )}
        
        {/* Preview Mode */}
        {viewMode === "preview" && schema && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
              <h3 className="font-medium text-gray-700">Schema бүтэц</h3>
            </div>
            <div className="p-4 max-h-[600px] overflow-y-auto">
              <div className="space-y-6">
                {schema.sections?.map((section, idx) => (
                  <div key={section.id || idx} className="border border-gray-200 rounded-xl overflow-hidden">
                    <div className="bg-blue-50 px-4 py-2 border-b border-gray-200">
                      <h4 className="font-semibold text-gray-800">
                        {section.id}. {section.title}
                      </h4>
                    </div>
                    <div className="p-4">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-3 py-2 text-left w-20 text-gray-600">Мөр</th>
                            <th className="px-3 py-2 text-left text-gray-600">Үзүүлэлт</th>
                            <th className="px-3 py-2 text-left w-24 text-gray-600">Төрөл</th>
                            <th className="px-3 py-2 text-left w-32 text-gray-600">Томьёо</th>
                          </tr>
                        </thead>
                        <tbody>
                          {section.fields?.map((field, fIdx) => (
                            <tr key={field.id || fIdx} className="border-t border-gray-200">
                              <td className="px-3 py-2 font-mono text-sm text-gray-700">{field.id}</td>
                              <td className="px-3 py-2 text-gray-700">
                                {field.label}
                                {field.children && field.children.length > 0 && (
                                  <div className="ml-4 mt-1 text-xs text-gray-500">
                                    {field.children.length} дэд талбар
                                  </div>
                                )}
                              </td>
                              <td className="px-3 py-2">
                                <span className={`px-2 py-0.5 rounded-full text-xs ${
                                  field.isCalculated ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                                }`}>
                                  {field.isCalculated ? 'Томьёотой' : 'Гарын'}
                                </span>
                              </td>
                              <td className="px-3 py-2 font-mono text-xs text-gray-500">
                                {field.calculationRule || '-'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* History Mode with Pagination */}
        {viewMode === "history" && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 px-6 py-3 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-medium text-gray-700">Schema шинэчлэлийн түүх</h3>
              <span className="text-xs text-gray-500">
                Нийт {schemaHistory.length} бүртгэл
              </span>
            </div>
            <div className="p-4">
              {isLoadingHistory ? (
                <div className="flex justify-center py-8">
                  <FiLoader className="animate-spin text-2xl text-blue-600" />
                </div>
              ) : schemaHistory.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FiCode className="text-4xl mx-auto mb-2 opacity-50" />
                  <p className="text-gray-500">Шинэчлэлийн түүх байхгүй байна</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    {getPaginatedHistory().map((history) => (
                      <div key={history.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition">
                        <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
                          <div className="flex items-center gap-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getVersionBadgeColor(history.status)}`}>
                              {getVersionStatusText(history.status)}
                            </span>
                            <span className="text-sm text-gray-600">
                              v{history.old_schema_version} → v{history.new_schema_version}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500">
                            {new Date(history.created_at).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 mb-2">{history.change_summary}</p>
                        {history.migrated_reports_count > 0 && (
                          <p className="text-xs text-gray-500">
                            Шинэчлэгдсэн тайлан: {history.migrated_reports_count}
                          </p>
                        )}
                        {history.completed_at && (
                          <p className="text-xs text-gray-500 mt-1">
                            Дууссан: {new Date(history.completed_at).toLocaleString()}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {/* Pagination */}
                  <Pagination
                    currentPage={historyCurrentPage}
                    totalPages={historyTotalPages}
                    onPageChange={goToHistoryPage}
                  />
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}