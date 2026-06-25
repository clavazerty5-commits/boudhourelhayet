'use client';

import { useState, useEffect, useCallback } from 'react';
import { useStore } from '@/lib/store';
import { getTranslation, getDirection, getLocalizedName } from '@/lib/i18n';
import type { Product, Category, Order, Employee } from '@/types';

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
  Wallet,
  CircleDollarSign,
  Banknote,
  TrendingUp,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  Users,
  UserPlus,
  UserCog,
  Shield,
  UserCheck,
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

interface EmployeeFormData {
  name: string;
  username: string;
  password: string;
  role: string;
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

const emptyEmployeeForm: EmployeeFormData = {
  name: '',
  username: '',
  password: '',
  role: 'seller',
};

// ORDER_STATUS_MAP moved inside component for i18n

const ORDER_STATUS_COLORS: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  pending: 'outline',
  confirmed: 'secondary',
  processing: 'default',
  shipped: 'default',
  delivered: 'secondary',
  cancelled: 'destructive',
};

// ROLE_MAP moved inside component for i18n

const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-purple-100 text-purple-700 border-purple-200',
  seller: 'bg-blue-100 text-blue-700 border-blue-200',
  seller_plus: 'bg-emerald-100 text-emerald-700 border-emerald-200',
};

interface TreasuryData {
  todaySales: number;
  todayOrdersCount: number;
  yesterdaySales: number;
  totalTreasury: number;
  unpaidTotal: number;
  unpaidOrdersCount: number;
  dailyBreakdown: Array<{
    date: string;
    dateLabel: string;
    total: number;
    ordersCount: number;
    orders: Array<{
      id: string;
      orderNumber: string;
      total: number;
      customerName: string;
      paidAt: string | null;
      paymentMethod: string;
      confirmedByName: string | null;
    }>;
  }>;
  employeeSalesToday: Array<{
    id: string;
    name: string;
    role: string;
    confirmedToday: number;
    confirmedTodayTotal: number;
    createdToday: number;
    createdTodayTotal: number;
  }>;
}

// ─── Helper: Permission checks ─────────────────────────────────────────────

function canManageProducts(role: string): boolean {
  return role === 'admin' || role === 'seller_plus';
}

function canManageEmployees(role: string): boolean {
  return role === 'admin';
}

function canManageSettings(role: string): boolean {
  return role === 'admin';
}

function canManageFacebook(role: string): boolean {
  return role === 'admin';
}

function canConfirmPayment(role: string): boolean {
  return role === 'admin' || role === 'seller' || role === 'seller_plus';
}

// ─── AdminPanel Component ────────────────────────────────────────────────────

