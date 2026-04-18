'use client'
import { useState } from 'react'
import { InnerPageWrapper } from './InnerPageWrapper'

const faqs = [
  {
    q: '¿Qué es el ISV?',
    a: 'El ISV (Investor Strategy Vector) es tu perfil inversor. Lo construye el agente conversacional en base a tus respuestas: mercado, presupuesto, estrategia, tolerancia al riesgo y horizonte de inversión. Cuanto más preciso sea tu ISV, mejores serán los activos que te mostramos.'
  },
  {
    q: '¿Cómo se calcula el G-Score?',
    a: 'El G-Score es una métrica de 0 a 100 que combina la calidad intrínseca del activo (AQS: métricas financieras reales como IRR, cap rate y ROI) con la compatibilidad con tu perfil inversor (IMS: qué tan bien encaja el activo con tu ISV). Un G-Score sobre 70 indica alta compatibilidad.'
  },
  {
    q: '¿Qué significa el nivel de confianza?',
    a: 'El nivel de confianza refleja la calidad de los datos del activo. Un 90%+ significa que el anuncio tiene información completa y verificada. Un nivel más bajo indica que algunos campos fueron estimados a partir de promedios de mercado — el análisis sigue siendo válido pero con mayor incertidumbre.'
  },
  {
    q: '¿Puedo cambiar mi perfil inversor?',
    a: 'Sí. Desde "Mi perfil inversor" en el menú podés ver tu perfil actual y actualizarlo con el botón "Actualizar perfil inversor". El agente te guiará por el proceso de nuevo.'
  },
  {
    q: '¿En qué mercados opera Geoland?',
    a: 'Actualmente operamos en Madrid, Miami, Dubai y Buenos Aires. Cada mercado tiene su propio análisis de contexto económico, tasas locales y parámetros de rentabilidad.'
  },
  {
    q: '¿Qué estrategias de inversión cubre la plataforma?',
    a: 'Cubrimos 14 estrategias: Renta residencial, Fix & Flip, Value Add, Distressed, Short-Term Rental, NNN Comercial, Sale & Leaseback, Land Banking, Greenfield, FARMLAND, LIVESTOCK, Forestry, Hotel Boutique y Oportunidad de Desarrollo.'
  },
  {
    q: '¿Cómo se calculan los retornos?',
    a: 'Los retornos (IRR, ROI, Cap Rate) se calculan usando los datos del anuncio enriquecidos con parámetros reales de cada mercado: precios por zona, tasas de ocupación, impuestos locales y costos operativos. No son estimaciones genéricas — reflejan las condiciones actuales del mercado.'
  },
  {
    q: '¿Puedo guardar activos para analizarlos después?',
    a: 'La función de favoritos estará disponible próximamente. Estamos trabajando en el Investor Bureau, tu espacio personal para guardar y comparar activos.'
  },
]

export function AyudaPage({ onBack }: { onBack: () => void }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <InnerPageWrapper
      title="Centro de ayuda"
      subtitle="Preguntas frecuentes sobre la plataforma"
      onBack={onBack}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {faqs.map((faq, i) => (
          <div
            key={i}
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5E7EB',
              borderRadius: 10,
              overflow: 'hidden'
            }}
          >
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              style={{
                width: '100%', textAlign: 'left',
                padding: '14px 18px',
                background: 'none', border: 'none',
                cursor: 'pointer', display: 'flex',
                justifyContent: 'space-between', alignItems: 'center',
                fontSize: 14, fontWeight: 500, color: '#0F172A',
                fontFamily: 'Inter, sans-serif'
              }}
            >
              {faq.q}
              <span style={{ color: '#94A3B8', fontSize: 18, lineHeight: 1 }}>
                {openIndex === i ? '−' : '+'}
              </span>
            </button>
            {openIndex === i && (
              <div style={{
                padding: '0 18px 14px',
                fontSize: 13, color: '#64748B', lineHeight: 1.7,
                borderTop: '1px solid #F1F5F9'
              }}>
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{
        marginTop: 24,
        backgroundColor: '#F0F7FF',
        border: '1px solid #BFDBFE',
        borderRadius: 10,
        padding: 16
      }}>
        <p style={{ fontSize: 13, color: '#1E40AF', margin: 0 }}>
          ¿No encontrás lo que buscás? Escribinos a <strong>hola@geoland.io</strong>
        </p>
      </div>
    </InnerPageWrapper>
  )
}
