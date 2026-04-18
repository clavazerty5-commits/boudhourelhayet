---
Task ID: 1
Agent: Main Agent
Task: Add employee/staff management system with roles, login, permissions, and per-employee sales tracking

Work Log:
- Updated Prisma schema: Added Employee model with role-based permissions (admin/seller/seller_plus) and updated Order model with employeeId and confirmedByEmployeeId fields
- Created Employee API endpoints: GET/POST /api/employees, PUT/DELETE /api/employees/[id], POST /api/employees/login, GET /api/employees/sales
- Updated Zustand store: Added currentEmployee, employeeRole state with persistence
- Updated TypeScript types: Added Employee interface, updated Order interface with employee fields
- Rewrote AdminPanel component with full employee management:
  - Employee login system (admin + employees)
  - Employee management tab (add/edit/delete/toggle active)
  - Role-based permissions (admin: all, seller_plus: sell+products, seller: sell only)
  - Per-employee sales tracking in treasury tab
  - Order tracking with employee who created/confirmed
  - Current user display in header
- Updated Orders API to include employee relations and confirmedByEmployeeId tracking
- Updated Treasury API to include employeeSalesToday data and confirmedByName in daily breakdown
- Built and tested successfully

Stage Summary:
- Full employee management system implemented
- Three role levels: admin (مدير), seller (بائع), seller_plus (بائع + إضافة منتجات)
- Each employee logs in with username/password
- Orders are tracked by which employee created them and confirmed payment
- Per-employee daily sales shown in treasury tab
- Role-based access control restricts tabs based on permissions
