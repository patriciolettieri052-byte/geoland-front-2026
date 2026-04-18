'use client'
import { InnerPageWrapper } from './InnerPageWrapper'

const mercados = ['Madrid', 'Miami', 'Dubai', 'Buenos Aires']
const estrategias = [
  'Renta residencial', 'Fix & Flip', 'Value Add', 'Distressed',
  'Short-Term Rental', 'NNN Comercial', 'Sale & Leaseback', 'Land Banking',
  'Greenfield', 'FARMLAND', 'LIVESTOCK', 'Forestry',
  'Hotel Boutique', 'Oportunidad de Desarrollo'
]

export function QueEsGeolandPage({ onBack }: { onBack: () => void }) {
  return (
    <InnerPageWrapper
      title="¿Qué es Geoland?"
      subtitle="La infraestructura de decisión para inversión inmobiliaria global"
      onBack={onBack}
    >
      {/* Propuesta de valor */}
      <div style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid #E5E7EB',
        borderRadius: 12, padding: 24, marginBottom: 16
      }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, color: '#0F172A', marginTop: 0, marginBottom: 12 }}>
          El problema que resolvemos
        </h2>
        <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.7, margin: 0 }}>
          Los inversores internacionales pierden oportunidades porque analizar activos en múltiples mercados es lento, costoso y opaco. Los portales tradicionales muestran listados — nosotros mostramos decisiones. Cada activo en Geoland pasa por un pipeline de análisis que calcula retornos reales, evalúa riesgos y lo compara contra tu perfil inversor específico.
        </p>
      </div>

      {/* Cómo funciona */}
      <div style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid #E5E7EB',
        borderRadius: 12, padding: 24, marginBottom: 16
      }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, color: '#0F172A', marginTop: 0, marginBottom: 16 }}>
          Cómo funciona
        </h2>
        {[
          { num: '01', title: 'Construís tu ISV', desc: 'El agente conversacional mapea tu perfil inversor: mercado, presupuesto, estrategia, riesgo y horizonte.' },
          { num: '02', title: 'El pipeline analiza', desc: 'Cada activo pasa por 11 pasos de análisis: normalización, enriquecimiento con datos de mercado, cálculo financiero real y scoring.' },
          { num: '03', title: 'Recibís decisiones rankeadas', desc: 'Los activos más compatibles con tu perfil aparecen primero, ordenados por G-Score — una métrica que combina calidad intrínseca y compatibilidad con tu ISV.' },
        ].map(({ num, title, desc }) => (
          <div key={num} style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              backgroundColor: '#1E3A5F', color: '#FFFFFF',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 700, flexShrink: 0
            }}>
              {num}
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#0F172A', margin: '0 0 4px' }}>{title}</p>
              <p style={{ fontSize: 13, color: '#64748B', margin: 0, lineHeight: 1.6 }}>{desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Mercados */}
      <div style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid #E5E7EB',
        borderRadius: 12, padding: 24, marginBottom: 16
      }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, color: '#0F172A', marginTop: 0, marginBottom: 12 }}>
          4 mercados activos
        </h2>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {mercados.map(m => (
            <span key={m} style={{
              backgroundColor: '#F0F7FF', color: '#1E40AF',
              border: '1px solid #BFDBFE',
              borderRadius: 20, padding: '4px 14px',
              fontSize: 13, fontWeight: 500
            }}>{m}</span>
          ))}
        </div>
      </div>

      {/* Estrategias */}
      <div style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid #E5E7EB',
        borderRadius: 12, padding: 24
      }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, color: '#0F172A', marginTop: 0, marginBottom: 12 }}>
          14 estrategias de inversión
        </h2>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {estrategias.map(e => (
            <span key={e} style={{
              backgroundColor: '#F8FAFC', color: '#475569',
              border: '1px solid #E5E7EB',
              borderRadius: 20, padding: '4px 14px',
              fontSize: 12
            }}>{e}</span>
          ))}
        </div>
      </div>
    </InnerPageWrapper>
  )
}
