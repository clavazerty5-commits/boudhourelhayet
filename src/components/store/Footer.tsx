'use client'

import Link from 'next/link'
import {
  Facebook,
  Instagram,
  Twitter,
  Phone,
  Mail,
  MapPin,
  MessageCircle,
} from 'lucide-react'
import { Separator } from '@/components/ui/separator'

const quickLinks = [
  { label: 'الرئيسية', href: '/' },
  { label: 'المنتجات', href: '/products' },
  { label: 'سلة التسوق', href: '/cart' },
  { label: 'سياسة الإرجاع', href: '/return-policy' },
]

const socialLinks = [
  {
    icon: Facebook,
    href: 'https://facebook.com',
    label: 'فيسبوك',
    className: 'bg-blue-600 hover:bg-blue-700 text-white',
  },
  {
    icon: Instagram,
    href: 'https://instagram.com',
    label: 'انستغرام',
    className: 'bg-gradient-to-tr from-pink-500 via-red-500 to-yellow-500 hover:from-pink-600 hover:via-red-600 hover:to-yellow-600 text-white',
  },
  {
    icon: Twitter,
    href: 'https://x.com',
    label: 'إكس',
    className: 'bg-neutral-800 hover:bg-neutral-900 text-white',
  },
]

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300" dir="rtl">
      {/* Main Footer Content */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          {/* Column 1: About the Store */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white">متجر إلكتروني</h3>
            <p className="leading-relaxed text-gray-400">
              وجهتك المثالية للتسوق الإلكتروني. نقدم لك أفضل المنتجات بأسعار
              تنافسية مع خدمة توصيل سريعة وسياسة إرجاع مرنة. تسوق بثقة وراحة
              من أي مكان.
            </p>
            {/* Social Media Icons */}
            <div className="flex items-center gap-3 pt-2">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className={`flex h-10 w-10 items-center justify-center rounded-full transition-all duration-200 ${social.className}`}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white">روابط سريعة</h3>
            <nav aria-label="روابط سريعة">
              <ul className="space-y-3">
                {quickLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-gray-400 transition-colors duration-200 hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Column 3: Contact Info */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white">تواصل معنا</h3>
            <ul className="space-y-4">
              <li>
                <a
                  href="tel:+966500000000"
                  className="flex items-center gap-3 text-gray-400 transition-colors duration-200 hover:text-white"
                >
                  <Phone className="h-5 w-5 shrink-0 text-emerald-400" />
                  <span dir="ltr">+966 50 000 0000</span>
                </a>
              </li>
              <li>
                <a
                  href="mailto:info@store.sa"
                  className="flex items-center gap-3 text-gray-400 transition-colors duration-200 hover:text-white"
                >
                  <Mail className="h-5 w-5 shrink-0 text-emerald-400" />
                  <span>info@store.sa</span>
                </a>
              </li>
              <li className="flex items-start gap-3 text-gray-400">
                <MapPin className="h-5 w-5 shrink-0 text-emerald-400" />
                <span>الرياض، المملكة العربية السعودية</span>
              </li>
              <li>
                <a
                  href="https://wa.me/966500000000"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-emerald-700"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>تواصل عبر واتساب</span>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <Separator className="bg-gray-700" />
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm text-gray-500">
          © 2025 متجر إلكتروني. جميع الحقوق محفوظة.
        </p>
      </div>
    </footer>
  )
}
