"use client";
import { motion } from "framer-motion";
import {
  FiFileText,
  FiCheckCircle,
  FiClock,
  FiUsers,
  FiBarChart2,
  FiArrowRight,
  FiBookOpen,
  FiDownload,
  FiUpload,
  FiShield,
} from "react-icons/fi";
import { FaUniversity, FaGraduationCap, FaChalkboardTeacher } from "react-icons/fa";
import Link from "next/link";
import Header from "../component/Header";
import Footer from "../component/Footer";

export default function MandakhHomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] via-white to-[#eef2ff] relative overflow-hidden">

      {/* Background Decorative Blur */}
      <div className="absolute top-[-120px] left-[-120px] w-[350px] h-[350px] bg-blue-500/20 rounded-full blur-3xl" />
      <div className="absolute bottom-[-120px] right-[-120px] w-[350px] h-[350px] bg-yellow-400/20 rounded-full blur-3xl" />
      
      {/* Header */}
      <Header />
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 max-w-7xl mx-auto px-6 py-16 md:py-24"
      >
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div>
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <FiBookOpen />
              Мандах Их Сургууль
            </div>
            
            <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-6">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-amber-400">Тайлангийн <br /></span>
              
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-800 to-blue-600">
                Цахим Систем
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-lg">
              Оюутан болон багш нар тайлан илгээх, хянах, баталгаажуулах
              нэгдсэн платформ. Цаасан хэлбэрийн тайлангаас салж, цахим хэлбэрт шилжинэ.
            </p>

            {/* Stats */}
            <div className="flex gap-8 mb-10">
              <div>
                <div className="text-3xl font-bold text-gray-900">500+</div>
                <div className="text-sm text-gray-500">Идэвхтэй оюутан</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900">50+</div>
                <div className="text-sm text-gray-500">Багш нар</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900">1000+</div>
                <div className="text-sm text-gray-500">Илгээсэн тайлан</div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4">
              <Link 
                href="/auth" 
                className="px-8 py-4 bg-gradient-to-r from-[#0f172a] to-[#1e3a8a] text-white rounded-xl font-semibold shadow-xl hover:opacity-95 transition flex items-center gap-2"
              >
                Эхлэх
                <FiArrowRight />
              </Link>
              <Link 
                href="/about" 
                className="px-8 py-4 bg-white border border-gray-200 text-gray-700 rounded-xl font-semibold shadow-lg hover:shadow-xl transition flex items-center gap-2"
              >
                Дэлгэрэнгүй
              </Link>
            </div>
          </div>

          {/* Right Image/Illustration */}
          <div className="relative">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200 p-8">
              {/* Recent Reports Preview */}
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Сүүлийн тайлангууд</h3>
              <div className="space-y-4">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FiFileText className="text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">Дадлагын тайлан {item}</div>
                        <div className="text-xs text-gray-500">2026.02.{10 + item}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">Баталгаажсан</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Features Section */}
      <div className="relative z-10 bg-white/50 backdrop-blur-sm py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Системийн боломжууд</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Тайлан илгээх, хянах, баталгаажуулах үйл явцыг бүрэн цахимжуулсан
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: FiUpload,
                title: "Тайлан илгээх",
                desc: "Оюутнууд тайлангаа хялбар илгээх",
                color: "bg-blue-100 text-blue-600"
              },
              {
                icon: FiCheckCircle,
                title: "Багшийн хяналт",
                desc: "Багш нар тайлан хянах, баталгаажуулах",
                color: "bg-green-100 text-green-600"
              },
              {
                icon: FiDownload,
                title: "PDF татах",
                desc: "Тайлангаа PDF хэлбэрээр татах",
                color: "bg-purple-100 text-purple-600"
              },
              {
                icon: FiBarChart2,
                title: "Статистик",
                desc: "Тайлангийн статистик мэдээлэл",
                color: "bg-yellow-100 text-yellow-600"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 hover:shadow-2xl transition"
              >
                <div className={`w-14 h-14 ${feature.color} rounded-xl flex items-center justify-center mb-4`}>
                  <feature.icon className="text-2xl" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* How it Works */}
      <div className="relative z-10 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Хэрхэн ажилладаг вэ?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              3 энгийн алхамаар тайлангаа илгээнэ
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Тайлан бичих",
                desc: "Өөрийн тайлангаа бэлтгэнэ",
                icon: FiFileText
              },
              {
                step: "2",
                title: "Багшид илгээх",
                desc: "Тайлангаа системээр багшид хүргүүлнэ",
                icon: FiUpload
              },
              {
                step: "3",
                title: "Баталгаажуулах",
                desc: "Багш тайланг хянаж, баталгаажуулна",
                icon: FiCheckCircle
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.2 }}
                className="relative"
              >
                <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100 text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-[#0f172a] to-[#1e3a8a] text-white rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                    {item.step}
                  </div>
                  <item.icon className="text-4xl text-blue-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.desc}</p>
                </div>
                {index < 2 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 text-gray-300 text-2xl">
                    <FiArrowRight />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="relative z-10 bg-gradient-to-br from-[#0f172a] to-[#1e3a8a] py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Хэрэглэгчдийн сэтгэгдэл</h2>
            <p className="text-xl text-blue-200 max-w-3xl mx-auto">
              Манай системийг ашиглаж буй оюутнууд болон багш нар
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Б. Мөнхжин",
                role: "Оюутан, Мэдээллийн технологи",
                text: "Тайлангаа цахимаар илгээх боломжтой болсноор маш хялбар болсон. Багш нар шуурхай хянаж баталгаажуулдаг.",
                avatar: <FaGraduationCap className="text-3xl text-white" />
              },
              {
                name: "Г. Батбаяр",
                role: "Багш, Программ хангамж",
                text: "Оюутнуудын тайланг хянах, үнэлэх ажил хялбарчсан. Нэгдсэн мэдээллийн сантай болсноор өмнөх тайлангуудыг харахад хялбар.",
                avatar: <FaChalkboardTeacher className="text-3xl text-white" />
              },
              {
                name: "С. Номин",
                role: "Оюутан, Бизнесийн удирдлага",
                text: "PDF татах боломжтой нь маш тохиромжтой. Хаана ч байсан тайлангаа хялбар илгээж чаддаг болсон.",
                avatar: <FaUniversity className="text-3xl text-white" />
              }
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="text-white font-semibold">{testimonial.name}</div>
                    <div className="text-blue-200 text-sm">{testimonial.role}</div>
                  </div>
                </div>
                <p className="text-white/90 text-sm leading-relaxed">&ldquo;{testimonial.text}&rdquo;</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}