import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST /api/employees/login - Employee login
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: 'اسم المستخدم وكلمة المرور مطلوبان' },
        { status: 400 }
      );
    }

    // Check admin login first
    if (username === 'admin' && password === 'admin123') {
      return NextResponse.json({
        id: 'admin',
        username: 'admin',
        name: 'المدير العام',
        role: 'admin',
        active: true,
      });
    }

    // Check employee login
    const employee = await db.employee.findUnique({
      where: { username },
    });

    if (!employee) {
      return NextResponse.json(
        { error: 'اسم المستخدم أو كلمة المرور غير صحيحة' },
        { status: 401 }
      );
    }

    if (employee.password !== password) {
      return NextResponse.json(
        { error: 'اسم المستخدم أو كلمة المرور غير صحيحة' },
        { status: 401 }
      );
    }

    if (!employee.active) {
      return NextResponse.json(
        { error: 'هذا الحساب معطل. تواصل مع المدير' },
        { status: 403 }
      );
    }

    // Don't return password
    const { password: _, ...safeEmployee } = employee;
    return NextResponse.json(safeEmployee);
  } catch (error) {
    console.error('Error logging in employee:', error);
    return NextResponse.json(
      { error: 'Failed to login' },
      { status: 500 }
    );
  }
}
