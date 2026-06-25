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
  title: "بذور الحياة - Graines de Vie",
  description: "متجرك لمنتجات التجميل والأعشاب الطبيعية ومواد التنظيف. Votre boutique de produits de beauté, d'herbes naturelles et de nettoyage.",
  keywords: ["بذور الحياة", "Graines de Vie", "تجميل", "أعشاب طبيعية", "مواد تنظيف", "تونس", "Tunisie", "produits naturels"],
  authors: [{ name: "بذور الحياة - Graines de Vie" }],
  icons: {
    icon: "/store-logo.png",
  },
  openGraph: {
    title: "بذور الحياة - Graines de Vie",
    description: "منتجات تجميل وأعشاب طبيعية ومواد تنظيف - توصيل لجميع أنحاء تونس",
    type: "website",
    locale: "ar_TN",
    alternateLocale: "fr_TN",
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
