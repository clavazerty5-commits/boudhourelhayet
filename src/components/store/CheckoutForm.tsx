'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  ArrowRight,
  CheckCircle,
  Loader2,
  ShoppingBag,
  Share2,
  Truck,
  Building2,
} from 'lucide-react';
import { useStore } from '@/lib/store';
import { formatPrice } from '@/lib/utils';
import { trackPurchase, shareOnFacebook } from '@/lib/facebook';
import { getTranslation, getDirection, GOVERNORATE_KEYS } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

// Default shipping fee (TND)
const DEFAULT_SHIPPING_FEE = 8;
const FREE_SHIPPING_THRESHOLD = 80;

interface FormData {
  name: string;
  phone: string;
  email: string;
  city: string;
  address: string;
  notes: string;
  paymentMethod: 'cod' | 'transfer';
}

interface FormErrors {
  name?: string;
  phone?: string;
  city?: string;
  address?: string;
}

export default function CheckoutForm() {
  const { items, getTotal, clearCart, setPage } = useStore();
  const locale = useStore((s) => s.locale);
  const t = getTranslation(locale);
  const dir = getDirection(locale);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [shippingFee, setShippingFee] = useState(DEFAULT_SHIPPING_FEE);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(FREE_SHIPPING_THRESHOLD);

  const [formData, setFormData] = useState<FormData>({
    name: '',
    phone: '',
    email: '',
    city: '',
    address: '',
    notes: '',
    paymentMethod: 'cod',
  });

  const [errors, setErrors] = useState<FormErrors>({});

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
        // Use defaults
      }
    }
    fetchSettings();
  }, []);

  const subtotal = getTotal();
  const isFreeShipping = subtotal >= freeShippingThreshold;
  const shipping = isFreeShipping ? 0 : shippingFee;
  const total = subtotal + shipping;
  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = t.nameRequired;
    }

    if (!formData.phone.trim()) {
      newErrors.phone = t.phoneRequired;
    } else if (!/^[0-9+\-\s()]{8,15}$/.test(formData.phone.trim())) {
      newErrors.phone = t.phoneInvalid;
    }

    if (!formData.city) {
      newErrors.city = t.cityRequired;
    }

    if (!formData.address.trim()) {
      newErrors.address = t.addressRequired;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (items.length === 0) {
      toast.error(t.cartEmpty);
      return;
    }

    if (!validateForm()) {
      toast.error(t.fillRequired);
      return;
    }

    setIsSubmitting(true);

    try {
      const orderData = {
        customer: {
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          city: formData.city,
          address: formData.address,
          notes: formData.notes,
        },
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        shipping,
        paymentMethod: formData.paymentMethod,
        notes: formData.notes,
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || t.orderFailed);
      }

      const order = await res.json();

      // Track purchase with Facebook Pixel
      trackPurchase({
        orderId: order.orderNumber,
        value: total,
        numItems: itemCount,
        contents: items.map((item) => ({
          id: item.productId,
          quantity: item.quantity,
          item_price: item.price,
        })),
      });

      setOrderNumber(order.orderNumber);
      setOrderConfirmed(true);
      clearCart();
      toast.success(t.orderConfirmedSuccess);
    } catch (error) {
      const message = error instanceof Error ? error.message : t.orderError;
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleShareOnFacebook = () => {
    shareOnFacebook(
      window.location.href,
      `${t.orderedFromStore} ${orderNumber}`
    );
  };

  // Order Confirmation View
  if (orderConfirmed) {
    return (
      <div dir={dir} className="min-h-screen bg-background">
        <div className="max-w-2xl mx-auto px-4 py-16">
          <div className="text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto">
              <CheckCircle className="size-10 text-green-600" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold">{t.orderConfirmed}</h1>
              <p className="text-muted-foreground">
                {t.orderConfirmedDesc}
              </p>
            </div>

            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">{t.orderNumber}</span>
                  <span className="font-bold text-lg font-mono">{orderNumber}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">{t.orderStatus}</span>
                  <span className="text-sm bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full font-medium">
                    {t.pendingStatus}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">{t.paymentMethodLabel}</span>
                  <span className="font-medium">
                    {formData.paymentMethod === 'cod'
                      ? t.cashOnDelivery
                      : t.bankTransfer}
                  </span>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
              <Button
                variant="outline"
                className="gap-2"
                onClick={handleShareOnFacebook}
              >
                <Share2 className="size-4" />
                {t.shareOnFacebook}
              </Button>
              <Button
                className="gap-2"
                onClick={() => setPage('shop')}
              >
                <ShoppingBag className="size-4" />
                {t.continueShopping}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Redirect to shop if cart is empty
  if (items.length === 0) {
    return (
      <div dir={dir} className="min-h-screen bg-background">
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="size-10 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold mb-2">{t.yourCartIsEmpty}</h2>
          <p className="text-muted-foreground mb-8">
            {t.noProductsInCart}
          </p>
          <Button onClick={() => setPage('shop')} className="gap-2">
            <ShoppingBag className="size-4" />
            {t.shopNowBtn}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div dir={dir} className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setPage('cart')}
            aria-label={t.backToCart}
          >
            <ArrowRight className="size-5" />
          </Button>
          <h1 className="text-xl font-bold">{t.completeOrder}</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Form Fields */}
          <div className="flex-1 space-y-6">
            {/* Customer Information */}
            <Card>
              <CardContent className="p-6 space-y-5">
                <h2 className="font-bold text-lg">{t.customerInfo}</h2>

                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">
                    {t.fullName} <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder={t.enterFullName}
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    aria-invalid={!!errors.name}
                    className={errors.name ? 'border-destructive' : ''}
                  />
                  {errors.name && (
                    <p className="text-destructive text-sm">{errors.name}</p>
                  )}
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label htmlFor="phone">
                    {t.phoneNumber} <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="0xxxxxxxxx"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    dir="ltr"
                    className={`text-left ${errors.phone ? 'border-destructive' : ''}`}
                    aria-invalid={!!errors.phone}
                  />
                  {errors.phone && (
                    <p className="text-destructive text-sm">{errors.phone}</p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">{t.emailAddress}</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="example@email.com"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    dir="ltr"
                    className="text-left"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Delivery Information */}
            <Card>
              <CardContent className="p-6 space-y-5">
                <h2 className="font-bold text-lg">{t.deliveryInfo}</h2>

                {/* City */}
                <div className="space-y-2">
                  <Label htmlFor="city">
                    {t.city} <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.city}
                    onValueChange={(value) => handleChange('city', value)}
                  >
                    <SelectTrigger
                      className={`w-full ${errors.city ? 'border-destructive' : ''}`}
                      aria-invalid={!!errors.city}
                    >
                      <SelectValue placeholder={t.chooseCity} />
                    </SelectTrigger>
                    <SelectContent>
                      {GOVERNORATE_KEYS.map((key) => (
                        <SelectItem key={key} value={key}>
                          {t.governorates[key]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.city && (
                    <p className="text-destructive text-sm">{errors.city}</p>
                  )}
                </div>

                {/* Address */}
                <div className="space-y-2">
                  <Label htmlFor="address">
                    {t.address} <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="address"
                    placeholder={t.enterAddressDetail}
                    value={formData.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                    className={errors.address ? 'border-destructive' : ''}
                    aria-invalid={!!errors.address}
                    rows={3}
                  />
                  {errors.address && (
                    <p className="text-destructive text-sm">{errors.address}</p>
                  )}
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes">{t.notes}</Label>
                  <Textarea
                    id="notes"
                    placeholder={t.additionalNotes}
                    value={formData.notes}
                    onChange={(e) => handleChange('notes', e.target.value)}
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardContent className="p-6 space-y-5">
                <h2 className="font-bold text-lg">{t.paymentMethod}</h2>

                <RadioGroup
                  value={formData.paymentMethod}
                  onValueChange={(value) =>
                    handleChange('paymentMethod', value)
                  }
                  className="space-y-3"
                >
                  <div className="flex items-center gap-3 p-4 rounded-lg border bg-background hover:bg-accent/50 transition-colors cursor-pointer">
                    <RadioGroupItem value="cod" id="cod" />
                    <label
                      htmlFor="cod"
                      className="flex items-center gap-3 cursor-pointer flex-1"
                    >
                      <Truck className="size-5 text-primary" />
                      <div>
                        <p className="font-medium">{t.cashOnDelivery}</p>
                        <p className="text-sm text-muted-foreground">
                          {t.codDesc}
                        </p>
                      </div>
                    </label>
                  </div>

                  <div className="flex items-center gap-3 p-4 rounded-lg border bg-background hover:bg-accent/50 transition-colors cursor-pointer">
                    <RadioGroupItem value="transfer" id="transfer" />
                    <label
                      htmlFor="transfer"
                      className="flex items-center gap-3 cursor-pointer flex-1"
                    >
                      <Building2 className="size-5 text-primary" />
                      <div>
                        <p className="font-medium">{t.bankTransfer}</p>
                        <p className="text-sm text-muted-foreground">
                          {t.transferDesc}
                        </p>
                      </div>
                    </label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:w-80 lg:flex-shrink-0">
            <Card className="sticky top-20">
              <CardContent className="p-6 space-y-4">
                <h2 className="font-bold text-lg">{t.orderSummary}</h2>

                <Separator />

                {/* Items List */}
                <div className="space-y-3 max-h-64 overflow-y-auto scrollbar-thin">
                  {items.map((item) => (
                    <div key={item.productId} className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-md bg-muted flex-shrink-0 overflow-hidden">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingBag className="size-4 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium line-clamp-1">
                          {item.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          ×{item.quantity} - {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t.subtotal}</span>
                    <span className="font-medium">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t.deliveryFee}</span>
                    <span className="font-medium">
                      {isFreeShipping ? (
                        <span className="text-green-600">{t.free}</span>
                      ) : (
                        formatPrice(shipping)
                      )}
                    </span>
                  </div>
                  {!isFreeShipping && freeShippingThreshold > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {t.addMoreForFreeShipping.replace('{amount}', formatPrice(freeShippingThreshold - subtotal))}
                    </p>
                  )}
                </div>

                <Separator />

                <div className="flex justify-between font-bold text-lg">
                  <span>{t.total}</span>
                  <span className="text-primary">{formatPrice(total)}</span>
                </div>

                <Button
                  type="submit"
                  className="w-full gap-2"
                  size="lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      {t.submitting}
                    </>
                  ) : (
                    t.confirmOrder
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
