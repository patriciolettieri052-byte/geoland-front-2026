/**
 * Representa un activo (asset) procesado por el pipeline de Geoland
 * y listo para ser mostrado en Layer 1 y Layer 2.
 */
export interface AssetMatchItem {
  id: string;
  nombre: string;
  ciudad: string;
  estrategia: string;           // "FIX_FLIP" | "RENTA" | "FARMLAND" | "buy_and_hold_appreciation" | etc.
  g_score: number;
  irr_equivalente: number;
  roiTotal: number;
  risk_score: number;
  confidence_final: number;
  precio_usd: number;

  // Extensiones para el renderizado de Layer 1 y Layer 2
  layer1?: {
    gScore: number;
    expectedIrr: number;
    liquidity: string;
    riskLevel: string;
    rationale: string;
    backgroundImageUrl: string;
  };
  layer2?: {
    strategy_key?: string;
    metrics: {
      roiTotal: number;
      netMargin: number;
      baseCapex: number;
      [key: string]: any;
    };
    sensitivityConfig?: {
      capexRange: [number, number];
      exitRateRange: [number, number];
    };
  };
  
  // Campos dinámicos adicionales del pipeline
  [key: string]: any;
}
