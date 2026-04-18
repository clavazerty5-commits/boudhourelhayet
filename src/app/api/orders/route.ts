import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

function generateOrderNumber(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const random = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
  return `ORD-${year}${month}${day}-${random}`;
}

// GET /api/orders - List orders
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (status) {
      where.status = status;
    }

    const [orders, total] = await Promise.all([
      db.order.findMany({
        where,
        include: {
          customer: true,
          employee: true,
          confirmedByEmployee: true,
          items: {
            include: {
              product: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      db.order.count({ where }),
    ]);

    // Parse images JSON strings in order items
    const ordersWithParsedImages = orders.map((order) => ({
      ...order,
      items: order.items.map((item) => ({
        ...item,
        product: {
          ...item.product,
          images: JSON.parse(item.product.images),
        },
      })),
    }));

    return NextResponse.json({
      orders: ordersWithParsedImages,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

// POST /api/orders - Create a new order
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      customer,
      items,
      shipping,
      paymentMethod,
      notes,
      facebookLeadId,
      employeeId,
    } = body;

    if (!customer || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Customer and items are required' },
        { status: 400 }
      );
    }

    // Validate customer data
    if (!customer.name || !customer.phone) {
      return NextResponse.json(
        { error: 'Customer name and phone are required' },
        { status: 400 }
      );
    }

    // Validate items
    for (const item of items) {
      if (!item.productId || !item.quantity || item.quantity < 1) {
        return NextResponse.json(
          { error: 'Each item must have a productId and quantity > 0' },
          { status: 400 }
        );
      }
    }

    // Fetch products to get current prices
    const productIds = items.map((item: { productId: string }) => item.productId);
    const products = await db.product.findMany({
      where: { id: { in: productIds } },
    });

    if (products.length !== productIds.length) {
      return NextResponse.json(
        { error: 'One or more products not found' },
        { status: 404 }
      );
    }

    // Calculate totals
    const productMap = new Map(products.map((p) => [p.id, p]));
    let subtotal = 0;
    const orderItems = items.map((item: { productId: string; quantity: number }) => {
      const product = productMap.get(item.productId)!;
      const price = product.price;
      const total = price * item.quantity;
      subtotal += total;
      return {
        productId: item.productId,
        quantity: item.quantity,
        price,
        total,
      };
    });

    const shippingCost = shipping || 0;
    const total = subtotal + shippingCost;

    // Generate unique order number
    let orderNumber = generateOrderNumber();
    let existingOrder = await db.order.findUnique({
      where: { orderNumber },
    });
    while (existingOrder) {
      orderNumber = generateOrderNumber();
      existingOrder = await db.order.findUnique({
        where: { orderNumber },
      });
    }

    // Find or create customer
    let customerRecord = await db.customer.findFirst({
      where: { phone: customer.phone },
    });

    if (!customerRecord) {
      customerRecord = await db.customer.create({
        data: {
          name: customer.name,
          email: customer.email || '',
          phone: customer.phone,
          address: customer.address || null,
          city: customer.city || null,
          notes: customer.notes || null,
        },
      });
    } else {
      // Update customer info if provided
      customerRecord = await db.customer.update({
        where: { id: customerRecord.id },
        data: {
          name: customer.name || customerRecord.name,
          email: customer.email || customerRecord.email,
          address: customer.address || customerRecord.address,
          city: customer.city || customerRecord.city,
        },
      });
    }

    // Create order with items in a transaction
    const order = await db.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          customerId: customerRecord!.id,
          total,
          subtotal,
          shipping: shippingCost,
          status: 'pending',
          paymentMethod: paymentMethod || 'cod',
          notes: notes || null,
          facebookLeadId: facebookLeadId || null,
          employeeId: employeeId || null,
          items: {
            create: orderItems,
          },
        },
        include: {
          customer: true,
          employee: true,
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      // Update stock for each product
      for (const item of items as { productId: string; quantity: number }[]) {
        const product = productMap.get(item.productId)!;
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: Math.max(0, product.stock - item.quantity),
          },
        });
      }

      return newOrder;
    });

    // Parse images JSON strings in response
    const orderResponse = {
      ...order,
      items: order.items.map((item) => ({
        ...item,
        product: {
          ...item.product,
          images: JSON.parse(item.product.images),
        },
      })),
    };

    return NextResponse.json(orderResponse, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
