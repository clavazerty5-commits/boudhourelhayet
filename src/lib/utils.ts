import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Locale } from '@/lib/i18n';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a price number with currency symbol based on locale.
 * Arabic: "1,500 د.ت"
 * French: "1,500 TND"
 */
export function formatPrice(price: number, locale: Locale = 'ar'): string {
  const localeStr = locale === 'ar' ? 'ar-TN' : 'fr-TN';
  const formatted = price.toLocaleString(localeStr, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 3,
  });
  if (locale === 'ar') {
    return `${formatted} د.ت`;
  }
  return `${formatted} TND`;
}

/**
 * Generate a unique order number with timestamp and random suffix.
 * Format: ORD-YYYYMMDD-XXXXXX
 */
export function generateOrderNumber(): string {
  const now = new Date();
  const datePart = now.getFullYear().toString() +
    (now.getMonth() + 1).toString().padStart(2, '0') +
    now.getDate().toString().padStart(2, '0');
  const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `ORD-${datePart}-${randomPart}`;
}

/**
 * Truncate text to a maximum length, adding ellipsis if truncated.
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + '…';
}
