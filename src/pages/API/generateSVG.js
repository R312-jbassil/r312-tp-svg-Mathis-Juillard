// src/pages/api/generateSVG.js
import { OpenAI } from 'openai';

const HF_TOKEN = import.meta.env.HF_TOKEN;
const HF_URL   = import.meta.env.HF_URL || 'https://router.huggingface.co/v1';
const HF_MODEL = import.meta.env.HF_MODEL || 'meta-llama/Llama-3.1-8B-Instruct';

export const POST = async ({ request }) => {
  try {
    const { prompt } = await request.json();

    if (!HF_TOKEN) {
      return new Response(JSON.stringify({ error: 'HF_TOKEN manquant' }), {
        status: 500, headers: { 'Content-Type': 'application/json' }
      });
    }
    if (!prompt || typeof prompt !== 'string') {
      return new Response(JSON.stringify({ error: 'prompt manquant' }), {
        status: 400, headers: { 'Content-Type': 'application/json' }
      });
    }

    const client = new OpenAI({
      baseURL: HF_URL,
      apiKey: HF_TOKEN,
    });

    const chat = await client.chat.completions.create({
      model: HF_MODEL,
      messages: [
        {
          role: 'system',
          content:
            'You are an SVG generation tool. Generate only the SVG code without any explanation.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.2,
      max_tokens: 2048,
    });

    const message = chat.choices?.[0]?.message?.content || '';
    // extrait <svg>...</svg> (non-greedy)
    const match = message.match(/<svg[\s\S]*?<\/svg>/i);
    const svg = match ? match[0] : '';

    return new Response(JSON.stringify({ svg }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('generateSVG error:', e);
    return new Response(JSON.stringify({ error: 'Erreur génération' }), {
      status: 500, headers: { 'Content-Type': 'application/json' }
    });
  }
};
