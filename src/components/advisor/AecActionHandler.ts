// src/components/advisor/AecActionHandler.ts
// Ejecutor de acciones del AEC — traduce AecAction[] en efectos sobre el store

import { AecAction } from '@/types/aec'
import { useGeolandStore } from '@/store/useGeolandStore'

export async function executeAecActions(actions: AecAction[]): Promise<void> {
  for (const action of actions) {
    try {
      await executeSingleAction(action)
    } catch (error) {
      console.error(`[AEC Handler] Error ejecutando acción ${action.type}:`, error)
      // continuar con la siguiente acción
    }
  }
}

async function executeSingleAction(action: AecAction): Promise<void> {
  const store = useGeolandStore.getState()

  switch (action.type) {

    case 'filter_assets': {
      // FIX-FRONT-P1-06: Filter from original snapshot so it can be undone
      let filtered = [...(store.originalAssets ?? store.assets ?? [])]
      if (action.mercado) {
        filtered = filtered.filter(a => a.mercado === action.mercado)
      }
      if (action.estrategia) {
        filtered = filtered.filter(a =>
          (a.strategy ?? a.estrategia ?? '').toUpperCase() === action.estrategia!.toUpperCase()
        )
      }
      if (action.min_irr !== undefined) {
        filtered = filtered.filter(a =>
          (a.layer1?.expectedIrr ?? a.irr_equivalente ?? 0) >= action.min_irr!
        )
      }
      if (action.max_precio !== undefined) {
        filtered = filtered.filter(a => (a.precio_usd ?? 0) <= action.max_precio!)
      }
      store.setAssets(filtered)
      break
    }

    case 'sort_assets': {
      const sorted = [...(store.assets ?? [])].sort((a, b) => {
        let valA = 0, valB = 0
        if (action.by === 'irr') {
          valA = a.layer1?.expectedIrr ?? a.irr_equivalente ?? 0
          valB = b.layer1?.expectedIrr ?? b.irr_equivalente ?? 0
        } else if (action.by === 'g_score') {
          valA = a.layer1?.gScore ?? a.g_score ?? 0
          valB = b.layer1?.gScore ?? b.g_score ?? 0
        } else if (action.by === 'precio') {
          valA = a.precio_usd ?? 0
          valB = b.precio_usd ?? 0
        }
        return action.order === 'desc' ? valB - valA : valA - valB
      })
      store.setAssets(sorted)
      break
    }

    case 'highlight_asset': {
      // Mover el asset al primer lugar del array
      const assets = store.assets ?? []
      const idx = assets.findIndex(a => (a.id ?? a.asset_id) === action.asset_id)
      if (idx > 0) {
        const reordered = [assets[idx], ...assets.slice(0, idx), ...assets.slice(idx + 1)]
        store.setAssets(reordered)
      }
      break
    }

    case 'open_layer2': {
      // Setear el asset activo — el componente Layer2Container escucha este campo
      store.setActiveAssetId(action.asset_id)
      break
    }

    case 'update_isv': {
      // Merge profundo del ISV con los cambios del LLM
      const currentIsv = store.isvV6 ?? {}
      const merged = deepMerge(currentIsv as unknown as Record<string, unknown>, action.payload)
      store.updateIsvV6(merged as any)
      break
    }

    case 'refetch_match': {
      store.setIsRefining(true)
      try {
        const { buildMatchPayloadFromV6, fetchMatch } = await import('@/lib/api/geolandService')
        const currentIsv = useGeolandStore.getState().isvV6
        if (!currentIsv) break
        const payload = buildMatchPayloadFromV6(currentIsv)
        const nuevosAssets = await fetchMatch(payload)
        // FIX-FRONT-P1-06: update original snapshot on fresh fetch
        store.setOriginalAssets(nuevosAssets)
        store.setAssets(nuevosAssets)
      } catch (error) {
        console.error('[AEC Handler] Error en refetch_match:', error)
      } finally {
        store.setIsRefining(false)
      }
      break
    }

    case 'simulate_isv': {
      if (action.preview) {
        // No aplicar el cambio — solo mostrar la preview
        const changes = action.changes
        const currentAssets = store.assets ?? []
        let estimatedCount = currentAssets.length

        // Estimación básica basada en el cambio
        if (changes.budget) {
          const newMax = (changes.budget as any).amount_max
          if (newMax) {
            estimatedCount = currentAssets.filter(a => (a.precio_usd ?? 0) <= newMax).length
          }
        }
        if ((changes as any).preferred_markets) {
          const markets = (changes as any).preferred_markets as string[]
          estimatedCount = currentAssets.filter(a => markets.includes(a.mercado)).length
        }

        store.setSimulationPreview({ changes, resultCount: estimatedCount })
      } else {
        // Aplicar directamente (cuando preview:false)
        await executeSingleAction({ type: 'update_isv', payload: action.changes })
        await executeSingleAction({ type: 'refetch_match' })
      }
      break
    }

    case 'compare_assets': {
      // Setear los dos assets para comparación — AecCompareView maneja el UI
      store.setCompareAssetIds(action.asset_ids)
      break
    }

    case 'explain_metric': {
      // No hace nada en el store — el LLM ya explicó en dialogo_ui
      break
    }
  }
}

// Merge profundo para update_isv
function deepMerge(target: Record<string, unknown>, source: Record<string, unknown>): Record<string, unknown> {
  const result = { ...target }
  for (const key of Object.keys(source)) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(
        (target[key] as Record<string, unknown>) ?? {},
        source[key] as Record<string, unknown>
      )
    } else {
      result[key] = source[key]
    }
  }
  return result
}
