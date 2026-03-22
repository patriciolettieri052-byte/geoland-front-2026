// src/lib/api/geolandService.ts
// Capa de fetching GEOLAND OS → Backend FastAPI v1.3
// NO modificar componentes visuales. Solo este archivo conecta con el backend.

import { FiltrosDuros, FiltrosBlandosIsv, PreferenciasAgro } from "@/store/useGeolandStore";
import { Asset } from "@/lib/mockEngine";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const API_KEY = process.env.NEXT_PUBLIC_GEOLAND_API_KEY || '';

function getHeaders(): HeadersInit {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (API_KEY) {
        headers['X-API-Key'] = API_KEY;
    } else {
        console.warn('[GeolandService] NEXT_PUBLIC_GEOLAND_API_KEY no configurada');
    }
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

// ── POST /api/v1/core/match ───────────────────────────────────────
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

export async function fetchMatch(payload: MatchPayload): Promise<Asset[]> {
    const res = await fetch(`${API_URL}/api/v1/core/match`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload),
    });

    if (res.status === 404) {
        // Dataset vacío post-veto WACC
        throw new Error('NO_ASSETS_MATCH');
    }
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Backend error en /core/match');
    }

    const data: MatchResponse = await res.json();
    return data.assets;
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
        const res = await fetch(`${API_URL}/api/v1/health`, { method: 'GET' });
        const data = await res.json();
        return data.status === 'ok' && data.dataset_loaded === true;
    } catch {
        return false;
    }
}
