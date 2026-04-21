// src/app/api/aec/route.ts
// Proxy route: Next.js → Backend FastAPI /api/v1/aec

import { NextResponse } from 'next/server'
import { checkRateLimit } from '@/lib/rateLimiter'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://geoland-backend-final.onrender.com'
const API_KEY = process.env.GEOLAND_API_KEY || process.env.NEXT_PUBLIC_GEOLAND_API_KEY || 'geoland-dev-key'

export async function POST(req: Request) {
  // Rate limiting — FIX-FRONT-P1-02
  const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? 'anonymous'
  const { allowed } = checkRateLimit(`aec:${ip}`, 10)
  if (!allowed) {
    return NextResponse.json(
      { dialogo_ui: 'Demasiadas solicitudes. Esperá un momento antes de enviar otro mensaje.', actions: [] },
      { status: 429 }
    )
  }

  try {
    const body = await req.json()

    const backendRes = await fetch(`${API_URL}/api/v1/aec`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
      },
      body: JSON.stringify(body),
    })

    if (!backendRes.ok) {
      const errBody = await backendRes.text()
      console.error('[AEC Route] Backend error:', backendRes.status, errBody)
      return NextResponse.json(
        { dialogo_ui: 'Hubo un problema conectando con el asesor. Intentá de nuevo.', actions: [] },
        { status: 200 } // devolved 200 para que el front no crashee
      )
    }

    const data = await backendRes.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('[AEC Route] Error:', error)
    return NextResponse.json(
      { dialogo_ui: 'Error interno del asesor. Intentá de nuevo en unos segundos.', actions: [] },
      { status: 200 }
    )
  }
}
