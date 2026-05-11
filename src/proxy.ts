import { NextResponse, type NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // 1. Excluir explícitamente assets estáticos y API para evitar bucles o bloqueos
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.includes('.') // Archivos con extensión (imágenes, etc)
  ) {
    return NextResponse.next();
  }

  // 2. Verificar autenticación
  const authCookie = request.cookies.get('geoland_auth');
  const isAuthenticated = authCookie?.value === 'true';

  // 3. Lógica de redirección
  if (pathname === '/login') {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  if (!isAuthenticated) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

// Usar un matcher más amplio para asegurar que capture la raíz '/'
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
