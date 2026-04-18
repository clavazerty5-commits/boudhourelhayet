'use client';

import { useMemo, useEffect, useState } from 'react';
import { ShoppingCart, ArrowRight, Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useStore } from '@/lib/store';
import { formatPrice } from '@/lib/utils';
import { trackInitCheckout } from '@/lib/facebook';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

// Default shipping fee (will be overridden by settings if available)
const DEFAULT_SHIPPING_FEE = 500;
const FREE_SHIPPING_THRESHOLD = 5000;

export default function CartDrawer() {
  const { items, removeItem, updateQuantity, getTotal, setPage } = useStore();
  const [shippingFee, setShippingFee] = useState(DEFAULT_SHIPPING_FEE);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(FREE_SHIPPING_THRESHOLD);

  // Fetch settings for shipping fee
  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch('/api/settings');
        if (res.ok) {
          const settings = await res.json();
          if (settings.shippingFee) {
            setShippingFee(Number(settings.shippingFee));
          }
          if (settings.freeShippingThreshold) {
            setFreeShippingThreshold(Number(settings.freeShippingThreshold));
          }
        }
      } catch {
        // Use defaults on error
      }
    }
    fetchSettings();
  }, []);

  const subtotal = getTotal();
  const isFreeShipping = subtotal >= freeShippingThreshold;
  const shipping = isFreeShipping ? 0 : shippingFee;
  const total = subtotal + shipping;
  const itemCount = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);

  const handleCheckout = () => {
    trackInitCheckout({
      value: total,
      numItems: itemCount,
      contents: items.map((item) => ({
        id: item.productId,
        quantity: item.quantity,
        item_price: item.price,
      })),
    });
    setPage('checkout');
  };

  if (items.length === 0) {
    return (
      <div dir="rtl" className="min-h-screen bg-background">
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setPage('shop')}
              aria-label="العودة"
            >
              <ArrowRight className="size-5" />
            </Button>
            <h1 className="text-xl font-bold">سلة التسوق</h1>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-16 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
            <ShoppingCart className="size-10 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold mb-2">سلتك فارغة</h2>
          <p className="text-muted-foreground mb-8 max-w-sm">
            لم تقم بإضافة أي منتجات بعد. اكتشف منتجاتنا المميزة وأضفها إلى سلتك!
          </p>
          <Button
            size="lg"
            onClick={() => setPage('shop')}
            className="gap-2"
          >
            <ShoppingBag className="size-5" />
            تسوق الآن
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setPage('shop')}
            aria-label="العودة"
          >
            <ArrowRight className="size-5" />
          </Button>
          <h1 className="text-xl font-bold">سلة التسوق</h1>
          <span className="bg-primary text-primary-foreground text-xs font-medium px-2 py-0.5 rounded-full">
            {itemCount}
          </span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Cart Items */}
          <div className="flex-1 space-y-3">
            {items.map((item) => (
              <Card key={item.productId} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    {/* Image Placeholder */}
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg bg-muted flex-shrink-0 overflow-hidden">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingBag className="size-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    {/* Item Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-medium text-sm sm:text-base line-clamp-2 leading-snug">
                          {item.name}
                        </h3>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 text-muted-foreground hover:text-destructive flex-shrink-0"
                          onClick={() => removeItem(item.productId)}
                          aria-label={`حذف ${item.name}`}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>

                      <p className="text-primary font-bold mt-1">
                        {formatPrice(item.price)}
                      </p>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-1 mt-3">
                        <Button
                          variant="outline"
                          size="icon"
                          className="size-8"
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          aria-label="تقليل الكمية"
                        >
                          <Minus className="size-3" />
                        </Button>
                        <span className="w-10 text-center font-medium text-sm tabular-nums">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="size-8"
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          aria-label="زيادة الكمية"
                        >
                          <Plus className="size-3" />
                        </Button>
                        <span className="text-muted-foreground text-sm mr-2">
                          المجموع: {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:w-80 lg:flex-shrink-0">
            <Card className="sticky top-20">
              <CardContent className="p-6 space-y-4">
                <h2 className="font-bold text-lg">ملخص الطلب</h2>

                <Separator />

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">المجموع الفرعي</span>
                    <span className="font-medium">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">رسوم التوصيل</span>
                    <span className="font-medium">
                      {isFreeShipping ? (
                        <span className="text-green-600">مجاني</span>
                      ) : (
                        formatPrice(shipping)
                      )}
                    </span>
                  </div>
                  {!isFreeShipping && freeShippingThreshold > 0 && (
                    <p className="text-xs text-muted-foreground">
                      أضف منتجات بقيمة {formatPrice(freeShippingThreshold - subtotal)} للحصول على توصيل مجاني
                    </p>
                  )}
                </div>

                <Separator />

                <div className="flex justify-between font-bold text-lg">
                  <span>الإجمالي</span>
                  <span className="text-primary">{formatPrice(total)}</span>
                </div>

                <Button
                  className="w-full gap-2"
                  size="lg"
                  onClick={handleCheckout}
                >
                  إتمام الطلب
                </Button>

                <Button
                  variant="outline"
                  className="w-full gap-2"
                  size="lg"
                  onClick={() => setPage('shop')}
                >
                  <ShoppingBag className="size-4" />
                  متابعة التسوق
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