export default function AdminPanel() {
  const { isAdmin, setAdmin, adminTab, setAdminTab, setPage, currentEmployee, setCurrentEmployee } = useStore();
  const locale = useStore((s) => s.locale);
  const t = getTranslation(locale);
  const dir = getDirection(locale);
  const isRTL = dir === 'rtl';
  const numLocale = locale === 'ar' ? 'ar-TN' : 'fr-TN';

  // Locale-aware status/role maps
  const ORDER_STATUS_MAP: Record<string, string> = {
    pending: t.pendingStatus,
    confirmed: t.confirmed,
    processing: t.processing,
    shipped: t.shipped,
    delivered: t.delivered,
    cancelled: t.cancelled,
  };

  const ROLE_MAP: Record<string, string> = {
    admin: t.roleAdmin,
    seller: t.roleSeller,
    seller_plus: t.roleSellerPlus,
  };

  const getRoleLabel = (role: string) => ROLE_MAP[role] || role;

  // Data state
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
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
  const [loginLoading, setLoginLoading] = useState(false);
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
  const [treasury, setTreasury] = useState<TreasuryData | null>(null);
  const [expandedDay, setExpandedDay] = useState<string | null>(null);

  // Employee management state
  const [employeeDialogOpen, setEmployeeDialogOpen] = useState(false);
  const [employeeForm, setEmployeeForm] = useState<EmployeeFormData>(emptyEmployeeForm);
  const [editingEmployeeId, setEditingEmployeeId] = useState<string | null>(null);
  const [savingEmployee, setSavingEmployee] = useState(false);

  // Current user role for permissions
  const currentRole = currentEmployee?.role || 'admin';

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

  const fetchTreasury = useCallback(async () => {
    try {
      const res = await fetch('/api/treasury?days=30');
      if (res.ok) {
        const data = await res.json();
        setTreasury(data);
      }
    } catch (err) {
      console.error('Error fetching treasury:', err);
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
        setPixelActive(!!data.facebookPixelId);
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
    }
  }, []);

  const fetchEmployees = useCallback(async () => {
    try {
      const res = await fetch('/api/employees');
      if (res.ok) {
        const data = await res.json();
        setEmployees(data.employees || []);
      }
    } catch (err) {
      console.error('Error fetching employees:', err);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) {
      setIsLoading(true);
      const fetches = [fetchProducts(), fetchOrders(), fetchCategories(), fetchSettings(), fetchTreasury()];
      if (canManageEmployees(currentRole)) {
        fetches.push(fetchEmployees());
      }
      Promise.all(fetches).finally(() => setIsLoading(false));
    }
  }, [isAdmin, currentRole, fetchProducts, fetchOrders, fetchCategories, fetchSettings, fetchTreasury, fetchEmployees]);

  // ─── Login Handler ───────────────────────────────────────────────────────

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');
    try {
      const res = await fetch('/api/employees/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: loginUsername, password: loginPassword }),
      });
      if (res.ok) {
        const emp = await res.json();
        setAdmin(true);
        setCurrentEmployee({
          id: emp.id,
          username: emp.username,
          name: emp.name,
          role: emp.role,
          active: emp.active,
          createdAt: emp.createdAt || new Date().toISOString(),
          updatedAt: emp.updatedAt || new Date().toISOString(),
        });
        setLoginError('');
      } else {
        const data = await res.json();
        setLoginError(data.error || t.wrongCredentials);
      }
    } catch {
      setLoginError(t.connectionError);
    } finally {
      setLoginLoading(false);
    }
  };

  // ─── Logout Handler ──────────────────────────────────────────────────────

  const handleLogout = () => {
    setAdmin(false);
    setCurrentEmployee(null);
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
    if (!confirm(t.confirmDeleteProduct)) return;
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

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm(t.confirmDeleteOrder)) return;
    try {
      const res = await fetch(`/api/orders/${orderId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete order');
      fetchOrders();
      fetchTreasury();
    } catch (err) {
      console.error('Error deleting order:', err);
    }
  };

  const handleConfirmPayment = async (orderId: string) => {
    if (!confirm(t.confirmPaymentMsg)) return;
    try {
      const payload: Record<string, unknown> = { paymentStatus: 'paid' };
      // Record which employee confirmed payment
      if (currentEmployee && currentEmployee.id !== 'admin') {
        payload.confirmedByEmployeeId = currentEmployee.id;
      }
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to confirm payment');
      fetchOrders();
      fetchTreasury();
    } catch (err) {
      console.error('Error confirming payment:', err);
    }
  };

  // ─── Employee CRUD ───────────────────────────────────────────────────────

  const openAddEmployee = () => {
    setEditingEmployeeId(null);
    setEmployeeForm(emptyEmployeeForm);
    setEmployeeDialogOpen(true);
  };

  const openEditEmployee = (emp: Employee) => {
    setEditingEmployeeId(emp.id);
    setEmployeeForm({
      name: emp.name,
      username: emp.username,
      password: '',
      role: emp.role,
    });
    setEmployeeDialogOpen(true);
  };

  const handleSaveEmployee = async () => {
    setSavingEmployee(true);
    try {
      if (editingEmployeeId) {
        const payload: Record<string, unknown> = {
          name: employeeForm.name,
          role: employeeForm.role,
        };
        if (employeeForm.password && employeeForm.password.length >= 4) {
          payload.password = employeeForm.password;
        }
        const res = await fetch(`/api/employees/${editingEmployeeId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('Failed to update employee');
      } else {
        const res = await fetch('/api/employees', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(employeeForm),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Failed to create employee');
        }
      }
      setEmployeeDialogOpen(false);
      fetchEmployees();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t.errorOccurred;
      alert(msg);
    } finally {
      setSavingEmployee(false);
    }
  };

  const handleDeleteEmployee = async (empId: string) => {
    if (!confirm(t.confirmDeleteEmployee)) return;
    try {
      const res = await fetch(`/api/employees/${empId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete employee');
      fetchEmployees();
    } catch (err) {
      console.error('Error deleting employee:', err);
    }
  };

  const handleToggleEmployeeActive = async (empId: string, active: boolean) => {
    try {
      const res = await fetch(`/api/employees/${empId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !active }),
      });
      if (!res.ok) throw new Error('Failed to toggle employee status');
      fetchEmployees();
    } catch (err) {
      console.error('Error toggling employee status:', err);
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
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setSyncingFacebook(false);
    alert(t.syncSuccess);
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
      <div dir={dir} className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-emerald-100 p-4">
        <Card className="w-full max-w-md shadow-xl border-emerald-200">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-16 h-16 rounded-full bg-emerald-600 flex items-center justify-center mb-3">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl text-emerald-800">{t.adminTitle}</CardTitle>
            <CardDescription>{t.loginToAccess}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">{t.username}</Label>
                <Input
                  id="username"
                  type="text"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  placeholder={t.enterUsername}
                  className={isRTL ? "text-right" : "text-left"}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">{t.password}</Label>
                <Input
                  id="password"
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder={t.enterPassword}
                  className={isRTL ? "text-right" : "text-left"}
                  required
                />
              </div>
              {loginError && (
                <p className="text-sm text-red-600 text-center font-medium">{loginError}</p>
              )}
              <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" disabled={loginLoading}>
                {loginLoading ? (
                  <>
                    <RefreshCw className={`w-4 h-4 ${isRTL ? "ml-2" : "mr-2"} animate-spin`} />
                    {t.loggingIn}
                  </>
                ) : (
                  t.login
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ─── Main Admin Panel ────────────────────────────────────────────────────

  return (
    <div dir={dir} className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-emerald-700 text-white shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LayoutDashboard className="w-6 h-6" />
            <h1 className="text-lg sm:text-xl font-bold">{t.storeAdminPanel}</h1>
          </div>
          <div className="flex items-center gap-3">
            {/* Current user badge */}
            <div className="hidden sm:flex items-center gap-2 bg-emerald-600 rounded-lg px-3 py-1.5">
              <UserCheck className="w-4 h-4" />
              <span className="text-sm font-medium">{currentEmployee?.name || t.generalManager}</span>
              <Badge className="bg-emerald-500 text-white border-0 text-[10px] px-1.5 py-0">
                {getRoleLabel(currentRole)}
              </Badge>
            </div>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="border-emerald-500 text-emerald-100 hover:bg-emerald-600 hover:text-white bg-transparent"
            >
              <LogOut className={`w-4 h-4 ${isRTL ? "ml-2" : "mr-2"}`} />
              {t.logout}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3">
              <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin" />
              <p className="text-emerald-700 font-medium">{t.loadingData}</p>
            </div>
          </div>
        ) : (
          <Tabs
            value={adminTab}
            onValueChange={setAdminTab}
            dir={dir}
            className="w-full"
          >
            <TabsList className="w-full flex-wrap h-auto gap-1 bg-white shadow-sm border p-1 rounded-xl mb-6">
              <TabsTrigger
                value="dashboard"
                className="flex items-center gap-1.5 data-[state=active]:bg-emerald-600 data-[state=active]:text-white px-3 py-2 rounded-lg text-sm"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span className="hidden sm:inline">{t.dashboard}</span>
              </TabsTrigger>
              {canManageProducts(currentRole) && (
                <TabsTrigger
                  value="products"
                  className="flex items-center gap-1.5 data-[state=active]:bg-emerald-600 data-[state=active]:text-white px-3 py-2 rounded-lg text-sm"
                >
                  <Package className="w-4 h-4" />
                  <span className="hidden sm:inline">{t.productsTab}</span>
                </TabsTrigger>
              )}
              <TabsTrigger
                value="orders"
                className="flex items-center gap-1.5 data-[state=active]:bg-emerald-600 data-[state=active]:text-white px-3 py-2 rounded-lg text-sm"
              >
                <ShoppingCart className="w-4 h-4" />
                <span className="hidden sm:inline">{t.ordersTab}</span>
              </TabsTrigger>
              {canManageEmployees(currentRole) && (
                <TabsTrigger
                  value="employees"
                  className="flex items-center gap-1.5 data-[state=active]:bg-emerald-600 data-[state=active]:text-white px-3 py-2 rounded-lg text-sm"
                >
                  <Users className="w-4 h-4" />
                  <span className="hidden sm:inline">{t.employeesTab}</span>
                </TabsTrigger>
              )}
              <TabsTrigger
                value="treasury"
                className="flex items-center gap-1.5 data-[state=active]:bg-emerald-600 data-[state=active]:text-white px-3 py-2 rounded-lg text-sm"
              >
                <Wallet className="w-4 h-4" />
                <span className="hidden sm:inline">{t.treasuryTab}</span>
              </TabsTrigger>
              {canManageSettings(currentRole) && (
                <TabsTrigger
                  value="settings"
                  className="flex items-center gap-1.5 data-[state=active]:bg-emerald-600 data-[state=active]:text-white px-3 py-2 rounded-lg text-sm"
                >
                  <Settings className="w-4 h-4" />
                  <span className="hidden sm:inline">{t.settingsTab}</span>
                </TabsTrigger>
              )}
              {canManageFacebook(currentRole) && (
                <TabsTrigger
                  value="facebook"
                  className="flex items-center gap-1.5 data-[state=active]:bg-emerald-600 data-[state=active]:text-white px-3 py-2 rounded-lg text-sm"
                >
                  <Facebook className="w-4 h-4" />
                  <span className="hidden sm:inline">{t.facebookTab}</span>
                </TabsTrigger>
              )}
            </TabsList>

            {/* ─── Dashboard Tab ────────────────────────────────────────── */}
            <TabsContent value="dashboard">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <Card className="border-emerald-100 shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <CardDescription className="flex items-center gap-2 text-emerald-700">
                      <Package className="w-5 h-5" />
                      {t.totalProducts}
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
                      {t.totalOrders}
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
                      {t.pendingOrders}
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
                      {t.totalRevenue}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-emerald-800">
                      {totalRevenue.toLocaleString(numLocale)} {t.currency}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Current employee info card */}
              {currentEmployee && currentEmployee.id !== 'admin' && (
                <Card className="mt-6 border-blue-100 shadow-sm bg-gradient-to-r from-blue-50 to-indigo-50">
                  <CardHeader>
                    <CardTitle className="text-blue-800 flex items-center gap-2">
                      <UserCheck className="w-5 h-5" />
                      {t.employeeInfo}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap items-center gap-4">
                      <div>
                        <span className="text-sm text-blue-600">{t.name}</span>
                        <span className="font-bold text-blue-800 mr-2">{currentEmployee.name}</span>
                      </div>
                      <div>
                        <span className="text-sm text-blue-600">{t.permission}</span>
                        <Badge className={ROLE_COLORS[currentRole] || ''}>
                          {getRoleLabel(currentRole)}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Recent Orders */}
              <Card className="mt-6 border-emerald-100 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-emerald-800">{t.recentOrders}</CardTitle>
                </CardHeader>
                <CardContent>
                  {orders.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">{t.noOrdersYet}</p>
                  ) : (
                    <div className="max-h-96 overflow-y-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className={isRTL ? "text-right" : "text-left"}>{t.orderNum}</TableHead>
                            <TableHead className={isRTL ? "text-right" : "text-left"}>{t.customer}</TableHead>
                            <TableHead className={isRTL ? "text-right" : "text-left"}>{t.amount}</TableHead>
                            <TableHead className={isRTL ? "text-right" : "text-left"}>{t.status}</TableHead>
                            {canManageEmployees(currentRole) && (
                              <TableHead className="text-right hidden md:table-cell">{t.employee}</TableHead>
                            )}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {orders.slice(0, 5).map((order) => (
                            <TableRow key={order.id}>
                              <TableCell className="font-mono text-sm">
                                {order.orderNumber}
                              </TableCell>
                              <TableCell>{order.customer?.name || '—'}</TableCell>
                              <TableCell>{order.total.toLocaleString(numLocale)} {t.currency}</TableCell>
                              <TableCell>
                                <Badge variant={ORDER_STATUS_COLORS[order.status] || 'outline'}>
                                  {ORDER_STATUS_MAP[order.status] || order.status}
                                </Badge>
                              </TableCell>
                              {canManageEmployees(currentRole) && (
                                <TableCell className="hidden md:table-cell text-sm text-gray-600">
                                  {order.employee?.name || '—'}
                                </TableCell>
                              )}
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
            {canManageProducts(currentRole) && (
              <TabsContent value="products">
                <Card className="border-emerald-100 shadow-sm">
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <CardTitle className="text-emerald-800">{t.manageProducts}</CardTitle>
                      {canManageProducts(currentRole) && (
                        <Button
                          onClick={openAddProduct}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          <Plus className={`w-4 h-4 ${isRTL ? "ml-2" : "mr-2"}`} />
                          {t.addProduct}
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {products.length === 0 ? (
                      <p className="text-center text-gray-500 py-8">{t.noProductsYet}</p>
                    ) : (
                      <div className="max-h-[500px] overflow-y-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className={isRTL ? "text-right" : "text-left"}>{t.itemName}</TableHead>
                              <TableHead className="text-right hidden md:table-cell">{t.price}</TableHead>
                              <TableHead className="text-right hidden sm:table-cell">{t.stock}</TableHead>
                              <TableHead className="text-right hidden lg:table-cell">{t.category}</TableHead>
                              <TableHead className={isRTL ? "text-right" : "text-left"}>{t.status}</TableHead>
                              <TableHead className={isRTL ? "text-right" : "text-left"}>{t.actions}</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {products.map((product) => (
                              <TableRow key={product.id}>
                                <TableCell className="font-medium max-w-[150px] truncate">
                                  {getLocalizedName(product, locale)}
                                </TableCell>
                                <TableCell className="hidden md:table-cell">
                                  {product.price.toLocaleString(numLocale)} {t.currency}
                                </TableCell>
                                <TableCell className="hidden sm:table-cell">
                                  <Badge
                                    variant={product.stock > 0 ? 'secondary' : 'destructive'}
                                  >
                                    {product.stock}
                                  </Badge>
                                </TableCell>
                                <TableCell className="hidden lg:table-cell">
                                  {product.category ? getLocalizedName(product.category, locale) : '—'}
                                </TableCell>
                                <TableCell>
                                  {product.active ? (
                                    <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                                      {t.active}
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline" className="text-gray-500">
                                      {t.inactive}
                                    </Badge>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-1">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => openEditProduct(product)}
                                      className="text-emerald-600 border-emerald-200 hover:bg-emerald-50 hover:text-emerald-800 gap-1"
                                    >
                                      <Pencil className="w-3.5 h-3.5" />
                                      <span className="hidden sm:inline text-xs">{t.edit}</span>
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleDeleteProduct(product.id)}
                                      className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-700 gap-1"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                      <span className="hidden sm:inline text-xs">{t.delete}</span>
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
            )}

            {/* ─── Orders Tab ───────────────────────────────────────────── */}
            <TabsContent value="orders">
              <Card className="border-emerald-100 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-emerald-800">{t.manageOrders}</CardTitle>
                </CardHeader>
                <CardContent>
                  {orders.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">{t.noOrdersYet}</p>
                  ) : (
                    <div className="max-h-[500px] overflow-y-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className={isRTL ? "text-right" : "text-left"}>{t.orderNum}</TableHead>
                            <TableHead className="text-right hidden sm:table-cell">{t.customer}</TableHead>
                            <TableHead className={isRTL ? "text-right" : "text-left"}>{t.amount}</TableHead>
                            <TableHead className={isRTL ? "text-right" : "text-left"}>{t.status}</TableHead>
                            <TableHead className={isRTL ? "text-right" : "text-left"}>{t.paymentLabel}</TableHead>
                            {canManageEmployees(currentRole) && (
                              <TableHead className="text-right hidden lg:table-cell">{t.employee}</TableHead>
                            )}
                            <TableHead className="text-right hidden md:table-cell">{t.dateLabel}</TableHead>
                            <TableHead className={isRTL ? "text-right" : "text-left"}>{t.actions}</TableHead>
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
                                {order.total.toLocaleString(numLocale)} {t.currency}
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
                              <TableCell>
                                {order.paymentStatus === 'paid' ? (
                                  <Badge className="bg-green-100 text-green-700 border-green-200 gap-1">
                                    <CheckCircle2 className="w-3 h-3" />
                                    {t.paid}
                                  </Badge>
                                ) : canConfirmPayment(currentRole) ? (
                                  <Button
                                    size="sm"
                                    onClick={() => handleConfirmPayment(order.id)}
                                    className="bg-amber-500 hover:bg-amber-600 text-white gap-1 h-7 text-xs"
                                  >
                                    <CircleDollarSign className="w-3.5 h-3.5" />
                                    {t.confirmPayment}
                                  </Button>
                                ) : (
                                  <Badge variant="outline" className="text-amber-600">
                                    {t.unpaid}
                                  </Badge>
                                )}
                              </TableCell>
                              {canManageEmployees(currentRole) && (
                                <TableCell className="hidden lg:table-cell text-sm text-gray-600">
                                  {order.employee?.name || '—'}
                                </TableCell>
                              )}
                              <TableCell className="hidden md:table-cell text-sm text-gray-600">
                                {new Date(order.createdAt).toLocaleDateString('ar-TN')}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedOrder(order);
                                      setOrderDetailDialogOpen(true);
                                    }}
                                    className="text-emerald-600 border-emerald-200 hover:bg-emerald-50 hover:text-emerald-800 gap-1"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                    <span className="hidden sm:inline text-xs">{t.viewLabel}</span>
                                  </Button>
                                  {canManageEmployees(currentRole) && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleDeleteOrder(order.id)}
                                      className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-700 gap-1"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                      <span className="hidden sm:inline text-xs">{t.delete}</span>
                                    </Button>
                                  )}
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

            {/* ─── Employees Tab ────────────────────────────────────────── */}
            {canManageEmployees(currentRole) && (
              <TabsContent value="employees">
                <div className="space-y-6">
                  {/* Employee Management */}
                  <Card className="border-emerald-100 shadow-sm">
                    <CardHeader>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <CardTitle className="text-emerald-800 flex items-center gap-2">
                          <Users className="w-5 h-5" />
                          {t.manageEmployees}
                        </CardTitle>
                        <Button
                          onClick={openAddEmployee}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          <UserPlus className={`w-4 h-4 ${isRTL ? "ml-2" : "mr-2"}`} />
                          {t.addEmployee}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {employees.length === 0 ? (
                        <div className="text-center py-12">
                          <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                          <p className="text-gray-500">{t.noEmployeesYet}</p>
                          <p className="text-gray-400 text-sm mt-1">{t.addEmployeesDesc}</p>
                        </div>
                      ) : (
                        <div className="max-h-[400px] overflow-y-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className={isRTL ? "text-right" : "text-left"}>{t.itemName}</TableHead>
                                <TableHead className={isRTL ? "text-right" : "text-left"}>{t.username}</TableHead>
                                <TableHead className={isRTL ? "text-right" : "text-left"}>{t.employeeRole}</TableHead>
                                <TableHead className="text-right hidden sm:table-cell">{t.ordersLabel}</TableHead>
                                <TableHead className={isRTL ? "text-right" : "text-left"}>{t.status}</TableHead>
                                <TableHead className={isRTL ? "text-right" : "text-left"}>{t.actions}</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {employees.map((emp) => (
                                <TableRow key={emp.id}>
                                  <TableCell className="font-medium">{emp.name}</TableCell>
                                  <TableCell className="text-gray-500 font-mono text-sm">{emp.username}</TableCell>
                                  <TableCell>
                                    <Badge className={ROLE_COLORS[emp.role] || ''}>
                                      {getRoleLabel(emp.role)}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="hidden sm:table-cell">
                                    <span className="text-sm text-gray-600">{emp.ordersCount || 0}</span>
                                  </TableCell>
                                  <TableCell>
                                    {emp.active ? (
                                      <Badge className="bg-green-100 text-green-700 border-green-200">{t.active}</Badge>
                                    ) : (
                                      <Badge variant="outline" className="text-gray-500">{t.disabledStatus}</Badge>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-1">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => openEditEmployee(emp)}
                                        className="text-emerald-600 border-emerald-200 hover:bg-emerald-50 gap-1"
                                      >
                                        <Pencil className="w-3.5 h-3.5" />
                                        <span className="hidden sm:inline text-xs">{t.edit}</span>
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleToggleEmployeeActive(emp.id, emp.active)}
                                        className={`gap-1 ${emp.active ? 'text-amber-500 border-amber-200 hover:bg-amber-50' : 'text-green-500 border-green-200 hover:bg-green-50'}`}
                                      >
                                        {emp.active ? (
                                          <>
                                            <XCircle className="w-3.5 h-3.5" />
                                            <span className="hidden sm:inline text-xs">{t.deactivateBtn}</span>
                                          </>
                                        ) : (
                                          <>
                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                            <span className="hidden sm:inline text-xs">{t.activateBtn}</span>
                                          </>
                                        )}
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleDeleteEmployee(emp.id)}
                                        className="text-red-500 border-red-200 hover:bg-red-50 gap-1"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
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

                  {/* Role Descriptions */}
                  <Card className="border-blue-100 shadow-sm bg-blue-50/50">
                    <CardHeader>
                      <CardTitle className="text-blue-800 flex items-center gap-2">
                        <Shield className="w-5 h-5" />
                        {t.permissionExplanation}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-white rounded-lg border border-purple-100">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={ROLE_COLORS.admin}>{t.roleAdmin}</Badge>
                          </div>
                          <ul className="text-sm text-gray-600 space-y-1">
                            <li>- {t.allPermissions}</li>
                            <li>- {t.manageEmployeesPermission}</li>
                            <li>- {t.addEditDeleteProducts}</li>
                            <li>- {t.confirmPaymentManageOrders}</li>
                            <li>- {t.settingsAndFacebook}</li>
                          </ul>
                        </div>
                        <div className="p-4 bg-white rounded-lg border border-emerald-100">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={ROLE_COLORS.seller_plus}>{t.roleSellerPlus}</Badge>
                          </div>
                          <ul className="text-sm text-gray-600 space-y-1">
                            <li>- {t.addEditDeleteProducts}</li>
                            <li>- {t.confirmPaymentManageOrders}</li>
                            <li>- {t.viewTreasury}</li>
                            <li>- {t.cannotManageEmployees}</li>
                          </ul>
                        </div>
                        <div className="p-4 bg-white rounded-lg border border-blue-100">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={ROLE_COLORS.seller}>{t.roleSeller}</Badge>
                          </div>
                          <ul className="text-sm text-gray-600 space-y-1">
                            <li>- {t.confirmPaymentOnly}</li>
                            <li>- {t.viewOrdersChangeStatus}</li>
                            <li>- {t.viewTreasury}</li>
                            <li>- {t.cannotAddProducts}</li>
                            <li>- {t.cannotManageEmployees}</li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            )}

            {/* ─── Treasury Tab ─────────────────────────────────────────── */}
            <TabsContent value="treasury">
              {treasury ? (
                <div className="space-y-6">
                  {/* Treasury Summary Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    <Card className="border-green-100 shadow-sm hover:shadow-md transition-shadow bg-gradient-to-br from-green-50 to-emerald-50">
                      <CardHeader className="pb-2">
                        <CardDescription className="flex items-center gap-2 text-green-700">
                          <Banknote className="w-5 h-5" />
                          {t.todaySales}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-3xl font-bold text-green-800">
                          {treasury.todaySales.toLocaleString(numLocale, { minimumFractionDigits: 3 })} {t.currency}
                        </p>
                        <p className="text-xs text-green-600 mt-1">
                          {t.paidOrderCount.replace('{count}', String(treasury.todayOrdersCount))}
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="border-blue-100 shadow-sm hover:shadow-md transition-shadow bg-gradient-to-br from-blue-50 to-indigo-50">
                      <CardHeader className="pb-2">
                        <CardDescription className="flex items-center gap-2 text-blue-700">
                          <TrendingUp className="w-5 h-5" />
                          {t.yesterdaySales}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-3xl font-bold text-blue-800">
                          {treasury.yesterdaySales.toLocaleString(numLocale, { minimumFractionDigits: 3 })} {t.currency}
                        </p>
                        <p className="text-xs text-blue-600 mt-1">{t.forComparison}</p>
                      </CardContent>
                    </Card>

                    <Card className="border-emerald-100 shadow-sm hover:shadow-md transition-shadow bg-gradient-to-br from-emerald-50 to-teal-50">
                      <CardHeader className="pb-2">
                        <CardDescription className="flex items-center gap-2 text-emerald-700">
                          <Wallet className="w-5 h-5" />
                          {t.totalTreasury}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-3xl font-bold text-emerald-800">
                          {treasury.totalTreasury.toLocaleString(numLocale, { minimumFractionDigits: 3 })} {t.currency}
                        </p>
                        <p className="text-xs text-emerald-600 mt-1">{t.allPayments}</p>
                      </CardContent>
                    </Card>

                    <Card className="border-amber-100 shadow-sm hover:shadow-md transition-shadow bg-gradient-to-br from-amber-50 to-yellow-50">
                      <CardHeader className="pb-2">
                        <CardDescription className="flex items-center gap-2 text-amber-700">
                          <Clock className="w-5 h-5" />
                          {t.awaitingPayment}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-3xl font-bold text-amber-700">
                          {treasury.unpaidTotal.toLocaleString(numLocale, { minimumFractionDigits: 3 })} {t.currency}
                        </p>
                        <p className="text-xs text-amber-600 mt-1">
                          {t.unpaidOrderCount.replace('{count}', String(treasury.unpaidOrdersCount))}
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Employee Sales Today */}
                  {canManageEmployees(currentRole) && treasury.employeeSalesToday && treasury.employeeSalesToday.length > 0 && (
                    <Card className="border-indigo-100 shadow-sm">
                      <CardHeader>
                        <CardTitle className="text-indigo-800 flex items-center gap-2">
                          <UserCog className="w-5 h-5" />
                          {t.employeeSalesToday}
                        </CardTitle>
                        <CardDescription>
                          {t.trackEmployeeSalesDesc}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="max-h-[300px] overflow-y-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className={isRTL ? "text-right" : "text-left"}>{t.employee}</TableHead>
                                <TableHead className={isRTL ? "text-right" : "text-left"}>{t.employeeRole}</TableHead>
                                <TableHead className={isRTL ? "text-right" : "text-left"}>{t.ordersCreated}</TableHead>
                                <TableHead className={isRTL ? "text-right" : "text-left"}>{t.totalCreated}</TableHead>
                                <TableHead className={isRTL ? "text-right" : "text-left"}>{t.paymentsConfirmed}</TableHead>
                                <TableHead className={isRTL ? "text-right" : "text-left"}>{t.totalConfirmedPayments}</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {treasury.employeeSalesToday.map((emp) => (
                                <TableRow key={emp.id}>
                                  <TableCell className="font-medium">{emp.name}</TableCell>
                                  <TableCell>
                                    <Badge className={ROLE_COLORS[emp.role] || ''}>
                                      {getRoleLabel(emp.role)}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>{emp.createdToday}</TableCell>
                                  <TableCell className="font-medium">
                                    {emp.createdTodayTotal.toLocaleString(numLocale, { minimumFractionDigits: 3 })} {t.currency}
                                  </TableCell>
                                  <TableCell>{emp.confirmedToday}</TableCell>
                                  <TableCell className="font-medium text-green-700">
                                    {emp.confirmedTodayTotal.toLocaleString(numLocale, { minimumFractionDigits: 3 })} {t.currency}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Daily Breakdown */}
                  <Card className="border-emerald-100 shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-emerald-800 flex items-center gap-2">
                        <CalendarDays className="w-5 h-5" />
                        {t.dailySalesLast30}
                      </CardTitle>
                      <CardDescription>
                        {t.clickDayForPaymentDetails}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {treasury.dailyBreakdown.map((day) => (
                          <div key={day.date} className="border rounded-lg overflow-hidden">
                            <button
                              onClick={() => setExpandedDay(expandedDay === day.date ? null : day.date)}
                              className="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-3 h-3 rounded-full ${day.total > 0 ? 'bg-green-500' : 'bg-gray-300'}`} />
                                <span className="font-medium text-sm text-gray-700">{day.dateLabel}</span>
                              </div>
                              <div className="flex items-center gap-3">
                                {day.ordersCount > 0 && (
                                  <Badge variant="secondary" className="text-xs">
                                    {day.ordersCount} {t.orderSingular}
                                  </Badge>
                                )}
                                <span className={`font-bold text-sm ${day.total > 0 ? 'text-green-700' : 'text-gray-400'}`}>
                                  {day.total.toLocaleString(numLocale, { minimumFractionDigits: 3 })} {t.currency}
                                </span>
                                {expandedDay === day.date ? (
                                  <ChevronUp className="w-4 h-4 text-gray-400" />
                                ) : (
                                  <ChevronDown className="w-4 h-4 text-gray-400" />
                                )}
                              </div>
                            </button>
                            {expandedDay === day.date && day.orders.length > 0 && (
                              <div className="border-t bg-gray-50 p-3">
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead className={`${isRTL ? "text-right" : "text-left"} text-xs`}>{t.orderNum}</TableHead>
                                      <TableHead className={`${isRTL ? "text-right" : "text-left"} text-xs`}>{t.customer}</TableHead>
                                      <TableHead className={`${isRTL ? "text-right" : "text-left"} text-xs`}>{t.amount}</TableHead>
                                      <TableHead className={`${isRTL ? "text-right" : "text-left"} text-xs`}>{t.paymentMethodCol}</TableHead>
                                      <TableHead className={`${isRTL ? "text-right" : "text-left"} text-xs`}>{t.paymentTime}</TableHead>
                                      {canManageEmployees(currentRole) && (
                                        <TableHead className={`${isRTL ? "text-right" : "text-left"} text-xs`}>{t.confirmedBy}</TableHead>
                                      )}
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {day.orders.map((o) => (
                                      <TableRow key={o.id}>
                                        <TableCell className="font-mono text-xs">{o.orderNumber}</TableCell>
                                        <TableCell className="text-xs">{o.customerName}</TableCell>
                                        <TableCell className="text-xs font-medium">{o.total.toLocaleString(numLocale, { minimumFractionDigits: 3 })} {t.currency}</TableCell>
                                        <TableCell className="text-xs">{o.paymentMethod === 'cod' ? t.cashOnDeliveryShort : t.bankTransferShort}</TableCell>
                                        <TableCell className="text-xs text-gray-500">
                                          {o.paidAt ? new Date(o.paidAt).toLocaleTimeString(numLocale, { hour: '2-digit', minute: '2-digit' }) : '—'}
                                        </TableCell>
                                        {canManageEmployees(currentRole) && (
                                          <TableCell className="text-xs text-gray-500">
                                            {o.confirmedByName || '—'}
                                          </TableCell>
                                        )}
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </div>
                            )}
                            {expandedDay === day.date && day.orders.length === 0 && (
                              <div className="border-t bg-gray-50 p-3 text-center text-gray-400 text-sm">
                                {t.noPaymentsThisDay}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="flex items-center justify-center py-20">
                  <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin" />
                </div>
              )}
            </TabsContent>

            {/* ─── Settings Tab ─────────────────────────────────────────── */}
            {canManageSettings(currentRole) && (
              <TabsContent value="settings">
                <Card className="border-emerald-100 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-emerald-800">{t.storeSettings}</CardTitle>
                    <CardDescription>{t.editStoreSettingsDesc}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="storeName">{t.storeNameLabel}</Label>
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
                        <Label htmlFor="storeDescription">{t.storeDescriptionLabel}</Label>
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
                        <Label htmlFor="whatsappNumber">{t.whatsappNumber}</Label>
                        <Input
                          id="whatsappNumber"
                          value={settings.whatsappNumber}
                          onChange={(e) =>
                            setSettings({ ...settings, whatsappNumber: e.target.value })
                          }
                          className="text-right"
                          dir="ltr"
                          placeholder="+216XXXXXXXX"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="shippingFee">{t.shippingFeeLabel}</Label>
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
                        <Label htmlFor="freeShippingThreshold">{t.freeShippingLabel}</Label>
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
                            {t.saving}
                          </>
                        ) : (
                          'حفظ الإعدادات'
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            {/* ─── Facebook Tab ─────────────────────────────────────────── */}
            {canManageFacebook(currentRole) && (
              <TabsContent value="facebook">
                <div className="space-y-6">
                  <Card className="border-emerald-100 shadow-sm">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-emerald-800 flex items-center gap-2">
                          <Facebook className="w-5 h-5" />
                          {t.facebookIntegration}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          {pixelActive ? (
                            <>
                              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                              <span className="text-sm font-medium text-emerald-600">{t.pixelActiveLabel}</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-5 h-5 text-red-400" />
                              <span className="text-sm font-medium text-red-500">{t.pixelInactiveLabel}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="fbPixelId">{t.facebookPixelId}</Label>
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
                            {t.activateBtn}
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="fbPageUrl">{t.facebookPageUrl}</Label>
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
                              {t.syncing}
                            </>
                          ) : (
                            <>
                              <RefreshCw className="w-4 h-4 ml-2" />
                              {t.syncShop}
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-blue-100 shadow-sm bg-blue-50/50">
                    <CardHeader>
                      <CardTitle className="text-blue-800 text-lg">
                        {t.howToConnectFbShop}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ol className="space-y-3 text-sm text-blue-900 list-decimal list-inside">
                        <li>
                          {t.fbStep1}{' '}
                          <span className="font-mono bg-blue-100 px-1.5 py-0.5 rounded text-xs" dir="ltr">
                            business.facebook.com
                          </span>{' '}
                          {t.fbStep1Link}
                        </li>
                        <li>{t.fbStep2}</li>
                        <li>{t.fbStep3}</li>
                        <li>{t.fbStep4}</li>
                        <li>{t.fbStep5}</li>
                      </ol>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            )}
          </Tabs>
        )}
      </main>

      {/* ─── Product Form Dialog ────────────────────────────────────────────── */}
      <Dialog open={productDialogOpen} onOpenChange={setProductDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir={dir}>
          <DialogHeader>
            <DialogTitle className="text-emerald-800">
              {editingProductId ? t.editProduct : t.addNewProduct}
            </DialogTitle>
            <DialogDescription>
              {editingProductId
                ? t.editProductDesc
                : t.addNewProductDesc}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="prod-name">{t.productNameAr}</Label>
              <Input
                id="prod-name"
                value={productForm.nameAr}
                onChange={(e) =>
                  setProductForm({ ...productForm, nameAr: e.target.value })
                }
                placeholder={t.productNameAr}
                className={isRTL ? "text-right" : "text-left"}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prod-nameEn">{t.productName}</Label>
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
              <Label htmlFor="prod-descAr">{t.productDescriptionAr}</Label>
              <Textarea
                id="prod-descAr"
                value={productForm.descriptionAr}
                onChange={(e) =>
                  setProductForm({ ...productForm, descriptionAr: e.target.value })
                }
                placeholder={t.productDescriptionAr}
                className={`${isRTL ? "text-right" : "text-left"} min-h-[60px]`}
                rows={2}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="prod-desc">{t.productDescription}</Label>
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
              <Label htmlFor="prod-price">{t.price}</Label>
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
              <Label htmlFor="prod-comparePrice">{t.comparePrice}</Label>
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
              <Label htmlFor="prod-category">{t.category}</Label>
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
              <Label htmlFor="prod-stock">{t.stock}</Label>
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
                placeholder={t.sku}
                dir="ltr"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setProductDialogOpen(false)}
            >
              {t.cancel}
            </Button>
            <Button
              onClick={handleSaveProduct}
              disabled={savingProduct || !productForm.name || !productForm.categoryId || !productForm.price}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {savingProduct ? (
                <>
                  <RefreshCw className={`w-4 h-4 ${isRTL ? "ml-2" : "mr-2"} animate-spin`} />
                  {t.saving}
                </>
              ) : editingProductId ? (
                t.updateProduct
              ) : (
                t.addProductBtn
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Employee Form Dialog ──────────────────────────────────────────── */}
      <Dialog open={employeeDialogOpen} onOpenChange={setEmployeeDialogOpen}>
        <DialogContent className="max-w-md" dir={dir}>
          <DialogHeader>
            <DialogTitle className="text-emerald-800">
              {editingEmployeeId ? t.editEmployeeTitle : t.addNewEmployee}
            </DialogTitle>
            <DialogDescription>
              {editingEmployeeId
                ? t.editEmployeeDesc
                : t.addNewEmployeeDesc}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="emp-name">{t.employeeName}</Label>
              <Input
                id="emp-name"
                value={employeeForm.name}
                onChange={(e) =>
                  setEmployeeForm({ ...employeeForm, name: e.target.value })
                }
                placeholder={t.fullNamePlaceholder}
                className={isRTL ? "text-right" : "text-left"}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emp-username">{t.username}</Label>
              <Input
                id="emp-username"
                value={employeeForm.username}
                onChange={(e) =>
                  setEmployeeForm({ ...employeeForm, username: e.target.value })
                }
                placeholder={t.usernameLoginPlaceholder}
                dir="ltr"
                disabled={!!editingEmployeeId}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emp-password">
                {editingEmployeeId ? t.newPasswordLabel : t.password}
              </Label>
              <Input
                id="emp-password"
                type="password"
                value={employeeForm.password}
                onChange={(e) =>
                  setEmployeeForm({ ...employeeForm, password: e.target.value })
                }
                placeholder={editingEmployeeId ? t.leaveEmptyNoChange : t.passwordMinChars}
                dir="ltr"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emp-role">{t.employeeRole}</Label>
              <Select
                value={employeeForm.role}
                onValueChange={(value) =>
                  setEmployeeForm({ ...employeeForm, role: value })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="اختر الصلاحية" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="seller">{t.sellerOnlyDesc}</SelectItem>
                  <SelectItem value="seller_plus">{t.roleSellerPlus}</SelectItem>
                  <SelectItem value="admin">{t.adminAllPermissions}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEmployeeDialogOpen(false)}
            >
              {t.cancel}
            </Button>
            <Button
              onClick={handleSaveEmployee}
              disabled={savingEmployee || !employeeForm.name || (!editingEmployeeId && (!employeeForm.username || !employeeForm.password))}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {savingEmployee ? (
                <>
                  <RefreshCw className={`w-4 h-4 ${isRTL ? "ml-2" : "mr-2"} animate-spin`} />
                  {t.saving}
                </>
              ) : editingEmployeeId ? (
                t.updateEmployee
              ) : (
                t.addEmployeeBtn
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Order Detail Dialog ────────────────────────────────────────────── */}
      <Dialog open={orderDetailDialogOpen} onOpenChange={setOrderDetailDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir={dir}>
          <DialogHeader>
            <DialogTitle className="text-emerald-800">{t.orderDetails}</DialogTitle>
            <DialogDescription>
              {t.orderNum} {selectedOrder?.orderNumber}
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">{t.customer}</p>
                  <p className="font-medium">{selectedOrder.customer?.name || '—'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">{t.phoneNumber}</p>
                  <p className="font-medium" dir="ltr">{selectedOrder.customer?.phone || '—'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">{t.city}</p>
                  <p className="font-medium">{selectedOrder.customer?.city || '—'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">{t.total}</p>
                  <p className="font-bold text-emerald-700">
                    {selectedOrder.total.toLocaleString(numLocale)} {t.currency}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">{t.orderStatus}</p>
                  <Badge variant={ORDER_STATUS_COLORS[selectedOrder.status] || 'outline'}>
                    {ORDER_STATUS_MAP[selectedOrder.status] || selectedOrder.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-500">{t.paymentMethodLabel}</p>
                  {selectedOrder.paymentStatus === 'paid' ? (
                    <Badge className="bg-green-100 text-green-700 border-green-200">{t.paid}</Badge>
                  ) : (
                    <Badge variant="outline" className="text-amber-600">{t.unpaid}</Badge>
                  )}
                </div>
                {canManageEmployees(currentRole) && selectedOrder.employee && (
                  <div>
                    <p className="text-sm text-gray-500">{t.employee}</p>
                    <p className="font-medium">{selectedOrder.employee.name}</p>
                  </div>
                )}
                {canManageEmployees(currentRole) && selectedOrder.confirmedByEmployee && (
                  <div>
                    <p className="text-sm text-gray-500">{t.confirmedBy}</p>
                    <p className="font-medium">{selectedOrder.confirmedByEmployee.name}</p>
                  </div>
                )}
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">{t.productsTab}</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className={isRTL ? "text-right" : "text-left"}>{t.itemName}</TableHead>
                      <TableHead className={isRTL ? "text-right" : "text-left"}>{t.quantity}</TableHead>
                      <TableHead className={isRTL ? "text-right" : "text-left"}>{t.price}</TableHead>
                      <TableHead className={isRTL ? "text-right" : "text-left"}>{t.total}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedOrder.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          {item.product?.nameAr || item.product?.name || '—'}
                        </TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>{item.price.toLocaleString(numLocale)} {t.currency}</TableCell>
                        <TableCell className="font-medium">
                          {item.total.toLocaleString(numLocale)} {t.currency}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
