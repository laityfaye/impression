import { NextRequest, NextResponse } from 'next/server';
import { getOrders, saveOrders, StoredOrder } from '@/lib/dataStore';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const orders = getOrders();

    const newOrder: StoredOrder = {
      id: crypto.randomUUID(),
      orderNumber: body.orderNumber ?? '',
      document: body.document ?? { name: '', pageCount: 0, hasIssues: false },
      client: body.client ?? null,
      correctionService: body.correctionService ?? false,
      finishing: body.finishing ?? null,
      delivery: body.delivery ?? null,
      selectedInstitute: body.selectedInstitute ?? null,
      copies: body.copies ?? 1,
      totalPrice: body.totalPrice ?? 0,
      status: 'pending',
      assignedTo: null,
      createdAt: new Date().toISOString(),
    };

    orders.unshift(newOrder);
    saveOrders(orders);

    return NextResponse.json({ success: true, order: newOrder });
  } catch {
    return NextResponse.json({ error: 'Erreur lors de la sauvegarde' }, { status: 500 });
  }
}
