// src/hooks/useAssets.ts
import { useState, useEffect } from "react";
import { Asset, getAssets } from "@/lib/mockEngine";
import { fetchMatch } from "@/lib/api/geolandService";
import { useGeolandStore } from "@/store/useGeolandStore";
import { generateRationale } from "@/lib/ai/generateRationale";

const USE_LIVE = process.env.NEXT_PUBLIC_USE_LIVE_BACKEND === 'true';

export function useAssets() {
    const [assets, setAssets] = useState<Asset[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { filtrosDuros, filtrosBlandosIsv, perfilCompletado } = useGeolandStore();

    useEffect(() => {
        if (!perfilCompletado) return;
        setLoading(true);
        setError(null);

        const load = USE_LIVE
            ? fetchMatch({ filtrosDuros, filtrosBlandosIsv })
            : getAssets().then(r => r.assets);

        load
            .then(async (fetchedAssets) => {
                // Generar los rationales en paralelo para mantener baja latencia
                const assetsWithRationale = await Promise.all(
                    fetchedAssets.map(async (a) => ({
                        ...a,
                        layer1: {
                            ...a.layer1,
                            rationale: await generateRationale(a, filtrosBlandosIsv)
                        }
                    }))
                );
                setAssets(assetsWithRationale);
            })
            .catch(err => {
                // NOTE: This hook is currently unused. The real fix for infinite loading 
                // is applied directly in page.tsx where fetching actually occurs.
                console.error('[useAssets] fetchMatch falló:', err);
                if (err.message === 'NO_ASSETS_MATCH') {
                    setAssets([]);
                    setError(null);
                } else {
                    setError('No se pudieron cargar los resultados. Intentá de nuevo.');
                }
                setLoading(false);
            })
            .finally(() => setLoading(false));
    }, [perfilCompletado, filtrosDuros, filtrosBlandosIsv]);

    return { assets, loading, error };
}
