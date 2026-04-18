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
  title: "متجر إلكتروني - E-Commerce Store",
  description: "متجرك الإلكتروني لكل ما تحتاجه. اكتشف أحدث المنتجات بأفضل الأسعار مع توصيل سريع.",
  keywords: ["متجر", "تسوق", "منتجات", "إلكترونيات", "ملابس", "اكسسوارات"],
  authors: [{ name: "متجر إلكتروني" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "متجر إلكتروني",
    description: "متجرك الإلكتروني لكل ما تحتاجه",
    type: "website",
    locale: "ar_AR",
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
