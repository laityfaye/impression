import { NextRequest, NextResponse } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = request.cookies.get('admin-session');
  const isAuthenticated = session?.value === 'authenticated';
  const role = request.cookies.get('admin-role')?.value;

  // Protect /admin/* routes (except /admin/login)
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    // /admin/super requires superadmin role
    if (pathname.startsWith('/admin/super') && role !== 'superadmin') {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }

  // Protect /api/admin/* routes (except login and logout which are public)
  const PUBLIC_API = ['/api/admin/login', '/api/admin/logout'];
  if (pathname.startsWith('/api/admin') && !PUBLIC_API.includes(pathname)) {
    if (!isAuthenticated) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
