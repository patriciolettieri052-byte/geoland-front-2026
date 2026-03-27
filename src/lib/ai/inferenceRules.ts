// src/lib/ai/inferenceRules.ts
// Motor de inferencia con confianza
// Opera DESPUÉS del normalizer y ANTES del LLM
// No modifica el store — devuelve campos inferidos para que route.ts los procese

import type { NormalizerOutput } from './normalizer';

// ── TIPOS ─────────────────────────────────────────────────────────

export type ConfidenceLevel = 'strong' | 'medium' | 'weak';

export interface CandidateField {
    field: string;
    value: string;
    confidence: number;         // 0.0 - 1.0
    level: ConfidenceLevel;
    source: string;             // qué señal lo originó
}

export interface Conflict {
    type: 'contradiction' | 'incomplete' | 'dependency';
    fields: string[];
    description: string;
    action: 'ask_clarification' | 'auto_resolve' | 'block_sufficiency';
}

export interface InferenceInput {
    normalizedOutput: NormalizerOutput;
    currentIsvState: Record<string, any>;
    conversationTurn: number;
}

export interface InferenceOutput {
    resolvedFields: Record<string, any>;
    candidateFields: CandidateField[];
    conflicts: Conflict[];
    pendingFields: string[];
    nextAction: 'ask_question' | 'clarify_ambiguity' | 'resolve_conflict' | 'proceed';
    contextForLLM: string;
}

// ── DICCIONARIO DE SEÑALES → CAMPOS ISV ──────────────────────────
// Strong signal (confidence ≥ 0.8): mapeo directo
// Medium signal (0.5-0.8): candidato, no cierra el campo
// Weak signal (< 0.5): ignorar

interface SignalRule {
    patterns: string[];
    field: string;
    value: string;
    confidence: number;
    dependencies?: Record<string, string>; // campos que se deben setear también
}

