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
}

export const mockDatabase: { assets: Asset[] } = {
    assets: [
        {
            id: 'asset-fix-flip-madrid-1',
            strategy: 'fix_and_flip',
            location: 'Madrid Centro · Calle Alcalá',
            confidence: 0.78,
            etiqueta_operacion: null,
            market_context_version: "v2",
            trace_id: null,
            clase_coneat: null,
            acceso_agua: null,
            zona_agroecologica: null,
            capacidad_carga_cabezas_ha: null,
            layer1: {
                gScore: 82,
                expectedIrr: 0.185,
                liquidity: "Media",
                riskLevel: "Medio",
                rationale: 'Oportunidad de reforma integral en zona premium con alta demanda',
                backgroundImageUrl: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2',
            },
            layer2: {
                metrics: { roiTotal: 0.185, netMargin: 0.15, baseCapex: 450000 },
                sensitivityConfig: { capexRange: [300000, 600000], exitRateRange: [4.0, 6.0] },
            },
            layer3: {
                documents: []
            },
            // fix_and_flip specific
            arv_zona: 8500,
            costo_reforma_m2: 1200,
            capex_total: 450000,
            margen_bruto: 22.5,
            meses_obra: 6,
            estado_actual: 'Bueno',
        },
        {
            id: 'asset-agriculture-bsas-1',
            strategy: 'agriculture',
            location: 'Buenos Aires · Pampa Húmeda',
            confidence: 0.82,
            etiqueta_operacion: null,
            market_context_version: "v2",
            trace_id: null,
            clase_coneat: null,
            acceso_agua: 'riego_complementario',
            zona_agroecologica: 'I - Humeda',
            capacidad_carga_cabezas_ha: null,
            layer1: {
                gScore: 75,
                expectedIrr: 0.142,
                liquidity: "Baja",
                riskLevel: "Bajo",
                rationale: 'Terreno con excelente productividad y acceso a riego complementario',
                backgroundImageUrl: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad576',
            },
            layer2: {
                metrics: { roiTotal: 0.142, netMargin: 0.12, baseCapex: 0 },
                sensitivityConfig: { capexRange: [0, 0], exitRateRange: [5.0, 7.0] },
            },
            layer3: {
                documents: []
            },
            // agriculture specific
            precio_soja_live: 580,
            rinde_qq_ha: 48,
            opex_ha: 2100,
            retenciones: 33,
            margen_neto_ha: 8500,
        },
        {
            id: 'asset-value-add-miami-1',
            strategy: 'value_add',
            location: 'Miami Beach · South Beach',
            confidence: 0.75,
            etiqueta_operacion: null,
            market_context_version: "v2",
            trace_id: null,
            clase_coneat: null,
            acceso_agua: null,
            zona_agroecologica: null,
            capacidad_carga_cabezas_ha: null,
            layer1: {
                gScore: 88,
                expectedIrr: 0.213,
                liquidity: "Alta",
                riskLevel: "Medio",
                rationale: 'Multifamiliar con potencial de repositioning y NOI growth significativo',
                backgroundImageUrl: 'https://images.unsplash.com/photo-1570129477492-45c003cedd44',
            },
            layer2: {
                metrics: { roiTotal: 0.213, netMargin: 0.18, baseCapex: 280000 },
                sensitivityConfig: { capexRange: [200000, 400000], exitRateRange: [4.0, 6.0] },
            },
            layer3: {
                documents: []
            },
            // value_add specific
            noi_post_reforma: 125000,
            yield_post_reforma: 7.2,
            costo_reforma_integral: 280000,
            meses_reposicionamiento: 9,
            estado_actual: 'Necesita reforma',
        },
        {
            id: 'asset-commercial-dubai-1',
            strategy: 'commercial',
            location: 'Dubai · Downtown',
            confidence: 0.71,
            etiqueta_operacion: null,
            market_context_version: "v2",
            trace_id: null,
            clase_coneat: null,
            acceso_agua: null,
            zona_agroecologica: null,
            capacidad_carga_cabezas_ha: null,
            layer1: {
                gScore: 79,
                expectedIrr: 0.168,
                liquidity: "Alta",
                riskLevel: "Medio",
                rationale: 'Oficina premium en ubicación estratégica con arrendatario AAA',
                backgroundImageUrl: 'https://images.unsplash.com/photo-1486325212027-8081e485255e',
            },
            layer2: {
                metrics: { roiTotal: 0.168, netMargin: 0.14, baseCapex: 0 },
                sensitivityConfig: { capexRange: [0, 0], exitRateRange: [6.0, 10.0] },
            },
            layer3: {
                documents: []
            },
            // commercial specific
            noi_neto_anual: 145000,
            walt_anos: 8,
        }
    ],
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
