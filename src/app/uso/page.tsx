'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { getMonthlyUsage } from '@/lib/usage'

interface UsageData {
  search: { used: number; limit: number }
  layer2_view: { used: number; limit: number }
  layer3_generate: { used: number; limit: number }
}

export default function UsoPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [usage, setUsage] = useState<UsageData | null>(null)
  const [loadingUsage, setLoadingUsage] = useState(true)

  useEffect(() => {
    if (!loading && !user) router.push('/')
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      getMonthlyUsage(user.id).then(data => {
        setUsage(data as UsageData)
        setLoadingUsage(false)
      })
    }
  }, [user])

  if (loading || !user) return null

  // Fecha de reset: primer día del mes siguiente
  const resetDate = new Date()
  resetDate.setMonth(resetDate.getMonth() + 1)
  resetDate.setDate(1)
  const resetStr = resetDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })

  const items = usage ? [
    { label: 'Búsquedas', sublabel: 'Análisis de perfil ISV', ...usage.search },
    { label: 'Assets analizados', sublabel: 'Vistas de Layer 2', ...usage.layer2_view },
    { label: 'Informes generados', sublabel: 'Análisis Layer 3', ...usage.layer3_generate },
  ] : []

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#F8FAFC',
      padding: '40px 24px',
      fontFamily: 'Inter, sans-serif'
    }}>
      <div style={{ maxWidth: 600, margin: '0 auto' }}>

        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0F172A', margin: 0 }}>
            Uso del plan
          </h1>
          <p style={{ fontSize: 14, color: '#64748B', marginTop: 4 }}>
            Los contadores se reinician el {resetStr}
          </p>
        </div>

        {loadingUsage ? (
          <p style={{ color: '#94A3B8', fontSize: 14 }}>Cargando...</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {items.map(({ label, sublabel, used, limit }) => {
              const pct = limit > 0 ? Math.min((used / limit) * 100, 100) : 0
              const color = pct >= 90 ? '#EF4444' : pct >= 70 ? '#F59E0B' : '#000000'

              return (
                <div key={label} style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E5E7EB',
                  borderRadius: 12,
                  padding: 20
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 600, color: '#0F172A', margin: 0 }}>
                        {label}
                      </p>
                      <p style={{ fontSize: 12, color: '#94A3B8', margin: '2px 0 0' }}>
                        {sublabel}
                      </p>
                    </div>
                    <p style={{ fontSize: 14, fontWeight: 600, color, margin: 0 }}>
                      {used} / {limit}
                    </p>
                  </div>
                  <div style={{
                    height: 6,
                    backgroundColor: '#F1F5F9',
                    borderRadius: 99,
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${pct}%`,
                      backgroundColor: color,
                      borderRadius: 99,
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <div style={{
          marginTop: 24,
          backgroundColor: '#F0F7FF',
          border: '1px solid #BFDBFE',
          borderRadius: 12,
          padding: 16
        }}>
          <p style={{ fontSize: 13, color: '#1E40AF', margin: 0 }}>
            ¿Necesitás más créditos? Escribinos a <strong>hola@geoland.io</strong>
          </p>
        </div>

        <button
          onClick={() => router.push('/perfil')}
          style={{
            marginTop: 24,
            background: 'none',
            border: 'none',
            fontSize: 14,
            color: '#64748B',
            cursor: 'pointer',
            padding: 0
          }}
        >
          ← Volver a mi perfil
        </button>

      </div>
    </div>
  )
}
