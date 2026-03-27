// src/lib/ai/flowController.ts
// Decide QUÉ preguntar basándose en el estado del ISV.
// El LLM no decide el flujo — solo genera el texto de la pregunta indicada.

export type FlowQuestion =
    | 'P0_APERTURA'
    | 'P1_MODO'
    | 'P2_ASSET_CLASS'
    | 'P3A_TIPO_PROPIEDAD'
    | 'P3B_USO_FARMLAND'
    | 'P4A_ACCION_PROPIEDAD'
    | 'P5_INVOLUCRAMIENTO'
    | 'P6_PRESUPUESTO'
    | 'P6B_MONEDA'
    | 'P7_TRADEOFF'
    | 'P8_HORIZONTE'
    | 'P9_CIUDAD'
    | 'P10_SUMMARY'
    | 'DONE';

export interface FlowResult {
    nextQuestion: FlowQuestion;
    questionText: string;       // Texto exacto del spec v6 — primera vez
    retryText: string;          // Reformulación corta — si el usuario fue ambiguo
    missingFields: string[];    // Campos que aún faltan
    resolvedFields: string[];   // Campos ya resueltos
}

// Texto exacto de cada pregunta — fiel al spec v6
const QUESTION_TEXT: Record<FlowQuestion, string> = {
    P0_APERTURA: `Hola.\n\nVoy a ayudarte a encontrar oportunidades de inversión.\n\nPara empezar, puedes contarme en una frase qué estás buscando o qué te gustaría hacer con tu inversión.`,

    P1_MODO: `¿Tus objetivos son únicamente financieros y de rendimiento, o estás interesado en algún activo o estrategia en particular para alcanzarlos?`,

    P2_ASSET_CLASS: `Para orientarme mejor, ¿te interesa invertir en:\n\n– propiedades\n– tierras para uso agrícola o ganadero`,

    P3A_TIPO_PROPIEDAD: `¿Te interesa más invertir en:\n\n– propiedades residenciales\n– propiedades comerciales\n– o ambas?`,

    P3B_USO_FARMLAND: `En ese caso, ¿qué te interesa más?\n\n– agrícola (cultivo)\n– ganadero\n– una combinación de ambos`,

    P4A_ACCION_PROPIEDAD: `Pensando en esta inversión, ¿qué te gustaría hacer principalmente con la propiedad?\n\n– alquilarla durante un período corto\n– alquilarla y mantenerla en el tiempo\n– mejorarla y venderla\n– construir (o desarrollar una propiedad)`,

    P5_INVOLUCRAMIENTO: `¿Cuánto quieres involucrarte en la inversión?\n\n– nada (solo invertir)\n– algo (seguirla de cerca)\n– mucho (gestionarla activamente)`,

    P6_PRESUPUESTO: `¿De qué presupuesto estamos hablando aproximadamente?`,

    P6B_MONEDA: `¿Ese presupuesto sería en euros, dólares u otra moneda?`,

    P7_TRADEOFF: `Si una inversión puede darte más rentabilidad pero implica más complejidad, ¿la considerarías o prefieres algo más simple y predecible?`,

    P8_HORIZONTE: `¿En cuánto tiempo te gustaría ver resultados?\n\n– corto plazo\n– medio plazo\n– largo plazo`,

    P9_CIUDAD: `¿Tienes alguna ciudad en mente o prefieres que exploremos distintas opciones por ti?`,

    P10_SUMMARY: `[GENERAR_SUMMARY]`, // El LLM genera el resumen con los datos del ISV

    DONE: `[DONE]`,
};
// Reformulaciones cortas — usar cuando el usuario fue ambiguo y el campo no se resolvió
const RETRY_TEXT: Record<FlowQuestion, string> = {
    P0_APERTURA: `No hay problema. ¿Puedes contarme qué tipo de inversión te interesa explorar?`,
    P1_MODO: `Para orientarte mejor: ¿buscas que GEOLAND te recomiende lo que mejor rinde, o ya tienes en mente un tipo de activo o estrategia concreta?`,
    P2_ASSET_CLASS: `¿Estás pensando en algo urbano como un piso o local, o más bien en tierras para producción agrícola o ganadera?`,
    P3A_TIPO_PROPIEDAD: `¿Te suena más una propiedad para vivir (residencial), un local o espacio de negocio (comercial), o te da igual?`,
    P3B_USO_FARMLAND: `¿Lo que buscas es más orientado a cultivos, a ganadería, o una combinación de las dos?`,
    P4A_ACCION_PROPIEDAD: `¿Te suena más comprarla para alquilar, comprarla para mejorarla y vender, o construir algo desde cero?`,
    P5_INVOLUCRAMIENTO: `¿Prefieres que funcione sola sin que tengas que hacer nada, o quieres estar al tanto o gestionarla tú directamente?`,
    P6_PRESUPUESTO: `¿Tienes un número aproximado en mente? No tiene que ser exacto — un rango ya me ayuda.`,
    P6B_MONEDA: `¿Ese monto sería en dólares, euros, o en otra moneda?`,
    P7_TRADEOFF: `Si pudieras ganar más pero con más complejidad, ¿lo considerarías? ¿O prefieres algo predecible aunque rinda un poco menos?`,
    P8_HORIZONTE: `¿Estás pensando en algo a corto plazo (1-2 años), medio plazo (3-5 años), o largo plazo (más de 5 años)?`,
    P9_CIUDAD: `¿Tienes alguna ciudad en mente — Madrid, Miami, Buenos Aires o Dubái — o te interesa que exploremos todas?`,
    P10_SUMMARY: `[GENERAR_SUMMARY]`,
    DONE: `[DONE]`,
};

