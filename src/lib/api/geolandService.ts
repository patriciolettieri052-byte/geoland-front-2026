// src/lib/api/geolandService.ts
// Capa de fetching GEOLAND OS → Backend FastAPI v1.3
// NO modificar componentes visuales. Solo este archivo conecta con el backend.

import { FiltrosDuros, FiltrosBlandosIsv, PreferenciasAgro } from "@/store/useGeolandStore";
import { Asset } from "@/lib/mockEngine";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://geoland-backend-final.onrender.com';

// Headers for server-side only calls (health check)
function getHeaders(): HeadersInit {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    // API key is now server-side only via /api/match proxy (FIX-FRONT-P1-01)
    const apiKey = typeof window === 'undefined'
        ? (process.env.GEOLAND_API_KEY || process.env.NEXT_PUBLIC_GEOLAND_API_KEY)
        : undefined;
    if (apiKey) headers['x-api-key'] = apiKey;
    return headers;
}

// ── TIPOS DE REQUEST ──────────────────────────────────────────────
export interface MatchPayload {
    filtrosDuros: FiltrosDuros;
    filtrosBlandosIsv: FiltrosBlandosIsv;
    preferenciasAgro?: PreferenciasAgro | null;
    // Campos ISV expandido (CHIEF-E4-02) — opcionales: solo se envían si tienen valor en el store
    investor_type?:    string;
    sub_strategies?:   string[];
    liquidity_need?:   string;
    experience_level?: string;
    // ISV V6 extras
    use_potential?:    string[];
    market_proxy?:     string;
    min_aqs?:          number | null;
}

export interface RecalculatePayload {
    id: string;
    overrides: {
        capexExtra?: number;         // desde sensitivity.capexOverrun
        vacanciaMeses?: number;      // desde sensitivity.timeOnMarket
        precioCompraUsd?: number;    // precio base del activo
        exitCapRate?: number;        // desde sensitivity.exitCapRate
    };
}

// ── TIPOS DE RESPUESTA (snake_case del backend → camelCase) ────────
// El backend devuelve la estructura Asset directamente en camelCase
// (el backend usa los nombres exactos del contrato layer1/layer2/layer3)
// No se necesita adapter. La interfaz Asset del mockEngine es compatible.

export interface MatchResponse {
    status: string;
    total_matches: number;
    assets: Asset[];
}

export interface RecalculateResponse {
    id: string;
    layer1: { expectedIrr: number; gScore: number };
    layer2: { metrics: { baseCapex: number; roiTotal: number; netMargin: number } };
    deltas: { deltaIrr: number; deltaRoi: number };
}

// ── GET /api/v1/match/search ───────────────────────────────────────
function sanitizeFiltrosDuros(f: FiltrosDuros): FiltrosDuros {
    return {
        ubicacion:         f?.ubicacion         ?? "todos",
        tipoActivo:        f?.tipoActivo        ?? "todos",
        presupuestoMaximo: f?.presupuestoMaximo ?? 0,
        moneda:            f?.moneda            ?? "USD",
    };
}

function sanitizeFiltrosBlandos(b: FiltrosBlandosIsv): FiltrosBlandosIsv {
    return {
        estrategiaObjetivo: b?.estrategiaObjetivo ?? "todas",
        horizonteAnos:      b?.horizonteAnos      ?? "todos",
        involucramiento:    b?.involucramiento     ?? "todos",
        riesgoTolerancia:   b?.riesgoTolerancia    ?? "todos",
        financiacion:       b?.financiacion        ?? "todos",
        mercadoPreferencia: b?.mercadoPreferencia  ?? "todos",
    };
}
export function buildMatchPayload(
    filtrosDuros: FiltrosDuros,
    filtrosBlandosIsv: FiltrosBlandosIsv,
    extras?: {
        preferenciasAgro?: PreferenciasAgro | null;
        investor_type?:    string | null;
        sub_strategies?:   string[] | null;
        liquidity_need?:   string | null;
        experience_level?: string | null;
    }
): MatchPayload {
    const safeDuros   = sanitizeFiltrosDuros(filtrosDuros);
    const safeBlandos = sanitizeFiltrosBlandos(filtrosBlandosIsv);
    const payload: MatchPayload = { filtrosDuros: safeDuros, filtrosBlandosIsv: safeBlandos };
    if (extras?.preferenciasAgro) payload.preferenciasAgro = extras.preferenciasAgro;
    // Campos ISV expandido — solo incluir si tienen valor en el store
    if (extras?.investor_type)         payload.investor_type    = extras.investor_type;
    if (extras?.sub_strategies?.length) payload.sub_strategies   = extras.sub_strategies;
    if (extras?.liquidity_need)        payload.liquidity_need   = extras.liquidity_need;
    if (extras?.experience_level)      payload.experience_level = extras.experience_level;
    return payload;
}

// ── TRADUCCIÓN ISV V6 → MatchPayload (ISV-V6-04) ──────────────────
const STRATEGY_MAP: Record<string, string> = {
  // Flujo
  'buy_hold_income':           'RENTAL_LONG_TERM',
  'rental_long_term':          'RENTAL_LONG_TERM',
  'buy_and_hold_appreciation': 'BUY_AND_HOLD_APPRECIATION',
  'short_term_rental':         'RENTAL_SHORT_TERM',
  'rental_short_term':         'RENTAL_SHORT_TERM',
  'nnn_commercial':            'COMMERCIAL',
  'commercial':                'COMMERCIAL',
  // Transformación
  'fix_and_flip':              'FIX_AND_FLIP',
  'fix_flip':                  'FIX_AND_FLIP',
  'value_add':                 'VALUE_ADD',
  'development':               'DEVELOPMENT',
  'greenfield':                'DEVELOPMENT',
  // Oportunidad
  'land_banking':              'LAND_BANKING',
  'subdivision':               'SUBDIVISION',
  'distressed':                'DISTRESSED',
  'opportunistic':             'DISTRESSED',
  // Farmland
  'farmland_agriculture':      'AGRICULTURE',
  'agriculture':               'AGRICULTURE',
  'farmland_livestock':        'LIVESTOCK',
  'livestock':                 'LIVESTOCK',
  'farmland_mixed':            'MIXED_FARMLAND',
  'mixed_farmland':            'MIXED_FARMLAND',
  'forestry':                  'FORESTRY',
};

