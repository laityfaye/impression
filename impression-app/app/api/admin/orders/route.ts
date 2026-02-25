import { NextRequest, NextResponse } from 'next/server';
import { getOrders } from '@/lib/dataStore';

export async function GET(req: NextRequest) {
  const role = req.cookies.get('admin-role')?.value;
  const orders = getOrders();

  // Admin 1 et Admin 2 voient uniquement leurs commandes affectées
  if (role === 'admin1' || role === 'admin2') {
    return NextResponse.json(orders.filter((o) => o.assignedTo === role));
  }

  // Le super admin ne passe pas par cette route (il a sa propre route /api/admin/orders?all=1)
  // ou accède via /admin/super qui utilise directement /api/admin/orders avec superadmin role
  if (role === 'superadmin') {
    return NextResponse.json(orders);
  }

  return NextResponse.json([]);
}
