import { NextRequest, NextResponse } from 'next/server';

const ADMIN1_PASSWORD = process.env.ADMIN_PASSWORD ?? 'admin#123';
const ADMIN2_PASSWORD = process.env.ADMIN2_PASSWORD ?? 'admin#123@';
const SUPER_ADMIN_PASSWORD = process.env.SUPER_ADMIN_PASSWORD ?? 'InnoSoft#123@';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    let role: 'admin1' | 'admin2' | 'superadmin' | null = null;
    if (body.password === SUPER_ADMIN_PASSWORD) {
      role = 'superadmin';
    } else if (body.password === ADMIN1_PASSWORD) {
      role = 'admin1';
    } else if (body.password === ADMIN2_PASSWORD) {
      role = 'admin2';
    }

    if (!role) {
      return NextResponse.json({ error: 'Mot de passe incorrect' }, { status: 401 });
    }

    const cookieOptions = { httpOnly: true, sameSite: 'lax' as const, path: '/', maxAge: 60 * 60 * 24 };
    const response = NextResponse.json({ success: true, role });
    response.cookies.set('admin-session', 'authenticated', cookieOptions);
    response.cookies.set('admin-role', role, cookieOptions);
    return response;
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
