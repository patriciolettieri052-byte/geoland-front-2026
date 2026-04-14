'use client'

interface LimitModalProps {
  isOpen: boolean
  onClose: () => void
  actionLabel?: string
}

export function LimitModal({ isOpen, onClose, actionLabel = 'búsquedas' }: LimitModalProps) {
  if (!isOpen) return null

  return (
    <div style={{
      position: 'fixed', 
      inset: 0,
      backgroundColor: 'rgba(0,0,0,0.6)',
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(4px)'
    }}
      onClick={onClose}
    >
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 40,
        maxWidth: 440,
        width: '90%',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
        border: '1px solid #E5E7EB'
      }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>⚡</div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0F172A', margin: '0 0 12px' }}>
            Límite mensual alcanzado
          </h2>
          <p style={{ fontSize: 14, color: '#64748B', margin: 0, lineHeight: 1.6 }}>
            Alcanzaste tu límite de {actionLabel} para este mes.
            Los contadores se reinician el primer día del mes próximo.
          </p>
        </div>

        <a
          href="mailto:hola@geoland.io?subject=Ampliar límite de uso"
          style={{
            display: 'block',
            backgroundColor: '#000000',
            color: '#FFFFFF',
            textAlign: 'center',
            padding: '14px 24px',
            borderRadius: 12,
            fontSize: 14,
            fontWeight: 600,
            textDecoration: 'none',
            marginBottom: 12,
            transition: 'opacity 0.2s'
          }}
        >
          Contactar para ampliar →
        </a>

        <button
          onClick={onClose}
          style={{
            display: 'block',
            width: '100%',
            backgroundColor: 'transparent',
            border: '1px solid #E5E7EB',
            borderRadius: 12,
            padding: '12px 24px',
            fontSize: 14,
            fontWeight: 500,
            color: '#64748B',
            cursor: 'pointer',
            transition: 'background-color 0.2s'
          }}
        >
          Cerrar
        </button>
      </div>
    </div>
  )
}
