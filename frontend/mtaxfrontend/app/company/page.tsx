"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  FiBriefcase,
  FiMapPin,
  FiGlobe,
  FiPhone,
  FiMail,
  FiUser,
  FiFileText,
  FiCheckCircle,
  FiArrowLeft,
  FiPlus,
  FiX,
  FiSave,
  FiEdit2,
  FiTrash2,
} from "react-icons/fi";
import { FaBuilding, FaUniversity } from "react-icons/fa";
import Link from "next/link";
import Header from "../component/Header";

export default function CreateCompanyPage() {
  const [activeTab, setActiveTab] = useState("create");
  const [selectedCompany, setSelectedCompany] = useState<number | null>(null);

  // Mock companies data
  const myCompanies = [
    {
      id: 1,
      name: "Монгол Веб Солюшнс",
      type: "ХХК",
      industry: "Мэдээллийн технологи",
      address: "Улаанбаатар, Сүхбаатар дүүрэг",
      phone: "+976 99112233",
      email: "info@mws.mn",
      website: "www.mws.mn",
      established: "2025",
      employees: 15,
      description: "Вэб хөгжүүлэлт, программ хангамжийн шийдлүүд",
      isActive: true,
    },
    {
      id: 2,
      name: "Эко Технологи",
      type: "ХХК",
      industry: "Байгаль орчин",
      address: "Улаанбаатар, Баянзүрх дүүрэг",
      phone: "+976 99887766",
      email: "info@eco-tech.mn",
      website: "www.eco-tech.mn",
      established: "2024",
      employees: 8,
      description: "Байгаль орчны шийдэл, хог хаягдал дахин боловсруулалт",
      isActive: true,
    },
  ];

  const industries = [
    "Мэдээллийн технологи",
    "Банк, Санхүү",
    "Худалдаа",
    "Үйлдвэрлэл",
    "Боловсрол",
    "Эрүүл мэнд",
    "Барилга",
    "Тээвэр, Логистик",
    "Хөдөө аж ахуй",
    "Аялал жуулчлал",
    "Бусад",
  ];

  const companyTypes = ["ХХК", "НҮБ", "ТББ", "Төрийн байгууллага", "Олон улсын байгууллага", "Бусад"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] via-white to-[#eef2ff]">
      <Header />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Хийсвэр байгууллага үүсгэх</h1>
            <p className="text-gray-600">Дадлагын тайланд ашиглах байгууллагын мэдээллийг бүртгэнэ</p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => setActiveTab("create")}
              className={`px-4 py-2 rounded-xl font-medium transition flex items-center gap-2 ${
                activeTab === "create" 
                  ? "bg-[#0f172a] text-white" 
                  : "bg-white text-gray-700 border border-gray-200"
              }`}
            >
              <FiPlus /> Шинэ бүртгэл
            </button>
            <button
              onClick={() => setActiveTab("list")}
              className={`px-4 py-2 rounded-xl font-medium transition flex items-center gap-2 ${
                activeTab === "list" 
                  ? "bg-[#0f172a] text-white" 
                  : "bg-white text-gray-700 border border-gray-200"
              }`}
            >
              <FiBriefcase /> Миний байгууллагууд
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "create" ? (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Column - Form */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-2xl p-6 shadow-xl border border-gray-200"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FaBuilding className="text-blue-600" />
                  Байгууллагын мэдээлэл
                </h3>

                <div className="space-y-4">
                  {/* Company Name - only this field is required as per request */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Байгууллагын нэр <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Жишээ: Монгол Веб Солюшнс ХХК"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    />
                    <p className="text-xs text-gray-500 mt-1">Та зөвхөн нэрээр бүртгэж болно</p>
                  </div>

                  {/* Optional fields - but visually shown */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Байгууллагын төрөл</label>
                      <select className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white text-gray-400">
                        <option value="">Сонгох (optional)</option>
                        {companyTypes.map((type, index) => (
                          <option key={index} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Салбар</label>
                      <select className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white text-gray-400">
                        <option value="">Сонгох (optional)</option>
                        {industries.map((industry, index) => (
                          <option key={index} value={industry}>{industry}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <FiMapPin className="inline mr-1" /> Хаяг
                    </label>
                    <input
                      type="text"
                      placeholder="Байгууллагын хаяг (optional)"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <FiPhone className="inline mr-1" /> Утас
                      </label>
                      <input
                        type="text"
                        placeholder="Утасны дугаар (optional)"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <FiMail className="inline mr-1" /> И-мэйл
                      </label>
                      <input
                        type="email"
                        placeholder="info@company.mn (optional)"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <FiGlobe className="inline mr-1" /> Вэбсайт
                    </label>
                    <input
                      type="text"
                      placeholder="www.company.mn (optional)"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Товч танилцуулга</label>
                    <textarea
                      rows={3}
                      placeholder="Байгууллагын үйл ажиллагааны товч танилцуулга (optional)"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                    />
                  </div>

                  {/* Submit Buttons */}
                  <div className="flex gap-3 pt-4">
                    <button className="flex-1 px-6 py-3 bg-gradient-to-r from-[#0f172a] to-[#1e3a8a] text-white rounded-xl font-semibold shadow-lg hover:opacity-90 transition flex items-center justify-center gap-2">
                      <FiSave />
                      Бүртгэх
                    </button>
                    <button className="px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition">
                      Цэвэрлэх
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right Column - Info & Tips */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                {/* Info Card */}
                <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-6 shadow-xl text-white">
                  <FaBuilding className="text-4xl mb-4 opacity-80" />
                  <h3 className="text-xl font-bold mb-2">Хийсвэр байгууллага гэж юу вэ?</h3>
                  <p className="text-blue-100 mb-4">
                    Хийсвэр байгууллага гэдэг нь оюутнууд дадлагын тайлангаа бичихдээ 
                    ашиглах зориулалттай, бодит бус байгууллага юм. Та өөрийн сонирхолын 
                    дагуу ямар ч нэртэй байгууллага үүсгэж болно.
                  </p>
                  <div className="border-t border-blue-400/30 pt-4">
                    <p className="text-sm text-blue-200">
                      <span className="font-semibold">Жишээ нь:</span> "Монгол Веб Солюшнс", 
                      "Эко Технологи", "Дижитал Эйжнси" гэх мэт
                    </p>
                  </div>
                </div>

                {/* Tips Card */}
                <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <FiCheckCircle className="text-green-500" />
                    Зөвлөмж
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <span className="text-green-500">•</span>
                      <span>Зөвхөн нэрээр бүртгэх боломжтой</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500">•</span>
                      <span>Бусад мэдээллийг нэмэлтээр бөглөж болно</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500">•</span>
                      <span>Нэг оюутан олон байгууллага үүсгэх боломжтой</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500">•</span>
                      <span>Үүсгэсэн байгууллагаа дараа засах, устгах боломжтой</span>
                    </li>
                  </ul>
                </div>

                {/* Example Card */}
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-3">Жишээ бүртгэл</h3>
                  <div className="space-y-2">
                    <p className="text-sm">
                      <span className="font-medium text-gray-700">Байгууллагын нэр:</span> 
                      <span className="text-gray-600 ml-2">Монгол Веб Солюшнс ХХК</span>
                    </p>
                    <p className="text-sm">
                      <span className="font-medium text-gray-700">Салбар:</span> 
                      <span className="text-gray-600 ml-2">Мэдээллийн технологи</span>
                    </p>
                    <p className="text-sm">
                      <span className="font-medium text-gray-700">Үйл ажиллагаа:</span> 
                      <span className="text-gray-600 ml-2">Вэб хөгжүүлэлт, программ хангамж</span>
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        ) : (
          /* My Companies List Tab */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-2xl p-6 shadow-xl border border-gray-200"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Миний бүртгэсэн байгууллагууд</h3>
              <span className="text-sm text-gray-500">Нийт {myCompanies.length} байгууллага</span>
            </div>

            <div className="space-y-4">
              {myCompanies.map((company) => (
                <div
                  key={company.id}
                  className={`border rounded-xl p-5 transition cursor-pointer ${
                    selectedCompany === company.id
                      ? "border-blue-500 bg-blue-50/50"
                      : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                  }`}
                  onClick={() => setSelectedCompany(company.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-[#0f172a] to-[#1e3a8a] rounded-xl flex items-center justify-center text-white text-xl font-bold">
                        {company.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{company.name}</h4>
                        <p className="text-sm text-gray-600">{company.industry} · {company.type}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <FiMapPin /> {company.address}
                          </span>
                          <span className="flex items-center gap-1">
                            <FiPhone /> {company.phone}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <button className="p-2 hover:bg-white rounded-lg transition text-blue-600">
                        <FiEdit2 />
                      </button>
                      <button className="p-2 hover:bg-white rounded-lg transition text-red-600">
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>

                  {selectedCompany === company.id && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 pt-4 border-t border-blue-200"
                    >
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">И-мэйл</p>
                          <p className="font-medium">{company.email}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Вэбсайт</p>
                          <p className="font-medium text-blue-600">{company.website}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Байгуулагдсан</p>
                          <p className="font-medium">{company.established} он</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Ажилчдын тоо</p>
                          <p className="font-medium">{company.employees}</p>
                        </div>
                      </div>
                      <p className="mt-3 text-sm text-gray-700">{company.description}</p>
                    </motion.div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-6 text-center text-sm text-gray-500">
              <FiFileText className="inline mr-1" /> Нийт 2 байгууллага бүртгэгдсэн
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}