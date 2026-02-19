import { NextRequest, NextResponse } from 'next/server';
import { getInstitutes, saveInstitutes } from '@/lib/dataStore';

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const institutes = getInstitutes();
  const filtered = institutes.filter((i) => i.id !== id);

  if (filtered.length === institutes.length) {
    return NextResponse.json({ error: 'Institut non trouvé' }, { status: 404 });
  }

  saveInstitutes(filtered);
  return NextResponse.json({ success: true });
}
