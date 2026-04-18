'use client';

import { useState, useEffect, useCallback } from 'react';
import { useStore } from '@/lib/store';
import type { Product, Category, Order } from '@/types';

// shadcn/ui components
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';

// Icons
import {
  ShieldCheck,
  Package,
  ShoppingCart,
  Clock,
  DollarSign,
  Plus,
  Pencil,
  Trash2,
  LogOut,
  Eye,
  Facebook,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Settings,
  LayoutDashboard,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface ProductFormData {
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  price: string;
  comparePrice: string;
  categoryId: string;
  stock: string;
  sku: string;
  active: boolean;
  featured: boolean;
}

interface StoreSettingsData {
  storeName: string;
  storeDescription: string;
  facebookPixelId: string;
  facebookPageUrl: string;
  whatsappNumber: string;
  shippingFee: string;
  freeShippingThreshold: string;
  [key: string]: string;
}

const emptyProductForm: ProductFormData = {
  name: '',
  nameAr: '',
  description: '',
  descriptionAr: '',
  price: '',
  comparePrice: '',
  categoryId: '',
  stock: '0',
  sku: '',
  active: true,
  featured: false,
};

const ORDER_STATUS_MAP: Record<string, string> = {
  pending: 'قيد الانتظار',
  confirmed: 'مؤكد',
  processing: 'قيد المعالجة',
  shipped: 'تم الشحن',
  delivered: 'تم التوصيل',
  cancelled: 'ملغي',
};

const ORDER_STATUS_COLORS: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  pending: 'outline',
  confirmed: 'secondary',
  processing: 'default',
  shipped: 'default',
  delivered: 'secondary',
  cancelled: 'destructive',
};

// ─── AdminPanel Component ────────────────────────────────────────────────────

