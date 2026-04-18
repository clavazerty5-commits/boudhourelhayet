'use client';

import { useStore } from '@/lib/store';
import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LanguageSwitcher({ variant = 'default' }: { variant?: 'default' | 'mobile' }) {
  const locale = useStore((s) => s.locale);
  const setLocale = useStore((s) => s.setLocale);

  const toggleLocale = () => {
    setLocale(locale === 'ar' ? 'fr' : 'ar');
  };

  if (variant === 'mobile') {
    return (
      <Button
        variant="ghost"
        className="w-full justify-start gap-3 px-4 py-3 text-base font-medium text-gray-700 hover:bg-gray-100"
        onClick={toggleLocale}
      >
        <Globe className="size-5" />
        {locale === 'ar' ? 'Français' : 'العربية'}
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleLocale}
      className="text-gray-600 hover:bg-emerald-50 hover:text-emerald-600"
      aria-label={locale === 'ar' ? 'Switch to French' : 'التبديل إلى العربية'}
      title={locale === 'ar' ? 'Français' : 'العربية'}
    >
      <Globe className="size-5" />
    </Button>
  );
}
