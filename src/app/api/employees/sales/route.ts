import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/employees/sales - Get per-employee sales stats
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');
    const days = parseInt(searchParams.get('days') || '30');

    // Calculate date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - days);

    if (employeeId) {
      // Get sales for a specific employee
      const employee = await db.employee.findUnique({
        where: { id: employeeId },
      });

      if (!employee) {
        return NextResponse.json(
          { error: 'Employee not found' },
          { status: 404 }
        );
      }

      // Orders created by this employee
      const orders = await db.order.findMany({
        where: {
          employeeId,
          createdAt: { gte: startDate },
          status: { not: 'cancelled' },
        },
        include: { customer: true },
        orderBy: { createdAt: 'desc' },
      });

      // Orders where this employee confirmed payment
      const confirmedOrders = await db.order.findMany({
        where: {
          confirmedByEmployeeId: employeeId,
          paymentStatus: 'paid',
          paidAt: { gte: startDate },
        },
        include: { customer: true },
        orderBy: { paidAt: 'desc' },
      });

      const totalSales = orders.reduce((sum, o) => sum + o.total, 0);
      const totalConfirmed = confirmedOrders.reduce((sum, o) => sum + o.total, 0);

      return NextResponse.json({
        employee: {
          id: employee.id,
          name: employee.name,
          role: employee.role,
        },
        period: { days, from: startDate, to: today },
        stats: {
          ordersCreated: orders.length,
          totalSales,
          paymentsConfirmed: confirmedOrders.length,
          totalConfirmedAmount: totalConfirmed,
        },
        orders: orders.map((o) => ({
          id: o.id,
          orderNumber: o.orderNumber,
          total: o.total,
          status: o.status,
          paymentStatus: o.paymentStatus,
          customerName: o.customer?.name || '—',
          createdAt: o.createdAt,
        })),
        confirmedOrders: confirmedOrders.map((o) => ({
          id: o.id,
          orderNumber: o.orderNumber,
          total: o.total,
          customerName: o.customer?.name || '—',
          paidAt: o.paidAt,
        })),
      });
    }

    // Get sales for ALL employees
    const employees = await db.employee.findMany({
      where: { active: true },
      orderBy: { name: 'asc' },
    });

    const employeeStats = await Promise.all(
      employees.map(async (emp) => {
        const ordersCount = await db.order.count({
          where: {
            employeeId: emp.id,
            createdAt: { gte: startDate },
            status: { not: 'cancelled' },
          },
        });

        const ordersTotal = await db.order.aggregate({
          where: {
            employeeId: emp.id,
            createdAt: { gte: startDate },
            status: { not: 'cancelled' },
          },
          _sum: { total: true },
        });

        const confirmedCount = await db.order.count({
          where: {
            confirmedByEmployeeId: emp.id,
            paymentStatus: 'paid',
            paidAt: { gte: startDate },
          },
        });

        const confirmedTotal = await db.order.aggregate({
          where: {
            confirmedByEmployeeId: emp.id,
            paymentStatus: 'paid',
            paidAt: { gte: startDate },
          },
          _sum: { total: true },
        });

        return {
          id: emp.id,
          name: emp.name,
          username: emp.username,
          role: emp.role,
          ordersCreated: ordersCount,
          totalSales: ordersTotal._sum.total || 0,
          paymentsConfirmed: confirmedCount,
          totalConfirmedAmount: confirmedTotal._sum.total || 0,
        };
      })
    );

    return NextResponse.json({
      period: { days, from: startDate, to: today },
      employees: employeeStats,
    });
  } catch (error) {
    console.error('Error fetching employee sales:', error);
    return NextResponse.json(
      { error: 'Failed to fetch employee sales' },
      { status: 500 }
    );
  }
}
