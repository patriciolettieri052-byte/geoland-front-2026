// src/lib/ai/llmClient.ts
// Abstracción del LLM — cambiar de modelo = modificar solo este archivo

import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || 'dummy_key',
});

export interface LLMRequest {
    systemPrompt: string;
    userMessage: string;
    temperature?: number;
    maxTokens?: number;
}

export interface LLMResponse {
    text: string;
    model: string;
    tokensUsed?: number;
}

const DEFAULT_MODEL = 'gpt-5.2';
const DEFAULT_TEMPERATURE = 0.3;
const DEFAULT_MAX_TOKENS = 1500;

/**
 * Llama al LLM configurado y devuelve el texto de respuesta.
 * Para cambiar de modelo (ej: Gemini Flash 2.5), solo modificar esta función.
 * El resto del sistema no sabe qué LLM hay adentro.
 */
export async function callLLM(req: LLMRequest): Promise<LLMResponse> {
    const response = await openai.chat.completions.create({
        model: DEFAULT_MODEL,
        messages: [
            {
                role: 'system',
                content: req.systemPrompt,
            },
            {
                role: 'user',
                content: req.userMessage,
            }
        ],
        temperature: req.temperature ?? DEFAULT_TEMPERATURE,
        max_completion_tokens: req.maxTokens ?? DEFAULT_MAX_TOKENS,
        response_format: { type: 'json_object' },
    });

    const text = response.choices[0]?.message?.content;

    if (!text) {
        throw new Error(`[llmClient] Empty response from ${DEFAULT_MODEL}`);
    }

    return {
        text,
        model: DEFAULT_MODEL,
        tokensUsed: response.usage?.total_tokens,
    };
}

/**
 * INSTRUCCIONES PARA CAMBIAR DE MODELO:
 *
 * Para migrar a Gemini Flash 2.5:
 * 1. npm install @google/genai
 * 2. Agregar GEMINI_API_KEY en Vercel
 * 3. Reemplazar el cuerpo de callLLM() con:
 *
 *   import { GoogleGenAI } from '@google/genai';
 *   const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
 *   const response = await genAI.models.generateContent({
 *       model: 'gemini-2.5-flash',
 *       contents: `${req.systemPrompt}\n\n${req.userMessage}`,
 *   });
 *   return { text: response.text, model: 'gemini-2.5-flash' };
 *
 * Nada más cambia en el resto del sistema.
 */
