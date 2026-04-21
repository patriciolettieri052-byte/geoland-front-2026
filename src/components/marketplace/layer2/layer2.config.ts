export const STRATEGY_COLORS: Record<string, string> = {
  FIX_FLIP:            "rgba(127,119,221,0.3)",
  FARMLAND:            "rgba(186,117,23,0.3)",
  DISTRESSED:          "rgba(226,75,74,0.3)",
  VALUE_ADD:           "rgba(127,119,221,0.25)",
  LAND_BANKING:        "rgba(186,117,23,0.25)",
  SHORT_TERM_RENTAL:   "rgba(29,158,117,0.25)",
  NNN_COMERCIAL:       "rgba(93,202,165,0.25)",
  GREENFIELD:          "rgba(99,153,34,0.3)",
  SUBDIVISION:         "rgba(99,153,34,0.3)",
  LIVESTOCK:           "rgba(186,117,23,0.2)",
  MIXED_FARMLAND:      "rgba(186,117,23,0.28)",
  FORESTRY:            "rgba(99,153,34,0.25)",
  BUY_AND_HOLD:        "rgba(29,158,117,0.2)",
};

export const STRATEGY_LABELS: Record<string, string> = {
  FIX_FLIP:            "Fix & Flip",
  RENTAL_LONG_TERM:    "Renta larga",
  FARMLAND:            "Farmland",
  DISTRESSED:          "Distressed",
  VALUE_ADD:           "Value Add",
  LAND_BANKING:        "Land Banking",
  SHORT_TERM_RENTAL:   "Short-term Rental",
  NNN_COMERCIAL:       "NNN Comercial",
  GREENFIELD:          "Greenfield",
  SUBDIVISION:         "Subdivisión",
  LIVESTOCK:           "Livestock",
  MIXED_FARMLAND:      "Farmland Mixto",
  FORESTRY:            "Forestry",
  BUY_AND_HOLD:        "Buy & Hold",
};

