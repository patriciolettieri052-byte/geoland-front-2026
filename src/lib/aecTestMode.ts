import { AssetMatchItem } from '@/types/geoland'

const STRATEGY_MAPPING: Record<string, string> = {
  'renta': 'rental_long_term',
  'alquiler': 'rental_long_term',
  'long term': 'rental_long_term',
  'short term': 'rental_short_term',
  'airbnb': 'rental_short_term',
  'comercial': 'commercial',
  'nnn': 'commercial',
  'buy and hold': 'buy_and_hold',
  'apreciacion': 'buy_and_hold',
  'flip': 'fix_and_flip',
  'fix and flip': 'fix_and_flip',
  'reforma': 'value_add',
  'value add': 'value_add',
  'desarrollo': 'development',
  'development': 'development',
  'loteo': 'subdivision',
  'subdivision': 'subdivision',
  'remate': 'distressed',
  'distressed': 'distressed',
  'oportunidad': 'distressed',
  'tierra': 'land_banking',
  'land banking': 'land_banking',
  'agro': 'agriculture',
  'agricultura': 'agriculture',
  'ganaderia': 'livestock',
  'livestock': 'livestock',
  'mixto': 'mixed_farmland',
  'forestry': 'forestry',
  'forestal': 'forestry',
}

export function getTestModeAsset(input: string): AssetMatchItem | null {
  const normalized = input.toLowerCase().trim()
  const strategyKey = STRATEGY_MAPPING[normalized] || (Object.values(STRATEGY_MAPPING).includes(normalized) ? normalized : null)

  if (!strategyKey) return null

  // Base asset common for all mocks
  const baseAsset: AssetMatchItem = {
    id: `DEMO_${strategyKey.toUpperCase()}`,
    nombre: `Activo Demo: ${strategyKey.replace(/_/g, ' ').toUpperCase()}`,
    ciudad: 'Demo City',
    estrategia: strategyKey,
    g_score: 85,
    irr_equivalente: 0.15,
    roiTotal: 0.15,
    risk_score: 30,
    confidence_final: 0.9,
    precio_usd: 500000,
    layer1: {
      gScore: 85,
      expectedIrr: 0.15,
      liquidity: 'Alta',
      riskLevel: 'Bajo',
      rationale: `Este es un activo generado automáticamente para validar la interfaz de la estrategia ${strategyKey}.`,
      backgroundImageUrl: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1000&auto=format&fit=crop'
    },
    layer2: {
      strategy_key: strategyKey,
      metrics: {
        roiTotal: 0.15,
        netMargin: 0.12,
        baseCapex: 50000,
        // Inyectamos todas las métricas posibles según el contrato unificado
        noi_anual: 45000,
        caprate_entrada: 0.06,
        vacancia_avg: 0.05,
        opex_m2: 12.5,
        arv_zona: 650000,
        capex_total: 45000,
        costo_reforma_m2: 350,
        margen_bruto: 0.22,
        meses_obra: 10,
        // Agro
        superficie_ha: 150,
        rinde_qq_ha: 32,
        precio_soja_live: 455,
        retenciones: 0.33,
        margen_neto_ha: 420,
        // Livestock
        carga_animal: 1.5,
        precio_carne_live: 6.2,
        mortality_rate: 0.02,
        // STR
        ocupacion_airbnb: 0.75,
        // Comercial
        yield_comercial: 0.075,
        walt_anos: 5.5,
      } as any
    }
  }

  return baseAsset
}
