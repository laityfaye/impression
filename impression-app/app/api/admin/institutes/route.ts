import { NextRequest, NextResponse } from 'next/server';
import { getInstitutes, saveInstitutes, Institute } from '@/lib/dataStore';

export async function GET() {
  return NextResponse.json(getInstitutes());
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const name = (body.name ?? '').trim();

    if (!name) {
      return NextResponse.json({ error: "Nom de l'institut requis" }, { status: 400 });
    }

    const institutes = getInstitutes();
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    if (institutes.some((i) => i.id === slug || i.name.toLowerCase() === name.toLowerCase())) {
      return NextResponse.json({ error: 'Cet institut existe déjà' }, { status: 409 });
    }

    const newInstitute: Institute = {
      id: slug || `inst-${Date.now()}`,
      name,
      createdAt: new Date().toISOString(),
    };

    institutes.push(newInstitute);
    saveInstitutes(institutes);

    return NextResponse.json(newInstitute, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
