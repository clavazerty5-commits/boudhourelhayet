'use client';

import { useState } from 'react';
import {
  Search,
  ShoppingCart,
  Shield,
  Facebook,
  Menu,
  X,
  Store,
  Home,
  Settings,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';
import { useStore } from '@/lib/store';

export default function Header() {
  const {
    items,
    searchQuery,
    setSearchQuery,
    currentPage,
    setPage,
  } = useStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const cartItemCount = items.reduce((total, item) => total + item.quantity, 0);

  return (
    <header
      dir="rtl"
      className="sticky top-0 z-50 w-full border-b bg-white shadow-sm"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
        {/* Logo - Right side in RTL */}
        <button
          onClick={() => setPage('shop')}
          className="flex shrink-0 items-center gap-2 transition-opacity hover:opacity-80"
          aria-label="الصفحة الرئيسية"
        >
          <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-600 text-white">
            <Store className="size-5" />
          </div>
          <span className="hidden text-lg font-bold text-emerald-700 sm:inline-block">
            متجر بذور الحياة
          </span>
        </button>

        {/* Search Bar - Middle (hidden on mobile) */}
        <div className="relative hidden flex-1 md:block">
          <Search className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="ابحث عن منتجات..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 w-full pr-10 pl-4 bg-gray-50 border-gray-200 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30"
          />
        </div>

        {/* Action Buttons - Left side in RTL */}
        <div className="flex items-center gap-1">
          {/* Cart Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setPage('cart')}
            className="relative text-gray-600 hover:text-emerald-600 hover:bg-emerald-50"
            aria-label={`سلة التسوق (${cartItemCount} عنصر)`}
          >
            <ShoppingCart className="size-5" />
            {cartItemCount > 0 && (
              <Badge className="absolute -top-1 -left-1 flex size-5 items-center justify-center rounded-full bg-emerald-600 p-0 text-[10px] font-bold text-white hover:bg-emerald-600 border-0">
                {cartItemCount > 99 ? '99+' : cartItemCount}
              </Badge>
            )}
          </Button>

          {/* Admin Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setPage('admin')}
            className={`text-gray-600 hover:bg-emerald-50 hover:text-emerald-600 ${
              currentPage === 'admin' ? 'bg-emerald-50 text-emerald-600' : ''
            }`}
            aria-label="لوحة الإدارة"
          >
            <Shield className="size-5" />
          </Button>

          {/* Facebook Link */}
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="text-gray-600 hover:bg-emerald-50 hover:text-emerald-600"
          >
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="صفحة الفيسبوك"
            >
              <Facebook className="size-5" />
            </a>
          </Button>

          {/* Mobile Menu Trigger */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-600 hover:bg-emerald-50 hover:text-emerald-600 md:hidden"
                aria-label="القائمة"
              >
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[350px]">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2 text-emerald-700">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
                    <Store className="size-4" />
                  </div>
                  متجر بذور الحياة
                </SheetTitle>
              </SheetHeader>

              <div className="flex flex-col gap-4 px-4 pb-6">
                {/* Mobile Search */}
                <div className="relative">
                  <Search className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="ابحث عن منتجات..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-10 w-full pr-10 pl-4 bg-gray-50 border-gray-200 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30"
                  />
                </div>

                {/* Mobile Navigation Links */}
                <nav className="flex flex-col gap-1">
                  <SheetClose asChild>
                    <Button
                      variant="ghost"
                      className={`w-full justify-start gap-3 px-4 py-3 text-base font-medium ${
                        currentPage === 'shop'
                          ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                      onClick={() => setPage('shop')}
                    >
                      <Home className="size-5" />
                      الرئيسية
                    </Button>
                  </SheetClose>

                  <SheetClose asChild>
                    <Button
                      variant="ghost"
                      className={`w-full justify-start gap-3 px-4 py-3 text-base font-medium ${
                        currentPage === 'cart'
                          ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                      onClick={() => setPage('cart')}
                    >
                      <ShoppingCart className="size-5" />
                      سلة التسوق
                      {cartItemCount > 0 && (
                        <Badge className="mr-auto bg-emerald-600 text-white hover:bg-emerald-600 border-0">
                          {cartItemCount}
                        </Badge>
                      )}
                    </Button>
                  </SheetClose>

                  <SheetClose asChild>
                    <Button
                      variant="ghost"
                      className={`w-full justify-start gap-3 px-4 py-3 text-base font-medium ${
                        currentPage === 'admin'
                          ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                      onClick={() => setPage('admin')}
                    >
                      <Shield className="size-5" />
                      لوحة الإدارة
                    </Button>
                  </SheetClose>

                  <SheetClose asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-3 px-4 py-3 text-base font-medium text-gray-700 hover:bg-gray-100"
                      asChild
                    >
                      <a
                        href="https://facebook.com"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Facebook className="size-5" />
                        صفحة الفيسبوك
                      </a>
                    </Button>
                  </SheetClose>
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