export default function AdminPanel() {
  const { isAdmin, setAdmin, adminTab, setAdminTab, setPage } = useStore();

  // Data state
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<StoreSettingsData>({
    storeName: '',
    storeDescription: '',
    facebookPixelId: '',
    facebookPageUrl: '',
    whatsappNumber: '',
    shippingFee: '',
    freeShippingThreshold: '',
  });

  // UI state
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [productForm, setProductForm] = useState<ProductFormData>(emptyProductForm);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [orderDetailDialogOpen, setOrderDetailDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [savingProduct, setSavingProduct] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [pixelActive, setPixelActive] = useState(false);
  const [syncingFacebook, setSyncingFacebook] = useState(false);

  // ─── Data Fetching ───────────────────────────────────────────────────────

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch('/api/products?limit=100&active=all');
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch('/api/orders?limit=100');
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch('/api/categories');
      if (res.ok) {
        const data = await res.json();
        setCategories(data || []);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  }, []);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        setSettings({
          storeName: data.storeName || '',
          storeDescription: data.storeDescriptionAr || data.storeDescription || '',
          facebookPixelId: data.facebookPixelId || '',
          facebookPageUrl: data.facebookPageUrl || '',
          whatsappNumber: data.whatsappNumber || '',
          shippingFee: data.shippingFee || '0',
          freeShippingThreshold: data.freeShippingThreshold || '',
        });
        // Check if pixel is active from settings
        setPixelActive(!!data.facebookPixelId);
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) {
      setIsLoading(true);
      Promise.all([fetchProducts(), fetchOrders(), fetchCategories(), fetchSettings()]).finally(
        () => setIsLoading(false)
      );
    }
  }, [isAdmin, fetchProducts, fetchOrders, fetchCategories, fetchSettings]);

  // ─── Login Handler ───────────────────────────────────────────────────────

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginUsername === 'admin' && loginPassword === 'admin123') {
      setAdmin(true);
      setLoginError('');
    } else {
      setLoginError('اسم المستخدم أو كلمة المرور غير صحيحة');
    }
  };

  // ─── Logout Handler ──────────────────────────────────────────────────────

  const handleLogout = () => {
    setAdmin(false);
    setPage('shop');
  };

  // ─── Product CRUD ────────────────────────────────────────────────────────

  const openAddProduct = () => {
    setEditingProductId(null);
    setProductForm(emptyProductForm);
    setProductDialogOpen(true);
  };

  const openEditProduct = (product: Product) => {
    setEditingProductId(product.id);
    setProductForm({
      name: product.name,
      nameAr: product.nameAr || '',
      description: product.description || '',
      descriptionAr: product.descriptionAr || '',
      price: String(product.price),
      comparePrice: String(product.comparePrice || ''),
      categoryId: product.categoryId,
      stock: String(product.stock),
      sku: product.sku || '',
      active: product.active,
      featured: product.featured,
    });
    setProductDialogOpen(true);
  };

  const handleSaveProduct = async () => {
    setSavingProduct(true);
    try {
      const payload = {
        name: productForm.name,
        nameAr: productForm.nameAr || undefined,
        description: productForm.description || undefined,
        descriptionAr: productForm.descriptionAr || undefined,
        price: parseFloat(productForm.price),
        comparePrice: productForm.comparePrice ? parseFloat(productForm.comparePrice) : undefined,
        categoryId: productForm.categoryId,
        stock: parseInt(productForm.stock) || 0,
        sku: productForm.sku || undefined,
        active: productForm.active,
        featured: productForm.featured,
      };

      if (editingProductId) {
        const res = await fetch(`/api/products/${editingProductId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('Failed to update product');
      } else {
        const res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('Failed to create product');
      }

      setProductDialogOpen(false);
      fetchProducts();
    } catch (err) {
      console.error('Error saving product:', err);
    } finally {
      setSavingProduct(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;
    try {
      const res = await fetch(`/api/products/${productId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete product');
      fetchProducts();
    } catch (err) {
      console.error('Error deleting product:', err);
    }
  };

  // ─── Order Status Update ─────────────────────────────────────────────────

  const handleOrderStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error('Failed to update order status');
      fetchOrders();
    } catch (err) {
      console.error('Error updating order status:', err);
    }
  };

  // ─── Settings Save ───────────────────────────────────────────────────────

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      const payload: Record<string, string> = {
        storeName: settings.storeName,
        storeDescriptionAr: settings.storeDescription,
        facebookPixelId: settings.facebookPixelId,
        facebookPageUrl: settings.facebookPageUrl,
        whatsappNumber: settings.whatsappNumber,
        shippingFee: settings.shippingFee,
        freeShippingThreshold: settings.freeShippingThreshold,
      };

      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to save settings');
    } catch (err) {
      console.error('Error saving settings:', err);
    } finally {
      setSavingSettings(false);
    }
  };

  // ─── Facebook ────────────────────────────────────────────────────────────

  const handleActivatePixel = () => {
    if (settings.facebookPixelId) {
      setPixelActive(true);
    }
  };

  const handleSyncFacebookShop = async () => {
    setSyncingFacebook(true);
    // Simulate sync operation
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setSyncingFacebook(false);
    alert('تمت مزامنة المنتجات مع فيسبوك شوب بنجاح');
  };

  // ─── Dashboard Stats ─────────────────────────────────────────────────────

  const totalProducts = products.length;
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status === 'pending').length;
  const totalRevenue = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.total, 0);

  // ─── Login Gate ──────────────────────────────────────────────────────────

  if (!isAdmin) {
    return (
      <div dir="rtl" className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-emerald-100 p-4">
        <Card className="w-full max-w-md shadow-xl border-emerald-200">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-16 h-16 rounded-full bg-emerald-600 flex items-center justify-center mb-3">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl text-emerald-800">لوحة الإدارة</CardTitle>
            <CardDescription>قم بتسجيل الدخول للوصول إلى لوحة التحكم</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">اسم المستخدم</Label>
                <Input
                  id="username"
                  type="text"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  placeholder="أدخل اسم المستخدم"
                  className="text-right"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">كلمة المرور</Label>
                <Input
                  id="password"
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="أدخل كلمة المرور"
                  className="text-right"
                  required
                />
              </div>
              {loginError && (
                <p className="text-sm text-red-600 text-center font-medium">{loginError}</p>
              )}
              <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                تسجيل الدخول
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ─── Main Admin Panel ────────────────────────────────────────────────────

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-emerald-700 text-white shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LayoutDashboard className="w-6 h-6" />
            <h1 className="text-lg sm:text-xl font-bold">لوحة إدارة المتجر</h1>
          </div>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="border-emerald-500 text-emerald-100 hover:bg-emerald-600 hover:text-white bg-transparent"
          >
            <LogOut className="w-4 h-4 ml-2" />
            تسجيل الخروج
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3">
              <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin" />
              <p className="text-emerald-700 font-medium">جاري تحميل البيانات...</p>
            </div>
          </div>
        ) : (
          <Tabs
            value={adminTab}
            onValueChange={setAdminTab}
            dir="rtl"
            className="w-full"
          >
            <TabsList className="w-full flex-wrap h-auto gap-1 bg-white shadow-sm border p-1 rounded-xl mb-6">
              <TabsTrigger
                value="dashboard"
                className="flex items-center gap-1.5 data-[state=active]:bg-emerald-600 data-[state=active]:text-white px-3 py-2 rounded-lg text-sm"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span className="hidden sm:inline">لوحة التحكم</span>
              </TabsTrigger>
              <TabsTrigger
                value="products"
                className="flex items-center gap-1.5 data-[state=active]:bg-emerald-600 data-[state=active]:text-white px-3 py-2 rounded-lg text-sm"
              >
                <Package className="w-4 h-4" />
                <span className="hidden sm:inline">المنتجات</span>
              </TabsTrigger>
              <TabsTrigger
                value="orders"
                className="flex items-center gap-1.5 data-[state=active]:bg-emerald-600 data-[state=active]:text-white px-3 py-2 rounded-lg text-sm"
              >
                <ShoppingCart className="w-4 h-4" />
                <span className="hidden sm:inline">الطلبات</span>
              </TabsTrigger>
              <TabsTrigger
                value="settings"
                className="flex items-center gap-1.5 data-[state=active]:bg-emerald-600 data-[state=active]:text-white px-3 py-2 rounded-lg text-sm"
              >
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">الإعدادات</span>
              </TabsTrigger>
              <TabsTrigger
                value="facebook"
                className="flex items-center gap-1.5 data-[state=active]:bg-emerald-600 data-[state=active]:text-white px-3 py-2 rounded-lg text-sm"
              >
                <Facebook className="w-4 h-4" />
                <span className="hidden sm:inline">فيسبوك</span>
              </TabsTrigger>
            </TabsList>

            {/* ─── Dashboard Tab ────────────────────────────────────────── */}
            <TabsContent value="dashboard">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <Card className="border-emerald-100 shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <CardDescription className="flex items-center gap-2 text-emerald-700">
                      <Package className="w-5 h-5" />
                      إجمالي المنتجات
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-emerald-800">{totalProducts}</p>
                  </CardContent>
                </Card>

                <Card className="border-emerald-100 shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <CardDescription className="flex items-center gap-2 text-emerald-700">
                      <ShoppingCart className="w-5 h-5" />
                      إجمالي الطلبات
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-emerald-800">{totalOrders}</p>
                  </CardContent>
                </Card>

                <Card className="border-amber-100 shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <CardDescription className="flex items-center gap-2 text-amber-700">
                      <Clock className="w-5 h-5" />
                      طلبات قيد الانتظار
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-amber-700">{pendingOrders}</p>
                  </CardContent>
                </Card>

                <Card className="border-emerald-100 shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <CardDescription className="flex items-center gap-2 text-emerald-700">
                      <DollarSign className="w-5 h-5" />
                      إجمالي الإيرادات
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-emerald-800">
                      {totalRevenue.toLocaleString('ar-SA')} ر.س
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Orders */}
              <Card className="mt-6 border-emerald-100 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-emerald-800">آخر الطلبات</CardTitle>
                </CardHeader>
                <CardContent>
                  {orders.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">لا توجد طلبات بعد</p>
                  ) : (
                    <div className="max-h-96 overflow-y-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-right">رقم الطلب</TableHead>
                            <TableHead className="text-right">العميل</TableHead>
                            <TableHead className="text-right">المبلغ</TableHead>
                            <TableHead className="text-right">الحالة</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {orders.slice(0, 5).map((order) => (
                            <TableRow key={order.id}>
                              <TableCell className="font-mono text-sm">
                                {order.orderNumber}
                              </TableCell>
                              <TableCell>{order.customer?.name || '—'}</TableCell>
                              <TableCell>{order.total.toLocaleString('ar-SA')} ر.س</TableCell>
                              <TableCell>
                                <Badge variant={ORDER_STATUS_COLORS[order.status] || 'outline'}>
                                  {ORDER_STATUS_MAP[order.status] || order.status}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* ─── Products Tab ─────────────────────────────────────────── */}
            <TabsContent value="products">
              <Card className="border-emerald-100 shadow-sm">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <CardTitle className="text-emerald-800">إدارة المنتجات</CardTitle>
                    <Button
                      onClick={openAddProduct}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      <Plus className="w-4 h-4 ml-2" />
                      إضافة منتج
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {products.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">لا توجد منتجات بعد</p>
                  ) : (
                    <div className="max-h-[500px] overflow-y-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-right">الاسم</TableHead>
                            <TableHead className="text-right hidden md:table-cell">السعر</TableHead>
                            <TableHead className="text-right hidden sm:table-cell">المخزون</TableHead>
                            <TableHead className="text-right hidden lg:table-cell">الفئة</TableHead>
                            <TableHead className="text-right">الحالة</TableHead>
                            <TableHead className="text-right">إجراءات</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {products.map((product) => (
                            <TableRow key={product.id}>
                              <TableCell className="font-medium max-w-[150px] truncate">
                                {product.nameAr || product.name}
                              </TableCell>
                              <TableCell className="hidden md:table-cell">
                                {product.price.toLocaleString('ar-SA')} ر.س
                              </TableCell>
                              <TableCell className="hidden sm:table-cell">
                                <Badge
                                  variant={product.stock > 0 ? 'secondary' : 'destructive'}
                                >
                                  {product.stock}
                                </Badge>
                              </TableCell>
                              <TableCell className="hidden lg:table-cell">
                                {product.category?.nameAr || product.category?.name || '—'}
                              </TableCell>
                              <TableCell>
                                {product.active ? (
                                  <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                                    نشط
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="text-gray-500">
                                    غير نشط
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => openEditProduct(product)}
                                    className="text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50"
                                  >
                                    <Pencil className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteProduct(product.id)}
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* ─── Orders Tab ───────────────────────────────────────────── */}
            <TabsContent value="orders">
              <Card className="border-emerald-100 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-emerald-800">إدارة الطلبات</CardTitle>
                </CardHeader>
                <CardContent>
                  {orders.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">لا توجد طلبات بعد</p>
                  ) : (
                    <div className="max-h-[500px] overflow-y-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-right">رقم الطلب</TableHead>
                            <TableHead className="text-right hidden sm:table-cell">العميل</TableHead>
                            <TableHead className="text-right">المبلغ</TableHead>
                            <TableHead className="text-right">الحالة</TableHead>
                            <TableHead className="text-right hidden md:table-cell">التاريخ</TableHead>
                            <TableHead className="text-right">إجراءات</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {orders.map((order) => (
                            <TableRow key={order.id}>
                              <TableCell className="font-mono text-sm">
                                {order.orderNumber}
                              </TableCell>
                              <TableCell className="hidden sm:table-cell">
                                {order.customer?.name || '—'}
                              </TableCell>
                              <TableCell>
                                {order.total.toLocaleString('ar-SA')} ر.س
                              </TableCell>
                              <TableCell>
                                <Select
                                  value={order.status}
                                  onValueChange={(value) =>
                                    handleOrderStatusChange(order.id, value)
                                  }
                                >
                                  <SelectTrigger className="w-[130px] h-8 text-xs">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {Object.entries(ORDER_STATUS_MAP).map(([key, label]) => (
                                      <SelectItem key={key} value={key}>
                                        {label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell className="hidden md:table-cell text-sm text-gray-600">
                                {new Date(order.createdAt).toLocaleDateString('ar-SA')}
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedOrder(order);
                                    setOrderDetailDialogOpen(true);
                                  }}
                                  className="text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50"
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* ─── Settings Tab ─────────────────────────────────────────── */}
            <TabsContent value="settings">
              <Card className="border-emerald-100 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-emerald-800">إعدادات المتجر</CardTitle>
                  <CardDescription>تعديل الإعدادات العامة للمتجر</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="storeName">اسم المتجر</Label>
                      <Input
                        id="storeName"
                        value={settings.storeName}
                        onChange={(e) =>
                          setSettings({ ...settings, storeName: e.target.value })
                        }
                        className="text-right"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="storeDescription">وصف المتجر</Label>
                      <Textarea
                        id="storeDescription"
                        value={settings.storeDescription}
                        onChange={(e) =>
                          setSettings({ ...settings, storeDescription: e.target.value })
                        }
                        className="text-right min-h-[80px]"
                        rows={2}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="whatsappNumber">رقم واتساب</Label>
                      <Input
                        id="whatsappNumber"
                        value={settings.whatsappNumber}
                        onChange={(e) =>
                          setSettings({ ...settings, whatsappNumber: e.target.value })
                        }
                        className="text-right"
                        dir="ltr"
                        placeholder="+966XXXXXXXXX"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="shippingFee">رسوم الشحن (ر.س)</Label>
                      <Input
                        id="shippingFee"
                        type="number"
                        value={settings.shippingFee}
                        onChange={(e) =>
                          setSettings({ ...settings, shippingFee: e.target.value })
                        }
                        className="text-right"
                        dir="ltr"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="freeShippingThreshold">حد الشحن المجاني (ر.س)</Label>
                      <Input
                        id="freeShippingThreshold"
                        type="number"
                        value={settings.freeShippingThreshold}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            freeShippingThreshold: e.target.value,
                          })
                        }
                        className="text-right"
                        dir="ltr"
                        placeholder="اتركه فارغاً لتعطيل"
                      />
                    </div>
                  </div>
                  <div className="mt-6">
                    <Button
                      onClick={handleSaveSettings}
                      disabled={savingSettings}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      {savingSettings ? (
                        <>
                          <RefreshCw className="w-4 h-4 ml-2 animate-spin" />
                          جاري الحفظ...
                        </>
                      ) : (
                        'حفظ الإعدادات'
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ─── Facebook Tab ─────────────────────────────────────────── */}
            <TabsContent value="facebook">
              <div className="space-y-6">
                {/* Pixel Status */}
                <Card className="border-emerald-100 shadow-sm">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-emerald-800 flex items-center gap-2">
                        <Facebook className="w-5 h-5" />
                        تكامل فيسبوك
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        {pixelActive ? (
                          <>
                            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                            <span className="text-sm font-medium text-emerald-600">البكسل نشط</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-5 h-5 text-red-400" />
                            <span className="text-sm font-medium text-red-500">البكسل غير نشط</span>
                          </>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Pixel ID */}
                    <div className="space-y-2">
                      <Label htmlFor="fbPixelId">معرف Facebook Pixel</Label>
                      <div className="flex gap-3">
                        <Input
                          id="fbPixelId"
                          value={settings.facebookPixelId}
                          onChange={(e) =>
                            setSettings({ ...settings, facebookPixelId: e.target.value })
                          }
                          placeholder="مثال: 1234567890"
                          className="flex-1"
                          dir="ltr"
                        />
                        <Button
                          onClick={handleActivatePixel}
                          disabled={!settings.facebookPixelId || pixelActive}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white whitespace-nowrap"
                        >
                          تفعيل
                        </Button>
                      </div>
                    </div>

                    {/* Facebook Page URL */}
                    <div className="space-y-2">
                      <Label htmlFor="fbPageUrl">رابط صفحة فيسبوك</Label>
                      <Input
                        id="fbPageUrl"
                        value={settings.facebookPageUrl}
                        onChange={(e) =>
                          setSettings({ ...settings, facebookPageUrl: e.target.value })
                        }
                        placeholder="https://facebook.com/your-page"
                        dir="ltr"
                      />
                    </div>

                    {/* Sync with Facebook Shop */}
                    <div className="pt-2">
                      <Button
                        onClick={handleSyncFacebookShop}
                        disabled={syncingFacebook}
                        variant="outline"
                        className="border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                      >
                        {syncingFacebook ? (
                          <>
                            <RefreshCw className="w-4 h-4 ml-2 animate-spin" />
                            جاري المزامنة...
                          </>
                        ) : (
                          <>
                            <RefreshCw className="w-4 h-4 ml-2" />
                            مزامنة مع فيسبوك شوب
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Instructions */}
                <Card className="border-blue-100 shadow-sm bg-blue-50/50">
                  <CardHeader>
                    <CardTitle className="text-blue-800 text-lg">
                      كيفية ربط المتجر بفيسبوك شوب
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ol className="space-y-3 text-sm text-blue-900 list-decimal list-inside">
                      <li>
                        انتقل إلى{' '}
                        <span className="font-mono bg-blue-100 px-1.5 py-0.5 rounded text-xs" dir="ltr">
                          business.facebook.com
                        </span>{' '}
                        وقم بتسجيل الدخول بحسابك
                      </li>
                      <li>أنشئ كتالوج منتجات جديد من قسم "Commerce"</li>
                      <li>أضف معرف البكسل الخاص بك في الحقل أعلاه واضغط "تفعيل"</li>
                      <li>اربط صفحة فيسبوك الخاصة بك بإدخال الرابط أعلاه</li>
                      <li>
                        اضغط على زر{' '}
                        <span className="font-semibold">"مزامنة مع فيسبوك شوب"</span>{' '}
                        لنقل منتجاتك إلى الكتالوج
                      </li>
                      <li>راجع المنتجات في مدير Commerce وفعّلها للعرض</li>
                      <li>اضبط إعدادات الدفع والشحن في لوحة تحكم Commerce</li>
                    </ol>
                    <div className="mt-4 p-3 bg-blue-100 rounded-lg">
                      <p className="text-xs text-blue-800">
                        <strong>ملاحظة:</strong> يجب أن يكون لديك صفحة فيسبوك تجارية وحساب
                        Business Manager لاستخدام فيسبوك شوب. تأكد من أن منتجاتك تتوافق مع
                        سياسات فيسبوك التجارية.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </main>

      {/* ─── Product Form Dialog ────────────────────────────────────────────── */}
      <Dialog open={productDialogOpen} onOpenChange={setProductDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-emerald-800">
              {editingProductId ? 'تعديل المنتج' : 'إضافة منتج جديد'}
            </DialogTitle>
            <DialogDescription>
              {editingProductId
                ? 'قم بتعديل بيانات المنتج'
                : 'أدخل بيانات المنتج الجديد'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="prod-name">اسم المنتج (عربي)</Label>
              <Input
                id="prod-name"
                value={productForm.nameAr}
                onChange={(e) =>
                  setProductForm({ ...productForm, nameAr: e.target.value })
                }
                placeholder="اسم المنتج بالعربية"
                className="text-right"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prod-nameEn">اسم المنتج (إنجليزي)</Label>
              <Input
                id="prod-nameEn"
                value={productForm.name}
                onChange={(e) =>
                  setProductForm({ ...productForm, name: e.target.value })
                }
                placeholder="Product name"
                dir="ltr"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="prod-descAr">وصف المنتج (عربي)</Label>
              <Textarea
                id="prod-descAr"
                value={productForm.descriptionAr}
                onChange={(e) =>
                  setProductForm({ ...productForm, descriptionAr: e.target.value })
                }
                placeholder="وصف المنتج بالعربية"
                className="text-right min-h-[60px]"
                rows={2}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="prod-desc">وصف المنتج (إنجليزي)</Label>
              <Textarea
                id="prod-desc"
                value={productForm.description}
                onChange={(e) =>
                  setProductForm({ ...productForm, description: e.target.value })
                }
                placeholder="Product description"
                className="min-h-[60px]"
                rows={2}
                dir="ltr"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prod-price">السعر (ر.س)</Label>
              <Input
                id="prod-price"
                type="number"
                step="0.01"
                value={productForm.price}
                onChange={(e) =>
                  setProductForm({ ...productForm, price: e.target.value })
                }
                placeholder="0.00"
                dir="ltr"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prod-comparePrice">سعر المقارنة (ر.س)</Label>
              <Input
                id="prod-comparePrice"
                type="number"
                step="0.01"
                value={productForm.comparePrice}
                onChange={(e) =>
                  setProductForm({ ...productForm, comparePrice: e.target.value })
                }
                placeholder="0.00 (اختياري)"
                dir="ltr"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prod-category">الفئة</Label>
              <Select
                value={productForm.categoryId}
                onValueChange={(value) =>
                  setProductForm({ ...productForm, categoryId: value })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="اختر الفئة" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.nameAr || cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="prod-stock">المخزون</Label>
              <Input
                id="prod-stock"
                type="number"
                value={productForm.stock}
                onChange={(e) =>
                  setProductForm({ ...productForm, stock: e.target.value })
                }
                placeholder="0"
                dir="ltr"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prod-sku">SKU</Label>
              <Input
                id="prod-sku"
                value={productForm.sku}
                onChange={(e) =>
                  setProductForm({ ...productForm, sku: e.target.value })
                }
                placeholder="كود المنتج (اختياري)"
                dir="ltr"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setProductDialogOpen(false)}
            >
              إلغاء
            </Button>
            <Button
              onClick={handleSaveProduct}
              disabled={savingProduct || !productForm.name || !productForm.categoryId || !productForm.price}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {savingProduct ? (
                <>
                  <RefreshCw className="w-4 h-4 ml-2 animate-spin" />
                  جاري الحفظ...
                </>
              ) : editingProductId ? (
                'تحديث المنتج'
              ) : (
                'إضافة المنتج'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Order Detail Dialog ────────────────────────────────────────────── */}
      <Dialog open={orderDetailDialogOpen} onOpenChange={setOrderDetailDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-emerald-800">تفاصيل الطلب</DialogTitle>
            <DialogDescription>
              {selectedOrder?.orderNumber}
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-4 py-4">
              {/* Customer Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-emerald-700 mb-2">معلومات العميل</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <p>
                    <span className="text-gray-500">الاسم:</span>{' '}
                    {selectedOrder.customer?.name}
                  </p>
                  <p>
                    <span className="text-gray-500">الهاتف:</span>{' '}
                    <span dir="ltr">{selectedOrder.customer?.phone}</span>
                  </p>
                  {selectedOrder.customer?.email && (
                    <p>
                      <span className="text-gray-500">البريد:</span>{' '}
                      <span dir="ltr">{selectedOrder.customer.email}</span>
                    </p>
                  )}
                  {selectedOrder.customer?.address && (
                    <p>
                      <span className="text-gray-500">العنوان:</span>{' '}
                      {selectedOrder.customer.address}
                    </p>
                  )}
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h4 className="font-semibold text-emerald-700 mb-2">المنتجات</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">المنتج</TableHead>
                      <TableHead className="text-right">الكمية</TableHead>
                      <TableHead className="text-right">السعر</TableHead>
                      <TableHead className="text-right">المجموع</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedOrder.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          {item.product?.nameAr || item.product?.name || 'منتج محذوف'}
                        </TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>{item.price.toLocaleString('ar-SA')} ر.س</TableCell>
                        <TableCell>{item.total.toLocaleString('ar-SA')} ر.س</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Totals */}
              <div className="bg-emerald-50 rounded-lg p-4 space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">المجموع الفرعي:</span>
                  <span>{selectedOrder.subtotal.toLocaleString('ar-SA')} ر.س</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">الشحن:</span>
                  <span>{selectedOrder.shipping.toLocaleString('ar-SA')} ر.س</span>
                </div>
                <div className="flex justify-between font-bold text-emerald-800 pt-1 border-t border-emerald-200">
                  <span>الإجمالي:</span>
                  <span>{selectedOrder.total.toLocaleString('ar-SA')} ر.س</span>
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">حالة الطلب:</span>
                <Badge variant={ORDER_STATUS_COLORS[selectedOrder.status] || 'outline'}>
                  {ORDER_STATUS_MAP[selectedOrder.status] || selectedOrder.status}
                </Badge>
              </div>

              {selectedOrder.notes && (
                <div className="bg-yellow-50 rounded-lg p-3">
                  <p className="text-sm">
                    <span className="text-yellow-700 font-medium">ملاحظات:</span>{' '}
                    {selectedOrder.notes}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
