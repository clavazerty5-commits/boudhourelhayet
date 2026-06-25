# Task 4-state: Zustand Store and Utility Files

## Summary
Created all Zustand store and utility files for the e-commerce frontend, including type definitions, state management, utility functions, and Facebook Pixel integration.

## Files Created/Modified

### 1. `/src/types/index.ts` (Created)
- **Product** interface: Aligned with Prisma schema (id, name, nameAr, description, descriptionAr, price, comparePrice, images as string[], categoryId, category, stock, featured, active, sku, weight, facebookProductId, timestamps)
- **Category** interface: id, name, nameAr, icon, image, products, timestamps
- **CartItem** interface: productId, name, price, quantity, image
- **OrderItem** interface: id, orderId, productId, product, quantity, price, total
- **Order** interface: id, orderNumber, customerId, customer, items, total, subtotal, shipping, status (union type), paymentMethod (union type), notes, facebookLeadId, timestamps
- **Customer** interface: id, name, email, phone, address, city, notes, orders, timestamps
- **StoreSettings** interface: Comprehensive settings including storeName, currency, shipping, social links, etc.
- **PageName** type: Union of all valid page names

### 2. `/src/lib/store.ts` (Created)
- **Cart state & actions**:
  - `items: CartItem[]` - cart items array
  - `addItem(item)` - adds item or increments quantity if exists
  - `removeItem(productId)` - removes item by product ID
  - `updateQuantity(productId, quantity)` - updates quantity (removes if <= 0)
  - `clearCart()` - empties the cart
  - `getTotal()` - returns calculated total price
- **UI state & actions**:
  - `currentPage: PageName` - current page (defaults to 'shop')
  - `setPage(page)` - navigate to page
  - `selectedProductId: string | null` - selected product for detail view
  - `setSelectedProductId(id)` - set selected product
- **Search/filter state & actions**:
  - `searchQuery: string` - current search query
  - `selectedCategory: string` - filter by category
  - `setSearchQuery(query)` - update search
  - `setSelectedCategory(category)` - update category filter
- **Admin state & actions**:
  - `isAdmin: boolean` - admin mode flag
  - `setAdmin(isAdmin)` - toggle admin mode
  - `adminTab: string` - current admin tab (defaults to 'dashboard')
  - `setAdminTab(tab)` - switch admin tab
- Uses `persist` middleware with localStorage for state persistence
- Partializes to persist only essential state (cart items, admin flag, page, etc.)

### 3. `/src/lib/utils.ts` (Updated)
- Kept existing `cn()` function
- **formatPrice(price: number): string** - Formats with Algerian Dinar (د.ج) using ar-DZ locale
- **generateOrderNumber(): string** - Generates ORD-YYYYMMDD-XXXXXX format with random suffix
- **truncateText(text: string, maxLength: number): string** - Truncates with ellipsis

### 4. `/src/lib/facebook.ts` (Created)
- **initFacebookPixel(pixelId: string)** - Initializes Facebook Pixel script and fbq function
- **trackPageView()** - Tracks PageView standard event
- **trackAddToCart(product)** - Tracks AddToCart with product details (id, name, price, quantity, category)
- **trackInitCheckout(data)** - Tracks InitiateCheckout with value, currency, items
- **trackPurchase(orderData)** - Tracks Purchase with order value and contents
- **shareOnFacebook(productUrl, productName)** - Opens FB share dialog in popup window
- All functions safely check for `window` and `fbq` availability (SSR-safe)

## Design Decisions
- Used Zustand v5 with `persist` middleware for cart persistence across sessions
- `partialize` excludes transient state (searchQuery) from persistence to avoid stale filters
- Cart `addItem` handles duplicate items by incrementing quantity
- `updateQuantity` with quantity <= 0 automatically removes the item
- Facebook functions are all SSR-safe with null checks
- Types use union types for Order status and paymentMethod for type safety
- Images in Product are `string[]` (parsed from JSON string in Prisma)
