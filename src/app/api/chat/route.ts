import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { ONBOARDING_SYSTEM_PROMPT, REFINAMIENTO_SYSTEM_PROMPT } from '@/lib/ai/prompts';

// Force v1 endpoint (not v1beta) which is required for newer accounts
const genAI = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || 'dummy_key',
    httpOptions: { apiVersion: 'v1' }
});

function cleanJsonMarkdown(text: string): string {
    let cleaned = text.trim();
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
}

// ── ISV V4: mapeo del response de Gemini al store (ISV-V4-03) ──────
function mapGeminiToIsvV4(isvV4Raw: any): any {
    if (!isvV4Raw) return null;
    return {
        strategy_intent: isvV4Raw.strategy_intent ?? null,
        strategy_cluster: Array.isArray(isvV4Raw.strategy_cluster) ? isvV4Raw.strategy_cluster : [],
        final_strategy: isvV4Raw.final_strategy ?? null,
        effort_level: isvV4Raw.effort_level ?? null,
        budget_range: isvV4Raw.budget_range ?? null,
        decision_tradeoff: isvV4Raw.decision_tradeoff ?? null,
        time_horizon: isvV4Raw.time_horizon ?? null,
        confidence_by_field: {
            strategy_intent: isvV4Raw.confidence_by_field?.strategy_intent ?? null,
            strategy_cluster: isvV4Raw.confidence_by_field?.strategy_cluster ?? null,
            final_strategy: isvV4Raw.confidence_by_field?.final_strategy ?? null,
            effort_level: isvV4Raw.confidence_by_field?.effort_level ?? null,
            budget_range: isvV4Raw.confidence_by_field?.budget_range ?? null,
            decision_tradeoff: isvV4Raw.confidence_by_field?.decision_tradeoff ?? null,
            time_horizon: isvV4Raw.confidence_by_field?.time_horizon ?? null,
        },
        isv_sufficient: isvV4Raw.isv_sufficient === true,
    };
}

// ── ISV V4: guardrail de suficiencia (ISV-V4-03) ────────────────────
// Bloquea isv_sufficient si faltan campos críticos con confianza media/alta
function applyIsvV4SufficiencyGuard(jsonOutput: any): any {
    const v4 = jsonOutput?.isv_v4;
    if (!v4 || v4.isv_sufficient !== true) return jsonOutput;

    const cf = v4.confidence_by_field ?? {};
    const acceptable = (level: string | null) => level === 'high' || level === 'medium';

    const clusterOk = acceptable(cf.strategy_cluster);
    const effortOk  = acceptable(cf.effort_level);
    const budgetOk  = acceptable(cf.budget_range);
    const hasOneOf  = acceptable(cf.decision_tradeoff) || acceptable(cf.time_horizon);

    if (!clusterOk || !effortOk || !budgetOk || !hasOneOf) {
        console.warn('[ISV-V4] isv_sufficient bloqueado — faltan campos críticos con confianza suficiente', {
            clusterOk, effortOk, budgetOk, hasOneOf
        });
        return {
            ...jsonOutput,
            isv_v4: { ...v4, isv_sufficient: false }
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


export async function POST(req: NextRequest) {
    try {
        const { history, message, perfilCompletado, currentState } = await req.json();

        // Track conversation start
        if (!history || history.length === 0) {
            trackEvent('isv_started');
        }

        if (!process.env.GEMINI_API_KEY) {
            console.error('CRITICAL: GEMINI_API_KEY environment variable is missing.');
            return NextResponse.json(
                { error: 'System architecture error: Missing intelligence layer connection.' },
                { status: 500 }
            );
        }

        const systemPrompt = perfilCompletado
            ? REFINAMIENTO_SYSTEM_PROMPT
            : ONBOARDING_SYSTEM_PROMPT;

        const conversationHistory = history.map((h: any) => `${h.role}: ${h.content}`).join('\n');
        const fullPrompt = `
${systemPrompt}

CONVERSATION HISTORY:
${conversationHistory}

USER MESSAGE: ${message}

You must respond ONLY with the valid JSON object described in the instructions.
`;

        const response = await genAI.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: fullPrompt,
        });

        const rawText = response.text;

        if (!rawText) {
            throw new Error('Empty response from Gemini');
        }

        const cleanText = cleanJsonMarkdown(rawText);
        let jsonOutput;
        try {
            jsonOutput = JSON.parse(cleanText);
        } catch (parseError) {
            console.error('JSON Parse Error. Raw text was:', rawText);
            throw new Error('Invalid JSON format in AI response');
        }

        // Apply legacy confidence guard for v3 (Refinamiento flow)
        if (!perfilCompletado) {
            // Apply ISV v4 guard and mapping
            jsonOutput = applyIsvV4SufficiencyGuard(jsonOutput);
        } else {
            // Legacy v3 path
            jsonOutput = applyConfidenceGuard(jsonOutput);
        }

        const isvV4Mapeado = mapGeminiToIsvV4(jsonOutput.isv_v4);
        const isvSufficient = jsonOutput.isv_v4?.isv_sufficient ?? false;

        const mapped = jsonOutput.extraccion_datos
            ? mapGeminiToStore(jsonOutput.extraccion_datos)
            : null;

        // Analytics events (fire-and-forget)
        if (isvSufficient) trackEvent('isv_v4_sufficient');
        if (jsonOutput.isv_v4?.strategy_cluster?.length > 0) trackEvent('isv_v4_cluster_defined');

        const newState = jsonOutput.extraccion_datos?.current_state;
        const extDatos = jsonOutput.extraccion_datos;
        if (newState === 'CONFIRMATION') trackEvent('isv_profile_confirmed');
        if (extDatos?.iterando_resultados) trackEvent('isv_reprofiled');
        if (extDatos?.contradiccion_detectada) trackEvent('isv_clarification_requested');

        return NextResponse.json({
            dialogo_ui: jsonOutput.dialogo_ui,
            isvV4_mapeado: isvV4Mapeado,
            perfil_completado: perfilCompletado ? (extDatos?.perfil_completado ?? false) : isvSufficient,
            // legacy fields — mantener para REFINAMIENTO_SYSTEM_PROMPT que aún usa v3
            current_state: newState ?? currentState ?? 'INIT',
            contradiccion_detectada: extDatos?.contradiccion_detectada ?? false,
            extraccion_mapeada: mapped,
            iterando_resultados: extDatos?.iterando_resultados ?? false,
        });

    } catch (error: any) {
        console.error('LLM API Error:', JSON.stringify(error?.errorDetails || error?.message || error));
        return NextResponse.json(
            { error: error?.message || 'Failed to process AI response' },
            { status: 500 }
        );
    }
}
