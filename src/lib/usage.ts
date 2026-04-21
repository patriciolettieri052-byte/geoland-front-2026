import { supabase } from '@/lib/supabase'

export type ActionType = 'search' | 'layer2_view' | 'layer3_generate'

const LIMITS: Record<ActionType, keyof LimitFields> = {
  search: 'limits_searches',
  layer2_view: 'limits_layer2',
  layer3_generate: 'limits_layer3',
}

// FIX-FRONT-P1-04: Default limits to prevent permanent blocks
const DEFAULT_LIMITS: Record<ActionType, number> = {
  search: 20,
  layer2_view: 50,
  layer3_generate: 5,
}

interface LimitFields {
  limits_searches: number
  limits_layer2: number
  limits_layer3: number
}

/**
 * Registra una acción en usage_log.
 * No bloqueante — llamar sin await.
 */
export async function trackAction(
  userId: string,
  action: ActionType,
  assetId?: string
): Promise<void> {
  try {
    await supabase.from('usage_log').insert({
      user_id: userId,
      action,
      asset_id: assetId ?? null,
    })
  } catch (error) {
    console.error('Error tracking action (no bloqueante):', error)
  }
}

/**
 * Verifica si el usuario alcanzó su límite mensual para una acción.
 * Retorna true si puede continuar, false si alcanzó el límite.
 */
export async function checkLimit(
  userId: string,
  action: ActionType
): Promise<boolean> {
  try {
    // Obtener límite del usuario
    const { data: profile } = await supabase
      .from('profiles')
      .select('limits_searches, limits_layer2, limits_layer3')
      .eq('id', userId)
      .single()

    if (!profile) return true // Si no hay perfil, dejar pasar

    const limitField = LIMITS[action]
    const limit = (profile[limitField as keyof typeof profile] as number)
      ?? DEFAULT_LIMITS[action]
      ?? 20  // absolute fallback

    // Contar usos del mes actual
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const { count } = await supabase
      .from('usage_log')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('action', action)
      .gte('created_at', startOfMonth.toISOString())

    return (count ?? 0) < limit
  } catch (error) {
    console.error('Error checking limit (permitiendo acción):', error)
    return true // En caso de error, dejar pasar
  }
}

/**
 * Obtiene el uso actual del mes para mostrar en /uso.
 */
export async function getMonthlyUsage(userId: string) {
  try {
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const { data: profile } = await supabase
      .from('profiles')
      .select('limits_searches, limits_layer2, limits_layer3')
      .eq('id', userId)
      .single()

    const actions: ActionType[] = ['search', 'layer2_view', 'layer3_generate']
    const usage: Record<ActionType, { used: number; limit: number }> = {
      search: { used: 0, limit: profile?.limits_searches ?? 20 },
      layer2_view: { used: 0, limit: profile?.limits_layer2 ?? 50 },
      layer3_generate: { used: 0, limit: profile?.limits_layer3 ?? 5 },
    }

    for (const action of actions) {
      const { count } = await supabase
        .from('usage_log')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('action', action)
        .gte('created_at', startOfMonth.toISOString())

      usage[action].used = count ?? 0
    }

    return usage
  } catch (error) {
    console.error('Error getting usage:', error)
    return null
  }
}
