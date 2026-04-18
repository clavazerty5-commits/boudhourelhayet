import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/treasury - Get treasury/daily sales data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');

    // Get all paid orders
    const paidOrders = await db.order.findMany({
      where: {
        paymentStatus: 'paid',
        status: { not: 'cancelled' },
      },
      include: {
        customer: true,
      },
      orderBy: { paidAt: 'desc' },
    });

    // Calculate today's sales
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayOrders = paidOrders.filter((order) => {
      if (!order.paidAt) return false;
      const paidDate = new Date(order.paidAt);
      return paidDate >= today;
    });

    const todaySales = todayOrders.reduce((sum, order) => sum + order.total, 0);
    const todayOrdersCount = todayOrders.length;

    // Calculate yesterday's sales
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const yesterdayOrders = paidOrders.filter((order) => {
      if (!order.paidAt) return false;
      const paidDate = new Date(order.paidAt);
      return paidDate >= yesterday && paidDate < today;
    });

    const yesterdaySales = yesterdayOrders.reduce((sum, order) => sum + order.total, 0);

    // Daily breakdown for the last N days
    const dailyBreakdown = [];
    for (let i = 0; i < days; i++) {
      const dayStart = new Date(today);
      dayStart.setDate(dayStart.getDate() - i);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);

      const dayOrders = paidOrders.filter((order) => {
        if (!order.paidAt) return false;
        const paidDate = new Date(order.paidAt);
        return paidDate >= dayStart && paidDate < dayEnd;
      });

      const dayTotal = dayOrders.reduce((sum, order) => sum + order.total, 0);

      dailyBreakdown.push({
        date: dayStart.toISOString().split('T')[0],
        dateLabel: dayStart.toLocaleDateString('ar-TN', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
        }),
        total: dayTotal,
        ordersCount: dayOrders.length,
        orders: dayOrders.map((o) => ({
          id: o.id,
          orderNumber: o.orderNumber,
          total: o.total,
          customerName: o.customer?.name || '—',
          paidAt: o.paidAt,
          paymentMethod: o.paymentMethod,
        })),
      });
    }

    // Total treasury (all time paid)
    const totalTreasury = paidOrders.reduce((sum, order) => sum + order.total, 0);

    // Unpaid orders total
    const unpaidOrders = await db.order.findMany({
      where: {
        paymentStatus: 'unpaid',
        status: { not: 'cancelled' },
      },
    });
    const unpaidTotal = unpaidOrders.reduce((sum, order) => sum + order.total, 0);

    return NextResponse.json({
      todaySales,
      todayOrdersCount,
      yesterdaySales,
      totalTreasury,
      unpaidTotal,
      unpaidOrdersCount: unpaidOrders.length,
      dailyBreakdown,
    });
  } catch (error) {
    console.error('Error fetching treasury data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch treasury data' },
      { status: 500 }
    );
  }
}
