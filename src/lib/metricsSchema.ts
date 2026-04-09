import { MetricModule } from '@/types/schemas';

// SCHEMA HARDCODEADO POR ESTRATEGIA
// Futuro: vendrá del backend en asset.metricsSchema

export const METRICS_SCHEMA: Record<string, MetricModule[]> = {
  // ══════════════════════════════════════════════════════════
  // FAMILIA: FLUJO (Rental + Commercial + Buy & Hold)
  // ══════════════════════════════════════════════════════════

  rental_long_term: [
    { id: 'irr', label: 'IRR', format: 'percent', source: 'anuncio', size: 'lg', highlight: true },
    { id: 'noi_anual', label: 'NOI Anual', format: 'currency', source: 'anuncio', size: 'md' },
    { id: 'yield_neto', label: 'Yield Neto %', format: 'percent', source: 'anuncio', size: 'md' },
    { id: 'vacancia_avg', label: 'Vacancia Avg %', format: 'percent', source: 'city_master', size: 'sm' },
    { id: 'opex_m2', label: 'OPEX/m²', format: 'currency', source: 'anuncio', size: 'sm' },
    { id: 'caprate_entrada', label: 'Cap Rate Entrada', format: 'percent', source: 'anuncio', size: 'sm' },
    { id: 'alquiler_estimado_m2', label: 'Alquiler Est./m²', format: 'currency', source: 'estimado', size: 'sm' },
  ],

  rental_short_term: [
    { id: 'irr', label: 'IRR', format: 'percent', source: 'anuncio', size: 'lg', highlight: true },
    { id: 'adr_zona', label: 'ADR Zona', format: 'currency', source: 'city_master', size: 'md' },
    { id: 'ocupacion_airbnb', label: 'Ocupación Airbnb %', format: 'percent', source: 'city_master', size: 'md' },
    { id: 'gestion_pct', label: 'Gestión %', format: 'percent', source: 'anuncio', size: 'sm' },
    { id: 'noi_neto_anual', label: 'NOI Neto Anual', format: 'currency', source: 'anuncio', size: 'md' },
    { id: 'restriccion_str', label: 'Restricción STR', format: 'badge', source: 'anuncio', size: 'sm' },
    { id: 'estado_reforma', label: 'Estado Reforma', format: 'badge', source: 'vision', size: 'sm' },
  ],

  commercial: [
    { id: 'irr', label: 'IRR', format: 'percent', source: 'anuncio', size: 'lg', highlight: true },
    { id: 'yield_comercial', label: 'Yield Comercial', format: 'percent', source: 'anuncio', size: 'md' },
    { id: 'walt_anos', label: 'WALT (años)', format: 'number', source: 'estimado', size: 'md' },
    { id: 'vacancia', label: 'Vacancia %', format: 'percent', source: 'city_master', size: 'sm' },
    { id: 'escalacion_renta', label: 'Escalación Renta %', format: 'percent', source: 'anuncio', size: 'sm' },
    { id: 'impuestos', label: 'Impuestos Anuales', format: 'currency', source: 'city_master', size: 'sm' },
  ],

  buy_and_hold: [
    { id: 'irr', label: 'IRR', format: 'percent', source: 'anuncio', size: 'lg', highlight: true },
    { id: 'apreciacion_historica', label: 'Apreciación Histórica %', format: 'percent', source: 'city_master', size: 'md' },
    { id: 'holding_costs_anual', label: 'Holding Costs Anual', format: 'currency', source: 'anuncio', size: 'md' },
    { id: 'anos_hold', label: 'Años Hold Est.', format: 'number', source: 'estimado', size: 'sm' },
    { id: 'caprate_salida', label: 'Cap Rate Salida', format: 'percent', source: 'estimado', size: 'sm' },
  ],

  // ══════════════════════════════════════════════════════════
  // FAMILIA: TRANSFORMACIÓN (Fix & Flip + Value Add + Development)
  // ══════════════════════════════════════════════════════════

  fix_and_flip: [
    { id: 'irr', label: 'IRR', format: 'percent', source: 'anuncio', size: 'lg', highlight: true },
    { id: 'arv_zona', label: 'ARV Zona $/m²', format: 'currency', source: 'city_master', size: 'lg' },
    { id: 'costo_reforma_m2', label: 'Costo Reforma/m²', format: 'currency', source: 'anuncio', size: 'md' },
    { id: 'capex_total', label: 'Capex Total', format: 'currency', source: 'anuncio', size: 'md' },
    { id: 'margen_bruto', label: 'Margen Bruto Est.', format: 'percent', source: 'anuncio', size: 'md' },
    { id: 'meses_obra', label: 'Meses Obra', format: 'number', source: 'anuncio', size: 'sm' },
    { id: 'estado_actual', label: 'Estado Actual', format: 'badge', source: 'vision', size: 'sm' },
  ],

  value_add: [
    { id: 'irr', label: 'IRR', format: 'percent', source: 'anuncio', size: 'lg', highlight: true },
    { id: 'noi_post_reforma', label: 'NOI Post-Reforma', format: 'currency', source: 'anuncio', size: 'md' },
    { id: 'yield_post_reforma', label: 'Yield Post-Reforma', format: 'percent', source: 'anuncio', size: 'md' },
    { id: 'costo_reforma_integral', label: 'Costo Reforma Integral', format: 'currency', source: 'anuncio', size: 'md' },
    { id: 'estado_actual', label: 'Estado Actual', format: 'badge', source: 'vision', size: 'sm' },
    { id: 'meses_reposicionamiento', label: 'Meses Reposicionamiento', format: 'number', source: 'estimado', size: 'sm' },
  ],

  development: [
    { id: 'irr', label: 'IRR', format: 'percent', source: 'anuncio', size: 'lg', highlight: true },
    { id: 'precio_venta_m2', label: 'Precio Venta/m² Zona', format: 'currency', source: 'city_master', size: 'lg' },
    { id: 'costo_construccion_m2', label: 'Costo Construcción/m²', format: 'currency', source: 'anuncio', size: 'md' },
    { id: 'm2_edificables', label: 'M² Edificables', format: 'number', source: 'anuncio', size: 'md' },
    { id: 'soft_costs_pct', label: 'Soft Costs %', format: 'percent', source: 'estimado', size: 'sm' },
    { id: 'meses_obra', label: 'Meses Obra', format: 'number', source: 'anuncio', size: 'sm' },
    { id: 'ratio_edificabilidad', label: 'Ratio Edificabilidad', format: 'number', source: 'anuncio', size: 'sm' },
  ],

  // ══════════════════════════════════════════════════════════
  // FAMILIA: OPORTUNIDAD (Distressed + Land Banking + Subdivision)
  // ══════════════════════════════════════════════════════════

  distressed: [
    { id: 'irr', label: 'IRR', format: 'percent', source: 'anuncio', size: 'lg', highlight: true },
    { id: 'mtm_zona', label: 'MTM Zona $/m²', format: 'currency', source: 'city_master', size: 'lg' },
    { id: 'costos_legales_avg', label: 'Costos Legales Avg', format: 'currency', source: 'estimado', size: 'md' },
    { id: 'meses_saneamiento', label: 'Meses Saneamiento', format: 'number', source: 'estimado', size: 'md' },
    { id: 'precio_entrada_vs_mtm', label: 'Precio Entrada vs MTM %', format: 'percent', source: 'anuncio', size: 'md' },
    { id: 'tipo_problema', label: 'Tipo Problema', format: 'badge', source: 'anuncio', size: 'sm' },
  ],

  land_banking: [
    { id: 'irr', label: 'IRR', format: 'percent', source: 'anuncio', size: 'lg', highlight: true },
    { id: 'apreciacion_suelo', label: 'Apreciación Suelo %', format: 'percent', source: 'city_master', size: 'md' },
    { id: 'holding_costs', label: 'Holding Costs', format: 'currency', source: 'anuncio', size: 'md' },
    { id: 'anos_hold', label: 'Años Hold', format: 'number', source: 'estimado', size: 'sm' },
    { id: 'zoning_actual', label: 'Zoning Actual', format: 'badge', source: 'anuncio', size: 'sm' },
    { id: 'prob_recalificacion', label: 'Probabilidad Recalificación', format: 'percent', source: 'estimado', size: 'sm' },
  ],

  subdivision: [
    { id: 'irr', label: 'IRR', format: 'percent', source: 'anuncio', size: 'lg', highlight: true },
    { id: 'precio_lote_zona', label: 'Precio Lote Zona', format: 'currency', source: 'city_master', size: 'lg' },
    { id: 'costo_urbanizacion_m2', label: 'Costo Urbanización/m²', format: 'currency', source: 'estimado', size: 'md' },
    { id: 'n_lotes_posibles', label: 'N° Lotes Posibles', format: 'number', source: 'estimado', size: 'md' },
    { id: 'meses_absorcion', label: 'Meses Absorción', format: 'number', source: 'estimado', size: 'sm' },
  ],

  // ══════════════════════════════════════════════════════════
  // FAMILIA: BIOLÓGICA (Agriculture + Livestock + Mixed + Forestry)
  // ══════════════════════════════════════════════════════════

  agriculture: [
    { id: 'irr', label: 'IRR', format: 'percent', source: 'anuncio', size: 'lg', highlight: true },
    { id: 'precio_soja_live', label: 'Precio Soja Live', format: 'currency', source: 'live_api', size: 'lg' },
    { id: 'rinde_qq_ha', label: 'Rinde qq/ha', format: 'number', source: 'anuncio', size: 'md' },
    { id: 'opex_ha', label: 'OPEX/ha', format: 'currency', source: 'anuncio', size: 'md' },
    { id: 'retenciones', label: 'Retenciones %', format: 'percent', source: 'city_master', size: 'sm' },
    { id: 'zona_agroecologica', label: 'Zona Agroecológica', format: 'badge', source: 'anuncio', size: 'sm' },
    { id: 'margen_neto_ha', label: 'Margen Neto/ha', format: 'currency', source: 'anuncio', size: 'md' },
  ],

  livestock: [
    { id: 'irr', label: 'IRR', format: 'percent', source: 'anuncio', size: 'lg', highlight: true },
    { id: 'precio_carne_live', label: 'Precio Carne Live', format: 'currency', source: 'live_api', size: 'lg' },
    { id: 'stocking_rate', label: 'Stocking Rate Cabezas/ha', format: 'number', source: 'anuncio', size: 'md' },
    { id: 'opex_ha', label: 'OPEX/ha', format: 'currency', source: 'anuncio', size: 'md' },
    { id: 'mortality_rate', label: 'Mortality Rate %', format: 'percent', source: 'estimado', size: 'sm' },
    { id: 'tipo_campo', label: 'Tipo Campo', format: 'badge', source: 'anuncio', size: 'sm' },
  ],

  mixed_farmland: [
    { id: 'irr', label: 'IRR', format: 'percent', source: 'anuncio', size: 'lg', highlight: true },
    { id: 'split_agri_gana', label: 'Split Agri/Ganadería %', format: 'percent', source: 'estimado', size: 'md' },
    { id: 'precio_commodities_live', label: 'Precio Commodities Live', format: 'currency', source: 'live_api', size: 'lg' },
    { id: 'opex_ha_combinado', label: 'OPEX/ha Combinado', format: 'currency', source: 'anuncio', size: 'md' },
    { id: 'zona', label: 'Zona', format: 'badge', source: 'anuncio', size: 'sm' },
  ],

  forestry: [
    { id: 'irr', label: 'IRR', format: 'percent', source: 'anuncio', size: 'lg', highlight: true },
    { id: 'precio_m3_madera', label: 'Precio m³ Madera', format: 'currency', source: 'estimado', size: 'md' },
    { id: 'anos_maduracion', label: 'Años Maduración', format: 'number', source: 'anuncio', size: 'md' },
    { id: 'opex_plantacion_ha', label: 'OPEX Plantación/ha', format: 'currency', source: 'anuncio', size: 'sm' },
    { id: 'tipo_plantacion', label: 'Tipo Plantación', format: 'badge', source: 'anuncio', size: 'sm' },
    { id: 'creditos_carbono', label: 'Créditos Carbono', format: 'number', source: 'estimado', size: 'sm' },
  ],
};

// Función pública para obtener schema de una estrategia
export function getMetricsSchema(strategy: string): MetricModule[] {
  const schema = METRICS_SCHEMA[strategy];
  
  // Fallback: si estrategia no existe, retornar schema genérico
  if (!schema) {
    return METRICS_SCHEMA['fix_and_flip']; // default a fix_and_flip
  }
  
  return schema;
}
