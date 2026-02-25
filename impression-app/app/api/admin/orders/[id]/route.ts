import { NextRequest, NextResponse } from 'next/server';
import { getOrders, saveOrders, OrderStatus } from '@/lib/dataStore';
import path from 'path';
import fs from 'fs/promises';

export const runtime = 'nodejs';

const UPLOADS_DIR = path.join(process.cwd(), 'uploads');

const ALLOWED: OrderStatus[] = ['pending', 'processing', 'ready', 'delivered'];
const ALLOWED_ASSIGNEES = ['admin1', 'admin2', null];

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const role = req.cookies.get('admin-role')?.value;

  const orders = getOrders();
  const idx = orders.findIndex((o) => o.id === id);
  if (idx === -1) return NextResponse.json({ error: 'Commande non trouvée' }, { status: 404 });

  // Affectation à un admin (réservé Super Admin)
  if ('assignedTo' in body) {
    if (role !== 'superadmin') {
      return NextResponse.json({ error: 'Réservé Super Admin' }, { status: 403 });
    }
    const assignedTo = body.assignedTo as 'admin1' | 'admin2' | null;
    if (!ALLOWED_ASSIGNEES.includes(assignedTo)) {
      return NextResponse.json({ error: 'Affectation invalide' }, { status: 400 });
    }
    orders[idx].assignedTo = assignedTo;
    saveOrders(orders);
    return NextResponse.json({ success: true, order: orders[idx] });
  }

  // Mise à jour du statut
  const s = body.status as OrderStatus;
  if (!ALLOWED.includes(s)) return NextResponse.json({ error: 'Statut invalide' }, { status: 400 });
  orders[idx].status = s;
  saveOrders(orders);
  return NextResponse.json({ success: true, order: orders[idx] });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (req.cookies.get('admin-role')?.value !== 'superadmin') {
    return NextResponse.json({ error: 'Reserve Super Admin' }, { status: 403 });
  }
  const { id } = await params;
  const orders = getOrders();
  const order = orders.find((o) => o.id === id);
  if (!order) return NextResponse.json({ error: 'Commande non trouvee' }, { status: 404 });

  // Supprimer le fichier associé
  const savedFileName = order.document?.savedFileName;
  if (savedFileName) {
    const filePath = path.join(UPLOADS_DIR, path.basename(savedFileName));
    await fs.unlink(filePath).catch(() => { /* fichier déjà absent, on ignore */ });
  }

  saveOrders(orders.filter((o) => o.id !== id));
  return NextResponse.json({ success: true });
}