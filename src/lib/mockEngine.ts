export interface AssetMetrics {
    roiTotal: number;
    netMargin: number;
    baseCapex: number;
}

export interface SensitivityConfig {
    capexRange: [number, number];
    exitRateRange: [number, number];
}

export interface DocumentItem {
    id: string;
    name: string;
    type: 'pdf' | 'xls' | 'dwg' | 'model';
    size: string;
    secured: boolean;
}

export interface Asset {
    id: string;
    location: string;
    strategy: string; // key matching METRICS_SCHEMA (e.g., 'fix_and_flip', 'agriculture')
    etiqueta_operacion: string | null;
    market_context_version: string | null;
    confidence: number | null;
    trace_id: string | null;
    layer1: {
        gScore: number;
        expectedIrr: number; // Decimal (e.g. 0.18 for 18%)
        liquidity: string;
        riskLevel: string;
        rationale: string;
        backgroundImageUrl: string;
    };
    layer2: {
        metrics: AssetMetrics;
        sensitivityConfig: SensitivityConfig;
    };
    layer3: {
        documents: DocumentItem[];
    };
    clase_coneat: number | null;
    acceso_agua: 'secano' | 'riego_complementario' | 'riego_pleno' | null;
    zona_agroecologica: string | null;
    capacidad_carga_cabezas_ha: number | null;

    // ============== NUEVOS CAMPOS OPCIONALES POR ESTRATEGIA ==============

    // fix_and_flip
    arv_zona?: number;
    costo_reforma_m2?: number;
    capex_total?: number;
    margen_bruto?: number;
    meses_obra?: number;
    estado_actual?: string;

    // agriculture
    precio_soja_live?: number;
    rinde_qq_ha?: number;
    opex_ha?: number;
    retenciones?: number;
    margen_neto_ha?: number;

    // rental_long_term
    noi_anual?: number;
    yield_neto?: number;
    vacancia_avg?: number;
    caprate_entrada?: number;
    alquiler_estimado_m2?: number;

    // rental_short_term
    adr_zona?: number;
    ocupacion_airbnb?: number;
    gestion_pct?: number;
    noi_neto_anual?: number;
    restriccion_str?: string;

    // value_add
    noi_post_reforma?: number;
    yield_post_reforma?: number;
    costo_reforma_integral?: number;
    meses_reposicionamiento?: number;

    // development
    precio_venta_m2?: number;
    costo_construccion_m2?: number;
    m2_edificables?: number;
    soft_costs_pct?: number;
    ratio_edificabilidad?: number;

    // distressed
    mtm_zona?: number;
    costos_legales_avg?: number;
    meses_saneamiento?: number;
    precio_entrada_vs_mtm?: number;
    tipo_problema?: string;

    // land_banking
    apreciacion_suelo?: number;
    holding_costs?: number;
    anos_hold?: number;
    zoning_actual?: string;
    prob_recalificacion?: number;

    // subdivision
    precio_lote_zona?: number;
    costo_urbanizacion_m2?: number;
    n_lotes_posibles?: number;
    meses_absorcion?: number;

    // livestock
    precio_carne_live?: number;
    stocking_rate?: number;
    mortality_rate?: number;
    tipo_campo?: string;

    // mixed_farmland
    split_agri_gana?: number;
    precio_commodities_live?: number;
    opex_ha_combinado?: number;
    zona?: string;

    // forestry
    precio_m3_madera?: number;
    anos_maduracion?: number;
    opex_plantacion_ha?: number;
    tipo_plantacion?: string;
    creditos_carbono?: number;

    // commercial / buy_and_hold specific
    walt_anos?: number;
    apreciacion_historica?: number;
    holding_costs_anual?: number;
    
    // UI specific
    nombre?: string;
    photo_urls?: string[];
    payback_meses?: number;
}

export const mockDatabase: { assets: Asset[] } = {
    assets: [],
};

export const getAssets = (offset = 0, limit = 4): Promise<{ assets: Asset[], totalCount: number }> => {
    return new Promise((resolve) => {
        // Simulate slight local delay for the loader effect, though it's near zero-latency
        setTimeout(() => {
            const paginatedAssets = mockDatabase.assets.slice(offset, offset + limit);
            resolve({
                assets: paginatedAssets,
                totalCount: mockDatabase.assets.length
            });
        }, 500);
    });
};

export const getAssetById = (id: string): Promise<Asset | undefined> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(mockDatabase.assets.find(a => a.id === id));
        }, 150);
    });
};
