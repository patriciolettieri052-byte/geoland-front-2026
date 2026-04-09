// Representa una métrica individual en el grid
export interface MetricModule {
  id: string; // 'irr', 'noi_anual', 'arv_zona', etc. — debe coincidir con campos en Asset
  label: string; // "IRR", "NOI Anual", "ARV Zona", etc.
  format: 'currency' | 'percent' | 'number' | 'text' | 'badge';
  source: 'anuncio' | 'city_master' | 'live_api' | 'vision' | 'estimado';
  size: 'sm' | 'md' | 'lg' | 'xl'; // controla grid-column-span
  highlight?: boolean; // true = emerald glow para KPI principal (IRR siempre true)
}

// Representa un slider de sensibilidad
export interface SensitivityVar {
  id: string; // 'capex_overrun', 'rinde_qq_ha', 'precio_soja_pct', etc.
  label: string; // "Capex Overrun", "Rinde qq/ha", "Precio Soja %", etc.
  unit: '%' | '€' | '$' | 'meses' | 'años' | 'qq/ha' | 'cabezas/ha' | 'kg/ha';
  min: number; // mínimo valor slider
  max: number; // máximo valor slider
  default: number; // valor inicial (corresponde a base)
  step: number; // incremento slider (ej: 0.1, 1, 5)
  impact: 'irr_positive' | 'irr_negative'; // sube o baja IRR al aumentar este slider
}

// Tipo para valores de métricas
export type MetricValue = number | string | null | undefined;
