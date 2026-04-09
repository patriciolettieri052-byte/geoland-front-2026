import { SensitivityVar } from '@/types/schemas';

// SCHEMA DE SLIDERS POR ESTRATEGIA
// Cada estrategia tiene sus propias variables de sensibilidad

export const SENSITIVITY_SCHEMA: Record<string, SensitivityVar[]> = {
  // Familia Flujo
  rental_long_term: [
    { id: 'vacancia_pct', label: 'Vacancia %', unit: '%', min: 0, max: 50, default: 15, step: 1, impact: 'irr_negative' },
    { id: 'opex_overrun', label: 'OPEX Overrun %', unit: '%', min: 0, max: 50, default: 0, step: 1, impact: 'irr_negative' },
    { id: 'caprate_salida', label: 'Cap Rate Salida', unit: '%', min: 2, max: 8, default: 5, step: 0.1, impact: 'irr_positive' },
  ],

  rental_short_term: [
    { id: 'vacancia_pct', label: 'Vacancia %', unit: '%', min: 0, max: 50, default: 20, step: 1, impact: 'irr_negative' },
    { id: 'opex_overrun', label: 'OPEX Overrun %', unit: '%', min: 0, max: 50, default: 0, step: 1, impact: 'irr_negative' },
    { id: 'caprate_salida', label: 'Cap Rate Salida', unit: '%', min: 2, max: 8, default: 5, step: 0.1, impact: 'irr_positive' },
  ],

  commercial: [
    { id: 'walt_anos', label: 'WALT (años)', unit: 'años', min: 2, max: 15, default: 7, step: 0.5, impact: 'irr_positive' },
    { id: 'vacancia', label: 'Vacancia %', unit: '%', min: 0, max: 30, default: 5, step: 1, impact: 'irr_negative' },
    { id: 'caprate_salida', label: 'Cap Rate Salida', unit: '%', min: 2, max: 8, default: 5, step: 0.1, impact: 'irr_positive' },
  ],

  buy_and_hold: [
    { id: 'anos_hold', label: 'Años Hold', unit: 'años', min: 5, max: 30, default: 15, step: 1, impact: 'irr_positive' },
    { id: 'caprate_salida', label: 'Cap Rate Salida', unit: '%', min: 2, max: 8, default: 5, step: 0.1, impact: 'irr_positive' },
    { id: 'apreciacion_anual', label: 'Apreciación Anual %', unit: '%', min: 0, max: 10, default: 3, step: 0.1, impact: 'irr_positive' },
  ],

  // Familia Transformación
  fix_and_flip: [
    { id: 'capex_overrun_eur', label: 'Capex Overrun €', unit: '€', min: 0, max: 500000, default: 0, step: 10000, impact: 'irr_negative' },
    { id: 'meses_obra', label: 'Meses Obra', unit: 'meses', min: 1, max: 24, default: 6, step: 1, impact: 'irr_negative' },
    { id: 'arv_ajuste_pct', label: 'ARV Ajuste %', unit: '%', min: -20, max: 20, default: 0, step: 1, impact: 'irr_positive' },
  ],

  value_add: [
    { id: 'capex_overrun_eur', label: 'Capex Overrun €', unit: '€', min: 0, max: 500000, default: 0, step: 10000, impact: 'irr_negative' },
    { id: 'noi_post_ajuste_pct', label: 'NOI Post Ajuste %', unit: '%', min: -20, max: 20, default: 0, step: 1, impact: 'irr_positive' },
    { id: 'meses_reposicionamiento', label: 'Meses Reposicionamiento', unit: 'meses', min: 1, max: 24, default: 12, step: 1, impact: 'irr_negative' },
  ],

  development: [
    { id: 'capex_overrun_pct', label: 'Capex Overrun %', unit: '%', min: 0, max: 50, default: 0, step: 1, impact: 'irr_negative' },
    { id: 'meses_obra', label: 'Meses Obra', unit: 'meses', min: 6, max: 48, default: 24, step: 1, impact: 'irr_negative' },
    { id: 'precio_venta_ajuste_pct', label: 'Precio Venta Ajuste %', unit: '%', min: -20, max: 20, default: 0, step: 1, impact: 'irr_positive' },
  ],

  // Familia Oportunidad
  distressed: [
    { id: 'meses_saneamiento', label: 'Meses Saneamiento', unit: 'meses', min: 1, max: 36, default: 12, step: 1, impact: 'irr_negative' },
    { id: 'costos_legales_overrun_eur', label: 'Costos Legales Overrun €', unit: '€', min: 0, max: 200000, default: 0, step: 5000, impact: 'irr_negative' },
    { id: 'precio_salida_ajuste_pct', label: 'Precio Salida Ajuste %', unit: '%', min: -20, max: 20, default: 0, step: 1, impact: 'irr_positive' },
  ],

  land_banking: [
    { id: 'anos_hold', label: 'Años Hold', unit: 'años', min: 5, max: 20, default: 10, step: 1, impact: 'irr_positive' },
    { id: 'apreciacion_suelo_ajuste_pct', label: 'Apreciación Suelo Ajuste %', unit: '%', min: -10, max: 20, default: 0, step: 0.5, impact: 'irr_positive' },
  ],

  subdivision: [
    { id: 'anos_hold', label: 'Años Hold', unit: 'años', min: 2, max: 15, default: 5, step: 1, impact: 'irr_positive' },
    { id: 'apreciacion_ajuste_pct', label: 'Apreciación Ajuste %', unit: '%', min: -10, max: 20, default: 0, step: 0.5, impact: 'irr_positive' },
  ],

  // Familia Biológica
  agriculture: [
    { id: 'rinde_qq_ha_ajuste_pct', label: 'Rinde Ajuste %', unit: '%', min: -30, max: 30, default: 0, step: 1, impact: 'irr_positive' },
    { id: 'precio_soja_ajuste_pct', label: 'Precio Soja Ajuste %', unit: '%', min: -30, max: 30, default: 0, step: 1, impact: 'irr_positive' },
    { id: 'opex_overrun_pct', label: 'OPEX Overrun %', unit: '%', min: 0, max: 50, default: 0, step: 1, impact: 'irr_negative' },
  ],

  livestock: [
    { id: 'stocking_rate_ajuste_pct', label: 'Stocking Rate Ajuste %', unit: '%', min: -20, max: 20, default: 0, step: 1, impact: 'irr_positive' },
    { id: 'precio_carne_ajuste_pct', label: 'Precio Carne Ajuste %', unit: '%', min: -30, max: 30, default: 0, step: 1, impact: 'irr_positive' },
    { id: 'mortality_rate_ajuste_pct', label: 'Mortality Rate Ajuste %', unit: '%', min: 0, max: 30, default: 0, step: 0.5, impact: 'irr_negative' },
  ],

  mixed_farmland: [
    { id: 'split_agri_gana_ajuste_pct', label: 'Split Agri/Gana Ajuste %', unit: '%', min: -30, max: 30, default: 0, step: 1, impact: 'irr_positive' },
    { id: 'precio_commodities_ajuste_pct', label: 'Precio Commodities Ajuste %', unit: '%', min: -30, max: 30, default: 0, step: 1, impact: 'irr_positive' },
  ],

  forestry: [
    { id: 'anos_maduracion_ajuste', label: 'Años Maduración Ajuste', unit: 'años', min: -5, max: 5, default: 0, step: 0.5, impact: 'irr_negative' },
    { id: 'precio_madera_ajuste_pct', label: 'Precio Madera Ajuste %', unit: '%', min: -30, max: 30, default: 0, step: 1, impact: 'irr_positive' },
    { id: 'creditos_carbono_ajuste_pct', label: 'Créditos Carbono Ajuste %', unit: '%', min: 0, max: 50, default: 0, step: 1, impact: 'irr_positive' },
  ],
};

// Función pública para obtener schema de sensibilidad
export function getSensitivitySchema(strategy: string): SensitivityVar[] {
  const schema = SENSITIVITY_SCHEMA[strategy];
  
  // Fallback: si estrategia no existe, retornar schema genérico
  if (!schema) {
    return SENSITIVITY_SCHEMA['fix_and_flip'];
  }
  
  return schema;
}
