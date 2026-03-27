// src/lib/ai/normalizer.ts
// Pipeline de normalización de input del usuario
// Opera ANTES del LLM. No infiere campos ISV. Solo prepara el texto.

export interface NormalizerInput {
    rawText: string;
    conversationHistory?: string[];
}

export interface NormalizerOutput {
    rawInput: string;
    normalizedText: string;
    tokens: string[];
    meta: {
        currencyDetected: boolean;
        currencyValue?: string;
        locationsDetected: string[];
        citiesInferred: string[];
        amountDetected?: number;
        typosFixed: string[];
    };
}

// ── [1] LIMPIEZA BÁSICA ───────────────────────────────────────────
function basicClean(text: string): string {
    return text
        .toLowerCase()
        .replace(/[!¡?¿]+/g, ' ')          // eliminar exclamaciones/interrogaciones
        .replace(/\.{2,}/g, '.')            // múltiples puntos → uno
        .replace(/\s+/g, ' ')               // múltiples espacios → uno
        .trim();
}

// ── [2] NORMALIZACIÓN LÉXICA (typos + abreviaciones) ─────────────
const LEXICAL_MAP: Record<string, string> = {
    // Abreviaciones financieras
    'u$d': 'usd', 'u$s': 'usd', 'usd$': 'usd', 'us$': 'usd',
    'u.s.d': 'usd', 'dolares': 'dolares', 'dólares': 'dolares',
    'euros': 'euros', 'eur': 'euros',
    'aed': 'aed', 'dirhams': 'aed',
    'ars': 'ars', 'pesos': 'pesos argentinos',

    // Abreviaciones inmobiliarias
    'depto': 'departamento', 'dpto': 'departamento', 'dto': 'departamento',
    'alq': 'alquilar', 'alq.': 'alquilar',
    'prop': 'propiedad', 'props': 'propiedades',
    'inv': 'inversion', 'invs': 'inversiones',
    'hab': 'habitacion', 'habs': 'habitaciones',
    'bano': 'baño', 'banos': 'baños',
    'coch': 'cochera', 'gar': 'garage',
    'ph': 'penthouse',
    'mono': 'monoambiente',

    // Typos comunes
    'quieroo': 'quiero', 'quierp': 'quiero',
    'alquilaar': 'alquilar', 'alqilar': 'alquilar',
    'inversoin': 'inversion', 'invesion': 'inversion',
    'madird': 'madrid', 'madid': 'madrid',
    'maiami': 'miami', 'miamy': 'miami',
    'dubay': 'dubai', 'dubái': 'dubai',
    'baires': 'buenos aires', 'bsas': 'buenos aires', 'caba': 'buenos aires',
};