// Métricas del Hero por estrategia
// topRight = siempre G-Score (universal)
export const HERO_METRICS_CONFIG: Record<string, {
  topLeft: { label: string; field: string; format: string; color: string; barMax?: number };
  bottomLeft: { label: string; field: string; format: string; color: string; barMax?: number };
  bottomRight: { label: string; field: string; format: string; color: string; barMax?: number };
}> = {
  FIX_FLIP: {
    topLeft:    { label: "TIR",          field: "roiTotal",   format: "percent", color: "green", barMax: 0.4 },
    bottomLeft: { label: "Riesgo",       field: "risk_score",        format: "score",   color: "amber" },
    bottomRight:{ label: "Margen bruto", field: "roiTotal",          format: "percent", color: "green", barMax: 1 },
  },
  RENTAL_LONG_TERM: {
    topLeft:    { label: "Cap Rate",     field: "roiTotal",   format: "percent", color: "green" },
    bottomLeft: { label: "Riesgo",       field: "risk_score",        format: "score",   color: "amber" },
    bottomRight:{ label: "NOI anual",    field: "ingreso_neto_anual",format: "currency",color: "green" },
  },
  FARMLAND: {
    topLeft:    { label: "Yield agro",   field: "roiTotal",   format: "percent", color: "amber" },
    bottomLeft: { label: "Riesgo",       field: "risk_score",        format: "score",   color: "amber" },
    bottomRight:{ label: "Renta/año",    field: "ingreso_neto_anual",format: "currency",color: "amber" },
  },
  DISTRESSED: {
    topLeft:    { label: "IRR proy.",    field: "roiTotal",   format: "percent", color: "green" },
    bottomLeft: { label: "Riesgo",       field: "risk_score",        format: "score",   color: "red"   },
    bottomRight:{ label: "Descuento",    field: "descuento_pct",     format: "percent", color: "green" },
  },
  VALUE_ADD: {
    topLeft:    { label: "TIR",          field: "roiTotal",   format: "percent", color: "green" },
    bottomLeft: { label: "Riesgo",       field: "risk_score",        format: "score",   color: "amber" },
    bottomRight:{ label: "Upside",       field: "roiTotal",          format: "percent", color: "green" },
  },
  LAND_BANKING: {
    topLeft:    { label: "Apreciación",  field: "roiTotal",   format: "percent", color: "amber" },
    bottomLeft: { label: "Riesgo",       field: "risk_score",        format: "score",   color: "amber" },
    bottomRight:{ label: "Horizonte",    field: "horizonte_anos",    format: "number",  color: "white" },
  },
  SHORT_TERM_RENTAL: {
    topLeft:    { label: "RevPAR",       field: "roiTotal",   format: "percent", color: "green" },
    bottomLeft: { label: "Riesgo",       field: "risk_score",        format: "score",   color: "amber" },
    bottomRight:{ label: "Ocupación",    field: "ocupacion_pct",     format: "percent", color: "green" },
  },
  NNN_COMERCIAL: {
    topLeft:    { label: "Cap Rate",     field: "roiTotal",   format: "percent", color: "green" },
    bottomLeft: { label: "Riesgo",       field: "risk_score",        format: "score",   color: "amber" },
    bottomRight:{ label: "NOI",          field: "ingreso_neto_anual",format: "currency",color: "green" },
  },
  GREENFIELD: {
    topLeft:    { label: "TIR",          field: "roiTotal",   format: "percent", color: "green" },
    bottomLeft: { label: "Riesgo",       field: "risk_score",        format: "score",   color: "amber" },
    bottomRight:{ label: "Margen",       field: "roiTotal",          format: "percent", color: "green" },
  },
  LIVESTOCK: {
    topLeft:    { label: "Yield",        field: "roiTotal",   format: "percent", color: "amber" },
    bottomLeft: { label: "Riesgo",       field: "risk_score",        format: "score",   color: "amber" },
    bottomRight:{ label: "Renta/año",    field: "ingreso_neto_anual",format: "currency",color: "amber" },
  },
  FORESTRY: {
    topLeft:    { label: "TIR",          field: "roiTotal",   format: "percent", color: "green" },
    bottomLeft: { label: "Riesgo",       field: "risk_score",        format: "score",   color: "amber" },
    bottomRight:{ label: "Horizonte",    field: "horizonte_anos",    format: "number",  color: "white" },
  },
  BUY_AND_HOLD: {
    topLeft:    { label: "Cap Rate",     field: "roiTotal",   format: "percent", color: "green" },
    bottomLeft: { label: "Riesgo",       field: "risk_score",        format: "score",   color: "amber" },
    bottomRight:{ label: "NOI",          field: "ingreso_neto_anual",format: "currency",color: "green" },
  },
  SUBDIVISION: {
    topLeft:    { label: "TIR",         field: "roiTotal",  format: "percent", color: "green" },
    bottomLeft: { label: "Riesgo",      field: "risk_score",       format: "score",   color: "amber" },
    bottomRight:{ label: "Margen",      field: "roiTotal",         format: "percent", color: "green" },
  },
  MIXED_FARMLAND: {
    topLeft:    { label: "Yield mixto", field: "roiTotal",   format: "percent", color: "amber" },
    bottomLeft: { label: "Riesgo",      field: "risk_score",        format: "score",   color: "amber" },
    bottomRight:{ label: "Renta/año",   field: "ingreso_neto_anual",format: "currency",color: "amber" },
  },
};

