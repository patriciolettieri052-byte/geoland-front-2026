'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, User } from 'lucide-react';
import { useGeolandStore } from '@/store/useGeolandStore';
import { GlassCard } from '../ui/GlassCard';

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
    } = useGeolandStore();

    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [hasSentSystemCommand, setHasSentSystemCommand] = useState(false);

    const bottomRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    // Initial invisible prompt
    useEffect(() => {
        let isMounted = true;
        const initChat = async () => {
            setIsLoading(true);
            try {
                const response = await fetch('/api/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        history: [],
                        message: '[SYSTEM COMMAND]: Inicia la conversación saludando al inversor y haciendo tu primera pregunta estratégica.'
                    }),
                });

                const data = await response.json();

                if (isMounted && data.dialogo_ui) {
                    setMessages(() => [{ role: 'assistant', content: data.dialogo_ui }]);
                }
            } catch (error) {
                console.error('Init chat failed', error);
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        // Only run if empty
        if (messages.length === 0) {
            initChat();
        }

        return () => { isMounted = false; };
    }, [messages.length, setMessages]);

    // 🕵️ THE FEEDBACK LOOP TRIGGER
    useEffect(() => {
        let isMounted = true;

        if (perfilCompletado && !hasSentSystemCommand && messages.length > 0) {
            setHasSentSystemCommand(true);

            // Directly inject exact text strictly when loader is finishing
            setTimeout(() => {
                if (isMounted) {
                    setMessages((prev) => [...prev, { role: 'assistant', content: '¿Estás de acuerdo con mi selección o te gustaría analizar otros?' }]);
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
                    currentState,
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
            setMessages((prev) => [...prev, { role: 'assistant', content: 'Connection to global index failed. Please retry.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full w-full max-w-2xl px-6 relative">

            {/* ── ACTIVE_SUPPORT badge (FRONT-ISV-EXP-04) ──────────────── */}
            {currentState === 'ACTIVE_SUPPORT' && (
                <div className="flex justify-end pb-2">
                    <span className="text-xs bg-blue-500/20 text-blue-300 border border-blue-400/20 px-2 py-1 rounded-full">
                        Copiloto activo
                    </span>
                </div>
            )}

            <div className="flex-1 overflow-y-auto space-y-6 scrollbar-hide pt-16 pb-8" style={{ scrollbarWidth: 'none' }}>
                <AnimatePresence initial={false}>
                    {messages.map((msg, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className="max-w-[85%] p-4 flex gap-4 bg-white/5 border border-white/10 shadow-sm backdrop-blur-md rounded-2xl">
                                <div className="mt-1 flex-shrink-0">
                                    {msg.role === 'user' ? <User size={18} className="text-white/60" /> : <div className="w-[18px] h-[18px] flex items-center justify-center bg-white/20 text-white font-bold text-[10px] rounded-sm">G</div>}
                                </div>
                                <p className="text-sm md:text-base font-medium leading-relaxed text-white/90">
                                    {msg.content}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                    {isLoading && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                            <div className="bg-primary/10 border border-primary/20 p-4 rounded-2xl rounded-tl-none animate-pulse">
                                <div className="flex space-x-2">
                                    <div className="w-2 h-2 bg-primary rounded-full" />
                                    <div className="w-2 h-2 bg-primary rounded-full animation-delay-200" />
                                    <div className="w-2 h-2 bg-primary rounded-full animation-delay-400" />
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
                        className="bg-yellow-400/10 border border-yellow-400/30 text-yellow-300 text-xs px-4 py-2 rounded-xl mb-2"
                    >
                        ⚠️ El agente detectó una posible contradicción — revisá su respuesta
                    </motion.div>
                )}

                {/* ── CONFIDENCE INDICATOR removed ── */}

                <form onSubmit={sendMessage} className="relative flex items-center">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Introduce your investment criteria..."
                        disabled={isLoading}
                        autoFocus
                        className="w-full bg-white/5 border-0 rounded-full py-4 pl-6 pr-14 text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-white/20 transition-colors shadow-lg backdrop-blur-xl"
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className="absolute right-2 p-3 bg-black text-white rounded-full hover:bg-black/80 disabled:opacity-50 transition-all font-bold border border-white/10"
                    >
                        <Send size={18} fill="white" stroke="white" />
                    </button>
                </form>
            </div>
        </div>
    );
}
