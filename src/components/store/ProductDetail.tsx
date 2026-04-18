'use client';

import { useEffect, useState, useCallback } from 'react';
import { useStore } from '@/lib/store';
import { formatPrice } from '@/lib/utils';
import { trackAddToCart, shareOnFacebook } from '@/lib/facebook';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  ArrowRight,
  Minus,
  Plus,
  ShoppingCart,
  Share2,
  Package,
  Weight,
  Hash,
  AlertCircle,
} from 'lucide-react';
import { getTranslation, getDirection, getLocalizedName, getLocalizedDescription } from '@/lib/i18n';
import ProductCard from './ProductCard';
import type { Product } from '@/types';

export default function ProductDetail() {
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  const selectedProductId = useStore((s) => s.selectedProductId);
  const addItem = useStore((s) => s.addItem);
  const setPage = useStore((s) => s.setPage);
  const locale = useStore((s) => s.locale);

  const t = getTranslation(locale);
  const dir = getDirection(locale);
  const isRTL = dir === 'rtl';

  const fetchProduct = useCallback(async () => {
    if (!selectedProductId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/products/${selectedProductId}`);
      if (res.ok) {
        const data = await res.json();
        setProduct(data);

        // Fetch related products from same category
        if (data.categoryId) {
          const relatedRes = await fetch(
            `/api/products?active=true&categoryId=${data.categoryId}`
          );
          if (relatedRes.ok) {
            const relatedData = await relatedRes.json();
            setRelatedProducts(
              relatedData.filter((p: Product) => p.id !== data.id)
            );
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch product:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedProductId]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  // Reset quantity when product changes
  useEffect(() => {
    setQuantity(1);
  }, [selectedProductId]);

  const handleAddToCart = () => {
    if (!product || product.stock === 0) return;

    const displayName = getLocalizedName(product, locale);

    addItem({
      productId: product.id,
      name: displayName,
      price: product.price,
      quantity,
      image: product.images?.[0] ?? '',
    });

    trackAddToCart({
      id: product.id,
      name: displayName,
      price: product.price,
      quantity,
      category: product.category ? getLocalizedName(product.category, locale) : undefined,
    });
  };

  const handleShare = () => {
    if (!product) return;
    const displayName = getLocalizedName(product, locale);
    const productUrl = `${window.location.origin}?product=${product.id}`;
    shareOnFacebook(productUrl, displayName);
  };

  const discountPercentage =
    product?.comparePrice && product.comparePrice > product.price
      ? Math.round(
          ((product.comparePrice - product.price) / product.comparePrice) * 100
        )
      : null;

  const initials =
    product?.nameAr?.slice(0, 2) ?? product?.name.slice(0, 2).toUpperCase() ?? '';

  const isOutOfStock = product?.stock === 0;

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6 px-4 sm:px-6">
        <Skeleton className="h-8 w-24" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Skeleton className="aspect-square rounded-2xl" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }

  // No product found
  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-4">
        <AlertCircle className="w-16 h-16 text-muted-foreground/40 mb-4" />
        <h2 className="text-xl font-semibold mb-2">{t.productNotFound}</h2>
        <p className="text-muted-foreground mb-6">
          {t.productNotFoundDesc}
        </p>
        <Button onClick={() => setPage('shop')} variant="outline">
          <ArrowRight className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
          {t.backToStore}
        </Button>
      </div>
    );
  }

  const displayName = getLocalizedName(product, locale);
  const displayDescription = getLocalizedDescription(product, locale);
  const displayCategory = product.category ? getLocalizedName(product.category, locale) : null;

  return (
    <div className="space-y-8 px-4 sm:px-6 pb-8" dir={dir}>
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => setPage('shop')}
        className="gap-2 text-muted-foreground hover:text-foreground"
      >
        <ArrowRight className="w-4 h-4" />
        {t.backToStore}
      </Button>

      {/* Product Main Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Image */}
        <div className="relative">
          {product.images && product.images.length > 0 && product.images[0] ? (
            <img
              src={product.images[0]}
              alt={displayName}
              className="w-full aspect-square rounded-2xl object-cover shadow-lg"
            />
          ) : (
            <div
              className="w-full aspect-square rounded-2xl flex items-center justify-center text-6xl font-bold text-white/70 shadow-lg"
              style={{
                background: `linear-gradient(135deg, hsl(${(product.name.charCodeAt(0) * 37) % 360}, 60%, 55%), hsl(${(product.name.charCodeAt(0) * 37 + 60) % 360}, 70%, 45%))`,
              }}
            >
              {initials}
            </div>
          )}

          {/* Discount Badge */}
          {discountPercentage && (
            <Badge className="absolute top-4 start-4 bg-red-500 text-white border-none text-base px-3 py-1">
              {t.discount} {discountPercentage}%
            </Badge>
          )}

          {/* Out of Stock Overlay */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center">
              <Badge className="bg-gray-800 text-white border-none text-lg px-4 py-2">
                {t.outOfStock}
              </Badge>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex flex-col gap-5">
          {/* Category */}
          {product.category && displayCategory && (
            <Badge variant="secondary" className="w-fit">
              {displayCategory}
            </Badge>
          )}

          {/* Name */}
          <h1 className={`text-2xl sm:text-3xl font-bold leading-tight ${isRTL ? 'text-right' : 'text-left'}`}>
            {displayName}
          </h1>

          {/* Price */}
          <div className={`flex items-end gap-3 ${isRTL ? 'justify-end' : 'justify-start'}`}>
            {product.comparePrice && (
              <span className="text-base text-muted-foreground line-through">
                {formatPrice(product.comparePrice)}
              </span>
            )}
            <span className="text-3xl font-bold text-emerald-600">
              {formatPrice(product.price)}
            </span>
          </div>

          {/* Description */}
          {displayDescription && (
            <p className={`text-muted-foreground leading-relaxed ${isRTL ? 'text-right' : 'text-left'}`}>
              {displayDescription}
            </p>
          )}

          <Separator />

          {/* Quantity Selector */}
          <div className={`flex items-center gap-4 ${isRTL ? 'justify-end' : 'justify-start'}`}>
            <span className="text-sm font-medium text-muted-foreground">
              {t.quantity}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                <Minus className="w-4 h-4" />
              </Button>
              <span className="w-12 text-center text-lg font-semibold">
                {quantity}
              </span>
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10"
                onClick={() =>
                  setQuantity(
                    Math.min(product.stock ?? 99, quantity + 1)
                  )
                }
                disabled={isOutOfStock}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            <Button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              size="lg"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base py-6 transition-colors"
            >
              <ShoppingCart className={`w-5 h-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {isOutOfStock ? t.outOfStock : t.addToCart}
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={handleShare}
              className="w-full py-5"
            >
              <Share2 className={`w-5 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {t.shareOnFacebook}
            </Button>
          </div>
        </div>
      </div>

      {/* Product Details Section */}
      <div className="bg-muted/50 rounded-xl p-6 space-y-4">
        <h2 className={`text-lg font-semibold ${isRTL ? 'text-right' : 'text-left'}`}>{t.productDetails}</h2>
        <Separator />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* SKU */}
          {product.sku && (
            <div className={`flex items-center gap-3 ${isRTL ? 'justify-end' : 'justify-start'}`}>
              <span className="text-sm text-muted-foreground">
                {product.sku}
              </span>
              <Hash className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">{t.productCode}</span>
            </div>
          )}

          {/* Weight */}
          {product.weight && (
            <div className={`flex items-center gap-3 ${isRTL ? 'justify-end' : 'justify-start'}`}>
              <span className="text-sm text-muted-foreground">
                {product.weight} {t.grams}
              </span>
              <Weight className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">{t.weight}</span>
            </div>
          )}

          {/* Stock Status */}
          <div className={`flex items-center gap-3 ${isRTL ? 'justify-end' : 'justify-start'}`}>
            <span
              className={`text-sm ${
                isOutOfStock
                  ? 'text-red-500 font-semibold'
                  : 'text-emerald-600'
              }`}
            >
              {isOutOfStock ? t.outOfStock : t.availableStock.replace('{stock}', String(product.stock))}
            </span>
            <Package
              className={`w-4 h-4 ${
                isOutOfStock ? 'text-red-500' : 'text-emerald-600'
              }`}
            />
            <span className="text-sm font-medium">{t.stockStatus}</span>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="space-y-6">
          <h2 className={`text-xl font-semibold ${isRTL ? 'text-right' : 'text-left'}`}>{t.relatedProducts}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {relatedProducts.slice(0, 4).map((relatedProduct) => (
              <ProductCard key={relatedProduct.id} product={relatedProduct} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
