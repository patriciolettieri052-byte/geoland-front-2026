'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { Inter } from 'next/font/google';
import { useGeolandStore } from '@/store/useGeolandStore';
import { AiChatProfiler } from '@/components/onboarding/AiChatProfiler';
import { AecChatAdvisor } from '@/components/advisor/AecChatAdvisor';
import { AecCompareView } from '@/components/advisor/AecCompareView';
import { DynamicIsvRadar } from '@/components/onboarding/DynamicIsvRadar';
import { TheOracleLoader } from '@/components/orchestrator/TheOracleLoader';
import { Layer1GlassGrid } from '@/components/marketplace/Layer1_GlassGrid';
import { Layer2Container } from '@/components/marketplace/Layer2Container';
import { Asset } from '@/lib/mockEngine';
import { motion, AnimatePresence } from 'framer-motion';
import { Typography } from '@/components/ui/Typography';
import { Settings, HelpCircle, Info, User, Star, Bell, BarChart3, CreditCard, LogOut, ChevronRight } from 'lucide-react';
import { translations } from '@/lib/translations';
import { AuthModal } from '@/components/ui/AuthModal';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { InnerPageRouter } from '@/components/inner-pages/InnerPageRouter';
import { supabase } from '@/lib/supabase';
import { trackAction, checkLimit } from '@/lib/usage';
import { LimitModal } from '@/components/usage/LimitModal';
import { useIsMobile } from '@/hooks/useIsMobile';


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
    setLanguage,
    setAuthModalOpen,
    setAuthModalView,
    rightPanelView,
    setRightPanelView,
    compareAssetIds,
    setCompareAssetIds
  } = useGeolandStore();

  const router = useRouter();


  const t = translations[language];

  const [error, setError] = useState<string | null>(null);
  const [isUserMenuOpen, setUserMenuOpen] = useState(false);
  const [showGearMenu, setShowGearMenu] = useState(false);
  const [limitModalOpen, setLimitModalOpen] = useState(false);
  const { user, signOut } = useAuth();
  const isMobile = useIsMobile();


  // EFECTO COMBINADO: Límite + Tracking + Persistencia + Búsqueda
  useEffect(() => {
    if (!perfilCompletado || assets.length > 0) return;
    
    let cancelled = false;
    let timeoutId: NodeJS.Timeout;

    const runSequence = async () => {
      // 1. Verificar límites si hay usuario
      if (user) {
        const canSearch = await checkLimit(user.id, 'search');
        if (!canSearch) {
          if (!cancelled) setLimitModalOpen(true);
          return;
        }

        // 2. Persistencia de ISV (no bloqueante)
        try {
          const currentISV = useGeolandStore.getState().isvV6;
          await supabase
            .from('profiles')
            .upsert({
              id: user.id,
              email: user.email ?? '',
              isv_v6: currentISV
            }, { onConflict: 'id' });
        } catch (err) {
          console.error('Error persistiendo ISV:', err);
        }
      }

      // 4. Ejecutar búsqueda (Lógica original)
      timeoutId = setTimeout(() => {
        if (!cancelled) {
          setError('El análisis tardó demasiado. Verificá tu conexión e intentá de nuevo.');
          setIsRefining(false);
        }
      }, 30000);

      setIsRefining(true);
      try {
        const { fetchMatch, buildMatchPayloadFromV6 } = await import('@/lib/api/geolandService');
        const store = useGeolandStore.getState();
        const payload = buildMatchPayloadFromV6(store.isvV6);
        const data = await fetchMatch(payload);
        if (!cancelled) {
          clearTimeout(timeoutId);
          
          if (data.length === 0) {
            // ── ZERO RESULTS: revertir transición y dejar al profiler activo ──
            setAssets([]);
            useGeolandStore.getState().setOriginalAssets([]);
            // Revertir perfilCompletado para que AiChatProfiler siga activo
            useGeolandStore.getState().setPerfilCompletado(false);
            // Inyectar mensaje en el historial del profiler
            useGeolandStore.getState().setChatHistory((prev) => [
              ...prev,
              {
                role: 'assistant',
                content: 'Analicé el mercado pero no encontré activos que coincidan exactamente con tu perfil actual. Podemos ajustar la búsqueda: ¿querés ampliar el mercado, cambiar la estrategia, o revisar el presupuesto?'
              }
            ]);
          } else {
            setAssets(data);
            useGeolandStore.getState().setOriginalAssets(data);
            if (user) trackAction(user.id, 'search');
          }
        }
      } catch (err: any) {
        if (!cancelled) {
          clearTimeout(timeoutId);
          console.error('[page.tsx] fetchMatch falló:', err);
          if (err.message === 'NO_ASSETS_MATCH') {
            setAssets([]);
            useGeolandStore.getState().setOriginalAssets([]);
            useGeolandStore.getState().setPerfilCompletado(false);
            useGeolandStore.getState().setChatHistory((prev) => [
              ...prev,
              {
                role: 'assistant',
                content: 'No encontré activos que coincidan con esos criterios. ¿Ajustamos algo? Podés cambiar el mercado, la estrategia o el rango de presupuesto.'
              }
            ]);
            setError(null);
          } else {
            setError('No se pudieron cargar los resultados. Intentá de nuevo.');
          }
        }
      } finally {
        if (!cancelled) setIsRefining(false);
      }
    };

    runSequence();

    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [perfilCompletado, user]);


  const handleAuthModalClose = () => {
    setAuthModalOpen(false);
    if (!user) {
      setActiveAsset(null);
    }
  };

  const handleLoaderComplete = useCallback(() => {
    // FIX: Always allow the loader to finish to avoid infinite loops
    // especially when assets.length is 0. The finally block in the fetch 
    // also handles this, but this ensures the 6s minimum duration 
    // doesn't block the UI if the fetch is already done with 0 results.
    setIsRefining(false);
  }, [setIsRefining]);

  const filteredAssets = useMemo(() => {
    if (!perfilCompletado || isRefining) return [];
    let result = [...assets];

    // Helper para extraer fotos de forma robusta
    const extractPhotos = (a: any): string[] => {
      const raw = a.photo_urls || a.image_url || a.images || a.foto || a.fotos || a.backgroundImageUrl;
      if (!raw) return ["/renovation_5.png"];
      if (Array.isArray(raw)) return raw.length > 0 ? raw : ["/renovation_5.png"];
      if (typeof raw === 'string') {
        const trimmed = raw.trim();
        if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
          try { 
            const parsed = JSON.parse(trimmed); 
            return Array.isArray(parsed) ? parsed : [trimmed];
          } catch(e) { return [trimmed]; }
        }
        if (trimmed.includes(',')) return trimmed.split(',').map(s => s.trim());
        return [trimmed];
      }
      return ["/renovation_5.png"];
    };

    // Helper para extraer ROI/Yield
    const extractRoi = (a: any): number | null => {
      const val = a.layer1?.expectedIrr ?? a.irr_equivalente ?? a.roi ?? a.roi_total ?? a.yield ?? a.yield_pct ?? a.expected_irr;
      if (val === undefined || val === null) return null;
      const n = Number(val);
      return isNaN(n) ? null : n;
    };

    // Helper para extraer Confidence (0-100)
    const extractConfidence = (a: any): number | null => {
      const val = a.confidence ?? a.confidence_score ?? a.confianza ?? a.confidenceScore;
      if (val === undefined || val === null) return null;
      let n = Number(val);
      if (isNaN(n)) return null;
      // Si está en escala 0.0-1.0 (como 0.85), convertir a 0-100
      if (n > 0 && n <= 1) n = n * 100;
      return n;
    };

    return result.map(a => {
      const id = a.id || a.asset_id || "unknown";
      
      const realPrice = a.precio_usd || a.precio || null;
      const realIrr = extractRoi(a);
      const realGScore = a.layer1?.gScore ?? a.g_score ?? a.aqs_score ?? null;
      const realConfidence = extractConfidence(a);
      const photos = extractPhotos(a);
      const hasFallbackData = !realPrice || realIrr === null || realGScore === null;

      return {
        ...a,
        id,
        asset_id: id,
        estrategia: a.estrategia || a.strategy || 'RENTAL_LONG_TERM',
        nombre: a.nombre || a.etiqueta_operacion || 'Activo sin nombre',
        location: a.ubicacion || a.mercado || a.location || "Global",
        precio_usd: realPrice,
        irr_equivalente: realIrr,
        g_score: realGScore,
        datos_estimados: hasFallbackData || a.datos_estimados || false,
        photo_urls: photos,
        confidenceScore: realConfidence,
        layer1: { 
          ...(a.layer1 || {}), 
          gScore: realGScore ?? 0,
          expectedIrr: realIrr ?? 0,
          backgroundImageUrl: photos[0]
        },
        layer2: {
          ...(a.layer2 || {}),
          metrics: {
            ...(a.layer2?.metrics || {}),
            baseCapex: a.layer2?.metrics?.baseCapex ?? realPrice ?? 0,
            roiTotal: realIrr ?? 0,
          }
        }
      };
    }).sort((a, b) => (b.layer1?.gScore || 0) - (a.layer1?.gScore || 0));
  }, [assets, perfilCompletado, isRefining]);

  const activeAsset = filteredAssets.find(a => a.id === activeAssetId);

  return (
    <main className={`${inter.variable} min-h-screen w-full overflow-auto font-sans`} style={{ backgroundColor: '#FFFFFF', color: '#0F1117' }}>

      <motion.div
        key="stable-container"
        className="min-h-screen w-full flex flex-col items-center justify-center p-4 md:p-8" 
        style={{ backgroundColor: "#FFFFFF" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >

        {/* ── MOBILE HEADER (Compact) ── */}
        <div
          className="flex md:hidden items-center justify-between px-4 py-3 w-full mb-4"
          style={{ borderBottom: '1px solid #E5E7EB', backgroundColor: '#FFFFFF' }}
        >
          <img src="/logo Geoland OS.svg" alt="GEOLAND OS" style={{ height: '24px', width: 'auto' }} />
          <div className="flex items-center gap-2">
            <div
              onClick={() => {
                if (!user) { setAuthModalView('login'); setAuthModalOpen(true); }
                else setUserMenuOpen(!isUserMenuOpen);
              }}
              className="flex items-center justify-center rounded-full text-white font-bold text-xs cursor-pointer"
              style={{ width: '32px', height: '32px', backgroundColor: '#000000' }}
            >
              {user ? (user.user_metadata?.full_name ?? user.email ?? 'U')[0].toUpperCase() : 'P'}
            </div>
          </div>
        </div>

        {/* ── DESKTOP HEADER ── */}
        <div className="hidden md:flex w-full max-w-[1664px] mx-auto px-0 mb-6 items-center justify-between relative z-50">

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
                onClick={() => { setShowGearMenu(!showGearMenu); setUserMenuOpen(false); }}

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
                      { label: '¿Qué es Geoland?', view: 'que-es-geoland' },
                      { label: 'Ayuda', view: 'ayuda' },
                    ].map(({ label, view }, i) => (
                      <button
                        key={i}
                        className="w-full flex items-center gap-3 px-3 py-2 text-xs rounded-xl transition-all hover:bg-gray-50 cursor-pointer"
                        style={{ color: '#6B7280' }}
                        onClick={() => {
                          setRightPanelView(view as any);
                          setShowGearMenu(false);
                        }}
                      >
                        {view === 'ayuda' ? <HelpCircle size={14} /> : <Info size={14} />}
                        <span className="font-medium">{label}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Avatar */}
            <div className="relative">
              <div
                onClick={() => { 
                  if (!user) {
                    setAuthModalView('login');
                    setAuthModalOpen(true);
                  } else {
                    setUserMenuOpen(!isUserMenuOpen); 
                    setShowGearMenu(false); 
                  }
                }}
                className={`flex items-center justify-center rounded-full text-white font-bold text-sm cursor-pointer hover:opacity-90 transition-all ${isUserMenuOpen ? 'ring-2 ring-offset-1 ring-black' : ''}`}
                style={{
                  width: '36px',
                  height: '36px',
                  backgroundColor: '#000000',
                }}

              >
                {user
                  ? (user.user_metadata?.full_name ?? user.email ?? 'U')[0].toUpperCase()
                  : 'P'  // inicial cosmética original
                }
              </div>

              <AnimatePresence>
                {isUserMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 5, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 top-full mt-2 w-56 rounded-2xl shadow-lg overflow-hidden z-50 p-1.5 border"
                    style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }}
                  >
                    {[
                      { icon: User,        label: 'Mi perfil inversor', view: null, href: '/perfil' },
                      { icon: BarChart3,   label: t.menus.profile.myBureau, view: 'suscripcion' },
                      { icon: Star,        label: t.menus.profile.myFavorites, view: 'favoritos' },
                      { icon: Info,        label: t.menus.profile.usage, view: null, href: '/uso' },
                      { icon: CreditCard,  label: t.menus.profile.subscription, view: 'suscripcion' },
                    ].map(({ icon: Icon, label, view, href }, i) => (
                      <button
                        key={i}
                        className="w-full flex items-center justify-between px-3 py-2.5 text-xs rounded-xl transition-all cursor-pointer hover:bg-gray-50"
                        style={{ color: '#374151' }}
                        onClick={() => {
                          if (href) {
                            router.push(href);
                          } else {
                            setRightPanelView(view as any);
                          }
                          setUserMenuOpen(false);
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <Icon size={14} />
                          <span className="font-medium">{label}</span>
                        </div>
                        <ChevronRight size={12} className="opacity-0 group-hover:opacity-40 transition-opacity" />
                      </button>
                    ))}
                    <div style={{ borderTop: '1px solid #F3F4F6', margin: '4px 8px' }} />
                    <button
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-xs rounded-xl transition-all cursor-pointer hover:bg-red-50"
                      style={{ color: '#DC2626' }}
                      onClick={async () => {
                        await signOut();
                        setUserMenuOpen(false);
                      }}
                    >
                      <LogOut size={14} />
                      <span className="font-medium">{t.menus.profile.logout}</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>
        </div>

        {/* ── CONTENEDOR PRINCIPAL ── */}
        <div
          className="flex flex-col md:flex-row w-full max-w-[1664px] md:h-[85vh] overflow-hidden md:rounded-[2rem] relative z-10"
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E5E7EB',
            boxShadow: '0 8px 32px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06)',
            height: isMobile ? 'undefined' : undefined, // help TS/Next if needed, but following ticket
          }}
        >

          {/* Left: Chat Profiler / AEC Advisor (33%) */}
          <div 
            className="w-full md:w-[33%] flex items-center justify-center relative z-10" 
            style={{ 
              height: isMobile ? '35vh' : '100%',
              minHeight: isMobile ? '180px' : 'auto',
              borderRight: isMobile ? 'none' : '1px solid #E5E7EB', 
              borderBottom: isMobile ? '1px solid #E5E7EB' : 'none',
              backgroundColor: '#f0f0f0',
              padding: isMobile ? '16px' : '32px',
              flexShrink: 0,
              overflow: 'hidden'
            }}
          >
            {perfilCompletado ? <AecChatAdvisor /> : <AiChatProfiler />}
          </div>

          {/* Right: Radar/Grid/Layer2 (67%) */}
          <div 
            className="w-full md:w-[67%] relative" 
            style={{ 
              backgroundColor: '#FFFFFF',
              height: isMobile ? '65vh' : '100%',
              overflow: 'hidden',
              flexShrink: 0
            }}
          >
            <AnimatePresence mode="wait">
              {rightPanelView ? (
                <motion.div
                  key="inner-page"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0 z-50"
                >
                  <InnerPageRouter
                    view={rightPanelView}
                    onBack={() => setRightPanelView(null)}
                  />
                </motion.div>
              ) : compareAssetIds ? (
                <motion.div
                  key="compare-view"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0 z-40"
                >
                  <AecCompareView
                    assetA={filteredAssets.find(a => (a.id ?? a.asset_id) === compareAssetIds[0])}
                    assetB={filteredAssets.find(a => (a.id ?? a.asset_id) === compareAssetIds[1])}
                    onClose={() => setCompareAssetIds(null)}
                  />
                </motion.div>
              ) : activeAsset && user ? (
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
                  className="absolute inset-0 flex flex-col pt-[15px] pb-8 px-6 overflow-y-auto scrollbar-hide"
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

      <AuthModal onClose={handleAuthModalClose} />

      <LimitModal 
        isOpen={limitModalOpen} 
        onClose={() => setLimitModalOpen(false)} 
        actionLabel="búsquedas"
      />
    </main>
  );
}

