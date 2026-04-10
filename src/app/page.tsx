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
import { Settings, HelpCircle, Info, User, Star, Bell, BarChart3, CreditCard, LogOut, ChevronRight } from 'lucide-react';
import { translations } from '@/lib/translations';

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
    language,
    setLanguage
  } = useGeolandStore();

  const t = translations[language];

  const [error, setError] = useState<string | null>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showGearMenu, setShowGearMenu] = useState(false);

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
      
      // Inject Enriched Fix & Flip mockup data for demo
      return {
        ...a,
        id,
        estrategia: "FIX_FLIP",
        nombre: "Residencia Colonial - Abasto",
        ciudad: "Buenos Aires",
        location: "Abasto, Buenos Aires, Argentina",
        precio_usd: 165000,
        capex_estimado: 48000,
        arv_estimado: 295000,
        roiTotal: 0.385,
        irr_equivalente: 0.242,
        risk_score: 28,
        confidence_final: 0.89,
        g_score: 84,
        ingreso_neto_anual: 0,
        descuento_pct: 0.12,
        payback_meses: 8,
        precio_m2: 1850,
        precio_m2_zona: 2100,
        etiqueta_operacion: "Oportunidad a largo plazo",
        photo_urls: [
          "/renovation_5.png",
          "/renovation_1.png",
          "/renovation_2.png",
          "/renovation_3.png",
          "/renovation_4.png"
        ],
        layer1: { ...(a.layer1 || {}), gScore: 84 },
        layer2: a.layer2 || { 
          metrics: { 
            baseCapex: 165000,
            renovationEstimate: 48000,
            projectDuration: 8
          } 
        }
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
        <div className="w-full max-w-[1664px] mx-auto px-0 mb-4 flex items-end justify-between relative z-50">
          <div className="flex items-end gap-6">
            <img src="/logo.png" alt="GEOLAND" className="h-12 w-auto opacity-90" />
            <span className={`${oswald.className} text-white/40 text-[11px] font-medium tracking-wider leading-none mb-1 uppercase hidden md:block`}>
              {t.header.infraText}
            </span>
          </div>
          
          <div className="flex items-center gap-4 relative">
            {/* Language Selector */}
            <div className="flex items-center gap-3 mr-2 bg-white/5 backdrop-blur-md rounded-full px-4 py-1.5 border border-white/10">
              {(['es', 'en', 'pt'] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`text-[10px] font-bold tracking-widest uppercase transition-all hover:text-white ${language === lang ? 'text-white scale-110' : 'text-white/40'}`}
                >
                  {lang}
                </button>
              ))}
            </div>

            {/* Gear Button */}
            <div className="relative">
              <button
                onClick={() => { setShowGearMenu(!showGearMenu); setShowProfileMenu(false); }}
                className={`flex items-center justify-center w-9 h-9 rounded-full bg-white/5 text-white/70 shadow-xl border border-white/10 cursor-pointer hover:bg-white/10 hover:text-white transition-all ${showGearMenu ? 'bg-white/10 text-white' : ''}`}
              >
                <Settings size={18} />
              </button>

              <AnimatePresence>
                {showGearMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 5, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 top-full mt-2 w-48 bg-[#1a1a1a]/90 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 p-1.5"
                  >
                    {[
                      { icon: HelpCircle, label: t.menus.gear.help },
                      { icon: Info, label: t.menus.gear.whatIsGeoland }
                    ].map((item, i) => (
                      <button
                        key={i}
                        className="w-full flex items-center gap-3 px-3 py-2 text-xs text-white/70 hover:text-white hover:bg-white/5 rounded-xl transition-all group"
                        onClick={() => setShowGearMenu(false)}
                      >
                        <item.icon size={14} className="group-hover:text-[#5a4282]" />
                        <span className="font-medium">{item.label}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile Button */}
            <div className="relative">
              <div 
                onClick={() => { setShowProfileMenu(!showProfileMenu); setShowGearMenu(false); }}
                className={`flex items-center justify-center w-9 h-9 rounded-full bg-[#5a4282] text-white font-bold text-sm shadow-xl border border-white/20 cursor-pointer hover:opacity-80 transition-all ${showProfileMenu ? 'ring-2 ring-white/50' : ''}`}
              >
                P
              </div>

              <AnimatePresence>
                {showProfileMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 5, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 top-full mt-2 w-56 bg-[#1a1a1a]/90 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 p-1.5"
                  >
                    {[
                      { icon: BarChart3, label: t.menus.profile.myBureau },
                      { icon: Star, label: t.menus.profile.myFavorites },
                      { icon: Bell, label: t.menus.profile.myAlerts },
                      { icon: Info, label: t.menus.profile.usage },
                      { icon: CreditCard, label: t.menus.profile.subscription },
                      { icon: LogOut, label: t.menus.profile.logout, danger: true }
                    ].map((item, i) => (
                      <button
                        key={i}
                        className={`w-full flex items-center justify-between px-3 py-2.5 text-xs rounded-xl transition-all group ${item.danger ? 'text-red-400 hover:bg-red-500/10' : 'text-white/70 hover:text-white hover:bg-white/5'}`}
                        onClick={() => setShowProfileMenu(false)}
                      >
                        <div className="flex items-center gap-3">
                          <item.icon size={14} className={item.danger ? '' : 'group-hover:text-[#5a4282]'} />
                          <span className="font-medium">{item.label}</span>
                        </div>
                        <ChevronRight size={12} className="opacity-0 group-hover:opacity-40 transition-opacity" />
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* CONTENEDOR PRINCIPAL — Glass Container */}
        <div className="flex flex-col md:flex-row w-full max-w-[1664px] h-[85vh] bg-white/10 backdrop-blur-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] overflow-hidden rounded-[2.5rem] relative z-10">

          {/* Left: Chat Profiler (30%) — Permanente */}
          <div className="w-full md:w-[30%] h-full flex items-center justify-center p-8 border-r border-white/10 relative z-10 bg-black/10">
            <AiChatProfiler />
          </div>

          {/* Right: Radar/Grid/Layer2 (70%) */}
          <div className="w-full md:w-[70%] h-full relative overflow-hidden bg-white/5">
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
                    <Typography variant="p" className="mb-0.5 font-bold text-[10.5px] text-white">{t.header.matchedOpportunities}</Typography>
                    <Typography variant="p" className="text-[8px] text-white/50">
                      {t.header.assetsMatching.replace('{{count}}', filteredAssets.length.toString())}
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
                                <Typography variant="h4" className="text-white/80">{t.header.noMatches}</Typography>
                                <Typography variant="p" className="max-w-xs mt-4 leading-relaxed text-sm text-white/50">
                                  {t.header.filterWarning}
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
