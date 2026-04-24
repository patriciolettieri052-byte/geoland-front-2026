// src/app/api/match/route.ts
// Proxy route: Next.js → Backend FastAPI /api/v1/match/search
// Keeps GEOLAND_API_KEY server-side only (FIX-FRONT-P1-01)

import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'https://geoland-backend-final.onrender.com'
const API_KEY = process.env.GEOLAND_API_KEY || process.env.NEXT_PUBLIC_GEOLAND_API_KEY // server-side

export async function GET(req: NextRequest) {
  if (!API_KEY) {
    console.error('[/api/match] GEOLAND_API_KEY not configured')
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
  }

  // Pass query params to backend
  const searchParams = req.nextUrl.searchParams
  const backendUrl = `${BACKEND_URL}/api/v1/match/search?${searchParams.toString()}`

  try {
    const res = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
      },
    })

    if (!res.ok) {
      const errBody = await res.text()
      console.error('[/api/match] Backend error:', res.status, errBody)
      // Forward the status code to the client
      try {
        const errJson = JSON.parse(errBody)
        return NextResponse.json(errJson, { status: res.status })
      } catch {
        return NextResponse.json(
          { error: 'Backend error', detail: errBody },
          { status: res.status }
        )
      }
    }

    const data = await res.json()
    
    // Transform data to align with frontend requirements (PLAN-ALINEACION-01)
    if (data.results && Array.isArray(data.results)) {
      data.results = data.results.map((asset: any) => {
        const metrics = asset.layer2?.metrics || {}
        const riskLevel = asset.layer1?.riskLevel || ''
        
        return {
          ...asset,
          ...metrics, // Flatten metrics to root
          // Map backend field names to frontend expected names
          capex_estimado: metrics.capex_total ?? metrics.capex_estimado ?? 0,
          arv_estimado: metrics.arv ?? metrics.arv_estimado ?? 0,
          vacancia_pct: metrics.vacancia ?? metrics.vacancia_pct ?? 0,
          precio_m2_zona: metrics.precio_m2_zona ?? 0,
          // Normalize risk score from Spanish labels
          risk_score: riskLevel === 'Muy Bajo' ? 20
                    : riskLevel === 'Bajo'     ? 35
                    : riskLevel === 'Medio'    ? 55
                    : riskLevel === 'Medio-Alto' ? 70
                    : riskLevel === 'Alto'     ? 85
                    : 50,
          payback_meses: metrics.payback_meses ?? 0,
          // Ensure core identification fields are always at root
          asset_id: asset.id || asset.asset_id,
        }
      })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('[/api/match] Error:', error)
    return NextResponse.json(
      { error: 'Backend unavailable' },
      { status: 503 }
    )
  }
}
