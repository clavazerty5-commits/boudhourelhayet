import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/orders/[id] - Get a single order
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const order = await db.order.findUnique({
      where: { id },
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
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Parse images JSON strings in order items
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

    return NextResponse.json(orderResponse);
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}

// PUT /api/orders/[id] - Update order status
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, paymentMethod, paymentStatus, notes, shipping, facebookLeadId, confirmedByEmployeeId } = body;

    const existingOrder = await db.order.findUnique({
      where: { id },
    });

    if (!existingOrder) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Valid statuses are: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    const validPaymentStatuses = ['unpaid', 'paid'];
    if (paymentStatus && !validPaymentStatuses.includes(paymentStatus)) {
      return NextResponse.json(
        { error: `Invalid payment status. Valid statuses are: ${validPaymentStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {};

    if (status !== undefined) updateData.status = status;
    if (paymentMethod !== undefined) updateData.paymentMethod = paymentMethod;
    if (notes !== undefined) updateData.notes = notes;
    if (shipping !== undefined) updateData.shipping = parseFloat(shipping);
    if (facebookLeadId !== undefined) updateData.facebookLeadId = facebookLeadId;
    
    // Handle payment status changes
    if (paymentStatus !== undefined) {
      updateData.paymentStatus = paymentStatus;
      if (paymentStatus === 'paid' && existingOrder.paymentStatus !== 'paid') {
        updateData.paidAt = new Date();
        // Record which employee confirmed the payment
        if (confirmedByEmployeeId) {
          updateData.confirmedByEmployeeId = confirmedByEmployeeId;
        }
      } else if (paymentStatus === 'unpaid') {
        updateData.paidAt = null;
        updateData.confirmedByEmployeeId = null;
      }
    }

    // If status changed to cancelled, restore product stock
    if (status === 'cancelled' && existingOrder.status !== 'cancelled') {
      const orderItems = await db.orderItem.findMany({
        where: { orderId: id },
      });

      await db.$transaction(async (tx) => {
        // Update order status
        await tx.order.update({
          where: { id },
          data: updateData,
        });

        // Restore stock
        for (const item of orderItems) {
          const product = await tx.product.findUnique({
            where: { id: item.productId },
          });
          if (product) {
            await tx.product.update({
              where: { id: item.productId },
              data: {
                stock: product.stock + item.quantity,
              },
            });
          }
        }
      });
    } else {
      await db.order.update({
        where: { id },
        data: updateData,
      });
    }

    const updatedOrder = await db.order.findUnique({
      where: { id },
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
    });

    // Parse images JSON strings in response
    const orderResponse = {
      ...updatedOrder!,
      items: updatedOrder!.items.map((item) => ({
        ...item,
        product: {
          ...item.product,
          images: JSON.parse(item.product.images),
        },
      })),
    };

    return NextResponse.json(orderResponse);
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
}

// DELETE /api/orders/[id] - Delete an order
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existingOrder = await db.order.findUnique({
      where: { id },
    });

    if (!existingOrder) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // If order is not cancelled, restore product stock before deleting
    if (existingOrder.status !== 'cancelled') {
      const orderItems = await db.orderItem.findMany({
        where: { orderId: id },
      });

      await db.$transaction(async (tx) => {
        // Restore stock for each item
        for (const item of orderItems) {
          const product = await tx.product.findUnique({
            where: { id: item.productId },
          });
          if (product) {
            await tx.product.update({
              where: { id: item.productId },
              data: {
                stock: product.stock + item.quantity,
              },
            });
          }
        }

        // Delete order items first (cascade)
        await tx.orderItem.deleteMany({
          where: { orderId: id },
        });

        // Delete the order
        await tx.order.delete({
          where: { id },
        });
      });
    } else {
      // Order already cancelled, just delete it
      await db.orderItem.deleteMany({
        where: { orderId: id },
      });
      await db.order.delete({
        where: { id },
      });
    }

    return NextResponse.json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Error deleting order:', error);
    return NextResponse.json(
      { error: 'Failed to delete order' },
      { status: 500 }
    );
  }
}
