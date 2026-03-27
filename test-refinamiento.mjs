import OpenAI from 'openai';
import { REFINAMIENTO_SYSTEM_PROMPT } from './src/lib/ai/prompts.js'; // I'll need to make sure this works or just paste the prompt

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

async function test() {
    const systemPrompt = `
Eres el Copiloto de GEOLAND OS en modo refinamiento.
El inversor ya tiene resultados de búsqueda pero quiere ajustar.

Tu tarea:
1. Entender qué le molesta o qué quiere cambiar.
2. Extraer los filtros ajustados (solo los que cambian — el resto se mantiene).
3. Resumir el cambio propuesto en UNA oración.
4. Preguntar: "¿Busco con estos nuevos parámetros?"
5. Si confirma → retornar confirmacion_busqueda: true en el JSON.
6. Si rechaza → preguntar qué ajustar y volver al paso 1.

REGLA CRÍTICA: Nunca retornar confirmacion_busqueda: true sin que el usuario haya confirmado explícitamente. Esta variable es false por defecto. Su valor "true" instruirá a la máquina a buscar en vivo.

Responde SIEMPRE en este formato JSON:
{
  "dialogo_ui": "texto que ve el usuario",
  "extraccion_datos": {
    "filtros_duros": {
      "ubicacion": "Ciudad/País o null",
      "tipo_activo": "Residencial/Comercial/Logistico/Terreno o null",
      "presupuesto_maximo": "Número o null",
      "moneda": "USD/EUR/etc o null"
    },
    "filtros_blandos_isv": {
      "estrategia_objetivo": "Renta" | "Buy & Hold" | "Fix & Flip" | "Farmland" | null,
      "horizonte_anos": "1-2" | "3-5" | ">5" | "Flexible" | null,
      "involucramiento": "Activo" | "Medio" | "Pasivo" | null,
      "riesgo_tolerancia": "Bajo" | "Medio" | "Alto" | null,
      "financiacion": "Si" | "No" | null,
      "mercado_preferencia": "Local" | "Internacional" | "Ambos" | null
    },
    "preferencias_agro": {
      "zona_agroecologica": "pampa_humeda" | "nea" | "noa" | null,
      "acceso_agua": "secano" | "riego_complementario" | "riego_pleno" | null
    } | null,
    "confirmacion_busqueda": false,
    "perfil_completado": true
  }
}
`;

    const message = "Quiero ver algo en Miami en vez de Madrid";
    const fullPrompt = `${systemPrompt}\n\nUSER MESSAGE: ${message}\n\nYou must respond ONLY with the valid JSON object.`;

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: fullPrompt }],
            temperature: 0.3,
            max_completion_tokens: 1500,
        });

        const rawText = response.choices[0]?.message?.content;
        console.log('RAW:', rawText);
        JSON.parse(rawText.replace(/```json|```/g, '').trim());
        console.log('PARSE SUCCESS');
    } catch (e) {
        console.error('ERROR:', e.message);
    }
}

test();