const SIGNAL_RULES: SignalRule[] = [
    // ── INVESTMENT MODE ──────────────────────────────────────────
    { patterns: ['solo quiero el mejor retorno', 'me da igual el tipo de activo',
                 'solo me importa el rendimiento', 'family office', 'fondo institucional',
                 'quiero lo que mas rinda', 'rendimiento puro'],
      field: 'investment_mode', value: 'performance_driven', confidence: 0.9 },

    { patterns: ['quiero construir', 'quiero alquilar', 'quiero desarrollar',
                 'quiero reformar', 'quiero campo', 'quiero un piso',
                 'quiero un departamento', 'quiero un local'],
      field: 'investment_mode', value: 'intent_defined', confidence: 0.9 },

    { patterns: ['quiero algo concreto', 'tengo algo en mente', 'me interesa el inmobiliario'],
      field: 'investment_mode', value: 'intent_guided', confidence: 0.7 },

    // ── ASSET CLASS ──────────────────────────────────────────────
    { patterns: ['piso', 'departamento', 'apartamento', 'casa', 'chalet',
                 'local', 'oficina', 'edificio', 'construir', 'desarrollar',
                 'demoler', 'levantar', 'solar', 'terreno para edificar',
                 'reformar', 'rehabilitar'],
      field: 'asset_class', value: 'real_estate', confidence: 0.9 },

    { patterns: ['campo', 'tierra', 'finca', 'estancia', 'chacra',
                 'ganaderia', 'agricultura', 'cultivo', 'soja', 'maiz',
                 'vacas', 'ganado', 'hacienda', 'tambo'],
      field: 'asset_class', value: 'farmland', confidence: 0.9 },

    // ── SUB ASSET CLASS ──────────────────────────────────────────
    { patterns: ['piso', 'departamento', 'casa', 'chalet', 'residencial',
                 'para vivir', 'para familias', 'vivienda'],
      field: 'sub_asset_class', value: 'residential', confidence: 0.85 },

    { patterns: ['local', 'local comercial', 'oficina', 'nave', 'comercial',
                 'nnn', 'triple net', 'retail'],
      field: 'sub_asset_class', value: 'commercial', confidence: 0.85 },

    // ── STRATEGY PRIMARY ─────────────────────────────────────────
    { patterns: ['alquilar', 'alquiler', 'renta', 'buy and hold',
                 'comprar y mantener', 'flujo de caja', 'ingreso pasivo'],
      field: 'strategy_primary', value: 'rental_long_term', confidence: 0.85 },

    { patterns: ['airbnb', 'booking', 'alquiler turistico', 'alquiler vacacional',
                 'corta estancia', 'alquiler por dias', 'temporadas cortas'],
      field: 'strategy_primary', value: 'rental_short_term', confidence: 0.9 },

    { patterns: ['reformar y vender', 'comprar y vender', 'fix and flip',
                 'flipear', 'plusvalia rapida', 'entrar barato y salir',
                 'arreglarlo y vender', 'pintar y vender'],
      field: 'strategy_primary', value: 'fix_and_flip', confidence: 0.9 },

    { patterns: ['construir', 'desarrollar', 'obra nueva', 'levantar',
                 'levantar desde cero', 'demoler', 'solar', 'promocion inmobiliaria',
                 'soy constructor', 'soy promotor'],
      field: 'strategy_primary', value: 'development', confidence: 0.9,
      dependencies: { asset_class: 'real_estate' } },

    { patterns: ['ganaderia', 'vacas', 'ganado', 'bovino', 'ovino',
                 'soy ganadero', 'feed lot', 'tambo'],
      field: 'strategy_primary', value: 'livestock', confidence: 0.9,
      dependencies: { asset_class: 'farmland' } },

    { patterns: ['agricultura', 'cultivo', 'soja', 'maiz', 'trigo',
                 'sembrar', 'cosecha', 'campo agricola'],
      field: 'strategy_primary', value: 'agriculture', confidence: 0.9,
      dependencies: { asset_class: 'farmland' } },

    { patterns: ['campo mixto', 'agricola y ganadero', 'produccion mixta'],
      field: 'strategy_primary', value: 'mixed_farmland', confidence: 0.85,
      dependencies: { asset_class: 'farmland' } },

    // ── EFFORT LEVEL ─────────────────────────────────────────────
    { patterns: ['no quiero gestionar', 'que sea automatico', 'pasivo',
                 'que funcione solo', 'no tengo tiempo', 'manos fuera',
                 'gestion delegada', 'que alguien lo gestione'],
      field: 'effort_level', value: 'low', confidence: 0.9 },

    { patterns: ['seguirla de cerca', 'estar al tanto', 'algo de involucramiento',
                 'reporting', 'informes periodicos'],
      field: 'effort_level', value: 'medium', confidence: 0.8 },

    { patterns: ['me gusta gestionar', 'gestionar yo mismo', 'muy activo',
                 'soy constructor', 'soy promotor', 'hands on', 'mucho involucramiento'],
      field: 'effort_level', value: 'high', confidence: 0.9 },

    // ── DECISION TRADEOFF ────────────────────────────────────────
    { patterns: ['simple', 'sin complicaciones', 'predecible', 'seguro',
                 'sin riesgo', 'conservador', 'no puedo perder', 'sin sorpresas'],
      field: 'decision_tradeoff', value: 'conservative', confidence: 0.85 },

    { patterns: ['acepto complejidad', 'no me asusta', 'quiero upside',
                 'growth', 'agresivo', 'la consideraria', 'si gana mas acepto'],
      field: 'decision_tradeoff', value: 'growth_tolerant', confidence: 0.85 },

    { patterns: ['equilibrio', 'balance', 'moderado', 'depende del retorno'],
      field: 'decision_tradeoff', value: 'balanced', confidence: 0.75 },

    // ── TIME HORIZON ─────────────────────────────────────────────
    { patterns: ['corto plazo', '1-2 años', 'rapido', 'pronto',
                 'quiero liquidez', 'exit rapido'],
      field: 'time_horizon', value: 'short', confidence: 0.85 },

    { patterns: ['medio plazo', '3 a 5 años', 'algunos años'],
      field: 'time_horizon', value: 'medium', confidence: 0.85 },

    { patterns: ['largo plazo', 'para siempre', '10 años', 'para mis hijos',
                 'para la jubilacion', 'generacional', 'no necesito el dinero pronto',
                 'buy and hold'],
      field: 'time_horizon', value: 'long', confidence: 0.85 },
];

