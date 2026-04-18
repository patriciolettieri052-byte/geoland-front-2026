import React from 'react'

interface Props {
  title: string
  subtitle?: string
  onBack: () => void
  children: React.ReactNode
}

export function InnerPageWrapper({ title, subtitle, onBack, children }: Props) {
  return (
    <div style={{
      height: '100%',
      overflowY: 'auto',
      backgroundColor: '#F8FAFC',
      padding: '32px 32px',
      fontFamily: 'Inter, sans-serif'
    }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <button
          onClick={onBack}
          style={{
            background: 'none', border: 'none',
            fontSize: 13, color: '#64748B',
            cursor: 'pointer', padding: 0,
            marginBottom: 16, display: 'flex',
            alignItems: 'center', gap: 6
          }}
        >
          ← Volver al marketplace
        </button>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0F172A', margin: 0 }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{ fontSize: 14, color: '#64748B', marginTop: 4, margin: '4px 0 0' }}>
            {subtitle}
          </p>
        )}
      </div>
      {children}
    </div>
  )
}
