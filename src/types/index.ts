export interface Product {
  id: string;
  name: string;
  nameAr?: string;
  description?: string;
  descriptionAr?: string;
  price: number;
  comparePrice?: number;
  images: string[];
  categoryId: string;
  category?: Category;
  stock: number;
  featured: boolean;
  active: boolean;
  sku?: string;
  weight?: number;
  facebookProductId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  nameAr?: string;
  icon?: string;
  image?: string;
  products?: Product[];
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  product?: Product;
  quantity: number;
  price: number;
  total: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customer?: Customer;
  items: OrderItem[];
  total: number;
  subtotal: number;
  shipping: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentMethod: 'cod' | 'card' | 'transfer';
  paymentStatus: 'unpaid' | 'paid';
  paidAt?: string | null;
  notes?: string;
  facebookLeadId?: string;
  employeeId?: string | null;
  employee?: Employee | null;
  confirmedByEmployeeId?: string | null;
  confirmedByEmployee?: Employee | null;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  notes?: string;
  orders?: Order[];
  createdAt: string;
  updatedAt: string;
}

export interface Employee {
  id: string;
  username: string;
  name: string;
  role: 'admin' | 'seller' | 'seller_plus';
  active: boolean;
  ordersCount?: number;
  confirmedOrdersCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface StoreSettings {
  storeName: string;
  storeNameAr?: string;
  storeDescription?: string;
  storeDescriptionAr?: string;
  currency: string;
  currencySymbol: string;
  shippingFee: number;
  freeShippingThreshold?: number;
  facebookPixelId?: string;
  facebookPageId?: string;
  contactEmail?: string;
  contactPhone?: string;
  whatsappNumber?: string;
  address?: string;
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
}

export type PageName =
  | 'shop'
  | 'cart'
  | 'checkout'
  | 'admin'
  | 'product-detail'
  | 'admin-products'
  | 'admin-orders'
  | 'admin-settings';
