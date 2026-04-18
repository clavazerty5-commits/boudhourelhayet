'use client';

import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Sparkles } from 'lucide-react';

export default function HeroSection() {
  const setPage = useStore((s) => s.setPage);

  return (
    <section className="relative overflow-hidden rounded-2xl mx-4 sm:mx-6 mt-4">
      {/* Gradient Background */}
      <div className="relative bg-gradient-to-bl from-emerald-600 via-emerald-500 to-teal-400 px-6 py-12 sm:px-12 sm:py-16 lg:px-16 lg:py-20">
        {/* Decorative circles */}
        <div className="absolute top-0 left-0 w-32 h-32 sm:w-48 sm:h-48 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-40 h-40 sm:w-64 sm:h-64 bg-white/5 rounded-full translate-x-1/3 translate-y-1/3" />
        <div className="absolute top-1/2 left-1/2 w-20 h-20 sm:w-32 sm:h-32 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />

        <div className="relative z-10 flex flex-col items-center text-center gap-6 sm:gap-8">
          {/* Icon */}
          <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
            <Sparkles className="w-5 h-5 text-white" />
            <span className="text-white/90 text-sm font-medium">
              عروض حصرية
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
            مرحباً بك في متجرنا
          </h1>

          {/* Subtitle */}
          <p className="text-white/85 text-base sm:text-lg lg:text-xl max-w-2xl leading-relaxed">
            اكتشف أحدث المنتجات بأفضل الأسعار
          </p>

          {/* CTA Button */}
          <Button
            onClick={() => setPage('shop')}
            size="lg"
            className="bg-white text-emerald-700 hover:bg-white/90 font-bold text-base sm:text-lg px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 mt-2"
          >
            <ShoppingBag className="w-5 h-5 ml-2" />
            تسوق الآن
          </Button>
        </div>
      </div>
    </section>
  );
}
