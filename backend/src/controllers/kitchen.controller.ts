import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';

export const getKitchenOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cafeId = req.user!.cafeId;

    // Fetch active kitchen orders (exclude COMPLETED and CANCELLED)
    const activeOrders = await prisma.order.findMany({
      where: {
        cafeId,
        orderStatus: {
          in: ['PENDING', 'ACCEPTED', 'PREPARING', 'READY'],
        },
      },
      include: {
        table: true,
        orderItems: true,
      },
      orderBy: { createdAt: 'asc' }, // FIFO - oldest orders first
    });

    res.json(
      activeOrders.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        orderToken: o.orderToken,
        tableNumber: o.table.number,
        customerName: o.customerName,
        orderStatus: o.orderStatus,
        paymentStatus: o.paymentStatus,
        notes: o.notes,
        createdAt: o.createdAt,
        elapsedMinutes: Math.floor((Date.now() - new Date(o.createdAt).getTime()) / (1000 * 60)),
        items: o.orderItems.map((i) => ({
          id: i.id,
          productName: i.productNameSnapshot,
          quantity: i.quantity,
          specialNote: i.specialNote,
        })),
      }))
    );
  } catch (error) {
    next(error);
  }
};

export const advanceKitchenOrderStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cafeId = req.user!.cafeId;
    const { id } = req.params;
    const { nextStatus } = req.body;

    if (!['ACCEPTED', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED'].includes(nextStatus)) {
      return res.status(400).json({ error: 'Invalid kitchen target order status.' });
    }

    const existing = await prisma.order.findFirst({ where: { id, cafeId } });
    if (!existing) return res.status(404).json({ error: 'Order not found.' });

    const updated = await prisma.order.update({
      where: { id },
      data: { orderStatus: nextStatus as any },
      include: { table: true, orderItems: true },
    });

    res.json({
      id: updated.id,
      orderNumber: updated.orderNumber,
      orderStatus: updated.orderStatus,
    });
  } catch (error) {
    next(error);
  }
};
