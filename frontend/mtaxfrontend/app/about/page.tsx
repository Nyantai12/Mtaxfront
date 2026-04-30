// app/about/page.tsx
"use client";

import { motion } from "framer-motion";
import {
  FiHome,
  FiUsers,
  FiTarget,
  FiEye,
  FiHeart,
  FiShield,
  FiGlobe,
  FiAward,
  FiTrendingUp,
  FiMail,
  FiMapPin,
  FiPhone,
  FiClock,
} from "react-icons/fi";
import { FaGraduationCap, FaChalkboardTeacher, FaUniversity } from "react-icons/fa";
import Link from "next/link";
import Header from "@/app/component/Header";
import Footer from "@/app/component/Footer";

export default function AboutPage() {
  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const stats = [
    { value: "500+", label: "Идэвхтэй оюутан", icon: <FiUsers className="text-3xl" /> },
    { value: "50+", label: "Мэргэжлийн багш", icon: <FaChalkboardTeacher className="text-3xl" /> },
    { value: "1000+", label: "Амжилттай тайлан", icon: <FiTrendingUp className="text-3xl" /> },
    { value: "24/7", label: "Үйлчилгээний дэмжлэг", icon: <FiClock className="text-3xl" /> },
  ];

  const values = [
    {
      title: "Шинэчлэл",
      description: "Бид технологийн хамгийн сүүлийн үеийн шийдлүүдийг нэвтрүүлж, байнга сайжруулж байдаг.",
      icon: <FiTrendingUp className="text-3xl" />,
      color: "bg-blue-100 text-blue-600"
    },
    {
      title: "Найдвартай байдал",
      description: "Таны мэдээллийн аюулгүй байдал, системийн тогтвортой ажиллагааг хангадаг.",
      icon: <FiShield className="text-3xl" />,
      color: "bg-green-100 text-green-600"
    },
    {
      title: "Хэрэглэгчдэд ээлтэй",
      description: "Энгийн, ойлгомжтой интерфейсээр хэрэглэгчдэд таатай орчинг бүрдүүлдэг.",
      icon: <FiHeart className="text-3xl" />,
      color: "bg-red-100 text-red-600"
    },
    {
      title: "Нээлттэй байдал",
      description: "Бүх үйл ажиллагаа нь ил тод, нээлттэй байхыг эрхэмлэдэг.",
      icon: <FiEye className="text-3xl" />,
      color: "bg-purple-100 text-purple-600"
    },
  ];

  const milestones = [
    {
      year: "2022",
      title: "Системийн эхлэл",
      description: "Тайлангийн цахим системийн үндэс суурь тавигдсан.",
      icon: <FiHome />
    },
    {
      year: "2022",
      title: "Өргөтгөл",
      description: "Оюутан, багш нарын бүртгэл нэмэгдэж, систем өргөжсөн.",
      icon: <FiUsers />
    },
    {
      year: "2023",
      title: "Автоматжуулалт",
      description: "Тайлан хянах, баталгаажуулах үйл явц бүрэн автоматжсан.",
      icon: <FiTrendingUp />
    },
    {
      year: "2024",
      title: "Загварын шинэчлэл",
      description: "Веб хувилбар дээр тайлан хянах, илгээх боломжтой болсон.",
      icon: <FiGlobe />
    },
    {
      year: "2025",
      title: "Интеграци",
      description: "Хиймэл оюун ухаан ашиглан тайлангийн чанарыг сайжруулах.",
      icon: <FiAward />
    },
    {
      year: "2026",
      title: "Бүрэн цахим",
      description: "Цаасан тайлангаас бүрэн татгалзаж, 100% цахим болсон.",
      icon: <FiShield />
    },
  ];

  const team = [
    {
      name: "З.Бумандэмбэрэл",
      role: "Backend хөгжүүлэгч",
      department: "",
      avatar: "ЗБ",
      color: "bg-blue-500"
    },
    {
      name: "А.Нянтай",
      role: "UI/UX Frontend хөгжүүлэгч",
      department: "",
      avatar: "АН",
      color: "bg-green-500"
    },
    {
      name: "С. Номин",
      role: "Системийн администратор",
      department: "",
      avatar: "СН",
      color: "bg-purple-500"
    },
    {
      name: "Д. Эрдэнэ",
      role: "Маркетингийн менежер",
      department: "",
      avatar: "ДЭ",
      color: "bg-yellow-500"
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] via-white to-[#eef2ff]">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl -z-10" />
        
        <div className="max-w-8xl mx-auto px-6 py-20 md:py-28">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <FaUniversity />
              Мандах Их Сургууль
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Тайлангийн Цахим Системийн
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-700 block mt-2 mb-4">
                Тухай
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Мандах Их Сургуулийн оюутан, багш нарын тайлан илгээх, хянах, баталгаажуулах үйл явцыг 
              бүрэн цахимжуулж, цаг хугацаа хэмнэх, ил тод байдлыг хангах зорилгоор бүтээгдсэн систем.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white shadow-lg">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-gray-600 mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12">
            <motion.div
              {...fadeInUp}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100"
            >
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-5">
                <FiTarget className="text-2xl text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Бидний эрхэм зорилго</h2>
              <p className="text-gray-600 leading-relaxed">
                Сургуулийн тайлангийн үйл явцыг бүрэн цахимжуулж, оюутан, багш нарын цаг хугацааг хэмнэх, 
                тайлан хянах, баталгаажуулах ажлыг ил тод, шуурхай болгох.
              </p>
            </motion.div>

            <motion.div
              {...fadeInUp}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100"
            >
              <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-5">
                <FiEye className="text-2xl text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Бидний алсын хараа</h2>
              <p className="text-gray-600 leading-relaxed">
                Монгол Улсын боловсролын салбарт тэргүүлэх цахим тайлангийн систем болж, 
                цаасан хэлбэрийн тайлангаас бүрэн татгалзаж, бүрэн цахим орчинд шилжих.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 bg-white/50">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Бидний үнэт зүйлс</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Бидний үйл ажиллагааг чиглүүлдэг үндсэн зарчмууд
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 text-center hover:shadow-xl transition"
              >
                <div className={`w-16 h-16 ${value.color} rounded-xl flex items-center justify-center mx-auto mb-4`}>
                  {value.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{value.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Хөгжлийн замнал</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Системийн хөгжлийн чухал үе шатууд
            </p>
          </motion.div>

          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 bg-gradient-to-b from-blue-500 to-indigo-600 h-full hidden lg:block" />
            
            <div className="space-y-8">
              {milestones.map((milestone, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex flex-col lg:flex-row ${index % 2 === 0 ? 'lg:flex-row-reverse' : ''} items-center gap-8`}
                >
                  <div className="lg:w-1/2">
                    <div className={`bg-white rounded-2xl p-6 shadow-lg border border-gray-100 ${index % 2 === 0 ? 'lg:ml-8' : 'lg:mr-8'}`}>
                      <div className="flex items-center gap-4 mb-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white">
                          {milestone.icon}
                        </div>
                        <span className="text-2xl font-bold text-blue-600">{milestone.year}</span>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{milestone.title}</h3>
                      <p className="text-gray-600">{milestone.description}</p>
                    </div>
                  </div>
                  <div className="lg:w-1/2" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-white/50">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Манай баг</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Системийг хөгжүүлж, үйлчилгээг тасралтгүй сайжруулж буй хөгжүүлэгчид
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 text-center hover:shadow-xl transition"
              >
                <div className={`w-24 h-24 ${member.color} rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold`}>
                  {member.avatar}
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{member.name}</h3>
                <p className="text-sm text-blue-600 mt-1">{member.role}</p>
                <p className="text-xs text-gray-500 mt-1">{member.department}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Info */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-gradient-to-r from-[#0f172a] to-[#1e3a8a] rounded-3xl p-8 md:p-12 text-white">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <FiMapPin className="text-xl" />
                </div>
                <div>
                  <h3 className="font-semibold">Хаяг</h3>
                  <p className="text-white/80 text-sm">Улаанбаатар хот, Сүхбаатар дүүрэг</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <FiMail className="text-xl" />
                </div>
                <div>
                  <h3 className="font-semibold">Имэйл</h3>
                  <p className="text-white/80 text-sm">info@report.mandakh.edu.mn</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <FiPhone className="text-xl" />
                </div>
                <div>
                  <h3 className="font-semibold">Утас</h3>
                  <p className="text-white/80 text-sm">+976 11 123456</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}