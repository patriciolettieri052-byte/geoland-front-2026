// frontend/src/components/marketplace/layer1.config.ts

export type MetricDef = {
  label: string
  field: string          // campo en asset.layer2.metrics
  format: 'percent' | 'currency' | 'number' | 'months' | 'area'
  suffix?: string
}

export const STRATEGY_CARD_METRICS: Record<string, [MetricDef, MetricDef, MetricDef]> = {
  FIX_FLIP: [
    { label: 'IRR EST.',    field: 'roiTotal',       format: 'percent' },
    { label: 'MARGEN',      field: 'margen_bruto',   format: 'percent' },
    { label: 'DESCUENTO',   field: 'descuento_pct',  format: 'percent' },
  ],
  VALUE_ADD: [
    { label: 'IRR EST.',    field: 'roiTotal',        format: 'percent' },
    { label: 'YIELD POST',  field: 'yield_post',      format: 'percent' },
    { label: 'APRECIACIÓN', field: 'apreciacion_anual', format: 'percent' },
  ],
  RENTAL_LONG_TERM: [
    { label: 'CAP RATE',    field: 'cap_rate',        format: 'percent' },
    { label: 'RENTA/MES',   field: 'renta_mensual',   format: 'currency', suffix: '/mes' },
    { label: 'VACANCIA',    field: 'vacancia_avg',    format: 'percent' },
  ],
  SHORT_TERM_RENTAL: [
    { label: 'CAP RATE',    field: 'cap_rate',        format: 'percent' },
    { label: 'REVPAR',      field: 'revpar',          format: 'currency', suffix: '/día' },
    { label: 'OCUPACIÓN',   field: 'ocupacion_pct',   format: 'percent' },
  ],
  BUY_AND_HOLD: [
    { label: 'IRR EST.',    field: 'roiTotal',        format: 'percent' },
    { label: 'APRECIACIÓN', field: 'apreciacion_anual', format: 'percent' },
    { label: 'CAP RATE',    field: 'cap_rate',        format: 'percent' },
  ],
  NNN_COMERCIAL: [
    { label: 'CAP RATE',    field: 'cap_rate',        format: 'percent' },
    { label: 'NOI ANUAL',   field: 'noi_anual',       format: 'currency' },
    { label: 'SUPERFICIE',  field: 'precio_m2',       format: 'currency', suffix: '/m²' },
  ],
  GREENFIELD: [
    { label: 'IRR PROY.',   field: 'roiTotal',        format: 'percent' },
    { label: 'PRECIO/M²',   field: 'precio_m2',       format: 'currency' },
    { label: 'M² EDIF.',    field: 'm2_edificables',  format: 'area', suffix: 'm²' },
  ],
  SUBDIVISION: [
    { label: 'APREC. PROY.',field: 'apreciacion_anual', format: 'percent' },
    { label: 'PRECIO/M²',   field: 'precio_m2',       format: 'currency' },
    { label: 'SUPERFICIE',  field: 'precio_m2',       format: 'area', suffix: 'm²' },
  ],
  DISTRESSED: [
    { label: 'DESCUENTO',   field: 'descuento_pct',   format: 'percent' },
    { label: 'IRR EST.',    field: 'roiTotal',        format: 'percent' },
    { label: 'SANEAMIENTO', field: 'meses_saneamiento', format: 'months', suffix: 'meses' },
  ],
  LAND_BANKING: [
    { label: 'APREC. PROY.',field: 'apreciacion_anual', format: 'percent' },
    { label: 'PRECIO/M²',   field: 'precio_m2',       format: 'currency' },
    { label: 'SUPERFICIE',  field: 'precio_m2',       format: 'area', suffix: 'm²' },
  ],
  FARMLAND: [
    { label: 'YIELD AGRO',  field: 'cap_rate',        format: 'percent' },
    { label: 'PRECIO/HA',   field: 'precio_ha',       format: 'currency' },
    { label: 'SUPERFICIE',  field: 'superficie_ha',   format: 'area', suffix: 'ha' },
  ],
  LIVESTOCK: [
    { label: 'YIELD GANAD.',field: 'cap_rate',        format: 'percent' },
    { label: 'CARGA ANIM.', field: 'carga_animal',    format: 'number', suffix: 'cab/ha' },
    { label: 'SUPERFICIE',  field: 'superficie_ha',   format: 'area', suffix: 'ha' },
  ],
  MIXED_FARMLAND: [
    { label: 'YIELD MIXTO', field: 'cap_rate',        format: 'percent' },
    { label: 'PRECIO/HA',   field: 'precio_ha',       format: 'currency' },
    { label: 'SUPERFICIE',  field: 'superficie_ha',   format: 'area', suffix: 'ha' },
  ],
  FORESTRY: [
    { label: 'YIELD FOREST.',field: 'cap_rate',       format: 'percent' },
    { label: 'PRECIO/HA',   field: 'precio_ha',       format: 'currency' },
    { label: 'SUPERFICIE',  field: 'superficie_ha',   format: 'area', suffix: 'ha' },
  ],
}

