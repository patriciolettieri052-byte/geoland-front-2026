import { NextResponse, type NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const authCookie = request.cookies.get('geoland_auth');
  // En este entorno, basta con que la cookie exista para considerar al usuario autenticado,
  // o podemos ser estrictos con el valor 'true'.
  const isAuthenticated = authCookie?.value === 'true';

  const { pathname } = request.nextUrl;
  
  // 1. Permitir acceso libre a archivos estáticos, imágenes, API y página de login
  if (
    pathname === '/login' ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.includes('.') || // favicon.ico, logos, etc.
    pathname === '/favicon.ico'
  ) {
    // Si ya está autenticado e intenta ir al login, redirigir al home
    if (isAuthenticated && pathname === '/login') {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  // 2. Si no está autenticado, redirigir a /login
  if (!isAuthenticated) {
    const url = new URL('/login', request.url);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
