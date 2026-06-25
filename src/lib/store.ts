import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, PageName, Employee } from '@/types';
import type { Locale } from '@/lib/i18n';

interface StoreState {
  // Cart state
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;

  // UI state
  currentPage: PageName;
  setPage: (page: PageName) => void;
  selectedProductId: string | null;
  setSelectedProductId: (id: string | null) => void;

  // Search/filter state
  searchQuery: string;
  selectedCategory: string;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string) => void;

  // Admin state
  isAdmin: boolean;
  setAdmin: (isAdmin: boolean) => void;
  adminTab: string;
  setAdminTab: (tab: string) => void;

  // Employee state
  currentEmployee: Employee | null;
  setCurrentEmployee: (employee: Employee | null) => void;
  employeeRole: string;
  setEmployeeRole: (role: string) => void;

  // Language state
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      // Cart state
      items: [],

      addItem: (item: CartItem) => {
        const { items } = get();
        const existingItem = items.find((i) => i.productId === item.productId);

        if (existingItem) {
          set({
            items: items.map((i) =>
              i.productId === item.productId
                ? { ...i, quantity: i.quantity + item.quantity }
                : i
            ),
          });
        } else {
          set({ items: [...items, item] });
        }
      },

      removeItem: (productId: string) => {
        set({ items: get().items.filter((i) => i.productId !== productId) });
      },

      updateQuantity: (productId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set({
          items: get().items.map((i) =>
            i.productId === productId ? { ...i, quantity } : i
          ),
        });
      },

      clearCart: () => {
        set({ items: [] });
      },

      getTotal: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
      },

      // UI state
      currentPage: 'shop',

      setPage: (page: PageName) => {
        set({ currentPage: page });
      },

      selectedProductId: null,

      setSelectedProductId: (id: string | null) => {
        set({ selectedProductId: id });
      },

      // Search/filter state
      searchQuery: '',

      selectedCategory: '',

      setSearchQuery: (query: string) => {
        set({ searchQuery: query });
      },

      setSelectedCategory: (category: string) => {
        set({ selectedCategory: category });
      },

      // Admin state
      isAdmin: false,

      setAdmin: (isAdmin: boolean) => {
        set({ isAdmin });
      },

      adminTab: 'dashboard',

      setAdminTab: (tab: string) => {
        set({ adminTab: tab });
      },

      // Employee state
      currentEmployee: null,

      setCurrentEmployee: (employee: Employee | null) => {
        set({
          currentEmployee: employee,
          employeeRole: employee?.role || '',
        });
      },

      employeeRole: '',

      setEmployeeRole: (role: string) => {
        set({ employeeRole: role });
      },

      // Language state
      locale: 'ar',

      setLocale: (locale: Locale) => {
        set({ locale });
      },
    }),
    {
      name: 'ecommerce-store',
      partialize: (state) => ({
        items: state.items,
        isAdmin: state.isAdmin,
        currentPage: state.currentPage,
        selectedProductId: state.selectedProductId,
        selectedCategory: state.selectedCategory,
        adminTab: state.adminTab,
        currentEmployee: state.currentEmployee,
        employeeRole: state.employeeRole,
        locale: state.locale,
      }),
    }
  )
);
