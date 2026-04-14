'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useGeolandStore } from '@/store/useGeolandStore'

export default function PerfilPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  // Obtenemos los datos directamente del store para mayor precisión
  const isvV6 = useGeolandStore(state => state.isvV6)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
    }
  }, [user, loading, router])

  if (loading || !user) return null

  const nombre = user.user_metadata?.full_name ?? user.user_metadata?.nombre ?? user.email ?? 'Usuario'
  const inicial = nombre[0].toUpperCase()
  const fechaRegistro = new Date(user.created_at).toLocaleDateString('es-ES', {
    year: 'numeric', month: 'long', day: 'numeric'
  })

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#F8FAFC',
      padding: '40px 24px',
      fontFamily: 'Inter, sans-serif'
    }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0F172A', margin: 0 }}>
            Mi Perfil
          </h1>
          <p style={{ fontSize: 14, color: '#64748B', marginTop: 4 }}>
            Gestioná tu cuenta y perfil inversor
          </p>
        </div>

        {/* Card — Datos básicos */}
        <div style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E5E7EB',
          borderRadius: 12,
          padding: 24,
          marginBottom: 16
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              backgroundColor: '#000000',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, fontWeight: 700, color: '#FFFFFF'
            }}>
              {inicial}
            </div>
            <div>
              <p style={{ fontSize: 18, fontWeight: 600, color: '#0F172A', margin: 0 }}>
                {nombre}
              </p>
              <p style={{ fontSize: 13, color: '#64748B', margin: 0 }}>
                {user.email}
              </p>
            </div>
          </div>
          <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: 16 }}>
            <p style={{ fontSize: 12, color: '#94A3B8', margin: 0 }}>
              Miembro desde {fechaRegistro}
            </p>
          </div>
        </div>

        {/* Card — ISV resumen */}
        <div style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E5E7EB',
          borderRadius: 12,
          padding: 24,
          marginBottom: 16
        }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: '#0F172A', marginTop: 0, marginBottom: 16 }}>
            Perfil Inversor (ISV)
          </h2>
          {isvV6?.strategy_primary ? (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[
                  { label: 'Mercado', value: isvV6.preferred_markets?.length > 0 ? isvV6.preferred_markets.join(', ') : 'Global' },
                  { label: 'Tipo de activo', value: isvV6.asset_class === 'real_estate' ? 'Vivienda' : isvV6.asset_class === 'farmland' ? 'Campo' : 'Cualquiera' },
                  { label: 'Estrategia', value: isvV6.strategy_primary?.replace(/_/g, ' ') || 'No definida' },
                  { label: 'Riesgo', value: isvV6.decision_tradeoff || 'No definido' },
                  { label: 'Horizonte', value: isvV6.time_horizon || 'No definido' },
                  { label: 'Presupuesto máx.', value: isvV6.budget?.amount_max
                    ? `${isvV6.budget.amount_max.toLocaleString()} ${isvV6.budget.currency ?? 'USD'}`
                    : '—'
                  },
                ].map(({ label, value }) => (
                  <div key={label} style={{
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #E5E7EB',
                    borderRadius: 8,
                    padding: '10px 14px'
                  }}>
                    <p style={{ fontSize: 11, color: '#94A3B8', margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {label}
                    </p>
                    <p style={{ fontSize: 14, fontWeight: 500, color: '#0F172A', margin: 0, textTransform: 'capitalize' }}>
                      {value}
                    </p>
                  </div>
                ))}
              </div>
              <div style={{ borderTop: '1px solid #E5E7EB', marginTop: 16, paddingTop: 16 }}>
                <button
                  onClick={() => {
                    useGeolandStore.getState().resetOnboarding();
                    router.push('/');
                  }}
                  style={{
                    backgroundColor: 'transparent',
                    border: '1px solid #E5E7EB',
                    borderRadius: 8,
                    padding: '8px 16px',
                    fontSize: 13,
                    color: '#64748B',
                    cursor: 'pointer',
                    fontFamily: 'Inter, sans-serif'
                  }}
                >
                  Actualizar perfil inversor
                </button>
              </div>
            </>

          ) : (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <p style={{ fontSize: 14, color: '#94A3B8', margin: '0 0 12px' }}>
                Todavía no completaste tu perfil inversor
              </p>
              <button
                onClick={() => router.push('/')}
                style={{
                  backgroundColor: '#000000',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: 8,
                  padding: '10px 20px',
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: 'pointer'
                }}
              >
                Completar perfil
              </button>
            </div>
          )}
        </div>

        {/* Acceso a Uso */}
        <div style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E5E7EB',
          borderRadius: 12,
          padding: 20,
          marginBottom: 24,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, color: '#0F172A', margin: 0 }}>Uso del plan</p>
            <p style={{ fontSize: 12, color: '#94A3B8', margin: '2px 0 0' }}>Ver mis consumos y límites mensuales</p>
          </div>
          <button 
            onClick={() => router.push('/uso')}
            style={{
              backgroundColor: 'transparent',
              border: '1px solid #000000',
              borderRadius: 8,
              padding: '6px 12px',
              fontSize: 13,
              fontWeight: 500,
              color: '#000000',
              cursor: 'pointer'
            }}
          >
            Ver uso
          </button>
        </div>

        {/* Volver */}
        <button
          onClick={() => router.push('/')}
          style={{
            background: 'none',
            border: 'none',
            fontSize: 14,
            color: '#64748B',
            cursor: 'pointer',
            padding: 0
          }}
        >
          ← Volver al marketplace
        </button>

      </div>
    </div>
  )
}
