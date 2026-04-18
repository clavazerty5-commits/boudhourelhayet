# Task 5d: Admin Panel Component

## Summary
Created the AdminPanel component (`/src/components/store/AdminPanel.tsx`) — a comprehensive admin dashboard with login gate, 5 tabbed sections, product CRUD dialog, order detail dialog, RTL Arabic layout, emerald color accents, and responsive design.

## Key Files
- `/src/components/store/AdminPanel.tsx` — Main admin panel component

## Features Implemented
1. **Admin Login Gate** — Hardcoded credentials admin/admin123, sets isAdmin in Zustand store
2. **Dashboard Tab** — 4 summary cards (products, orders, pending, revenue) + recent orders table
3. **Products Tab** — Full CRUD table with add/edit dialog and delete with confirmation
4. **Orders Tab** — Orders table with status dropdown, order detail dialog
5. **Settings Tab** — Store settings form (name, description, WhatsApp, shipping fee, free shipping threshold)
6. **Facebook Tab** — Pixel ID, page URL, sync button, pixel status indicator, setup instructions in Arabic
7. **Product Form Dialog** — Add/edit with Arabic/English name/description, price, compare price, category dropdown, stock, SKU
8. **Order Detail Dialog** — Customer info, items table, totals, status, notes
9. **Logout button** — Sets isAdmin to false, navigates to shop page

## Design
- RTL layout with `dir="rtl"`
- Emerald color theme (emerald-600/700 buttons, emerald-100 borders, emerald-800 headers)
- Responsive with hidden columns on mobile
- Uses shadcn/ui: Tabs, Card, Table, Dialog, Input, Label, Select, Button, Badge, Textarea

## Testing
- Lint: passing with no errors
- Dev server: compiling successfully
