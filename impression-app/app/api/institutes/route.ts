import { NextResponse } from 'next/server';
import { getInstitutes } from '@/lib/dataStore';

export async function GET() {
  const institutes = getInstitutes();
  return NextResponse.json(institutes);
}
