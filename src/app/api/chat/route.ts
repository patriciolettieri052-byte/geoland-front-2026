import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { ONBOARDING_SYSTEM_PROMPT, REFINAMIENTO_SYSTEM_PROMPT } from '@/lib/ai/prompts';
import { checkRateLimit } from '@/lib/rateLimiter';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || 'dummy_key',
});

function cleanJsonMarkdown(text: string): string {
    let cleaned = text.trim();
    
    // Find first { and last }
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        return cleaned.substring(firstBrace, lastBrace + 1);
    }

    // Fallback to old method if no braces found (unlikely for JSON)
    if (cleaned.startsWith('```json')) {
        cleaned = cleaned.replace(/^```json/, '');
    } else if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```/, '');
    }
    if (cleaned.endsWith('```')) {
        cleaned = cleaned.replace(/```$/, '');
    }
    return cleaned.trim();
}

function mapGeminiToStore(extraccion: any) {
    const d = extraccion?.filtros_duros ?? {};
    const b = extraccion?.filtros_blandos_isv ?? {};
    const a = extraccion?.preferencias_agro ?? null;
    const e = extraccion?.isv_expandido ?? {};
    return {
        filtrosDuros: {
            ubicacion: d.ubicacion ?? null,
            tipoActivo: d.tipo_activo ?? null,
            presupuestoMaximo: d.presupuesto_maximo ?? null,
            moneda: d.moneda ?? null,
        },
        filtrosBlandosIsv: {
            estrategiaObjetivo: b.estrategia_objetivo ?? null,
            horizonteAnos: b.horizonte_anos ?? null,
            involucramiento: b.involucramiento ?? null,
            riesgoTolerancia: b.riesgo_tolerancia ?? null,
            financiacion: b.financiacion ?? null,
            mercadoPreferencia: b.mercado_preferencia ?? null,
        },
        preferenciasAgro: a ? {
            zonaAgroecologica: a.zona_agroecologica ?? null,
            accesoAgua: a.acceso_agua ?? null,
        } : null,
        isvExpandido: {
            investorType: e.investor_type ?? null,
            subStrategies: e.sub_strategies ?? null,
            languageRegister: e.language_register ?? null,
            experienceLevel: e.experience_level ?? null,
            liquidityNeed: e.liquidity_need ?? null,
            avoidedGeographies: e.avoided_geographies ?? null,
            confidenceScore: e.confidence_score ?? 0,
            urgencyScore: e.urgency_score ?? 0,
            stabilityScore: e.stability_score ?? 100,
            presupuestoMinimo: d.presupuesto_minimo ?? null,
        }
    };
}

// confidence_score < 60 → override perfil_completado to false (FRONT-ISV-EXP-03)
function applyConfidenceGuard(jsonOutput: any): any {
    const cs = jsonOutput?.extraccion_datos?.isv_expandido?.confidence_score ?? 0;
    if (cs < 60 && jsonOutput?.extraccion_datos?.perfil_completado === true) {
        console.warn(`[Oracle] confidence_score=${cs} < 60 — bloqueando perfil_completado`);
        return {
            ...jsonOutput,
            extraccion_datos: { ...jsonOutput.extraccion_datos, perfil_completado: false }
        };
    }
    return jsonOutput;
}// ── ISV V6: mapeo del response de Gemini al store (ISV-V6-03) ──────
function mapGeminiToIsvV6(raw: any): import('@/store/useGeolandStore').IsvV6 | null {
    if (!raw) return null;
    return {
        investment_mode:    raw.investment_mode    ?? null,
        asset_class:        raw.asset_class        ?? null,
        sub_asset_class:    raw.sub_asset_class    ?? null,
        strategy_primary:   raw.strategy_primary   ?? null,
        strategy_secondary: raw.strategy_secondary ?? null,
        strategy_cluster:   Array.isArray(raw.strategy_cluster) ? raw.strategy_cluster : [],
        main_strategy:      raw.main_strategy      ?? null,
        target_return:      raw.target_return      ?? null,
        effort_level:       raw.effort_level       ?? null,
        budget: {
            amount_raw: raw.budget?.amount_raw ?? null,
            amount_min: raw.budget?.amount_min ?? null,
            amount_max: raw.budget?.amount_max ?? null,
            currency:   raw.budget?.currency   ?? null,
        },
        decision_tradeoff:    raw.decision_tradeoff    ?? null,
        time_horizon:         raw.time_horizon         ?? null,
        preferred_markets:    Array.isArray(raw.preferred_markets) ? raw.preferred_markets : [],
        preferred_submarkets: Array.isArray(raw.preferred_submarkets) ? raw.preferred_submarkets : [],
        market_mode:          raw.market_mode          ?? null,
        market_proxy:         raw.market_proxy         ?? null,
        use_potential:        Array.isArray(raw.use_potential) ? raw.use_potential : [],
        user_name:            raw.user_name            ?? null,
        confidence_score:     raw.confidence_score     ?? 0,
        stability_score:      raw.stability_score      ?? 0,
        isv_sufficient:       raw.isv_sufficient === true,
        confirmed_by_user:    raw.confirmed_by_user === true,
    };
}

// ── ISV V6: guardrail de suficiencia (ISV-V6-03) ───────────────────
function applyIsvV6SufficiencyGuard(jsonOutput: any): any {
    const v6 = jsonOutput?.isv_v6;
    if (!v6 || v6.isv_sufficient !== true) return jsonOutput;

    const b = v6.budget ?? {};
    const isPerformance = v6.investment_mode === 'performance_driven';

    const hasMarket = !!(v6.market_mode || v6.preferred_markets?.length > 0);
    // preferred_submarkets es deseable pero no bloqueante — el agente puede no haberla preguntado
    // si el usuario no mencionó zona y el agente cerró el ISV, se acepta como open_within_city

    const checks = [
        !!v6.investment_mode,
        !!v6.effort_level,
        !!(b.amount_max && b.currency),
        !!v6.decision_tradeoff,
        !!v6.time_horizon,
        hasMarket,
        isPerformance || (!!v6.asset_class && !!v6.strategy_primary),
        v6.confirmed_by_user === true,
    ];

    if (!checks.every(Boolean)) {
        const FIELD_LABELS: Record<string, string> = {
            'investment_mode':      'modo de inversión',
            'effort_level':         'nivel de involucramiento',
            'budget+currency':      'presupuesto y moneda',
            'decision_tradeoff':    'tolerancia al riesgo',
            'time_horizon':         'horizonte de inversión',
            'market':               'mercado o ciudad',
            'asset_class+strategy': 'tipo de activo y estrategia',
            'confirmed_by_user':    'confirmación del resumen',
        };
        const fieldKeys = [
            'investment_mode','effort_level','budget+currency','decision_tradeoff',
            'time_horizon','market','asset_class+strategy','confirmed_by_user'
        ];
        const missing = fieldKeys.filter((_,i) => !checks[i]);
        const missingLabels = missing.map(k => FIELD_LABELS[k] ?? k).join(', ');
        
        console.warn('[ISV-V6] isv_sufficient bloqueado — faltan:', missing);
        
        // Inyectar en dialogo_ui para que el LLM retome con contexto
        const feedbackMsg = `[GUARDRAIL] Perfil incompleto. Aún falta capturar: ${missingLabels}. Por favor continuá la conversación para completar estos campos.`;
        
        return {
            ...jsonOutput,
            dialogo_ui: feedbackMsg,
            isv_v6: { ...v6, isv_sufficient: false }
        };
    }
    return jsonOutput;
}

// Fire-and-forget analytics helper — never throws (FRONT-ISV-EXP-03)
async function trackEvent(event: string, props: Record<string, any> = {}) {
    try {
        console.log(`[Analytics] ${event}`, props);
    } catch {
        // silencioso — la conversación nunca se interrumpe por analytics
    }
}


// ── ISV FLOW: detecta qué campo falta resolver ────────────────────
// Función pura. Sin clases. Sin módulos. Lee el ISV y devuelve el primer campo pendiente.
function getFirstMissingField(isv: Record<string, any>): string | null {
    const mode = isv?.investment_mode;
    const isPerformance = mode === 'performance_driven';

    if (!mode) return 'investment_mode';

    if (!isPerformance) {
        if (!isv?.asset_class) return 'asset_class';
        if (isv.asset_class === 'real_estate' && !isv?.sub_asset_class) return 'sub_asset_class';
        if (!isv?.strategy_primary) return 'strategy_primary';
    }

    if (!isv?.effort_level) return 'effort_level';

    const hasAmount = isv?.budget?.amount_max || isv?.budget?.amount_raw;
    if (!hasAmount) return 'budget_amount';
    if (!isv?.budget?.currency) return 'budget_currency';

    if (!isv?.decision_tradeoff) return 'decision_tradeoff';
    if (!isv?.time_horizon) return 'time_horizon';

    const hasMarket = isv?.market_mode || (Array.isArray(isv?.preferred_markets) && isv.preferred_markets.length > 0);
    if (!hasMarket) return 'market';

    if (!isv?.confirmed_by_user) return 'confirmation';

    return null; // todo resuelto
}

/**
 * Merge seguro del ISV: solo sobreescribe un campo del prevIsv si el nuevo valor
 * es no-null, no-undefined, y no-array-vacío.
 * Los arrays se preservan del prev si el nuevo viene vacío.
 * El objeto budget tiene merge especial: campo por campo, solo si el nuevo valor no es null.
 */
function mergeIsvSafe(prev: Record<string, any>, next: Record<string, any>): Record<string, any> {
    const result = { ...prev };
    
    for (const key of Object.keys(next)) {
        const newVal = next[key];
        const prevVal = prev[key];
        
        // Arrays: preservar el prev si el nuevo viene vacío
        if (Array.isArray(newVal)) {
            if (newVal.length > 0) {
                result[key] = newVal;
            }
            // Si newVal es [] y prevVal tenía datos, se preserva prevVal (no hacer nada)
            continue;
        }
        
        // Objetos (ej: budget): merge recursivo campo por campo
        if (newVal && typeof newVal === 'object' && !Array.isArray(newVal)) {
            result[key] = mergeIsvSafe(prevVal ?? {}, newVal);
            continue;
        }
        
        // Primitivos: solo sobreescribir si el nuevo valor no es null/undefined
        if (newVal !== null && newVal !== undefined) {
            result[key] = newVal;
        }
        // Si newVal es null/undefined, se preserva prevVal
    }
    
    return result;
}


export async function POST(req: NextRequest) {
    // Rate limiting — FIX-FRONT-P1-02
    const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? 'anonymous'
    const { allowed, remaining } = checkRateLimit(`chat:${ip}`, 20)
    if (!allowed) {
        return NextResponse.json(
            { error: 'Demasiadas solicitudes. Por favor espera un momento.' },
            { status: 429, headers: { 'X-RateLimit-Remaining': '0' } }
        )
    }

    try {
        const { history, message, perfilCompletado, currentState } = await req.json();

        // Track conversation start
        if (!history || history.length === 0) {
            trackEvent('isv_started');
        }

        if (!process.env.OPENAI_API_KEY) {
            console.error('CRITICAL: OPENAI_API_KEY environment variable is missing.');
            return NextResponse.json(
                { error: 'System architecture error: Missing intelligence layer connection.' },
                { status: 500 }
            );
        }

        const systemPrompt = perfilCompletado
            ? REFINAMIENTO_SYSTEM_PROMPT
            : ONBOARDING_SYSTEM_PROMPT;

        const conversationHistory = history.slice(-10).map((h: any) => `${h.role}: ${h.content}`).join('\n'); // limitar a últimos 10 turnos

        if (!perfilCompletado) {
            const currentIsv = currentState ?? {};
            const isvActual = JSON.stringify(currentIsv, null, 2);

            console.log('[ISV] currentIsv keys:', Object.keys(currentIsv).filter(k => (currentIsv as any)[k]));

            const response = await openai.chat.completions.create({
                model: 'gpt-4o',
                messages: [
                    { role: 'system', content: systemPrompt },
                    {
                        role: 'user',
                        content: `HISTORIAL:\n${conversationHistory}\n\nMENSAJE DEL USUARIO: ${message}\n\nESTADO ACTUAL DEL ISV (No borres campos ya resueltos):\n${isvActual}\n\nResponde SOLO con el JSON indicado.`
                    }
                ],
                temperature: 0.2,
                max_completion_tokens: 1500,
                response_format: { type: 'json_object' },
            });

            const rawText = response.choices[0]?.message?.content;
            if (!rawText) throw new Error('Empty response from OpenAI');

            const cleanText = cleanJsonMarkdown(rawText);
            let jsonOutput: any;
            try {
                jsonOutput = JSON.parse(cleanText);
            } catch {
                console.error('[ISV] JSON parse error. Raw:', rawText);
                throw new Error('Invalid JSON from LLM');
            }

            jsonOutput = applyIsvV6SufficiencyGuard(jsonOutput);
            
            // Merge seguro: no sobreescribe campos ya resueltos con null
            const prevIsv = currentState ?? {};
            if (jsonOutput.isv_v6) {
                jsonOutput.isv_v6 = mergeIsvSafe(prevIsv, jsonOutput.isv_v6);
            }

            const isvV6Mapeado = mapGeminiToIsvV6(jsonOutput.isv_v6);
            const isvSufficient = isvV6Mapeado?.isv_sufficient && isvV6Mapeado?.confirmed_by_user;

            if (isvSufficient) trackEvent('isv_v6_complete');

            return NextResponse.json({
                dialogo_ui: jsonOutput.dialogo_ui,
                current_state: jsonOutput.current_state ?? currentState ?? 'INIT',
                isvV6_mapeado: isvV6Mapeado,
                perfil_completado: isvSufficient,
                contradiccion_detectada: false,
                extraccion_mapeada: null,
                iterando_resultados: false,
            });
        } else {
            // Refinamiento flow (legacy v3 path)
            const response = await openai.chat.completions.create({
                model: 'gpt-5.2',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: `CONVERSATION HISTORY:\n${history.map((h: any) => `${h.role}: ${h.content}`).join('\n')}\n\nUSER MESSAGE: ${message}\n\nYou must respond ONLY with the valid JSON object described in the instructions.` }
                ],
                temperature: 0.3,
                max_completion_tokens: 1500,
                response_format: { type: 'json_object' }
            });
            const rawText = response.choices[0]?.message?.content ?? '';
            
            if (!rawText) throw new Error('Empty response from OpenAI');

            const cleanText = cleanJsonMarkdown(rawText);
            let jsonOutput: any;
            try {
                jsonOutput = JSON.parse(cleanText);
            } catch (parseError) {
                console.error('JSON Parse Error. Raw text was:', rawText);
                throw new Error('Invalid JSON format in AI response');
            }

            jsonOutput = applyConfidenceGuard(jsonOutput);
            const mapped = jsonOutput.extraccion_datos
                ? mapGeminiToStore(jsonOutput.extraccion_datos)
                : null;
            
            const extDatos = jsonOutput.extraccion_datos;
            if (extDatos?.iterando_resultados) trackEvent('isv_reprofiled');
            if (extDatos?.contradiccion_detectada) trackEvent('isv_clarification_requested');

            return NextResponse.json({
                dialogo_ui: jsonOutput.dialogo_ui,
                current_state: jsonOutput.current_state ?? currentState ?? 'INIT',
                isvV6_mapeado: null,
                perfil_completado: extDatos?.perfil_completado ?? false,
                // legacy fields
                contradiccion_detectada: extDatos?.contradiccion_detectada ?? false,
                extraccion_mapeada: mapped,
                iterando_resultados: extDatos?.iterando_resultados ?? false,
            });
        }
    } catch (error: any) {
        console.error('LLM API Error:', JSON.stringify(error?.errorDetails || error?.message || error));
        return NextResponse.json(
            { error: error?.message || 'Failed to process AI response' },
            { status: 500 }
        );
    }
}
