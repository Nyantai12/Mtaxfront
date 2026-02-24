"use client";

import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="relative z-10 bg-white border-t border-gray-200 py-12 mt-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-8">
          
          {/* Logo + Description */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Image
                src="/images/logomandah.png"
                alt="Mandakh University Logo"
                width={40}
                height={40}
                className="object-contain"
              />
              <span className="font-bold text-gray-900">
                МАНДАХ ИХ СУРГУУЛЬ
              </span>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              Тайлангийн цахим систем — цаасан хэлбэрийн тайлангаас салж,
              бүрэн цахим хэлбэрт шилжих орчин үеийн шийдэл.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">
              Холбоосууд
            </h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <Link href="/student/profile" className="hover:text-gray-900 transition">
                  Бидний тухай
                </Link>
              </li>
              <li>
                <Link href="/student/reviews" className="hover:text-gray-900 transition">
                  Холбоо барих
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-gray-900 transition">
                  Түгээмэл асуултууд
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">
              Хууль эрх зүй
            </h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <Link href="/terms" className="hover:text-gray-900 transition">
                  Үйлчилгээний нөхцөл
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-gray-900 transition">
                  Нууцлалын бодлого
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">
              Холбоо барих
            </h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>info@mandakh.edu.mn</li>
              <li>+976 89898989</li>
              <li>Улаанбаатар, Монгол</li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-200 mt-8 pt-8 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} Мандах Их Сургууль · Тайлангийн цахим систем.
          Бүх эрх хуулиар хамгаалагдсан.
        </div>
      </div>
    </footer>
  );
}