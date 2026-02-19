import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';

export const runtime = 'nodejs';

const DATA_FILE = path.join(process.cwd(), 'data', 'orders.json');

const FINISHING_LABELS: Record<string, string> = {
  agraphage: 'Agraphage',
  reliure: 'Reliure spirale',
  livre: 'Format Livre',
};

const STATUS_LABELS: Record<string, { label: string; description: string }> = {
  pending: {
    label: 'En attente',
    description: 'Votre commande a été reçue et est en attente de traitement.',
  },
  processing: {
    label: 'En cours d\'impression',
    description: 'Votre document est en cours d\'impression.',
  },
  done: {
    label: 'Prête',
    description: 'Votre commande est prête. Vous pouvez la récupérer.',
  },
};

// GET /api/orders/[orderNumber] — consultation publique (données non sensibles uniquement)
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  const { orderNumber } = await params;

  try {
    const content = await fs.readFile(DATA_FILE, 'utf-8');
    const orders = JSON.parse(content);

    const order = orders.find(
      (o: { orderNumber: string }) => o.orderNumber === orderNumber
    );

    if (!order) {
      return NextResponse.json(
        { error: 'Commande introuvable. Vérifiez votre numéro.' },
        { status: 404 }
      );
    }

    const statusInfo = STATUS_LABELS[order.status] || STATUS_LABELS.pending;

    // On ne retourne que les données non sensibles au client
    return NextResponse.json({
      orderNumber: order.orderNumber,
      createdAt: order.createdAt,
      status: order.status,
      statusLabel: statusInfo.label,
      statusDescription: statusInfo.description,
      pageCount: order.document.pageCount,
      finishing: order.finishing ? FINISHING_LABELS[order.finishing] || order.finishing : null,
      correctionService: order.correctionService,
      delivery: order.delivery,
      totalPrice: order.totalPrice,
    });
  } catch {
    return NextResponse.json(
      { error: 'Erreur lors de la consultation' },
      { status: 500 }
    );
  }
}
