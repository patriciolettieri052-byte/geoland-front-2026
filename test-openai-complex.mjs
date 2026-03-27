import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

function cleanJsonMarkdown(text) {
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

async function test() {
    const systemPrompt = `Eres un agente que responde SOLAMENTE con JSON. ESTRUCTURA: {"respuesta": "tu texto"}`;
    const message = "Hola, ¿quién eres?";
    const fullPrompt = `
${systemPrompt}

USER MESSAGE: ${message}

You must respond ONLY with the valid JSON object described in the instructions.
`;

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: fullPrompt }],
            temperature: 0.3,
            max_tokens: 1500,
        });

        const rawText = response.choices[0]?.message?.content;
        console.log('RAW:', rawText);
        const cleaned = cleanJsonMarkdown(rawText);
        console.log('CLEANED:', cleaned);
        JSON.parse(cleaned);
        console.log('PARSE SUCCESS');
    } catch (e) {
        console.error('ERROR:', e.message);
    }
}

test();
