import { NextResponse, type NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  // Verificar la cookie de sesión hardcodeada
  const authCookie = request.cookies.get('geoland_auth')
  const isAuthenticated = authCookie?.value === 'true'

  const { pathname } = request.nextUrl
  
  // Definir rutas que no requieren autenticación
  const isLoginPage = pathname.startsWith('/login')
  const isPublicAsset = pathname.startsWith('/_next') || 
                        pathname.includes('favicon.ico') ||
                        pathname.startsWith('/logo') || // Logos y assets públicos
                        pathname.endsWith('.svg') ||
                        pathname.endsWith('.png') ||
                        pathname.endsWith('.jpg')

  // 1. Si no está autenticado y no está en la página de login ni es un asset público, redirigir a /login
  if (!isAuthenticated && !isLoginPage && !isPublicAsset) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // 2. Si está autenticado e intenta ir al login, redirigir al home
  if (isAuthenticated && isLoginPage) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
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
