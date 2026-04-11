'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, User } from 'lucide-react';
import { useGeolandStore } from '@/store/useGeolandStore';
import { GlassCard } from '../ui/GlassCard';
import { translations } from '@/lib/translations';

export function AiChatProfiler() {
    const {
        updateFiltros,
        setPerfilCompletado,
        setIterandoResultados,
        perfilCompletado,
        chatHistory: messages,
        setChatHistory: setMessages,
        setAssets,
        setIsRefining,
        // ISV V6 — ISV-V6-04
        updateIsvV6,
        isvV6,
        updateIsvV4,
        isvV4,
        setCurrentState,
        setContradictionDetected,
        contradictionDetected,
        currentState,
        triggerTestMode,
        language,
    } = useGeolandStore();

    const t = translations[language];

    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [hasSentSystemCommand, setHasSentSystemCommand] = useState(false);

    const bottomRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = () => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    // Mantener foco en el input después de cada respuesta
    useEffect(() => {
        if (!isLoading) {
            inputRef.current?.focus();
        }
    }, [isLoading]);

    // Initial invisible prompt - simplified to direct set
    useEffect(() => {
        if (messages.length === 0) {
            setMessages(() => [{
                role: 'assistant',
                content: t.chat.welcome
            }]);
        }
    }, [messages.length, setMessages]);

    // 🕵️ THE FEEDBACK LOOP TRIGGER
    useEffect(() => {
        let isMounted = true;

        if (perfilCompletado && !hasSentSystemCommand && messages.length > 0) {
            setHasSentSystemCommand(true);

            // Directly inject exact text strictly when loader is finishing
            setTimeout(() => {
                if (isMounted) {
                    setMessages((prev) => [...prev, { role: 'assistant', content: t.chat.refineQuestion }]);
                }
            }, 6000); // Timer to match the duration of TheOracleLoader
        }

        return () => { isMounted = false; };
    }, [perfilCompletado, hasSentSystemCommand, messages, setMessages]);

    const sendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput('');

        // Optimistic append
        setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);

        // 🛠️ TEST MODE BYPASS
        if (userMessage.toLowerCase() === 'test mode') {
            triggerTestMode();
            return;
        }

        setIsLoading(true);
        const currentHistoryForApi = [...messages, { role: 'user' as const, content: userMessage }];

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    history: currentHistoryForApi,
                    message: userMessage,
                    perfilCompletado,
                    currentState: useGeolandStore.getState().isvV6,  // leer estado más reciente del store
                }),
            });

            const data = await response.json();

            if (data.dialogo_ui) {
                setMessages((prev) => [...prev, { role: 'assistant', content: data.dialogo_ui }]);
            }

            // ISV V6 — actualizar store (ISV-V6-04)
            if (data.isvV6_mapeado) {
                updateIsvV6(data.isvV6_mapeado);

                // Sincronizar filtrosDuros con campos críticos del v6
                const v6 = data.isvV6_mapeado;
                const durosUpdate: any = {};
                if (v6.preferred_markets?.[0]) durosUpdate.ubicacion = v6.preferred_markets[0];
                if (v6.budget?.currency)       durosUpdate.moneda    = v6.budget.currency;
                if (v6.budget?.amount_max)     durosUpdate.presupuestoMaximo = v6.budget.amount_max;
                
                if (Object.keys(durosUpdate).length > 0) {
                    updateFiltros(durosUpdate, {}, undefined);
                }
            }

            // Transición a Capa 1 cuando el ISV es suficiente
            if (data.perfil_completado && !perfilCompletado) {
                setTimeout(() => {
                    setPerfilCompletado(true);
                }, 3000);
            }

            // Refinamiento (REFINAMIENTO_SYSTEM_PROMPT — legacy, se mantiene)
            if (data.iterando_resultados !== undefined) {
                setIterandoResultados(data.iterando_resultados);
            }

            // Legacy v3 mapping (only if present, for backward compatibility during refinement)
            if (data.extraccion_mapeada) {
                const { filtrosDuros, filtrosBlandosIsv, preferenciasAgro, isvExpandido: isvExp } = data.extraccion_mapeada;
                
                updateFiltros(
                    {
                        ubicacion: filtrosDuros?.ubicacion || null,
                        tipoActivo: filtrosDuros?.tipoActivo || null,
                        presupuestoMaximo: filtrosDuros?.presupuestoMaximo || null,
                        moneda: filtrosDuros?.moneda || null
                    },
                    {
                        estrategiaObjetivo: filtrosBlandosIsv?.estrategiaObjetivo || null,
                        horizonteAnos: filtrosBlandosIsv?.horizonteAnos || null,
                        involucramiento: filtrosBlandosIsv?.involucramiento || null,
                        riesgoTolerancia: filtrosBlandosIsv?.riesgoTolerancia || null,
                        financiacion: filtrosBlandosIsv?.financiacion || null,
                        mercadoPreferencia: filtrosBlandosIsv?.mercadoPreferencia || null
                    },
                    preferenciasAgro
                );

                // updateFiltros already handled the mapping. isvExpandido is no longer used separately.
            }

            if (data.current_state) setCurrentState(data.current_state);
            setContradictionDetected(data.contradiccion_detectada ?? false);

            if (perfilCompletado && data.extraccion_datos?.confirmacion_busqueda === true) {
                const store = useGeolandStore.getState();

                setIsRefining(true);
                try {
                    // Dynamic import to avoid breaking components loading rules across react
                    const { fetchMatch, buildMatchPayload } = await import('@/lib/api/geolandService');
                    const payload = buildMatchPayload(
                        store.filtrosDuros,
                        store.filtrosBlandosIsv,
                        {
                            preferenciasAgro: (store.filtrosBlandosIsv.estrategiaObjetivo === 'FARMLAND' || store.filtrosBlandosIsv.estrategiaObjetivo === 'LIVESTOCK') ? store.preferenciasAgro : null
                        }
                    );
                    const nuevosAssets = await fetchMatch(payload);
                    setAssets(nuevosAssets);
                } catch (error) {
                    // Si no hay resultados, el agente ya informó — no romper la grilla
                    console.error("No matches for the iteration.", error);
                    setMessages(prev => [...prev, {
                        role: 'assistant',
                        content: 'Mi analizador indexó un error al mapear esos parámetros exactos. ¿Ajustamos algo más para ser un poco más flexibles?'
                    }]);
                } finally {
                    setIsRefining(false);
                }
            }

        } catch (error) {
            console.error('Send message failed', error);
            setMessages((prev) => [...prev, { role: 'assistant', content: t.chat.errorRetry }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full w-full max-w-[620px] px-6 relative">

            {/* ── ACTIVE_SUPPORT badge (FRONT-ISV-EXP-04) ──────────────── */}
            {currentState === 'ACTIVE_SUPPORT' && (
                <div className="flex justify-end pb-2">
                    <span className="text-xs px-2 py-1 rounded-full font-medium" style={{ backgroundColor: '#F3F4F6', color: '#000000', border: '1px solid #E5E7EB' }}>
                        {t.chat.supportActive}
                    </span>
                </div>
            )}

            <div className="flex-1 overflow-y-auto space-y-4 scrollbar-hide pt-10 pb-8" style={{ scrollbarWidth: 'none' }}>
                <AnimatePresence initial={false}>
                    {messages.map((msg, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            {msg.role === 'assistant' ? (
                                <div
                                    className="max-w-[85%] p-[13px] flex gap-[12px] rounded-2xl rounded-tl-sm transition-all"
                                    style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', boxShadow: '0 2px 5px rgba(0,0,0,0.04)' }}
                                >
                                    <div className="mt-0.5 flex-shrink-0 w-[15px] h-[15px] flex items-center justify-center rounded-sm font-bold text-[8px] text-white" style={{ backgroundColor: '#000000' }}>G</div>
                                    <p className="text-[13px] font-normal leading-relaxed" style={{ color: '#0F1117' }}>
                                        {msg.content}
                                    </p>
                                </div>
                            ) : (
                                <div
                                    className="max-w-[85%] p-[13px] flex gap-[12px] rounded-2xl rounded-tr-sm"
                                    style={{ backgroundColor: '#000000' }}
                                >
                                    <div className="mt-0.5 flex-shrink-0">
                                        <User size={14} className="text-white/60" />
                                    </div>
                                    <p className="text-[13px] font-normal leading-relaxed text-white">
                                        {msg.content}
                                    </p>
                                </div>
                            )}
                        </motion.div>
                    ))}
                    {isLoading && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                            <div className="p-[13px] rounded-2xl rounded-tl-sm" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', boxShadow: '0 2px 5px rgba(0,0,0,0.04)' }}>
                                <div className="flex space-x-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: '#000000', opacity: 0.5 }} />
                                    <div className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: '#000000', opacity: 0.5, animationDelay: '0.1s' }} />
                                    <div className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: '#000000', opacity: 0.5, animationDelay: '0.2s' }} />
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
                <div ref={bottomRef} />
            </div>

            <div className="sticky bottom-8 mt-4">

                {/* ── CONTRADICTION BANNER (FRONT-ISV-EXP-04) ──────────── */}
                {contradictionDetected && (
                    <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-xs px-4 py-2 rounded-xl mb-2 font-medium"
                        style={{ backgroundColor: '#FFFBEB', border: '1px solid #FDE68A', color: '#92400E' }}
                    >
                        {t.chat.contradiction}
                    </motion.div>
                )}

                {/* ── CONFIDENCE INDICATOR removed ── */}

                <form onSubmit={sendMessage} className="relative flex items-center">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={t.chat.placeholder}
                        disabled={isLoading}
                        ref={inputRef}
                        autoFocus
                        className="w-full rounded-full py-[13px] pl-[20px] pr-12 text-[13px] font-normal focus:outline-none transition-colors"
                        style={{
                            backgroundColor: '#FFFFFF',
                            border: '1px solid #E5E7EB',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                            color: '#0F1117',
                        }}
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className="absolute right-2 p-[10px] rounded-full disabled:opacity-50 transition-all text-white"
                        style={{ backgroundColor: '#000000' }}
                    >
                        <Send size={15} fill="white" stroke="white" />
                    </button>
                </form>
            </div>
        </div>
    );
}
