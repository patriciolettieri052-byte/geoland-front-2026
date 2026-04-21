'use client'

import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import { useGeolandStore } from '@/store/useGeolandStore'

interface CompareViewProps {
  assetA: any
  assetB: any
  onClose: () => void
}

const METRICAS = [
  { label: 'IRR',       key: (a: any) => `${((a.layer1?.expectedIrr ?? 0) * 100).toFixed(1)}%` },
  { label: 'G-Score',   key: (a: any) => `${a.layer1?.gScore ?? '—'}` },
  { label: 'Precio',    key: (a: any) => a.precio_usd ? `$${a.precio_usd.toLocaleString()}` : '—' },
  { label: 'Estrategia',key: (a: any) => a.etiqueta_operacion ?? a.strategy ?? '—' },
  { label: 'Mercado',   key: (a: any) => a.mercado ?? '—' },
  { label: 'Confianza', key: (a: any) => `${((a.confidence ?? 0) * 100).toFixed(0)}%` },
  { label: 'Riesgo',    key: (a: any) => a.layer1?.riskLevel ?? '—' },
  { label: 'Liquidez',  key: (a: any) => a.layer1?.liquidity ?? '—' },
]

export function AecCompareView({ assetA, assetB, onClose }: CompareViewProps) {
  if (!assetA || !assetB) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-full overflow-y-auto"
      style={{ background: '#F9FAFB' }}
    >
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3"
        style={{ background: '#FFFFFF', borderBottom: '1px solid #E5E7EB' }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Comparación de activos
        </span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF' }}>
          <X size={16} />
        </button>
      </div>

      {/* Headers de los dos assets */}
      <div className="grid grid-cols-2 gap-0" style={{ borderBottom: '1px solid #E5E7EB' }}>
        {[assetA, assetB].map((asset, i) => (
          <div key={i} style={{
            padding: '14px 16px',
            borderRight: i === 0 ? '1px solid #E5E7EB' : 'none',
            background: '#FFFFFF'
          }}>
            <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Activo {i + 1}
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#0F1117' }}>
              {asset.etiqueta_operacion ?? asset.strategy ?? 'Sin etiqueta'}
            </div>
            <div style={{ fontSize: 11, color: '#6B7280', marginTop: 2 }}>
              {asset.mercado}
            </div>
          </div>
        ))}
      </div>

      {/* Métricas comparadas */}
      {METRICAS.map((m, i) => {
        const valA = m.key(assetA)
        const valB = m.key(assetB)
        return (
          <div key={i} className="grid grid-cols-2 gap-0"
            style={{ borderBottom: '1px solid #F3F4F6', background: i % 2 === 0 ? '#FFFFFF' : '#F9FAFB' }}>
            {[valA, valB].map((val, j) => (
              <div key={j} style={{
                padding: '10px 16px',
                borderRight: j === 0 ? '1px solid #E5E7EB' : 'none',
              }}>
                {j === 0 && (
                  <div style={{ fontSize: 10, color: '#9CA3AF', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {m.label}
                  </div>
                )}
                <div style={{ fontSize: 13, fontWeight: 500, color: '#0F1117' }}>
                  {val}
                </div>
              </div>
            ))}
          </div>
        )
      })}

      {/* CTA — abrir en Layer 2 */}
      <div className="grid grid-cols-2 gap-3 p-4">
        {[assetA, assetB].map((asset, i) => (
          <button
            key={i}
            onClick={() => {
              const store = useGeolandStore.getState()
              store.setCompareAssetIds(null)
              store.setActiveAssetId(asset.id ?? asset.asset_id)
            }}
            style={{
              background: '#000000', color: '#FFFFFF', border: 'none',
              borderRadius: 8, padding: '10px', fontSize: 12, fontWeight: 600, cursor: 'pointer'
            }}
          >
            Ver análisis completo →
          </button>
        ))}
      </div>
    </motion.div>
  )
}