// ── CAMPOS CRÍTICOS PARA SUFICIENCIA ─────────────────────────────
const CRITICAL_FIELDS = [
    'investment_mode',
    'effort_level',
    'budget_amount',
    'budget_currency',
    'decision_tradeoff',
    'time_horizon',
    'market_mode',
];

// ── DETECTORES DE CONTRADICCIÓN ──────────────────────────────────
interface ConflictRule {
    condition: (isv: Record<string, any>, text: string) => boolean;
    conflict: Conflict;
}

const CONFLICT_RULES: ConflictRule[] = [
    {
        condition: (isv, text) =>
            (text.includes('sin riesgo') || text.includes('cero riesgo')) &&
            (text.includes('maximo retorno') || text.includes('mejor retorno') || text.includes('alto retorno')),
        conflict: {
            type: 'contradiction',
            fields: ['decision_tradeoff'],
            description: 'El usuario quiere máximo retorno con cero riesgo — estos objetivos son mutuamente excluyentes.',
            action: 'ask_clarification',
        }
    },
    {
        condition: (isv, text) =>
            (text.includes('corto plazo') || isv.time_horizon === 'short') &&
            (text.includes('mantener siempre') || text.includes('para siempre') || text.includes('generacional')),
        conflict: {
            type: 'contradiction',
            fields: ['time_horizon'],
            description: 'El usuario menciona corto plazo pero también quiere mantener la inversión indefinidamente.',
            action: 'ask_clarification',
        }
    },
    {
        condition: (isv, text) =>
            isv.asset_class === 'farmland' &&
            (text.includes('construir') || text.includes('edificar') || text.includes('levantar')),
        conflict: {
            type: 'dependency',
            fields: ['asset_class', 'strategy_primary'],
            description: 'El usuario eligió farmland pero menciona construcción. Development siempre es real_estate.',
            action: 'auto_resolve',
        }
    },
];

