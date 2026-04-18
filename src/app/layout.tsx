import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "بذور الحياة - منتجات تجميل وأعشاب طبيعية",
  description: "متجرك لمنتجات التجميل والأعشاب الطبيعية ومواد التنظيف. منتجات طبيعية 100% بتوصيل لجميع أنحاء الجمهورية التونسية.",
  keywords: ["بذور الحياة", "تجميل", "أعشاب طبيعية", "مواد تنظيف", "تونس", "منتجات طبيعية", "مستحضرات تجميل"],
  authors: [{ name: "بذور الحياة" }],
  icons: {
    icon: "/store-logo.png",
  },
  openGraph: {
    title: "بذور الحياة",
    description: "منتجات تجميل وأعشاب طبيعية ومواد تنظيف - توصيل لجميع أنحاء تونس",
    type: "website",
    locale: "ar_TN",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
