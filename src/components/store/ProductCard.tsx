'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import { useStore } from '@/lib/store';
import { trackAddToCart } from '@/lib/facebook';
import { formatPrice } from '@/lib/utils';
import type { Product } from '@/types';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const addItem = useStore((s) => s.addItem);
  const setSelectedProductId = useStore((s) => s.setSelectedProductId);
  const setPage = useStore((s) => s.setPage);

  const discountPercentage =
    product.comparePrice && product.comparePrice > product.price
      ? Math.round(
          ((product.comparePrice - product.price) / product.comparePrice) * 100
        )
      : null;

  const initials =
    product.nameAr?.slice(0, 2) ?? product.name.slice(0, 2).toUpperCase();

  const isOutOfStock = product.stock === 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock) return;

    addItem({
      productId: product.id,
      name: product.nameAr ?? product.name,
      price: product.price,
      quantity: 1,
      image: product.images?.[0] ?? '',
    });

    trackAddToCart({
      id: product.id,
      name: product.nameAr ?? product.name,
      price: product.price,
      quantity: 1,
      category: product.category?.nameAr ?? product.category?.name,
    });
  };

  const handleCardClick = () => {
    setSelectedProductId(product.id);
    setPage('product-detail');
  };

  return (
    <Card
      onClick={handleCardClick}
      className="cursor-pointer group overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-border/50 py-0 gap-0"
    >
      {/* Product Image */}
      <div className="relative">
        {product.images && product.images.length > 0 && product.images[0] ? (
          <img
            src={product.images[0]}
            alt={product.nameAr ?? product.name}
            className="w-full aspect-square object-cover"
          />
        ) : (
          <div
            className="w-full aspect-square flex items-center justify-center text-3xl font-bold text-white/80"
            style={{
              background: `linear-gradient(135deg, hsl(${(product.name.charCodeAt(0) * 37) % 360}, 60%, 55%), hsl(${(product.name.charCodeAt(0) * 37 + 60) % 360}, 70%, 45%))`,
            }}
          >
            {initials}
          </div>
        )}

        {/* Discount Badge */}
        {discountPercentage && (
          <Badge className="absolute top-2 start-2 bg-red-500 text-white border-none text-xs font-bold">
            خصم {discountPercentage}%
          </Badge>
        )}

        {/* Out of Stock Badge */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <Badge className="bg-gray-800 text-white border-none text-sm">
              نفذ المخزون
            </Badge>
          </div>
        )}
      </div>

      <CardContent className="p-4 space-y-3">
        {/* Product Name */}
        <h3 className="font-semibold text-sm line-clamp-2 text-right leading-relaxed min-h-[2.5rem]">
          {product.nameAr ?? product.name}
        </h3>

        {/* Price Section */}
        <div className="flex items-end gap-2 justify-end">
          {product.comparePrice && (
            <span className="text-xs text-muted-foreground line-through">
              {formatPrice(product.comparePrice)}
            </span>
          )}
          <span className="text-lg font-bold text-emerald-600">
            {formatPrice(product.price)}
          </span>
        </div>

        {/* Add to Cart Button */}
        <Button
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
          size="sm"
        >
          <ShoppingCart className="w-4 h-4 ml-1" />
          أضف للسلة
        </Button>
      </CardContent>
    </Card>
  );
}