function lexicalNormalize(text: string): { text: string; fixed: string[] } {
    const fixed: string[] = [];
    let result = text;

    for (const [abbr, canonical] of Object.entries(LEXICAL_MAP)) {
        const regex = new RegExp(`\\b${abbr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
        if (regex.test(result)) {
            result = result.replace(regex, canonical);
            fixed.push(`${abbr} → ${canonical}`);
        }
    }

    return { text: result, fixed };
}

// ── [3] EXPANSIÓN DE SINÓNIMOS REGIONALES ────────────────────────
const SYNONYM_MAP: Record<string, string[]> = {
    // Vivienda
    'departamento':  ['depto', 'dpto', 'apartamento', 'piso', 'flat', 'unidad'],
    'casa':          ['chalet', 'villa', 'residencia', 'vivienda', 'chalé'],
    'local':         ['local comercial', 'tienda', 'negocio', 'comercio'],

    // Acciones
    'alquilar':      ['rentar', 'arrendar', 'dar en alquiler', 'poner en alquiler'],
    'comprar':       ['adquirir', 'invertir en', 'hacerse de'],
    'construir':     ['levantar', 'edificar', 'desarrollar', 'hacer', 'erigir',
                      'levantar desde cero', 'hacer desde cero', 'poner en pie'],
    'demoler':       ['tirar abajo', 'derrumbar', 'derribar', 'tirar', 'demolición'],
    'reformar':      ['renovar', 'refaccionar', 'arreglar', 'rehabilitar',
                      'meter mano', 'darle una vuelta'],
    'vender':        ['revender', 'salir', 'rotar'],

    // Dinero (informal)
    'dinero':        ['plata', 'guita', 'lana', 'cash', 'capital', 'fondos'],
    'inversion':     ['inversión', 'inv', 'apuesta'],

    // Campo/tierras
    'campo':         ['tierra', 'tierras', 'finca', 'estancia', 'chacra',
                      'hacienda', 'predio', 'lote rural'],
    'agricultura':   ['cultivo', 'cultivos', 'sembrar', 'cosecha', 'agro',
                      'producción agrícola', 'campo agrícola'],
    'ganadería':     ['ganado', 'vacas', 'hacienda', 'bovino', 'ovino',
                      'feed lot', 'tambo', 'lechería'],

    // Estrategias
    'renta':         ['ingreso pasivo', 'flujo de caja', 'rentabilidad mensual',
                      'cobrar alquiler', 'ingreso mensual'],
    'pasivo':        ['sin gestionar', 'sin involucramiento', 'manos fuera',
                      'que funcione solo', 'que alguien lo gestione'],
};

// Mapa inverso: sinónimo → canónico
const INVERSE_SYNONYM_MAP: Map<string, string> = new Map();
for (const [canonical, synonyms] of Object.entries(SYNONYM_MAP)) {
    for (const synonym of synonyms) {
        INVERSE_SYNONYM_MAP.set(synonym.toLowerCase(), canonical);
    }
}

function expandSynonyms(text: string): string {
    // Ordenar por longitud descendente para evitar reemplazos parciales
    const entries = Array.from(INVERSE_SYNONYM_MAP.entries())
        .sort((a, b) => b[0].length - a[0].length);

    let result = text;
    for (const [synonym, canonical] of entries) {
        const regex = new RegExp(`\\b${synonym.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
        if (regex.test(result) && !result.includes(canonical)) {
            result = result.replace(regex, canonical);
        }
    }
    return result;
}

// ── [4] NORMALIZACIÓN GEOGRÁFICA ──────────────────────────────────
const NEIGHBORHOOD_TO_CITY: Record<string, string> = {
    // Buenos Aires
    'palermo': 'buenos aires', 'palermo soho': 'buenos aires',
    'palermo hollywood': 'buenos aires', 'recoleta': 'buenos aires',
    'belgrano': 'buenos aires', 'nunez': 'buenos aires',
    'colegiales': 'buenos aires', 'villa crespo': 'buenos aires',
    'almagro': 'buenos aires', 'caballito': 'buenos aires',
    'san telmo': 'buenos aires', 'puerto madero': 'buenos aires',
    'microcentro': 'buenos aires', 'flores': 'buenos aires',
    'villa urquiza': 'buenos aires', 'devoto': 'buenos aires',
    'boedo': 'buenos aires', 'barracas': 'buenos aires',
    'liniers': 'buenos aires', 'mataderos': 'buenos aires',
    'tigre': 'buenos aires', 'san isidro': 'buenos aires',
    'olivos': 'buenos aires', 'martinez': 'buenos aires',
    'lomas de zamora': 'buenos aires', 'avellaneda': 'buenos aires',

    // Madrid
    'salamanca': 'madrid', 'chamberi': 'madrid', 'chamberí': 'madrid',
    'retiro': 'madrid', 'malasana': 'madrid', 'malasaña': 'madrid',
    'chueca': 'madrid', 'lavapies': 'madrid', 'lavapiés': 'madrid',
    'arganzuela': 'madrid', 'carabanchel': 'madrid', 'vallecas': 'madrid',
    'hortaleza': 'madrid', 'sanchinarro': 'madrid', 'las tablas': 'madrid',
    'pozuelo': 'madrid', 'majadahonda': 'madrid', 'las rozas': 'madrid',
    'alcobendas': 'madrid', 'la moraleja': 'madrid',
    'getafe': 'madrid', 'leganes': 'madrid', 'leganés': 'madrid',
    'alcorcon': 'madrid', 'alcorcón': 'madrid', 'mostoles': 'madrid',
    'alcala de henares': 'madrid', 'torrejon': 'madrid',

    // Miami
    'brickell': 'miami', 'brickell key': 'miami',
    'wynwood': 'miami', 'edgewater': 'miami', 'midtown': 'miami',
    'south beach': 'miami', 'miami beach': 'miami',
    'coconut grove': 'miami', 'coral gables': 'miami',
    'aventura': 'miami', 'sunny isles': 'miami', 'doral': 'miami',
    'little havana': 'miami', 'kendall': 'miami',
    'key biscayne': 'miami', 'bal harbour': 'miami',
    'design district': 'miami', 'arts district': 'miami',

    // Dubai
    'downtown dubai': 'dubai', 'dubai marina': 'dubai',
    'jbr': 'dubai', 'jumeirah beach residence': 'dubai',
    'palm jumeirah': 'dubai', 'business bay': 'dubai',
    'difc': 'dubai', 'jumeirah': 'dubai',
    'al barsha': 'dubai', 'dubai hills': 'dubai',
    'arabian ranches': 'dubai', 'jvc': 'dubai',
    'jumeirah village': 'dubai', 'deira': 'dubai',
    'bur dubai': 'dubai', 'mirdif': 'dubai',
    'dubai south': 'dubai', 'expo city': 'dubai',
    'silicon oasis': 'dubai', 'sports city': 'dubai',
};

const CITY_ALIASES: Record<string, string> = {
    'capital federal': 'buenos aires',
    'caba': 'buenos aires',
    'bsas': 'buenos aires',
    'bs as': 'buenos aires',
    'capital': 'buenos aires',
    'spain': 'madrid',
    'españa': 'madrid',
    'florida': 'miami',
    'eeuu': 'miami',
    'estados unidos': 'miami',
    'uae': 'dubai',
    'eau': 'dubai',
    'emiratos': 'dubai',
    'el golfo': 'dubai',
};

function normalizeGeography(text: string): {
    text: string;
    locationsDetected: string[];
    citiesInferred: string[];
} {
    const locationsDetected: string[] = [];
    const citiesInferred: string[] = [];
    let result = text;

    // Detectar barrios y agregar ciudad inferida
    for (const [neighborhood, city] of Object.entries(NEIGHBORHOOD_TO_CITY)) {
        if (result.includes(neighborhood)) {
            locationsDetected.push(neighborhood);
            if (!citiesInferred.includes(city)) {
                citiesInferred.push(city);
                // Agregar la ciudad al texto si no está ya
                if (!result.includes(city)) {
                    result = `${result} (ciudad: ${city})`;
                }
            }
        }
    }

    // Normalizar aliases de ciudades
    for (const [alias, canonical] of Object.entries(CITY_ALIASES)) {
        const regex = new RegExp(`\\b${alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
        if (regex.test(result)) {
            result = result.replace(regex, canonical);
            if (!locationsDetected.includes(alias)) locationsDetected.push(alias);
            if (!citiesInferred.includes(canonical)) citiesInferred.push(canonical);
        }
    }

    return { text: result, locationsDetected, citiesInferred };
}

// ── DETECTORES DE META ────────────────────────────────────────────
const CURRENCY_PATTERNS: Record<string, RegExp[]> = {
    USD: [/\busd\b/i, /\bdolares?\b/i, /\bdólares?\b/i, /u\$d/i, /u\$s/i, /\$\s*\d/],
    EUR: [/\beur\b/i, /\beuros?\b/i, /€/],
    AED: [/\baed\b/i, /\bdirhams?\b/i],
    ARS: [/\bars\b/i, /\bpesos?\s+argentinos?\b/i, /\bpesos?\b/i],
};

function detectCurrency(text: string): { detected: boolean; value?: string } {
    for (const [currency, patterns] of Object.entries(CURRENCY_PATTERNS)) {
        if (patterns.some(p => p.test(text))) {
            return { detected: true, value: currency };
        }
    }
    return { detected: false };
}

function detectAmount(text: string): number | undefined {
    // Detectar patrones como "200k", "200.000", "200 mil", "2 millones"
    const patterns = [
        /(\d+(?:[.,]\d+)?)\s*k\b/i,
        /(\d+(?:[.,]\d+)?)\s*mil(?:es)?\b/i,
        /(\d+(?:[.,]\d+)?)\s*millon(?:es)?\b/i,
        /(\d{1,3}(?:[.,]\d{3})+)/,
    ];

    for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match) {
            const rawString = match[1].replace(/[.,]/g, '');
            const raw = parseFloat(rawString);
            if (pattern.source.includes('millon')) return raw * 1_000_000;
            if (pattern.source.includes('mil') || pattern.source.includes('k')) return raw * 1_000;
            return raw;
        }
    }
    return undefined;
}

function extractTokens(text: string): string[] {
    const stopWords = new Set(['de', 'en', 'el', 'la', 'los', 'las', 'un', 'una',
        'y', 'o', 'que', 'con', 'por', 'para', 'a', 'al', 'del', 'me', 'mi',
        'es', 'se', 'no', 'si', 'le', 'su', 'ya', 'lo']);

    return text
        .split(/\s+/)
        .filter(t => t.length > 2 && !stopWords.has(t))
        .slice(0, 20); // máximo 20 tokens
}

// ── FUNCIÓN PRINCIPAL ─────────────────────────────────────────────
export function normalizeInput(input: NormalizerInput): NormalizerOutput {
    const { rawText } = input;

    // [1] Limpieza básica
    let text = basicClean(rawText);

    // [2] Normalización léxica
    const { text: lexText, fixed: typosFixed } = lexicalNormalize(text);
    text = lexText;

    // [3] Expansión de sinónimos
    text = expandSynonyms(text);

    // [4] Normalización geográfica
    const { text: geoText, locationsDetected, citiesInferred } = normalizeGeography(text);
    text = geoText;

    // Meta detectors
    const currency = detectCurrency(rawText); // usar raw para no perder señales
    const amountDetected = detectAmount(rawText);
    const tokens = extractTokens(text);

    return {
        rawInput: rawText,
        normalizedText: text,
        tokens,
        meta: {
            currencyDetected: currency.detected,
            currencyValue: currency.value,
            locationsDetected,
            citiesInferred,
            amountDetected,
            typosFixed,
        },
    };
}
