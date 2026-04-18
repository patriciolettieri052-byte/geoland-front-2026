'use client'
import { InnerPageWrapper } from './InnerPageWrapper'

export function FavoritosPage({ onBack }: { onBack: () => void }) {
  return (
    <InnerPageWrapper
      title="Mis favoritos"
      subtitle="Activos que guardaste para analizar"
      onBack={onBack}
    >
      {/* Empty state */}
      <div style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid #E5E7EB',
        borderRadius: 12, padding: '48px 24px',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>🏛</div>
        <p style={{ fontSize: 16, fontWeight: 600, color: '#0F172A', margin: '0 0 8px' }}>
          Todavía no guardaste ningún activo
        </p>
        <p style={{ fontSize: 14, color: '#64748B', margin: '0 0 24px', lineHeight: 1.6 }}>
          Explorá el marketplace y guardá los activos que te interesen para analizarlos después.
        </p>
        <button
          onClick={onBack}
          style={{
            backgroundColor: '#1E3A5F', color: '#FFFFFF',
            border: 'none', borderRadius: 8,
            padding: '10px 24px', fontSize: 14,
            fontWeight: 500, cursor: 'pointer',
            fontFamily: 'Inter, sans-serif'
          }}
        >
          Explorar marketplace
        </button>
      </div>

      <div style={{
        marginTop: 16,
        backgroundColor: '#F8FAFC',
        border: '1px solid #E5E7EB',
        borderRadius: 10, padding: 16
      }}>
        <p style={{ fontSize: 13, color: '#94A3B8', margin: 0 }}>
          La función de guardar activos estará disponible próximamente.
        </p>
      </div>
    </InnerPageWrapper>
  )
}
