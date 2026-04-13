'use client';

import { useEffect, useState, useMemo } from 'react';
import { Inter } from 'next/font/google';
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

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
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
    chatHistory,
    language,
    setLanguage
  } = useGeolandStore();

  const t = translations[language];

  const [error, setError] = useState<string | null>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showGearMenu, setShowGearMenu] = useState(false);

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

  const filteredAssets = useMemo(() => {
    if (!perfilCompletado || isRefining) return [];
    let result = [...assets];
    return result.map(a => {
      const id = a.id || a.asset_id || "unknown";
      const seed = id.length + (filtrosBlandosIsv.estrategiaObjetivo?.length || 0) + (iterandoResultados ? 1 : 0);
      const mockGScore = 80 + (seed % 18);
      const aqs = a.layer1?.gScore || a.aqs_score || mockGScore;
      
      const localPrice = a.precio_usd || 165000;
      const localIrr = a.irr_equivalente || 0.242;
      const localGScore = a.g_score || 84;
      const localPhotos = (a.photo_urls && a.photo_urls.length > 0) ? a.photo_urls : [
        "/renovation_5.png",
        "/renovation_1.png",
        "/renovation_2.png",
        "/renovation_3.png",
        "/renovation_4.png"
      ];

      return {
        ...a,
        id,
        estrategia: a.estrategia || a.strategy || "FIX_FLIP",
        nombre: a.nombre || "Palacio Alcalá - Reforma Integral",
        ciudad: a.ciudad || "Buenos Aires",
        location: a.location || "Recoleta, Buenos Aires",
        precio_usd: localPrice,
        capex_estimado: a.capex_estimado || 48000,
        arv_estimado: a.arv_estimado || 295000,
        roiTotal: a.roiTotal || 0.385,
        irr_equivalente: localIrr,
        risk_score: a.risk_score || 28,
        confidence_final: a.confidence_final || 0.89,
        g_score: localGScore,
        ingreso_neto_anual: a.ingreso_neto_anual || 0,
        descuento_pct: a.descuento_pct || 0.12,
        payback_meses: a.payback_meses || 9,
        precio_m2: a.precio_m2 || 1850,
        precio_m2_zona: a.precio_m2_zona || 2100,
        etiqueta_operacion: a.etiqueta_operacion || "Oportunidad High-Yield",
        photo_urls: localPhotos,
        layer1: { 
          ...(a.layer1 || {}), 
          gScore: localGScore,
          expectedIrr: localIrr,
          backgroundImageUrl: (a.layer1?.backgroundImageUrl) || localPhotos[0]
        },
        layer2: {
          ...(a.layer2 || {}),
          metrics: {
            ...(a.layer2?.metrics || {}),
            baseCapex: (a.layer2?.metrics?.baseCapex && a.layer2?.metrics?.baseCapex > 0) ? a.layer2.metrics.baseCapex : localPrice,
            renovationEstimate: a.capex_estimado || 48000,
            projectDuration: a.payback_meses || 9
          },
          sensitivityConfig: a.layer2?.sensitivityConfig || { capexRange: [localPrice * 0.8, localPrice * 1.2], exitRateRange: [4.0, 6.0] }
        }
      };
    }).sort((a, b) => (b.layer1?.gScore || 0) - (a.layer1?.gScore || 0));
  }, [assets, perfilCompletado, isRefining, iterandoResultados, filtrosBlandosIsv]);

  const activeAsset = filteredAssets.find(a => a.id === activeAssetId);

  return (
    <main className={`${inter.variable} min-h-screen w-full overflow-auto font-sans`} style={{ backgroundColor: '#FFFFFF', color: '#0F1117' }}>

      <motion.div
        key="stable-container"
        className="min-h-screen w-full flex flex-col items-center justify-center p-4 md:p-8" 
        style={{ backgroundColor: "#FFFFFF", minWidth: "1024px" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >

        {/* ── HEADER ── */}
        <div className="w-full max-w-[1664px] mx-auto px-0 mb-6 flex items-center justify-between relative z-50">

          {/* Izquierda: logo + tagline alineados al baseline de GEOLAND */}
          <div className="flex items-end gap-4">
            <img src="/logo Geoland OS.svg" alt="GEOLAND OS" style={{ height: '32px', width: 'auto' }} />
            <span style={{ fontSize: "11px", fontWeight: 400, letterSpacing: "0.04em", color: "#9CA3AF", lineHeight: 1, marginBottom: "2px", transform: "translateY(5px)" }}>
              {t.header.infraText}
            </span>
          </div>

          {/* Derecha: idioma + engranaje + avatar — todos centrados en el mismo eje */}
          <div className="flex items-center gap-3">

            {/* Language Selector */}
            <div
              className="flex items-center gap-3 px-4 rounded-full border"
              style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB', height: '36px' }}
            >
              {(['es', 'en', 'pt'] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className="text-[10px] font-bold tracking-widest uppercase transition-all cursor-pointer"
                  style={{ color: language === lang ? '#000000' : '#9CA3AF' }}
                >
                  {lang}
                </button>
              ))}
            </div>

            {/* Gear */}
            <div className="relative">
              <button
                onClick={() => { setShowGearMenu(!showGearMenu); setShowProfileMenu(false); }}
                className="flex items-center justify-center rounded-full border transition-all hover:shadow-sm cursor-pointer"
                style={{
                  width: '36px',
                  height: '36px',
                  backgroundColor: showGearMenu ? '#F3F4F6' : '#FFFFFF',
                  borderColor: '#E5E7EB',
                  color: '#6B7280',
                }}
              >
                <Settings size={16} />
              </button>

              <AnimatePresence>
                {showGearMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 5, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 top-full mt-2 w-48 rounded-2xl shadow-lg overflow-hidden z-50 p-1.5 border"
                    style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }}
                  >
                    {[
                      { icon: HelpCircle, label: t.menus.gear.help },
                      { icon: Info, label: t.menus.gear.whatIsGeoland }
                    ].map((item, i) => (
                      <button
                        key={i}
                        className="w-full flex items-center gap-3 px-3 py-2 text-xs rounded-xl transition-all hover:bg-gray-50 cursor-pointer"
                        style={{ color: '#6B7280' }}
                        onClick={() => setShowGearMenu(false)}
                      >
                        <item.icon size={14} />
                        <span className="font-medium">{item.label}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Avatar */}
            <div className="relative">
              <div
                onClick={() => { setShowProfileMenu(!showProfileMenu); setShowGearMenu(false); }}
                className={`flex items-center justify-center rounded-full text-white font-bold text-sm cursor-pointer hover:opacity-90 transition-all ${showProfileMenu ? 'ring-2 ring-offset-1 ring-black' : ''}`}
                style={{
                  width: '36px',
                  height: '36px',
                  backgroundColor: '#000000',
                }}
              >
                P
              </div>

              <AnimatePresence>
                {showProfileMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 5, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 top-full mt-2 w-56 rounded-2xl shadow-lg overflow-hidden z-50 p-1.5 border"
                    style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }}
                  >
                    {[
                      { icon: BarChart3, label: t.menus.profile.myBureau },
                      { icon: Star,     label: t.menus.profile.myFavorites },
                      { icon: Bell,     label: t.menus.profile.myAlerts },
                      { icon: Info,     label: t.menus.profile.usage },
                      { icon: CreditCard, label: t.menus.profile.subscription },
                      { icon: LogOut,   label: t.menus.profile.logout, danger: true }
                    ].map((item, i) => (
                      <button
                        key={i}
                        className={`w-full flex items-center justify-between px-3 py-2.5 text-xs rounded-xl transition-all cursor-pointer ${(item as any).danger ? 'hover:bg-red-50' : 'hover:bg-gray-50'}`}
                        style={{ color: (item as any).danger ? '#DC2626' : '#374151' }}
                        onClick={() => setShowProfileMenu(false)}
                      >
                        <div className="flex items-center gap-3">
                          <item.icon size={14} />
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

        {/* ── CONTENEDOR PRINCIPAL ── */}
        <div
          className="flex flex-row w-full max-w-[1664px] h-[85vh] overflow-hidden rounded-[2rem] relative z-10"
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E5E7EB',
            boxShadow: '0 8px 32px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06)',
            minWidth: '900px',
          }}
        >

          {/* Left: Chat Profiler (33%) */}
          <div className="w-full md:w-[33%] h-full flex items-center justify-center p-8 relative z-10" style={{ borderRight: '1px solid #E5E7EB', backgroundColor: '#f0f0f0' }}>
            <AiChatProfiler />
          </div>

          {/* Right: Radar/Grid/Layer2 (67%) */}
          <div className="w-full md:w-[67%] h-full relative overflow-hidden" style={{ backgroundColor: '#FFFFFF' }}>
            <AnimatePresence mode="wait">
              {activeAsset ? (
                <motion.div
                  key="layer2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4 }}
                  className="absolute inset-0 flex flex-col z-0"
                >
                  <Layer2Container asset={activeAsset} onClose={() => setActiveAsset(null)} />
                </motion.div>
              ) : !perfilCompletado ? (
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
                <motion.div
                  key="index-view"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0 flex flex-col pt-2 pb-8 px-6 overflow-y-auto scrollbar-hide"
                  style={{ scrollbarWidth: 'none' }}
                >
                  <div className="flex-1">
                    {error ? (
                      <div className="flex flex-col items-center justify-center min-h-[400px] text-center px-8">
                        <p className="text-lg mb-4" style={{ color: '#6B7280' }}>{error}</p>
                        <button
                          onClick={() => window.location.reload()}
                          className="px-6 py-2 rounded-lg transition-colors text-white"
                          style={{ backgroundColor: '#000000' }}
                        >
                          Reintentar
                        </button>
                      </div>
                    ) : (
                      <>
                        <Layer1GlassGrid assets={filteredAssets} onAssetClick={setActiveAsset} />
                        {filteredAssets.length === 0 && (
                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-12 text-center w-full flex flex-col items-center">
                            <p className="text-lg" style={{ color: '#374151' }}>{t.header.noMatches}</p>
                            <p className="max-w-xs mt-4 leading-relaxed text-sm" style={{ color: '#9CA3AF' }}>
                              {t.header.filterWarning}
                            </p>
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