export const FINANCIAL_VARS_CONFIG: Record<string, Array<{
  label: string; field: string; format: string; positive?: string; showBar?: boolean; barMax?: number; delta?: string;
}>> = {
  FIX_FLIP: [
    { label: "Precio compra",  field: "precio_usd",            format: "currency" },
    { label: "CapEx reforma",  field: "capex_estimado",         format: "currency", positive: "low" },
    { label: "ARV estimado",   field: "arv_estimado",           format: "currency", positive: "high" },
    { label: "ROI total",      field: "roiTotal",               format: "percent",  positive: "high", showBar: true, barMax: 1 },
    { label: "IRR equiv.",     field: "roiTotal",        format: "percent",  positive: "high", showBar: true, barMax: 0.4 },
    { label: "Payback",        field: "payback_meses",          format: "number",   positive: "low" },
    { label: "Precio m²",      field: "precio_m2",              format: "currency", delta: "precio_m2_zona" },
    { label: "Confidence",     field: "confidence_final",       format: "percent",  showBar: true, barMax: 1 },
  ],
  RENTAL_LONG_TERM: [
    { label: "Precio activo",  field: "precio_usd",             format: "currency" },
    { label: "Renta mensual",  field: "renta_mensual",          format: "currency", positive: "high" },
    { label: "Cap Rate",       field: "roiTotal",        format: "percent",  positive: "high", showBar: true, barMax: 0.15 },
    { label: "NOI anual",      field: "ingreso_neto_anual",     format: "currency", positive: "high" },
    { label: "Vacancia est.",  field: "vacancia_pct",           format: "percent",  positive: "low" },
    { label: "OPEX anual",     field: "opex_anual",             format: "currency", positive: "low" },
    { label: "IRR 10 años",    field: "roiTotal",        format: "percent",  positive: "high" },
    { label: "Confidence",     field: "confidence_final",       format: "percent",  showBar: true, barMax: 1 },
  ],
  FARMLAND: [
    { label: "Valor campo",    field: "precio_usd",             format: "currency" },
    { label: "Superficie",     field: "superficie_ha",          format: "number" },
    { label: "Renta arrend.",  field: "ingreso_neto_anual",     format: "currency", positive: "high" },
    { label: "Yield agro",     field: "roiTotal",        format: "percent",  positive: "high", showBar: true, barMax: 0.12 },
    { label: "Cap rate",       field: "cap_rate",               format: "percent",  positive: "high" },
    { label: "OPEX agro",      field: "opex_anual",             format: "currency", positive: "low" },
    { label: "IRR 15 años",    field: "roiTotal",        format: "percent",  positive: "high" },
    { label: "Confidence",     field: "confidence_final",       format: "percent",  showBar: true, barMax: 1 },
  ],
  DISTRESSED: [
    { label: "Precio oferta",  field: "precio_usd",             format: "currency" },
    { label: "Tasación",       field: "arv_estimado",           format: "currency" },
    { label: "Descuento",      field: "descuento_pct",          format: "percent",  positive: "high" },
    { label: "CapEx legal",    field: "capex_estimado",         format: "currency", positive: "low" },
    { label: "IRR proyect.",   field: "roiTotal",        format: "percent",  positive: "high" },
    { label: "Payback",        field: "payback_meses",          format: "number",   positive: "low" },
    { label: "Upside total",   field: "roiTotal",               format: "percent",  positive: "high" },
    { label: "Confidence",     field: "confidence_final",       format: "percent",  showBar: true, barMax: 1 },
  ],
  VALUE_ADD: [
    { label: "Precio compra",  field: "precio_usd",             format: "currency" },
    { label: "CapEx mejora",   field: "capex_estimado",         format: "currency", positive: "low" },
    { label: "NOI post-obra",  field: "ingreso_neto_anual",     format: "currency", positive: "high" },
    { label: "Cap Rate final", field: "roiTotal",        format: "percent",  positive: "high" },
    { label: "ROI total",      field: "roiTotal",               format: "percent",  positive: "high" },
    { label: "Payback",        field: "payback_meses",          format: "number",   positive: "low" },
    { label: "Upside",         field: "roiTotal",               format: "percent",  positive: "high" },
    { label: "Confidence",     field: "confidence_final",       format: "percent",  showBar: true, barMax: 1 },
  ],
  LAND_BANKING: [
    { label: "Precio tierra",  field: "precio_usd",             format: "currency" },
    { label: "Superficie",     field: "superficie_ha",          format: "number" },
    { label: "Precio m²",      field: "precio_m2",              format: "currency" },
    { label: "Apreciación",    field: "roiTotal",        format: "percent",  positive: "high" },
    { label: "Horizonte",      field: "horizonte_anos",         format: "number" },
    { label: "OPEX",           field: "opex_anual",             format: "currency", positive: "low" },
    { label: "IRR",            field: "roiTotal",        format: "percent",  positive: "high" },
    { label: "Confidence",     field: "confidence_final",       format: "percent",  showBar: true, barMax: 1 },
  ],
  SHORT_TERM_RENTAL: [
    { label: "Precio activo",  field: "precio_usd",             format: "currency" },
    { label: "ADR",            field: "renta_mensual",          format: "currency", positive: "high" },
    { label: "RevPAR",         field: "roiTotal",        format: "percent",  positive: "high" },
    { label: "Ocupación",      field: "ocupacion_pct",          format: "percent",  positive: "high", showBar: true, barMax: 1 },
    { label: "NOI anual",      field: "ingreso_neto_anual",     format: "currency", positive: "high" },
    { label: "OPEX + fees",    field: "opex_anual",             format: "currency", positive: "low" },
    { label: "Cap Rate",       field: "roiTotal",        format: "percent",  positive: "high" },
    { label: "Confidence",     field: "confidence_final",       format: "percent",  showBar: true, barMax: 1 },
  ],
  NNN_COMERCIAL: [
    { label: "Precio activo",  field: "precio_usd",             format: "currency" },
    { label: "Renta mensual",  field: "renta_mensual",          format: "currency", positive: "high" },
    { label: "Cap Rate",       field: "roiTotal",        format: "percent",  positive: "high", showBar: true, barMax: 0.1 },
    { label: "NOI",            field: "ingreso_neto_anual",     format: "currency", positive: "high" },
    { label: "NOI mensual", field: "renta_mensual",  format: "currency", positive: "high" },
    { label: "Yield neto",  field: "netMargin",       format: "percent",  positive: "high" },
    { label: "IRR",            field: "roiTotal",        format: "percent",  positive: "high" },
    { label: "Confidence",     field: "confidence_final",       format: "percent",  showBar: true, barMax: 1 },
  ],
  GREENFIELD: [
    { label: "Precio suelo",   field: "precio_usd",             format: "currency" },
    { label: "Superficie",     field: "superficie_ha",          format: "number" },
    { label: "CapEx desarrollo",field:"capex_estimado",         format: "currency", positive: "low" },
    { label: "GDV estimado",   field: "arv_estimado",           format: "currency", positive: "high" },
    { label: "ROI desarrollo", field: "roiTotal",               format: "percent",  positive: "high" },
    { label: "Horizonte",      field: "horizonte_anos",         format: "number" },
    { label: "IRR",            field: "roiTotal",        format: "percent",  positive: "high" },
    { label: "Confidence",     field: "confidence_final",       format: "percent",  showBar: true, barMax: 1 },
  ],
  LIVESTOCK: [
    { label: "Valor campo",    field: "precio_usd",             format: "currency" },
    { label: "Superficie",     field: "superficie_ha",          format: "number" },
    { label: "Renta arrend.",  field: "ingreso_neto_anual",     format: "currency", positive: "high" },
    { label: "Yield",          field: "roiTotal",        format: "percent",  positive: "high" },
    { label: "Carga animal",   field: "carga_animal",           format: "number" },
    { label: "OPEX",           field: "opex_anual",             format: "currency", positive: "low" },
    { label: "IRR",            field: "roiTotal",        format: "percent",  positive: "high" },
    { label: "Confidence",     field: "confidence_final",       format: "percent",  showBar: true, barMax: 1 },
  ],
  FORESTRY: [
    { label: "Precio tierra",  field: "precio_usd",             format: "currency" },
    { label: "Superficie",     field: "superficie_ha",          format: "number" },
    { label: "Cap rate", field: "cap_rate", format: "percent", positive: "high" },
    { label: "Horizonte",      field: "horizonte_anos",         format: "number" },
    { label: "Renta arrend.",  field: "ingreso_neto_anual",     format: "currency", positive: "high" },
    { label: "OPEX",           field: "opex_anual",             format: "currency", positive: "low" },
    { label: "IRR",            field: "roiTotal",        format: "percent",  positive: "high" },
    { label: "Confidence",     field: "confidence_final",       format: "percent",  showBar: true, barMax: 1 },
  ],
  BUY_AND_HOLD: [
    { label: "Precio activo",  field: "precio_usd",             format: "currency" },
    { label: "Renta mensual",  field: "renta_mensual",          format: "currency", positive: "high" },
    { label: "Cap Rate",       field: "roiTotal",        format: "percent",  positive: "high" },
    { label: "NOI anual",      field: "ingreso_neto_anual",     format: "currency", positive: "high" },
    { label: "Apreciación",    field: "apreciacion_anual",      format: "percent",  positive: "high" },
    { label: "OPEX",           field: "opex_anual",             format: "currency", positive: "low" },
    { label: "IRR 10 años",    field: "roiTotal",        format: "percent",  positive: "high" },
    { label: "Confidence",     field: "confidence_final",       format: "percent",  showBar: true, barMax: 1 },
  ],
  SUBDIVISION: [
    { label: "Precio tierra",   field: "precio_usd",       format: "currency" },
    { label: "Superficie",      field: "superficie_ha",     format: "number" },
    { label: "CapEx subdiv.",   field: "capex_estimado",    format: "currency", positive: "low" },
    { label: "GDV estimado",    field: "arv_estimado",      format: "currency", positive: "high" },
    { label: "ROI",             field: "roiTotal",          format: "percent",  positive: "high" },
    { label: "Horizonte",       field: "horizonte_anos",    format: "number" },
    { label: "IRR",             field: "roiTotal",   format: "percent",  positive: "high" },
    { label: "Confidence",      field: "confidence_final",  format: "percent",  showBar: true, barMax: 1 },
  ],
  MIXED_FARMLAND: [
    { label: "Valor campo",     field: "precio_usd",        format: "currency" },
    { label: "Superficie",      field: "superficie_ha",      format: "number" },
    { label: "Renta agro",      field: "ingreso_neto_anual", format: "currency", positive: "high" },
    { label: "Yield mixto",     field: "roiTotal",    format: "percent",  positive: "high", showBar: true, barMax: 0.12 },
    { label: "Cap rate",        field: "cap_rate",           format: "percent",  positive: "high" },
    { label: "OPEX",            field: "opex_anual",         format: "currency", positive: "low" },
    { label: "IRR",             field: "roiTotal",    format: "percent",  positive: "high" },
    { label: "Confidence",      field: "confidence_final",   format: "percent",  showBar: true, barMax: 1 },
  ],
};

