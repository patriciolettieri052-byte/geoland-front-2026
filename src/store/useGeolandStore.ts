import { create } from 'zustand';

export interface FiltrosDuros {
    ubicacion: string | null;
    tipoActivo: string | null;
    presupuestoMaximo: number | null;
    moneda: string | null;
}

export interface FiltrosBlandosIsv {
    estrategiaObjetivo: string | null;
    horizonteAnos: string | null;
    involucramiento: string | null;
    riesgoTolerancia: string | null;
    financiacion: string | null;
    mercadoPreferencia: string | null;
}

export interface PreferenciasAgro {
    zonaAgroecologica: 'pampa_humeda' | 'nea' | 'noa' | null;
    accesoAgua: 'secano' | 'riego_complementario' | 'riego_pleno' | null;
}

export type ConversationState =
    | 'INIT' | 'DISCOVERY' | 'STRATEGY_PROFILING' | 'RISK_OPS'
    | 'GEO_TICKET' | 'SUMMARY' | 'CONFIRMATION' | 'ACTIVE_SUPPORT';

export interface IsvExpandido {
    investorType: string | null;
    subStrategies: string[] | null;
    languageRegister: 'simple' | 'profesional' | 'tecnico' | null;
    experienceLevel: string | null;
    liquidityNeed: 'baja' | 'media' | 'alta' | null;
    avoidedGeographies: string[] | null;
    confidenceScore: number;   // 0-100
    urgencyScore: number;   // 0-100
    stabilityScore: number;   // 0-100
    presupuestoMinimo: number | null;
}

// ── ISV V4 — schema nuevo (ISV-V4-01) ─────────────────────────────
export type StrategyIntent =
  | 'income' | 'resale' | 'passive' | 'development'
  | 'land' | 'commercial' | 'appreciation' | 'mixed' | null;

export type FinalStrategy =
  | 'buy_hold' | 'rental' | 'fix_and_flip' | 'fix_and_rent'
  | 'appreciation' | 'development' | 'commercial' | 'land' | 'opportunistic' | null;

export type EffortLevel = 'passive' | 'semi_active' | 'active' | null;
export type BudgetRange = 'under_100k' | '100k_300k' | '300k_1m' | 'over_1m' | null;
export type DecisionTradeoff = 'simple_predictable' | 'higher_upside' | 'balanced' | null;
export type TimeHorizon = 'short' | 'mid' | 'long' | null;
export type ConfidenceLevel = 'high' | 'medium' | 'low' | null;

export interface IsvV4 {
  strategy_intent: StrategyIntent;
  strategy_cluster: FinalStrategy[];
  final_strategy: FinalStrategy;
  effort_level: EffortLevel;
  budget_range: BudgetRange;
  decision_tradeoff: DecisionTradeoff;
  time_horizon: TimeHorizon;
  confidence_by_field: {
    strategy_intent: ConfidenceLevel;
    strategy_cluster: ConfidenceLevel;
    final_strategy: ConfidenceLevel;
    effort_level: ConfidenceLevel;
    budget_range: ConfidenceLevel;
    decision_tradeoff: ConfidenceLevel;
    time_horizon: ConfidenceLevel;
  };
  isv_sufficient: boolean;
}

export interface Message {
    role: 'user' | 'assistant';
    content: string;
}

export interface GeolandState {
    // 1. Onboarding (AI Profiler & Filters)
    chatHistory: Message[];
    setChatHistory: (updater: (prev: Message[]) => Message[]) => void;

    filtrosDuros: FiltrosDuros;
    filtrosBlandosIsv: FiltrosBlandosIsv;
    preferenciasAgro: PreferenciasAgro | null;

    updateFiltros: (duros: Partial<FiltrosDuros>, blandos: Partial<FiltrosBlandosIsv>, agro?: Partial<PreferenciasAgro> | null) => void;

    perfilCompletado: boolean;
    iterandoResultados: boolean;

    setPerfilCompletado: (val: boolean) => void;
    setIterandoResultados: (val: boolean) => void;

    resetOnboarding: () => void;

    // 2. Layer 1 & 2 (Marketplace)
    assets: any[]; // Asset typing implicitly handled or from mockEngine
    setAssets: (assets: any[]) => void;

    isRefining: boolean;
    setIsRefining: (val: boolean) => void;

    activeAssetId: string | null;
    setActiveAsset: (id: string | null) => void;

    // 3. Sensibilidad en Vivo de Capa 2
    sensitivity: {
        exitCapRate: number;
        capexOverrun: number;
        timeOnMarket: number;
    };
    updateSensitivity: (key: keyof GeolandState['sensitivity'], value: number) => void;

