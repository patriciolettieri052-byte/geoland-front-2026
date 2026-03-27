import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

async function test() {
    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'user',
                    content: 'Respond with a simple JSON object: {"test": "ok"}. You must respond ONLY with JSON.',
                }
            ],
            temperature: 0.3,
            max_completion_tokens: 1500,
        });

        console.log('RAW RESPONSE:', response.choices[0]?.message?.content);
    } catch (e) {
        console.error('ERROR:', e);
    }
}

test();