// FIX-FRONT-P1-05: Strategy key normalizer
// Maps any strategy key variant → config key used in HERO_METRICS_CONFIG / FINANCIAL_VARS_CONFIG
export const STRATEGY_NORMALIZER: Record<string, string> = {
  // Backend S11 keys → config keys
  'FIX_AND_FLIP':              'FIX_FLIP',
  'RENTAL_SHORT_TERM':         'SHORT_TERM_RENTAL',
  'COMMERCIAL':                'NNN_COMERCIAL',
  'DEVELOPMENT':               'GREENFIELD',
  'BUY_AND_HOLD_APPRECIATION': 'BUY_AND_HOLD',
  'AGRICULTURE':               'FARMLAND',
  // Pass-through (already match config)
  'FIX_FLIP':            'FIX_FLIP',
  'VALUE_ADD':           'VALUE_ADD',
  'RENTAL_LONG_TERM':    'RENTAL_LONG_TERM',
  'SHORT_TERM_RENTAL':   'SHORT_TERM_RENTAL',
  'NNN_COMERCIAL':       'NNN_COMERCIAL',
  'GREENFIELD':          'GREENFIELD',
  'DISTRESSED':          'DISTRESSED',
  'LAND_BANKING':        'LAND_BANKING',
  'FARMLAND':            'FARMLAND',
  'LIVESTOCK':           'LIVESTOCK',
  'MIXED_FARMLAND':      'MIXED_FARMLAND',
  'FORESTRY':            'FORESTRY',
  'SUBDIVISION':         'SUBDIVISION',
  'BUY_AND_HOLD':        'BUY_AND_HOLD',
};

export function normalizeStrategyKey(raw: string): string {
  return STRATEGY_NORMALIZER[raw?.toUpperCase()] ?? raw ?? 'RENTAL_LONG_TERM';
}