// ── FUNCIÓN PRINCIPAL ─────────────────────────────────────────────
export function runInference(input: InferenceInput): InferenceOutput {
    const { normalizedOutput, currentIsvState } = input;
    const text = normalizedOutput.normalizedText;
    const tokens = normalizedOutput.tokens;

    const resolvedFields: Record<string, any> = {};
    const candidateFields: CandidateField[] = [];
    const conflicts: Conflict[] = [];

    // 1. Aplicar reglas de señales
    for (const rule of SIGNAL_RULES) {
        const matched = rule.patterns.some(pattern =>
            text.includes(pattern) || tokens.some(t => t.includes(pattern))
        );

        if (!matched) continue;

        if (rule.confidence >= 0.8) {
            resolvedFields[rule.field] = rule.value;
            // Resolver dependencias
            if (rule.dependencies) {
                for (const [depField, depValue] of Object.entries(rule.dependencies)) {
                    if (!currentIsvState[depField] && !resolvedFields[depField]) {
                        resolvedFields[depField] = depValue;
                    }
                }
            }
        } else if (rule.confidence >= 0.5) {
            candidateFields.push({
                field: rule.field,
                value: rule.value,
                confidence: rule.confidence,
                level: rule.confidence >= 0.7 ? 'medium' : 'weak',
                source: rule.patterns.find(p => text.includes(p)) || 'pattern_match',
            });
        }
    }

    // 2. Inferencia geográfica desde el normalizer
    if (normalizedOutput.meta.citiesInferred.length > 0 && !currentIsvState.preferred_markets?.length) {
        const city = normalizedOutput.meta.citiesInferred[0];
        const supportedCities = ['madrid', 'miami', 'buenos aires', 'dubai'];
        if (supportedCities.includes(city.toLowerCase())) {
            const formatted = city.split(' ').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
            resolvedFields['preferred_markets'] = [formatted];
            resolvedFields['market_mode'] = 'fixed';
        }
    }

    // 3. Inferencia de presupuesto desde el normalizer
    if (normalizedOutput.meta.amountDetected && !currentIsvState.budget?.amount_max) {
        resolvedFields['budget_amount'] = normalizedOutput.meta.amountDetected;
    }
    if (normalizedOutput.meta.currencyDetected && !currentIsvState.budget?.currency) {
        resolvedFields['budget_currency'] = normalizedOutput.meta.currencyValue;
    }

    // 4. Detectar conflictos
    const mergedState = { ...currentIsvState, ...resolvedFields };
    for (const rule of CONFLICT_RULES) {
        if (rule.condition(mergedState, text)) {
            conflicts.push(rule.conflict);
            // Auto-resolver dependencias incorrectas
            if (rule.conflict.action === 'auto_resolve' &&
                rule.conflict.fields.includes('asset_class') &&
                text.includes('construir')) {
                resolvedFields['asset_class'] = 'real_estate';
                resolvedFields['strategy_primary'] = 'development';
            }
        }
    }

    // 5. Calcular campos pendientes
    const pendingFields = CRITICAL_FIELDS.filter(field => {
        if (field === 'budget_amount') return !mergedState.budget?.amount_max && !resolvedFields['budget_amount'];
        if (field === 'budget_currency') return !mergedState.budget?.currency && !resolvedFields['budget_currency'];
        if (field === 'market_mode') return !mergedState.market_mode && !resolvedFields['market_mode'];
        return !mergedState[field] && !resolvedFields[field];
    });

    // 6. Decidir next_action
    let nextAction: InferenceOutput['nextAction'] = 'proceed';
    if (conflicts.some(c => c.action === 'ask_clarification')) {
        nextAction = 'resolve_conflict';
    } else if (pendingFields.length > 0) {
        nextAction = 'ask_question';
    } else if (candidateFields.some(c => c.confidence < 0.7)) {
        nextAction = 'clarify_ambiguity';
    }

    // 7. Construir contexto para el LLM
    const contextParts: string[] = [];

    if (Object.keys(resolvedFields).length > 0) {
        contextParts.push(`CAMPOS YA RESUELTOS (no preguntar de nuevo):\n${JSON.stringify(resolvedFields, null, 2)}`);
    }

    if (pendingFields.length > 0) {
        contextParts.push(`CAMPOS PENDIENTES (preguntar en orden de prioridad):\n${pendingFields.join(', ')}`);
    }

    if (conflicts.length > 0) {
        contextParts.push(`CONFLICTOS DETECTADOS:\n${conflicts.map(c => `- ${c.description} (acción: ${c.action})`).join('\n')}`);
    }

    if (normalizedOutput.meta.citiesInferred.length > 0) {
        contextParts.push(`CIUDAD INFERIDA desde barrio mencionado: ${normalizedOutput.meta.citiesInferred.join(', ')}`);
    }

    if (normalizedOutput.meta.amountDetected) {
        const currency = normalizedOutput.meta.currencyValue || '(moneda no especificada - PREGUNTAR)';
        contextParts.push(`MONTO DETECTADO: ${normalizedOutput.meta.amountDetected.toLocaleString()} ${currency}`);
    }

    const contextForLLM = contextParts.length > 0
        ? `\n\n--- CONTEXTO DEL MOTOR DE INFERENCIA ---\n${contextParts.join('\n\n')}\n--- FIN CONTEXTO ---\n\n`
        : '';

    return {
        resolvedFields,
        candidateFields,
        conflicts,
        pendingFields,
        nextAction,
        contextForLLM,
    };
}
