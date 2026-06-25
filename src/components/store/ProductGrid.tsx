'use client';

import { useEffect, useState, useCallback } from 'react';
import { useStore } from '@/lib/store';
import { getTranslation, getDirection, getLocalizedName } from '@/lib/i18n';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { PackageOpen } from 'lucide-react';
import ProductCard from './ProductCard';
import type { Product, Category } from '@/types';

export default function ProductGrid() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const selectedCategory = useStore((s) => s.selectedCategory);
  const searchQuery = useStore((s) => s.searchQuery);
  const setSelectedCategory = useStore((s) => s.setSelectedCategory);
  const locale = useStore((s) => s.locale);
  const t = getTranslation(locale);
  const dir = getDirection(locale);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        fetch('/api/products?active=true'),
        fetch('/api/categories'),
      ]);

      if (productsRes.ok) {
        const productsData = await productsRes.json();
        setProducts(productsData.products || productsData);
      }

      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json();
        setCategories(categoriesData.categories || categoriesData);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter products
  const filteredProducts = products.filter((product) => {
    if (selectedCategory && product.categoryId !== selectedCategory) {
      return false;
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        product.name?.toLowerCase().includes(query) ||
        product.nameAr?.toLowerCase().includes(query) ||
        product.nameFr?.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query) ||
        product.descriptionAr?.toLowerCase().includes(query) ||
        product.descriptionFr?.toLowerCase().includes(query) ||
        product.sku?.toLowerCase().includes(query);
      if (!matchesSearch) return false;
    }

    return true;
  });

  if (loading) {
    return (
      <div className="space-y-6 px-4 sm:px-6">
        <div className="flex gap-3 overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-20 rounded-full shrink-0" />
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-square w-full rounded-xl" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-9 w-full rounded-md" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div dir={dir} className="space-y-6 px-4 sm:px-6">
      {/* Category Filter Tabs */}
      <div className="flex items-center gap-3">
        <ScrollArea className="flex-1">
          <div className="flex gap-2 pb-1">
            <button
              onClick={() => setSelectedCategory('')}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === ''
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {t.all}
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {getLocalizedName(category, locale)}
              </button>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      {/* Product Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {filteredProducts.length} {t.products}
        </p>
      </div>

      {/* Product Grid or Empty State */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <PackageOpen className="w-16 h-16 text-muted-foreground/40 mb-4" />
          <h3 className="text-lg font-semibold text-muted-foreground mb-2">
            {t.noProducts}
          </h3>
          <p className="text-sm text-muted-foreground/70 max-w-sm">
            {t.noProductsDesc}
          </p>
        </div>
      )}
    </div>
  );
}
