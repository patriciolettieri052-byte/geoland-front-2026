import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const authCookie = request.cookies.get('geoland_auth');
  const { pathname } = request.nextUrl;

  // 1. Permitir acceso libre a archivos estáticos, imágenes, API y página de login
  if (
    pathname === '/login' ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.includes('.') || // favicon.ico, logos, etc.
    pathname === '/favicon.ico'
  ) {
    // Si ya tiene cookie e intenta ir a login, mandarlo al home
    if (authCookie && pathname === '/login') {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  // 2. Si no hay cookie de sesión, redirigir a login
  if (!authCookie) {
    const url = new URL('/login', request.url);
    // Opcional: guardar la URL de destino para volver después del login
    // url.searchParams.set('callbackUrl', pathname); 
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Configurar en qué rutas se ejecuta el middleware
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
};
