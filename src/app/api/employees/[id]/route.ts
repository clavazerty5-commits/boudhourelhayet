import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/employees/[id] - Get a single employee
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const employee = await db.employee.findUnique({
      where: { id },
      include: {
        _count: {
          select: { orders: true, confirmedOrders: true },
        },
      },
    });

    if (!employee) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      );
    }

    const { password: _, ...safeEmployee } = employee;
    return NextResponse.json(safeEmployee);
  } catch (error) {
    console.error('Error fetching employee:', error);
    return NextResponse.json(
      { error: 'Failed to fetch employee' },
      { status: 500 }
    );
  }
}

// PUT /api/employees/[id] - Update an employee
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, password, role, active } = body;

    const existingEmployee = await db.employee.findUnique({
      where: { id },
    });

    if (!existingEmployee) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (role !== undefined) {
      const validRoles = ['admin', 'seller', 'seller_plus'];
      if (validRoles.includes(role)) {
        updateData.role = role;
      }
    }
    if (active !== undefined) updateData.active = active;
    if (password && password.length >= 4) {
      updateData.password = password;
    }

    await db.employee.update({
      where: { id },
      data: updateData,
    });

    const updatedEmployee = await db.employee.findUnique({
      where: { id },
    });

    const { password: _, ...safeEmployee } = updatedEmployee!;
    return NextResponse.json(safeEmployee);
  } catch (error) {
    console.error('Error updating employee:', error);
    return NextResponse.json(
      { error: 'Failed to update employee' },
      { status: 500 }
    );
  }
}

// DELETE /api/employees/[id] - Delete an employee
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existingEmployee = await db.employee.findUnique({
      where: { id },
    });

    if (!existingEmployee) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      );
    }

    // Remove employee references from orders first
    await db.order.updateMany({
      where: { employeeId: id },
      data: { employeeId: null },
    });

    await db.order.updateMany({
      where: { confirmedByEmployeeId: id },
      data: { confirmedByEmployeeId: null },
    });

    await db.employee.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    console.error('Error deleting employee:', error);
    return NextResponse.json(
      { error: 'Failed to delete employee' },
      { status: 500 }
    );
  }
}
