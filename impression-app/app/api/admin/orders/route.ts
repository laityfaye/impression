import { NextRequest, NextResponse } from 'next/server';
import { getOrders } from '@/lib/dataStore';

export async function GET(req: NextRequest) {
  const role = req.cookies.get('admin-role')?.value;
  const orders = getOrders();

  // Super admin voit toutes les commandes
  if (role === 'superadmin') {
    return NextResponse.json(orders);
  }

  // Admin 1 et Admin 2 voient uniquement leurs commandes affectées
  if (role === 'admin1' || role === 'admin2') {
    return NextResponse.json(orders.filter((o) => o.assignedTo === role));
  }

  return NextResponse.json([]);
}
