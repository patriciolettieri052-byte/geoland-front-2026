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
    strategy: string;
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
}

export const mockDatabase: { assets: Asset[] } = {
    assets: [
        {
            id: "ES_MAD_88",
            location: "Madrid, España",
            strategy: "FIX_FLIP",
            etiqueta_operacion: null,
            market_context_version: "v2",
            confidence: 0.85,
            trace_id: null,
            clase_coneat: null,
            acceso_agua: null,
            zona_agroecologica: null,
            capacidad_carga_cabezas_ha: null,
            layer1: {
                gScore: 88,
                expectedIrr: 0.18,
                liquidity: "Media",
                riskLevel: "Medio",
                rationale: "",
                backgroundImageUrl: "https://images.unsplash.com/photo-1543783207-ec64e4d95325?q=80&w=2670&auto=format&fit=crop",
            },
            layer2: {
                metrics: { roiTotal: 0.18, netMargin: 0.15, baseCapex: 45000 },
                sensitivityConfig: { capexRange: [30000, 80000], exitRateRange: [4.0, 6.5] },
            },
            layer3: {
                documents: []
            }
        },
        {
            id: "AE_DXB_89",
            location: "Dubai, UAE",
            strategy: "VALUE_ADD",
            etiqueta_operacion: null,
            market_context_version: "v2",
            confidence: 0.88,
            trace_id: null,
            clase_coneat: null,
            acceso_agua: null,
            zona_agroecologica: null,
            capacidad_carga_cabezas_ha: null,
            layer1: {
                gScore: 89,
                expectedIrr: 0.28,
                liquidity: "Alta",
                riskLevel: "Medio",
                rationale: "",
                backgroundImageUrl: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=2670&auto=format&fit=crop",
            },
            layer2: {
                metrics: { roiTotal: 0.28, netMargin: 0.25, baseCapex: 0 },
                sensitivityConfig: { capexRange: [0, 0], exitRateRange: [6.0, 10.0] },
            },
            layer3: {
                documents: []
            }
        },
        {
            id: "US_MIA_94",
            location: "Miami, EE. UU.",
            strategy: "RENTA",
            etiqueta_operacion: null,
            market_context_version: "v2",
            confidence: 0.92,
            trace_id: null,
            clase_coneat: null,
            acceso_agua: null,
            zona_agroecologica: null,
            capacidad_carga_cabezas_ha: null,
            layer1: {
                gScore: 94,
                expectedIrr: 0.12,
                liquidity: "Alta",
                riskLevel: "Bajo",
                rationale: "",
                backgroundImageUrl: "https://images.unsplash.com/photo-1533106497176-45ae19e68ba2?q=80&w=2670&auto=format&fit=crop",
            },
            layer2: {
                metrics: { roiTotal: 0.12, netMargin: 0.08, baseCapex: 15000 },
                sensitivityConfig: { capexRange: [10000, 40000], exitRateRange: [4.5, 6.0] },
            },
            layer3: {
                documents: []
            }
        },
        {
            id: "AR_BUE_84",
            location: "Buenos Aires, Argentina",
            strategy: "VALUE_ADD",
            etiqueta_operacion: null,
            market_context_version: "v2",
            confidence: 0.80,
            trace_id: null,
            clase_coneat: null,
            acceso_agua: null,
            zona_agroecologica: null,
            capacidad_carga_cabezas_ha: null,
            layer1: {
                gScore: 84,
                expectedIrr: 0.26,
                liquidity: "Muy Baja",
                riskLevel: "Alto",
                rationale: "",
                backgroundImageUrl: "https://images.unsplash.com/photo-1589909202802-8f4aadce1849?q=80&w=2670&auto=format&fit=crop",
            },
            layer2: {
                metrics: { roiTotal: 0.26, netMargin: 0.20, baseCapex: 250000 },
                sensitivityConfig: { capexRange: [150000, 400000], exitRateRange: [8.0, 14.0] },
            },
            layer3: {
                documents: []
            }
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
