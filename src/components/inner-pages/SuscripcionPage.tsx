'use client'
import { InnerPageWrapper } from './InnerPageWrapper'

export function SuscripcionPage({ onBack }: { onBack: () => void }) {
  return (
    <InnerPageWrapper
      title="Planes y suscripción"
      subtitle="Accedé a análisis institucionales de nivel profesional"
      onBack={onBack}
    >
      {/* Plan actual */}
      <div style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid #E5E7EB',
        borderRadius: 12, padding: 24, marginBottom: 16
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: 13, color: '#94A3B8', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Plan actual</p>
            <p style={{ fontSize: 18, fontWeight: 700, color: '#0F172A', margin: 0 }}>Beta Access</p>
          </div>
          <span style={{
            backgroundColor: '#DCFCE7', color: '#16A34A',
            borderRadius: 20, padding: '4px 12px',
            fontSize: 12, fontWeight: 600
          }}>Activo</span>
        </div>
      </div>

      {/* Bureau — candado Premium */}
      <div style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid #E5E7EB',
        borderRadius: 12, padding: 24, marginBottom: 16,
        position: 'relative', overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute', top: 12, right: 12,
          backgroundColor: '#F59E0B', color: '#FFFFFF',
          borderRadius: 20, padding: '3px 10px',
          fontSize: 11, fontWeight: 700
        }}>PREMIUM</div>
        <h2 style={{ fontSize: 15, fontWeight: 600, color: '#0F172A', marginTop: 0, marginBottom: 8 }}>
          🔒 Investor Bureau
        </h2>
        <p style={{ fontSize: 13, color: '#64748B', lineHeight: 1.6, margin: '0 0 16px' }}>
          Tu espacio personal de inversión. Guardá activos, accedé a informes completos (Investment Memo, Risk Report, Financial Deep Dive) y comparalos lado a lado.
        </p>
        <div style={{
          backgroundColor: '#FFFBEB',
          border: '1px solid #FDE68A',
          borderRadius: 8, padding: '10px 14px'
        }}>
          <p style={{ fontSize: 13, color: '#92400E', margin: 0 }}>
            Disponible en la versión Premium — próximamente.
          </p>
        </div>
      </div>

      {/* CTA */}
      <div style={{
        backgroundColor: '#1E3A5F',
        borderRadius: 12, padding: 24, textAlign: 'center'
      }}>
        <p style={{ fontSize: 15, fontWeight: 600, color: '#FFFFFF', margin: '0 0 8px' }}>
          ¿Querés acceso anticipado al plan Premium?
        </p>
        <p style={{ fontSize: 13, color: '#94A3B8', margin: '0 0 16px' }}>
          Escribinos y te contactamos cuando esté disponible.
        </p>
        <a
          href="mailto:hola@geoland.io?subject=Acceso Premium Geoland"
          style={{
            display: 'inline-block',
            backgroundColor: '#FFFFFF', color: '#1E3A5F',
            borderRadius: 8, padding: '10px 24px',
            fontSize: 14, fontWeight: 600,
            textDecoration: 'none'
          }}
        >
          Contactar →
        </a>
      </div>
    </InnerPageWrapper>
  )
}
