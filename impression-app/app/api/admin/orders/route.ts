import { NextResponse } from 'next/server';
import { getOrders } from '@/lib/dataStore';

export async function GET() {
  return NextResponse.json(getOrders());
}