    // 4. Integracion Live Backend
    liveBackendMetrics: { irr: number | null; netMargin: number | null; baseCapex: number | null } | null;
    setLiveBackendMetrics: (metrics: { irr: number | null; netMargin: number | null; baseCapex: number | null } | null) => void;

    // 5. State Machine ISV Expandido (FRONT-ISV-EXP-02)
    currentState: ConversationState;
    setCurrentState: (s: ConversationState) => void;
    isvExpandido: IsvExpandido;
    updateIsvExpandido: (partial: Partial<IsvExpandido>) => void;
    // ISV V4
    isvV4: IsvV4;
    updateIsvV4: (partial: Partial<IsvV4>) => void;
    resetIsvV4: () => void;
    contradictionDetected: boolean;
    setContradictionDetected: (v: boolean) => void;
}

const initialFiltrosDuros: FiltrosDuros = {
    ubicacion: null,
    tipoActivo: null,
    presupuestoMaximo: null,
    moneda: null,
};

const initialFiltrosBlandos: FiltrosBlandosIsv = {
    estrategiaObjetivo: null,
    horizonteAnos: null,
    involucramiento: null,
    riesgoTolerancia: null,
    financiacion: null,
    mercadoPreferencia: null,
};

const initialPreferenciasAgro: PreferenciasAgro = {
    zonaAgroecologica: null,
    accesoAgua: null,
};

const initialIsvV4: IsvV4 = {
  strategy_intent: null,
  strategy_cluster: [],
  final_strategy: null,
  effort_level: null,
  budget_range: null,
  decision_tradeoff: null,
  time_horizon: null,
  confidence_by_field: {
    strategy_intent: null,
    strategy_cluster: null,
    final_strategy: null,
    effort_level: null,
    budget_range: null,
    decision_tradeoff: null,
    time_horizon: null,
  },
  isv_sufficient: false,
};

const initialSensitivity = {
    exitCapRate: 5.5,
    capexOverrun: 0,
    timeOnMarket: 6, // months
};

export const useGeolandStore = create<GeolandState>((set) => ({
    chatHistory: [],
    setChatHistory: (updater) => set((state) => ({ chatHistory: updater(state.chatHistory) })),

    filtrosDuros: initialFiltrosDuros,
    filtrosBlandosIsv: initialFiltrosBlandos,
    preferenciasAgro: null,

    updateFiltros: (duros, blandos, agro) =>
        set((state) => ({
            filtrosDuros: { ...state.filtrosDuros, ...duros },
            filtrosBlandosIsv: { ...state.filtrosBlandosIsv, ...blandos },
            preferenciasAgro: agro === null ? null : agro ? { ...(state.preferenciasAgro || initialPreferenciasAgro), ...agro } : state.preferenciasAgro,
        })),

    perfilCompletado: false,
    iterandoResultados: false,

    setPerfilCompletado: (val) => set({ perfilCompletado: val }),
    setIterandoResultados: (val) => set({ iterandoResultados: val }),

    resetOnboarding: () => set({
        filtrosDuros: initialFiltrosDuros,
        filtrosBlandosIsv: initialFiltrosBlandos,
        preferenciasAgro: null,
        perfilCompletado: false,
        iterandoResultados: false,
        activeAssetId: null,
        assets: [],
        isRefining: false,
        isvV4: initialIsvV4,
    }),

    assets: [],
    setAssets: (assets) => set({ assets }),

    isRefining: false,
    setIsRefining: (isRefining) => set({ isRefining }),

    activeAssetId: null,
    setActiveAsset: (id) => set({ activeAssetId: id }),

    sensitivity: initialSensitivity,
    updateSensitivity: (key, value) =>
        set((state) => ({
            sensitivity: {
                ...state.sensitivity,
                [key]: value,
            },
        })),

    liveBackendMetrics: null,
    setLiveBackendMetrics: (metrics) => set({ liveBackendMetrics: metrics }),

    // State Machine ISV Expandido defaults (FRONT-ISV-EXP-02)
    currentState: 'INIT',
    setCurrentState: (currentState) => set({ currentState }),
    isvExpandido: {
        investorType: null,
        subStrategies: null,
        languageRegister: null,
        experienceLevel: null,
        liquidityNeed: null,
        avoidedGeographies: null,
        confidenceScore: 0,
        urgencyScore: 0,
        stabilityScore: 100,
        presupuestoMinimo: null,
    },
    updateIsvExpandido: (partial) => set((state) => ({
        isvExpandido: { ...state.isvExpandido, ...partial }
    })),
    isvV4: initialIsvV4,
    updateIsvV4: (partial) => set((state) => ({
      isvV4: { ...state.isvV4, ...partial }
    })),
    resetIsvV4: () => set({ isvV4: initialIsvV4 }),
    contradictionDetected: false,
    setContradictionDetected: (contradictionDetected) => set({ contradictionDetected }),
}));
