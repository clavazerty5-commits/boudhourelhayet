import { ar } from './ar';
import { fr } from './fr';
import type { TranslationKeys } from './ar';

export type Locale = 'ar' | 'fr';

const translations: Record<Locale, TranslationKeys> = { ar, fr };

export function getTranslation(locale: Locale): TranslationKeys {
  return translations[locale];
}

export function t(locale: Locale, key: keyof TranslationKeys): string {
  const trans = translations[locale];
  const value = trans[key];
  return typeof value === 'string' ? value : String(value);
}

// Helper to get the direction based on locale
export function getDirection(locale: Locale): 'rtl' | 'ltr' {
  return locale === 'ar' ? 'rtl' : 'ltr';
}

// Helper to get localized product/category name
export function getLocalizedName(
  item: { name: string; nameAr?: string; nameFr?: string } | null | undefined,
  locale: Locale
): string {
  if (!item) return '';
  if (locale === 'ar') return item.nameAr || item.name;
  if (locale === 'fr') return item.nameFr || item.name;
  return item.name;
}

// Helper to get localized description
export function getLocalizedDescription(
  item: { description?: string; descriptionAr?: string; descriptionFr?: string } | null | undefined,
  locale: Locale
): string {
  if (!item) return '';
  if (locale === 'ar') return item.descriptionAr || item.description || '';
  if (locale === 'fr') return item.descriptionFr || item.description || '';
  return item.description || '';
}

// Tunisian governorates keys (used for i18n lookup)
export const GOVERNORATE_KEYS = [
  'tunis', 'ariana', 'benArous', 'manouba', 'nabeul', 'zaghouan',
  'bizerte', 'beja', 'jendouba', 'kef', 'siliana', 'kairouan',
  'kasserine', 'sidiBouzid', 'sfax', 'mahdia', 'monastir', 'sousse',
  'tatouine', 'kebili', 'gafsa', 'tozeur', 'gabes', 'medenine',
] as const;

export type GovernorateKey = typeof GOVERNORATE_KEYS[number];

export { ar, fr, type TranslationKeys };
