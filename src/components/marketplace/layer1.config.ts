// frontend/src/components/marketplace/layer1.config.ts

export type MetricDef = {
  label: string
  field: string          // campo en asset.layer2.metrics
  format: 'percent' | 'currency' | 'number' | 'months' | 'area'
  suffix?: string
}

export const STRATEGY_CARD_METRICS: Record<string, [MetricDef, MetricDef, MetricDef]> = {
  FIX_FLIP: [
    { label: 'EST. IRR',    field: 'roiTotal',       format: 'percent' },
    { label: 'NET MARGIN',  field: 'margen_bruto',   format: 'percent' },
    { label: 'ARV',         field: 'arv',            format: 'currency' },
  ],
  VALUE_ADD: [
    { label: 'EST. IRR',      field: 'roiTotal',     format: 'percent' },
    { label: 'YIELD-ON-COST', field: 'yield_neto',   format: 'percent' },
    { label: 'POST-NOI',      field: 'noi_anual',    format: 'currency' },
  ],
  RENTAL_LONG_TERM: [
    { label: 'NET YIELD',    field: 'yield_neto',    format: 'percent' },
    { label: 'MONTHLY NOI',  field: 'noi_mensual',   format: 'currency' },
    { label: 'VACANCY',      field: 'vacancia',      format: 'percent' },
  ],
  SHORT_TERM_RENTAL: [
    { label: 'NET YIELD STR', field: 'yield_neto',   format: 'percent' },
    { label: 'ADR',           field: 'adr',          format: 'currency' },
    { label: 'OCCUPANCY',     field: 'ocupacion_airbnb', format: 'percent' },
  ],
  BUY_AND_HOLD: [
    { label: 'APPRECIATION',  field: 'apreciacion_anual', format: 'percent' },
    { label: 'EST. IRR',      field: 'roiTotal',          format: 'percent' },
    { label: 'HOLDING COST',  field: 'holding_cost_anual', format: 'percent' },
  ],
  NNN_COMERCIAL: [
    { label: 'NET YIELD',     field: 'yield_neto',   format: 'percent' },
    { label: 'ANNUAL NOI',    field: 'noi_anual',    format: 'currency' },
    { label: 'WALT',          field: 'walt_anos',    format: 'number', suffix: 'YRS' },
  ],
  GREENFIELD: [
    { label: 'PROJ. IRR',     field: 'roiTotal',       format: 'percent' },
    { label: 'PROFIT ON COST', field: 'profit_on_cost', format: 'percent' },
    { label: 'M² BUILTABLE',  field: 'm2_edificables', format: 'number', suffix: 'M²' },
  ],
  SUBDIVISION: [
    { label: 'MARGIN/LOT',    field: 'margen_lote',    format: 'percent' },
    { label: 'EST. IRR',      field: 'roiTotal',       format: 'percent' },
    { label: 'ABSORPTION',    field: 'meses_absorcion', format: 'number', suffix: 'MO' },
  ],
  DISTRESSED: [
    { label: 'DISCOUNT',      field: 'descuento_pct',  format: 'percent' },
    { label: 'EST. IRR',      field: 'roiTotal',       format: 'percent' },
    { label: 'RESOLUTION',    field: 'meses_saneamiento', format: 'number', suffix: 'MO' },
  ],
  LAND_BANKING: [
    { label: 'UPSIDE',        field: 'apreciacion_anual', format: 'percent' },
    { label: 'HOLDING COST',  field: 'holding_cost_anual', format: 'percent' },
    { label: 'AREA',          field: 'superficie_m2',     format: 'number', suffix: 'M²' },
  ],
  FARMLAND: [
    { label: 'AGRO YIELD',    field: 'yield_neto',     format: 'percent' },
    { label: 'EXPECTED YIELD', field: 'yield_bruto',   format: 'percent' },
    { label: 'AREA',          field: 'superficie_m2',  format: 'number', suffix: 'M²' },
  ],
  LIVESTOCK: [
    { label: 'LIVESTOCK YIELD', field: 'yield_neto',   format: 'percent' },
    { label: 'STOCKING RATE', field: 'carga_animal',   format: 'number', suffix: 'CAB/HA' },
    { label: 'AREA',          field: 'superficie_m2',  format: 'number', suffix: 'M²' },
  ],
  MIXED_FARMLAND: [
    { label: 'MIXED YIELD',   field: 'yield_neto',     format: 'percent' },
    { label: 'SPLIT RATIO',   field: 'split_ratio',    format: 'percent' },
    { label: 'AREA',          field: 'superficie_m2',  format: 'number', suffix: 'M²' },
  ],
  FORESTRY: [
    { label: 'FORESTRY IRR',  field: 'roiTotal',       format: 'percent' },
    { label: 'WOOD VALUE',    field: 'wood_value',     format: 'currency' },
    { label: 'AREA',          field: 'superficie_m2',  format: 'number', suffix: 'M²' },
  ],
};

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
  'livestock':                  'LIVESTOCK',
  'mixed_farmland':             'MIXED_FARMLAND',
  'forestry':                   'FORESTRY',
  'subdivision':                'SUBDIVISION',
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
