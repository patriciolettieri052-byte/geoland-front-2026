'use client';

import { useEffect, useState, useMemo } from 'react';
import { Oswald } from 'next/font/google';
import { useGeolandStore } from '@/store/useGeolandStore';
import { AiChatProfiler } from '@/components/onboarding/AiChatProfiler';
import { DynamicIsvRadar } from '@/components/onboarding/DynamicIsvRadar';
import { TheOracleLoader } from '@/components/orchestrator/TheOracleLoader';
import { Layer1GlassGrid } from '@/components/marketplace/Layer1_GlassGrid';
import { Layer2Container } from '@/components/marketplace/Layer2Container';
import { Asset } from '@/lib/mockEngine';
import { motion, AnimatePresence } from 'framer-motion';
import { Typography } from '@/components/ui/Typography';

const oswald = Oswald({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  style: 'normal',
});

export default function GeolandOS() {
  const {
    perfilCompletado,
    iterandoResultados,
    activeAssetId,
    setActiveAsset,
    filtrosDuros,
    filtrosBlandosIsv,
    assets,
    setAssets,
    isRefining,
    setIsRefining,
    chatHistory,  // Requerido para ChatSidebar
  } = useGeolandStore();

  const [error, setError] = useState<string | null>(null);

  // Lógica existente de fetchMatch (sin cambios)
  useEffect(() => {
    if (!perfilCompletado || assets.length > 0) return;
    let cancelled = false;
    const timeoutId = setTimeout(() => {
        if (!cancelled) {
            setError('El análisis tardó demasiado. Verificá tu conexión e intentá de nuevo.');
            setIsRefining(false);
        }
    }, 30000);
    setIsRefining(true);
    (async () => {
        try {
            const { fetchMatch, buildMatchPayloadFromV6 } = await import('@/lib/api/geolandService');
            const store = useGeolandStore.getState();
            const payload = buildMatchPayloadFromV6(store.isvV6);
            const data = await fetchMatch(payload);
            if (!cancelled) {
                clearTimeout(timeoutId);
                setAssets(data);
            }
        } catch (err: any) {
            if (!cancelled) {
                clearTimeout(timeoutId);
                console.error('[page.tsx] fetchMatch falló:', err);
                if (err.message === 'NO_ASSETS_MATCH') {
                    setAssets([]);
                    setError(null);
                } else {
                    setError('No se pudieron cargar los resultados. Intentá de nuevo.');
                }
            }
        } finally {
            if (!cancelled) setIsRefining(false);
        }
    })();
    return () => {
        cancelled = true;
        clearTimeout(timeoutId);
    };
  }, [perfilCompletado]);

  const handleLoaderComplete = () => {
    if (assets.length > 0 || error) {
        setIsRefining(false);
    }
  };

  // Filtered assets (sin cambios)
  const filteredAssets = useMemo(() => {
    if (!perfilCompletado || isRefining) return [];
    let result = [...assets];
    return result.map(a => {
      const id = a.id || a.asset_id || "unknown";
      const seed = id.length + (filtrosBlandosIsv.estrategiaObjetivo?.length || 0) + (iterandoResultados ? 1 : 0);
      const mockGScore = 80 + (seed % 18);
      const aqs = a.layer1?.gScore || a.aqs_score || mockGScore;
      
      // Inject Fix & Flip mockup data for demo
      return {
        ...a,
        id,
        estrategia: "FIX_FLIP",
        nombre: "Casa Histórica - Abasto",
        ciudad: "Buenos Aires",
        precio_usd: 145000,
        capex_estimado: 45000,
        arv_estimado: 265000,
        roiTotal: 0.38,
        irr_equivalente: 0.245,
        risk_score: 32,
        photo_urls: [
          "/renovation_5_facade_1775780438213.png",
          "/renovation_1_living_room_1775780380158.png",
          "/renovation_2_kitchen_1775780394880.png",
          "/renovation_3_bedroom_1775780410141.png",
          "/renovation_4_bathroom_1775780423874.png"
        ],
        layer1: { ...(a.layer1 || {}), gScore: aqs },
        layer2: a.layer2 || { metrics: { baseCapex: 145000 } }
      };
    }).sort((a, b) => (b.layer1?.gScore || 0) - (a.layer1?.gScore || 0));
  }, [assets, perfilCompletado, isRefining, iterandoResultados, filtrosBlandosIsv]);

  const activeAsset = assets.find(a => a.id === activeAssetId);

  return (
    <main className="min-h-screen w-full relative overflow-hidden bg-background text-foreground">

      <motion.div
        key="stable-container"
        className="absolute inset-0 flex flex-col items-center justify-center p-4 md:p-8"
        style={{
          backgroundImage: `url('/monolith2.jpeg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="absolute inset-0 bg-black/25" />

        {/* Header — Logo */}
        <div className="w-full max-w-[1664px] mx-auto px-0 mb-4 flex items-end justify-between relative z-30">
          <div className="flex items-end gap-6">
            <img src="/logo.png" alt="GEOLAND" className="h-12 w-auto opacity-90" />
            <span className={`${oswald.className} text-white/40 text-[11px] font-medium tracking-wider leading-none mb-1 uppercase hidden md:block`}>
              The Infrastructure for Global Real Estate Investment Decisions
            </span>
          </div>
          <div className="flex items-center justify-center w-9 h-9 rounded-full bg-[#5a4282] text-white font-medium text-sm shadow-xl border border-white/20 cursor-pointer hover:opacity-80 transition-all">
            P
          </div>
        </div>

        {/* CONTENEDOR PRINCIPAL — Glass Container */}
        <div className="flex flex-col md:flex-row w-full max-w-[1664px] h-[85vh] bg-white/10 backdrop-blur-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] overflow-hidden rounded-[2.5rem] relative z-10">

          {/* Left: Chat Profiler (16%) — Permanente */}
          <div className="w-full md:w-[16%] h-full flex items-center justify-center p-8 border-r border-white/10 relative z-10 bg-black/10">
            <AiChatProfiler />
          </div>

          {/* Right: Radar/Grid/Layer2 (84%) */}
          <div className="w-full md:w-[84%] h-full relative overflow-hidden bg-white/5">
            <AnimatePresence mode="wait">
              {activeAsset ? (
                /* LAYER 2 */
                <motion.div
                  key="layer2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4 }}
                  className="absolute inset-0 flex flex-col z-0"
                >
                  <Layer2Container 
                    asset={activeAsset} 
                    onClose={() => setActiveAsset(null)} 
                  />
                </motion.div>
              ) : !perfilCompletado ? (
                /* RADAR */
                <motion.div
                  key="radar-view"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0 flex flex-col items-center justify-center"
                >
                  <DynamicIsvRadar />
                </motion.div>
              ) : isRefining ? (
                /* LOADER */
                <motion.div
                  key="loader-view"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex items-center justify-center bg-transparent z-50"
                >
                  <TheOracleLoader onComplete={handleLoaderComplete} />
                </motion.div>
              ) : (
                /* GRID (LAYER 1) */
                <motion.div
                  key="index-view"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0 flex flex-col py-8 px-6 overflow-y-auto scrollbar-hide"
                  style={{ scrollbarWidth: 'none' }}
                >
                  <div className="text-center mb-8 shrink-0">
                    <Typography variant="p" className="mb-0.5 font-bold text-[13.5px] text-white">Matched Opportunities</Typography>
                    <Typography variant="p" className="text-[11px] text-white/50">
                      {filteredAssets.length} Assets matching strategy.
                    </Typography>
                  </div>

                  <div className="flex-1">
                    {error ? (
                        <div className="flex flex-col items-center justify-center min-h-[400px] text-center px-8">
                            <p className="text-white/60 text-lg mb-4">{error}</p>
                            <button
                                onClick={() => window.location.reload()}
                                className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                            >
                                Reintentar
                            </button>
                        </div>
                    ) : (
                        <>
                            <Layer1GlassGrid assets={filteredAssets} onAssetClick={setActiveAsset} />

                            {filteredAssets.length === 0 && (
                              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-12 text-center w-full flex flex-col items-center opacity-70">
                                <Typography variant="h4" className="text-white/80">Sin coincidencias estrictas</Typography>
                                <Typography variant="p" className="max-w-xs mt-4 leading-relaxed text-sm text-white/50">
                                  Tus filtros duros (Ubicación, Tipo) son restrictivos para el mock actual.
                                </Typography>
                              </motion.div>
                            )}
                        </>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

      </motion.div>

    </main>
  );
}