const EFFORT_MAP: Record<string, string> = {
  low: 'Pasivo', medium: 'Medio', high: 'Activo'
};
const HORIZON_MAP: Record<string, string> = {
  short: 'Corto', medium: 'Medio', long: 'Largo'
};
const TRADEOFF_MAP: Record<string, string> = {
  conservative: 'Bajo', balanced: 'Medio', growth_tolerant: 'Alto'
};

export function buildMatchPayloadFromV6(
    isvV6: import('@/store/useGeolandStore').IsvV6
): MatchPayload {
    const strategyKey = isvV6.main_strategy ?? isvV6.strategy_primary ?? '';
    const estrategia  = STRATEGY_MAP[strategyKey] ?? 'todas';
    const mercado     = isvV6.preferred_markets?.[0] ?? 'todos';
    const tipoActivo  = isvV6.asset_class === 'farmland'
        ? 'farmland'
        : (isvV6.sub_asset_class ?? 'todos');

    const filtrosDuros: FiltrosDuros = {
        ubicacion:         mercado,
        tipoActivo:        tipoActivo,
        presupuestoMaximo: isvV6.budget?.amount_max ?? 0,
        moneda:            isvV6.budget?.currency   ?? 'USD',
    };

    const filtrosBlandosIsv: FiltrosBlandosIsv = {
        estrategiaObjetivo: estrategia,
        horizonteAnos:      HORIZON_MAP[isvV6.time_horizon ?? '']    ?? 'todos',
        involucramiento:    EFFORT_MAP[isvV6.effort_level ?? '']     ?? 'todos',
        riesgoTolerancia:   TRADEOFF_MAP[isvV6.decision_tradeoff ?? ''] ?? 'todos',
        financiacion:       'todos',
        mercadoPreferencia: mercado,
    };

    const payload: MatchPayload = { filtrosDuros, filtrosBlandosIsv };

    // Farmland extras
    if (isvV6.asset_class === 'farmland' && isvV6.strategy_cluster?.length) {
        payload.sub_strategies = isvV6.strategy_cluster as any;
    }
    if (isvV6.confidence_score) {
        payload.experience_level = isvV6.confidence_score.toString();
    }

    // use_potential — incluir si tiene valores (el backend lo soportará en v2)
    if ((isvV6 as any).use_potential?.length) {
        (payload as any).use_potential = (isvV6 as any).use_potential;
    }

    // market_proxy — incluir si existe
    if ((isvV6 as any).market_proxy) {
        (payload as any).market_proxy = (isvV6 as any).market_proxy;
    }

    return payload;
}

export async function fetchMatch(
    payload: MatchPayload,
    signal?: AbortSignal
): Promise<Asset[]> {
    const params = new URLSearchParams();

    const mercado = payload.filtrosDuros.ubicacion;
    const estrategia = payload.filtrosBlandosIsv.estrategiaObjetivo;

    if (mercado && mercado !== 'todos') {
        params.append('mercado', mercado);
    }
    if (estrategia && estrategia !== 'todas') {
        params.append('strategy', estrategia);
    }
    if (payload.min_aqs === null) {
        // Skip min_aqs param entirely
    } else if (payload.min_aqs !== undefined) {
        params.append('min_aqs', payload.min_aqs.toString());
    } else {
        params.append('min_aqs', '45');
    }

    // Call server-side proxy (API key stays server-side) — FIX-FRONT-P1-01
    const url = `/api/match?${params.toString()}`;

    console.log(`[GeolandService] Buscando via proxy: ${url}`);

    const res = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal,
    });

    if (res.status === 404) throw new Error('NO_ASSETS_MATCH');
    if (res.status === 503) throw new Error('BACKEND_WARMING_UP');
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Backend error');
    }

    const data = await res.json();
    console.log('[GeolandService] API Response Keys:', Object.keys(data));
    const assets = data.results ?? data.assets ?? data.matches ?? data.data ?? [];
    return assets;
}

// ── POST /api/v1/core/recalculate ─────────────────────────────────
export async function fetchRecalculate(
    id: string,
    sensitivity: { exitCapRate: number; capexOverrun: number; timeOnMarket: number },
    precioCompraUsd?: number
): Promise<RecalculateResponse> {
    const payload: RecalculatePayload = {
        id,
        overrides: {
            capexExtra: sensitivity.capexOverrun,
            vacanciaMeses: sensitivity.timeOnMarket,
            exitCapRate: sensitivity.exitCapRate,
            precioCompraUsd,
        },
    };

    const res = await fetch(`${API_URL}/api/v1/core/recalculate`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload),
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Backend error en /core/recalculate');
    }

    return res.json();
}

// ── GET /api/v1/health ────────────────────────────────────────────
export async function checkBackendHealth(): Promise<boolean> {
    try {
        const res = await fetch(`${API_URL}/api/v1/health`, { method: 'GET', headers: getHeaders() });
        const data = await res.json();
        // Nuestro backend devuelve status: "connected"
        return data.status === 'connected';
    } catch {
        return false;
    }
}
