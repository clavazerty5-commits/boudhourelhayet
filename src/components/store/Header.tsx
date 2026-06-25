'use client';

import { useState } from 'react';
import {
  Search,
  ShoppingCart,
  Shield,
  Facebook,
  Menu,
  Store,
  Home,
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
import { getTranslation, getDirection } from '@/lib/i18n';
import LanguageSwitcher from '@/components/store/LanguageSwitcher';

export default function Header() {
  const {
    items,
    searchQuery,
    setSearchQuery,
    currentPage,
    setPage,
    locale,
  } = useStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const t = getTranslation(locale);
  const dir = getDirection(locale);
  const isRTL = dir === 'rtl';

  const cartItemCount = items.reduce((total, item) => total + item.quantity, 0);

  return (
    <header
      dir={dir}
      className="sticky top-0 z-50 w-full border-b bg-white shadow-sm"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
        {/* Logo */}
        <button
          onClick={() => setPage('shop')}
          className="flex shrink-0 items-center gap-2 transition-opacity hover:opacity-80"
          aria-label={t.home}
        >
          <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-600 text-white">
            <Store className="size-5" />
          </div>
          <span className="hidden text-lg font-bold text-emerald-700 sm:inline-block">
            {t.storeName}
          </span>
        </button>

        {/* Search Bar - Middle (hidden on mobile) */}
        <div className="relative hidden flex-1 md:block">
          <Search className={`pointer-events-none absolute top-1/2 size-4 -translate-y-1/2 text-muted-foreground ${isRTL ? 'right-3' : 'left-3'}`} />
          <Input
            type="text"
            placeholder={t.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`h-10 w-full bg-gray-50 border-gray-200 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30 ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'}`}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1">
          {/* Cart Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setPage('cart')}
            className="relative text-gray-600 hover:text-emerald-600 hover:bg-emerald-50"
            aria-label={`${t.cart} (${t.cartItems.replace('{count}', String(cartItemCount))})`}
          >
            <ShoppingCart className="size-5" />
            {cartItemCount > 0 && (
              <Badge className={`absolute ${isRTL ? '-top-1 -left-1' : '-top-1 -right-1'} flex size-5 items-center justify-center rounded-full bg-emerald-600 p-0 text-[10px] font-bold text-white hover:bg-emerald-600 border-0`}>
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
            aria-label={t.adminPanel}
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
              aria-label={t.facebookPage}
            >
              <Facebook className="size-5" />
            </a>
          </Button>

          {/* Language Switcher */}
          <LanguageSwitcher />

          {/* Mobile Menu Trigger */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-600 hover:bg-emerald-50 hover:text-emerald-600 md:hidden"
                aria-label={t.menu}
              >
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side={isRTL ? 'right' : 'left'} className="w-[300px] sm:w-[350px]">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2 text-emerald-700">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
                    <Store className="size-4" />
                  </div>
                  {t.storeName}
                </SheetTitle>
              </SheetHeader>

              <div className="flex flex-col gap-4 px-4 pb-6">
                {/* Mobile Search */}
                <div className="relative">
                  <Search className={`pointer-events-none absolute top-1/2 size-4 -translate-y-1/2 text-muted-foreground ${isRTL ? 'right-3' : 'left-3'}`} />
                  <Input
                    type="text"
                    placeholder={t.searchPlaceholder}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`h-10 w-full bg-gray-50 border-gray-200 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30 ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'}`}
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
                      {t.home}
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
                      {t.cart}
                      {cartItemCount > 0 && (
                        <Badge className={`${isRTL ? 'mr-auto' : 'ml-auto'} bg-emerald-600 text-white hover:bg-emerald-600 border-0`}>
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
                      {t.adminPanel}
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
                        {t.facebookPage}
                      </a>
                    </Button>
                  </SheetClose>

                  {/* Mobile Language Switcher */}
                  <LanguageSwitcher variant="mobile" />
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
