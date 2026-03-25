'use client';

import { useEffect, useState, useMemo } from 'react';
import { useGeolandStore } from '@/store/useGeolandStore';
import { AiChatProfiler } from '@/components/onboarding/AiChatProfiler';
import { DynamicIsvRadar } from '@/components/onboarding/DynamicIsvRadar';
import { TheOracleLoader } from '@/components/orchestrator/TheOracleLoader';
import { Layer1GlassGrid } from '@/components/marketplace/Layer1_GlassGrid';
import { Layer2Immersion } from '@/components/marketplace/Layer2_Immersion';
import { Asset } from '@/lib/mockEngine';
import { motion, AnimatePresence } from 'framer-motion';
import { Typography } from '@/components/ui/Typography';

import { Snowflake, Palmtree, Moon, Zap } from 'lucide-react';

type Theme = 'geoland' | 'snow' | 'beach' | 'ny';

export default function GeolandOS() {
  const {
    perfilCompletado,
    iterandoResultados,
    activeAssetId,
    setActiveAsset,
    filtrosDuros,
    filtrosBlandosIsv,
    updateFiltros,
    setPerfilCompletado,
    assets,
    setAssets,
    isRefining,
    setIsRefining
  } = useGeolandStore();

  const [currentTheme, setCurrentTheme] = useState<Theme>('geoland');
  const [error, setError] = useState<string | null>(null);

  const themes: { id: Theme; icon: any; label: string; bg: string }[] = [
    { id: 'geoland', icon: Zap, label: 'Geoland OS', bg: '/monolith2.jpeg' },
    { id: 'snow', icon: Snowflake, label: 'Cozy Snow', bg: '/snow.png' },
    { id: 'beach', icon: Palmtree, label: 'Beautiful Beach', bg: '/beach.png' },
    { id: 'ny', icon: Moon, label: 'Manhattan Night', bg: '/ny-night.png' },
  ];

  const handleDemoMode = () => {
    updateFiltros(
      { ubicacion: 'Madrid', tipoActivo: 'Fix & Flip' },
      { estrategiaObjetivo: 'Active', riesgoTolerancia: 'Medio', involucramiento: 'Directo' }
    );
    setPerfilCompletado(true);
  };

  // Handle flow transitions based on Zustand state
  useEffect(() => {
    if (!perfilCompletado || assets.length > 0) return;

    let cancelled = false;

    const timeoutId = setTimeout(() => {
        if (!cancelled) {
            setError('El análisis tardó demasiado. Verificá tu conexión e intentá de nuevo.');
            setIsRefining(false);
        }
    }, 15000);

    setIsRefining(true);

    (async () => {
        try {
            const { fetchMatch, buildMatchPayload } = await import('@/lib/api/geolandService');
            const store = useGeolandStore.getState();
            const payload = buildMatchPayload(store.filtrosDuros, store.filtrosBlandosIsv, {
                preferenciasAgro: (
                    store.filtrosBlandosIsv.estrategiaObjetivo === 'FARMLAND' ||
                    store.filtrosBlandosIsv.estrategiaObjetivo === 'LIVESTOCK'
                ) ? store.preferenciasAgro : null
            });
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
    // El fetch ya corrió en el useEffect de arriba.
    // Esta función solo cierra el loader visualmente cuando los assets ya llegaron.
    if (assets.length > 0 || error) {
        setIsRefining(false);
    }
    // Si assets todavía está vacío y no hay error, el fetch sigue corriendo —
    // el loader se mantiene hasta que el useEffect llame setIsRefining(false).
  };

  // 🧠 THE MATCHMAKER ENGINE - Only client side sorting rendering now, backend filters the arrays.
  const filteredAssets = useMemo(() => {
    if (!perfilCompletado || isRefining) return [];

    let result = [...assets];
    return result.map(a => {
      // Deterministic pseudo-randomness based on ID + ISV length for visual layout if required
      const seed = a.id.length + (filtrosBlandosIsv.estrategiaObjetivo?.length || 0) + (iterandoResultados ? 1 : 0);
      const mockGScore = 80 + (seed % 18);

      return {
        ...a,
        layer1: { ...a.layer1, gScore: a.layer1?.gScore || mockGScore }
      };
    }).sort((a, b) => b.layer1.gScore - a.layer1.gScore);

  }, [assets, perfilCompletado, isRefining, iterandoResultados, filtrosBlandosIsv]);


  const activeAsset = assets.find(a => a.id === activeAssetId);

  return (
    <main className="min-h-screen w-full relative overflow-hidden bg-background text-foreground">

      {/* MAIN SYSTEM CONTAINER (ONBOARDING & LAYER 1 MARKETPLACE) */}
      <AnimatePresence>
        {!activeAsset && (
          <motion.div
            key="main-container"
            className="absolute inset-0 flex flex-col items-center justify-center p-4 md:p-8"
            style={{
              backgroundImage: `url(${themes.find(t => t.id === currentTheme)?.bg})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.8 }}
          >
            {/* Dark overlay to ensure text contrast */}
            <div className="absolute inset-0 bg-black/25" />

            {/* THEME SELECTOR - CIRCULAR BUTTONS */}
            <motion.div
              className="mb-8 flex items-center gap-4 px-6 py-3 bg-white/5 border border-white/10 rounded-full backdrop-blur-xl relative z-20 shadow-2xl"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, type: 'spring', stiffness: 200, damping: 20 }}
            >
              <div className="flex items-center gap-4">
                {themes.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => setCurrentTheme(theme.id)}
                    className={`relative flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 group ${currentTheme === theme.id
                      ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.4)]'
                      : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/80'
                      }`}
                    title={theme.label}
                  >
                    <theme.icon size={16} />
                    {currentTheme === theme.id && (
                      <motion.div
                        layoutId="active-theme-ring"
                        className="absolute -inset-1 border border-white/30 rounded-full"
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      />
                    )}
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Floating Glass Container (60/40 Split) */}
            <div className="flex flex-col md:flex-row w-full max-w-[1664px] h-[85vh] bg-white/10 backdrop-blur-3xl border border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] overflow-hidden rounded-[2.5rem] relative z-10 transition-all duration-700">

              {/* 60% Left Side - Persistent Chat */}
              <div className="w-full md:w-[60%] h-full flex items-center justify-center p-8 border-r border-white/10 relative z-10 bg-black/10">
                <AiChatProfiler />
              </div>

              {/* 40% Right Side - Stateful Content */}
              <div className="w-full md:w-[40%] h-full relative overflow-hidden bg-white/5">
                <AnimatePresence mode="wait">
                  {!perfilCompletado ? (
                    /* STATE A: ISV RADAR (ONBOARDING) */
                    <motion.div
                      key="radar-view"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.5 }}
                      className="absolute inset-0 flex flex-col items-center justify-center"
                    >
                      <div className="absolute top-12 text-center w-full z-10">
                        <Typography variant="h3" className="font-light tracking-widest text-white/50">GEOLAND</Typography>
                        <div className="w-12 h-px bg-white/20 mx-auto mt-4" />
                      </div>
                      <DynamicIsvRadar />
                    </motion.div>
                  ) : isRefining ? (
                    /* STATE B: LOCALIZED LOADER (40% PANEL) */
                    <motion.div
                      key="loader-view"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 flex items-center justify-center bg-transparent z-50"
                    >
                      <TheOracleLoader onComplete={handleLoaderComplete} />
                    </motion.div>
                  ) : perfilCompletado && !isRefining ? (
                    /* STATE C: GLOBAL INDEX (LAYER 1) */
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
                        <Typography variant="h3" className="mb-1 font-light tracking-wide text-white/90">Global Index</Typography>
                        <Typography variant="p" className="text-sm text-white/60">
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
                  ) : null}
                </AnimatePresence>
              </div>

            </div>

            {/* DEMO BUTTON - BELOW THE PANEL */}
            {!perfilCompletado && (
              <motion.button
                onClick={handleDemoMode}
                className="mt-8 px-8 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full backdrop-blur-md text-white/60 hover:text-white font-medium text-xs tracking-widest uppercase transition-all z-20 group"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
              >
                <span className="opacity-50 group-hover:opacity-100 mr-2">⚡</span> Quick Demo (Bypass Onboarding)
              </motion.button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* IMMERSIVE VIEW (LAYER 2) */}
      <AnimatePresence>
        {activeAsset && perfilCompletado && !isRefining && (
          <Layer2Immersion key="layer2" asset={activeAsset} onClose={() => setActiveAsset(null)} />
        )}
      </AnimatePresence>

    </main>
  );
}
