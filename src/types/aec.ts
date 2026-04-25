// src/types/aec.ts
// Tipos para el Asesor Ejecutivo de Capital (AEC) — FASE 8

export type AecAction =
  | { type: 'filter_assets'; mercado?: string; estrategia?: string; min_irr?: number; min_precio?: number; max_precio?: number }
  | { type: 'sort_assets'; by: 'irr' | 'g_score' | 'precio'; order: 'asc' | 'desc' }
  | { type: 'highlight_asset'; asset_id: string }
  | { type: 'open_layer2'; asset_id: string }
  | { type: 'update_isv'; payload: Record<string, unknown> }
  | { type: 'refetch_match' }
  | { type: 'simulate_isv'; changes: Record<string, unknown>; preview: boolean }
  | { type: 'compare_assets'; asset_ids: [string, string] }
  | { type: 'explain_metric'; metric: string; asset_id?: string }

export interface AecAssetContext {
  asset_id: string
  mercado: string
  estrategia: string
  irr: number
  g_score: number
  precio_usd: number
  etiqueta: string
  confidence: number
}