function isResolved(value: any): boolean {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string' && value.trim() === '') return false;
    if (Array.isArray(value) && value.length === 0) return false;
    return true;
}

function budgetAmountResolved(budget: any): boolean {
    return isResolved(budget?.amount_max) || isResolved(budget?.amount_raw);
}

function budgetCurrencyResolved(budget: any): boolean {
    return isResolved(budget?.currency);
}

/**
 * Dado el estado actual del ISV, devuelve qué pregunta hacer a continuación.
 * Esta función es la única fuente de verdad del flujo — el LLM no decide esto.
 */
export function getNextQuestion(isv: Record<string, any>): FlowResult {
    const resolved: string[] = [];
    const missing: string[] = [];

    const mode = isv.investment_mode;
    const isPerformance = mode === 'performance_driven';

    // ── PASO 1: investment_mode ───────────────────────────────────
    if (!isResolved(mode)) {
        missing.push('investment_mode');
        return result('P1_MODO', missing, resolved);
    }
    resolved.push('investment_mode');

    // ── PASO 2: asset_class (saltar si performance_driven) ────────
    if (!isPerformance) {
        if (!isResolved(isv.asset_class)) {
            missing.push('asset_class');
            return result('P2_ASSET_CLASS', missing, resolved);
        }
        resolved.push('asset_class');

        // ── PASO 3A: sub_asset_class (solo real_estate) ──────────
        if (isv.asset_class === 'real_estate') {
            if (!isResolved(isv.sub_asset_class)) {
                missing.push('sub_asset_class');
                return result('P3A_TIPO_PROPIEDAD', missing, resolved);
            }
            resolved.push('sub_asset_class');

            // ── PASO 4A: strategy_primary (solo real_estate) ─────
            if (!isResolved(isv.strategy_primary)) {
                missing.push('strategy_primary');
                return result('P4A_ACCION_PROPIEDAD', missing, resolved);
            }
            resolved.push('strategy_primary');
        }

        // ── PASO 3B: strategy_primary (solo farmland) ────────────
        if (isv.asset_class === 'farmland') {
            if (!isResolved(isv.strategy_primary)) {
                missing.push('strategy_primary');
                return result('P3B_USO_FARMLAND', missing, resolved);
            }
            resolved.push('strategy_primary');
        }
    } else {
        resolved.push('asset_class', 'sub_asset_class', 'strategy_primary'); // skipped
    }

    // ── PASO 5: effort_level ─────────────────────────────────────
    if (!isResolved(isv.effort_level)) {
        missing.push('effort_level');
        return result('P5_INVOLUCRAMIENTO', missing, resolved);
    }
    resolved.push('effort_level');

    // ── PASO 6: presupuesto ──────────────────────────────────────
    if (!budgetAmountResolved(isv.budget)) {
        missing.push('budget_amount');
        return result('P6_PRESUPUESTO', missing, resolved);
    }
    resolved.push('budget_amount');

    // ── PASO 6B: moneda (siempre obligatoria) ────────────────────
    if (!budgetCurrencyResolved(isv.budget)) {
        missing.push('budget_currency');
        return result('P6B_MONEDA', missing, resolved);
    }
    resolved.push('budget_currency');

    // ── PASO 7: decision_tradeoff ────────────────────────────────
    if (!isResolved(isv.decision_tradeoff)) {
        missing.push('decision_tradeoff');
        return result('P7_TRADEOFF', missing, resolved);
    }
    resolved.push('decision_tradeoff');

    // ── PASO 8: time_horizon ─────────────────────────────────────
    if (!isResolved(isv.time_horizon)) {
        missing.push('time_horizon');
        return result('P8_HORIZONTE', missing, resolved);
    }
    resolved.push('time_horizon');

    // ── PASO 9: mercado ──────────────────────────────────────────
    const marketResolved = isResolved(isv.market_mode) ||
        (Array.isArray(isv.preferred_markets) && isv.preferred_markets.length > 0);
    if (!marketResolved) {
        missing.push('market');
        return result('P9_CIUDAD', missing, resolved);
    }
    resolved.push('market');

    // ── PASO 10: summary + confirmación ──────────────────────────
    if (!isv.confirmed_by_user) {
        return result('P10_SUMMARY', missing, resolved);
    }

    return result('DONE', [], resolved);
}

function result(q: FlowQuestion, missing: string[], resolved: string[]): FlowResult {
    return {
        nextQuestion: q,
        questionText: QUESTION_TEXT[q],
        retryText: RETRY_TEXT[q],
        missingFields: missing,
        resolvedFields: resolved,
    };
}