// Normalizer para keys del backend
export const STRATEGY_KEY_MAP: Record<string, string> = {
  'fix_and_flip':               'FIX_FLIP',
  'FIX_AND_FLIP':               'FIX_FLIP',
  'rental_short_term':          'SHORT_TERM_RENTAL',
  'RENTAL_SHORT_TERM':          'SHORT_TERM_RENTAL',
  'rental_long_term':           'RENTAL_LONG_TERM',
  'commercial':                 'NNN_COMERCIAL',
  'COMMERCIAL':                 'NNN_COMERCIAL',
  'development':                'GREENFIELD',
  'DEVELOPMENT':                'GREENFIELD',
  'agriculture':                'FARMLAND',
  'AGRICULTURE':                'FARMLAND',
  'buy_and_hold_appreciation':  'BUY_AND_HOLD',
  // Pass-through
  'VALUE_ADD':                  'VALUE_ADD',
  'BUY_AND_HOLD':               'BUY_AND_HOLD',
  'DISTRESSED':                 'DISTRESSED',
  'LAND_BANKING':               'LAND_BANKING',
  'LIVESTOCK':                  'LIVESTOCK',
  'MIXED_FARMLAND':             'MIXED_FARMLAND',
  'FORESTRY':                   'FORESTRY',
  'SUBDIVISION':                'SUBDIVISION',
}

export function formatMetric(value: unknown, format: MetricDef['format'], suffix?: string): string {
  if (value === null || value === undefined) return '—'
  const num = Number(value)
  if (isNaN(num)) return '—'

  switch (format) {
    case 'percent':
      // Backend envía decimales (0.163) o porcentajes (16.3)
      const pct = num <= 1 && num > -1 ? num * 100 : num
      return `${pct.toFixed(1)}%`
    case 'currency':
      if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`
      if (num >= 1000) return `$${(num / 1000).toFixed(0)}K`
      return `$${num.toFixed(0)}`
    case 'number':
      return `${num.toFixed(1)}${suffix ? ' ' + suffix : ''}`
    case 'months':
      return `${Math.round(num)}${suffix ? ' ' + suffix : ''}`
    case 'area':
      if (num >= 1000) return `${(num / 1000).toFixed(1)}K ${suffix || ''}`
      return `${num.toFixed(0)} ${suffix || ''}`
    default:
      return String(num)
  }
}

export function getConfidenceBadge(confidence: number): { label: string; color: string } {
  if (confidence >= 0.80) return { label: 'Verificado',    color: '#16A34A' }
  if (confidence >= 0.60) return { label: 'Datos buenos',  color: '#CA8A04' }
  if (confidence >= 0.40) return { label: 'Datos parciales', color: '#EA580C' }
  return                         { label: 'Estimado',      color: '#9CA3AF' }
}
