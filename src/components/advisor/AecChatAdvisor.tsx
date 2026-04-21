'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, User, Sparkles } from 'lucide-react'
import { useGeolandStore } from '@/store/useGeolandStore'
import { AecAction, AecAssetContext } from '@/types/aec'
import { executeAecActions } from './AecActionHandler'

export function AecChatAdvisor() {
  const {
    isvV6,
    assets,
    originalAssets,
    activeAssetId,
    aecHistory,
    setAecHistory,
    setAecPendingActions,
    aecProactiveAlert,
    setAecProactiveAlert,
    simulationPreview,
    setSimulationPreview,
  } = useGeolandStore()

  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [aecHistory, isLoading])

  useEffect(() => {
    if (!isLoading) inputRef.current?.focus()
  }, [isLoading])

  // Mensaje de bienvenida del AEC
  useEffect(() => {
    if (aecHistory.length === 0) {
      const nombre = assets.length > 0
        ? `Encontré ${assets.length} activos que coinciden con tu perfil.`
        : 'Estoy listo para ayudarte.'
      setAecHistory(() => [{
        role: 'assistant',
        content: `Hola, soy tu asesor de capital en GEOLAND. ${nombre} Podés preguntarme sobre cualquier activo, pedirme que filtre o compare opciones, o ajustar tu perfil si los resultados no te convencen.`
      }])
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // solo al montar

  // Construir contexto de assets para el endpoint
  const buildAssetsContext = (): AecAssetContext[] => {
    return (assets ?? []).slice(0, 20).map(a => ({
      asset_id: a.id ?? a.asset_id ?? '',
      mercado: a.mercado ?? '',
      estrategia: a.strategy ?? a.estrategia ?? '',
      irr: a.layer1?.expectedIrr ?? a.irr_equivalente ?? 0,
      g_score: a.layer1?.gScore ?? a.g_score ?? 0,
      precio_usd: a.precio_usd ?? 0,
      etiqueta: a.etiqueta_operacion ?? a.etiqueta ?? '',
      confidence: a.confidence ?? 0,
    }))
  }

  const sendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput('')
    setAecHistory(prev => [...prev, { role: 'user', content: userMessage }])
    setIsLoading(true)

    // Cerrar alerta proactiva si la hay
    setAecProactiveAlert(null)
    setSimulationPreview(null)

    try {
      const response = await fetch('/api/aec-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          history: [...aecHistory, { role: 'user', content: userMessage }].slice(-15),
          isv: useGeolandStore.getState().isvV6 ?? {},
          assets: buildAssetsContext(),
          active_asset_id: useGeolandStore.getState().activeAssetId ?? undefined,
        }),
      })

      const data = await response.json()

      if (data.dialogo_ui) {
        setAecHistory(prev => [...prev, { role: 'assistant', content: data.dialogo_ui }])
      }

      if (data.proactive_alert) {
        setAecProactiveAlert(data.proactive_alert)
      }

      if (data.actions?.length > 0) {
        setAecPendingActions(data.actions)
        await executeAecActions(data.actions)
      }

    } catch (error) {
      console.error('[AEC] Error:', error)
      setAecHistory(prev => [...prev, {
        role: 'assistant',
        content: 'Hubo un error en la red al contactar al asesor. Intentá de nuevo.'
      }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full w-full max-w-[620px] px-3 md:px-6 relative">

      {/* Badge AEC */}
      <div className="flex justify-between items-center pb-2">
        <div className="flex items-center gap-1.5">
          <Sparkles size={12} style={{ color: '#000000' }} />
          <span className="text-xs font-medium" style={{ color: '#6B7280' }}>
            Asesor de Capital
          </span>
        </div>
        <div className="flex gap-2 items-center">
          {originalAssets?.length > (assets?.length ?? 0) && (
            <button
              onClick={() => useGeolandStore.getState().setAssets(originalAssets)}
              className="text-[10px] px-2 py-1 rounded border hover:bg-gray-50 transition-colors"
              style={{ borderColor: '#E5E7EB', color: '#374151', cursor: 'pointer' }}
            >
              Restaurar vista
            </button>
          )}
          <span className="text-xs px-2 py-1 rounded-full"
            style={{ backgroundColor: '#F3F4F6', color: '#374151', border: '1px solid #E5E7EB' }}>
            {assets?.length ?? 0} activos en pantalla
          </span>
        </div>
      </div>

      {/* Alerta proactiva */}
      <AnimatePresence>
        {aecProactiveAlert && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="text-xs px-4 py-2 rounded-xl mb-2 font-medium flex justify-between items-start"
            style={{ backgroundColor: '#ECFDF5', border: '1px solid #6EE7B7', color: '#065F46' }}
          >
            <span>{aecProactiveAlert}</span>
            <button
              onClick={() => setAecProactiveAlert(null)}
              className="ml-2 opacity-50 hover:opacity-100 flex-shrink-0"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#065F46', fontSize: 14 }}
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview de simulación */}
      <AnimatePresence>
        {simulationPreview && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="text-xs px-4 py-3 rounded-xl mb-2"
            style={{ backgroundColor: '#FFFBEB', border: '1px solid #FDE68A', color: '#92400E' }}
          >
            <p className="font-medium mb-1">Vista previa del cambio</p>
            <p>
              Con este ajuste verías <strong>{simulationPreview.resultCount ?? '?'} activos</strong> en vez de los {assets?.length ?? 0} actuales.
              {simulationPreview.resultCount === 0 && ' Ningún activo matchea con ese criterio — quizás hay que flexibilizar algo.'}
              {simulationPreview.resultCount && simulationPreview.resultCount > (assets?.length ?? 0) && ' Ampliaría tu búsqueda.'}
              {simulationPreview.resultCount && simulationPreview.resultCount < (assets?.length ?? 0) && ' Reduciría tu búsqueda.'}
            </p>
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => {
                  // Confirmar el cambio — ejecutar update_isv + refetch_match
                  const store = useGeolandStore.getState()
                  store.setAecPendingActions([
                    { type: 'update_isv', payload: simulationPreview.changes },
                    { type: 'refetch_match' }
                  ])
                  executeAecActions([
                    { type: 'update_isv', payload: simulationPreview.changes },
                    { type: 'refetch_match' }
                  ])
                  setSimulationPreview(null)
                }}
                style={{ backgroundColor: '#000000', color: '#FFFFFF', border: 'none', borderRadius: 6, padding: '4px 12px', cursor: 'pointer', fontSize: 11, fontWeight: 600 }}
              >
                Confirmar cambio
              </button>
              <button
                onClick={() => setSimulationPreview(null)}
                style={{ backgroundColor: 'transparent', border: '1px solid #FDE68A', borderRadius: 6, padding: '4px 12px', cursor: 'pointer', fontSize: 11, color: '#92400E' }}
              >
                Cancelar
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Historial del chat */}
      <div className="flex-1 overflow-y-auto space-y-4 scrollbar-hide pt-2 pb-4 md:pt-10 md:pb-8"
        style={{ scrollbarWidth: 'none' }}>
        <AnimatePresence initial={false}>
          {aecHistory.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' ? (
                <div
                  className="max-w-[85%] p-[13px] flex gap-[12px] rounded-2xl rounded-tl-sm"
                  style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', boxShadow: '0 2px 5px rgba(0,0,0,0.04)' }}
                >
                  <div className="mt-0.5 flex-shrink-0 w-[15px] h-[15px] flex items-center justify-center rounded-sm font-bold text-[8px] text-white"
                    style={{ backgroundColor: '#000000' }}>G</div>
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
              <div className="p-[13px] rounded-2xl rounded-tl-sm"
                style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', boxShadow: '0 2px 5px rgba(0,0,0,0.04)' }}>
                <div className="flex space-x-1.5">
                  {[0, 0.1, 0.2].map((delay, i) => (
                    <div key={i} className="w-1.5 h-1.5 rounded-full animate-bounce"
                      style={{ backgroundColor: '#000000', opacity: 0.5, animationDelay: `${delay}s` }} />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="sticky bottom-8 mt-4">
        <form onSubmit={sendMessage} className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Consultame sobre cualquier activo..."
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
  )
}
