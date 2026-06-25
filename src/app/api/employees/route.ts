import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/employees - List all employees
export async function GET(request: NextRequest) {
  try {
    const employees = await db.employee.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { orders: true, confirmedOrders: true },
        },
      },
    });

    // Don't return passwords
    const safeEmployees = employees.map((emp) => ({
      id: emp.id,
      username: emp.username,
      name: emp.name,
      role: emp.role,
      active: emp.active,
      ordersCount: emp._count.orders,
      confirmedOrdersCount: emp._count.confirmedOrders,
      createdAt: emp.createdAt,
      updatedAt: emp.updatedAt,
    }));

    return NextResponse.json({ employees: safeEmployees });
  } catch (error) {
    console.error('Error fetching employees:', error);
    return NextResponse.json(
      { error: 'Failed to fetch employees' },
      { status: 500 }
    );
  }
}

// POST /api/employees - Create a new employee
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password, name, role } = body;

    if (!username || !password || !name) {
      return NextResponse.json(
        { error: 'اسم المستخدم وكلمة المرور والاسم مطلوبون' },
        { status: 400 }
      );
    }

    if (password.length < 4) {
      return NextResponse.json(
        { error: 'كلمة المرور يجب أن تكون 4 أحرف على الأقل' },
        { status: 400 }
      );
    }

    // Check if username already exists
    const existing = await db.employee.findUnique({
      where: { username },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'اسم المستخدم موجود بالفعل' },
        { status: 400 }
      );
    }

    const validRoles = ['admin', 'seller', 'seller_plus'];
    const employeeRole = role && validRoles.includes(role) ? role : 'seller';

    const employee = await db.employee.create({
      data: {
        username,
        password, // In production, hash this with bcrypt
        name,
        role: employeeRole,
        active: true,
      },
    });

    // Don't return password
    const { password: _, ...safeEmployee } = employee;
    return NextResponse.json(safeEmployee, { status: 201 });
  } catch (error) {
    console.error('Error creating employee:', error);
    return NextResponse.json(
      { error: 'Failed to create employee' },
      { status: 500 }
    );
  }
}
