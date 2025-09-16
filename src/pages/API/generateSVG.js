// src/pages/api/generateSVG.js
import { OpenAI } from 'openai';

const HF_TOKEN = import.meta.env.HF_TOKEN;
const HF_URL   = import.meta.env.HF_URL  || 'https://router.huggingface.co/v1';
const HF_MODEL = import.meta.env.HF_MODEL || 'meta-llama/Llama-3.1-8B-Instruct';

const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

export const GET = () => json({ ok: true, hint: 'Use POST' });

export const POST = async ({ request }) => {
  try {
    if (!HF_TOKEN) return json({ error: 'HF_TOKEN manquant' }, 500);

    const { prompt } = await request.json();
    if (!prompt || typeof prompt !== 'string')
      return json({ error: 'prompt manquant' }, 400);

    const client = new OpenAI({ baseURL: HF_URL, apiKey: HF_TOKEN });

    const chat = await client.chat.completions.create({
      model: "meta-llama/Llama-3.1-8B-Instruct:novita",
      messages: [
        {
          role: 'system',
          content: 'You are an SVG generation tool. Generate only the SVG code without any explanation.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.2,
      max_tokens: 2048,
    });

    const message = chat.choices?.[0]?.message?.content || '';
    const match = message.match(/<svg[\s\S]*?<\/svg>/i);
    const svg = match ? match[0] : '';

    return json({ svg });
  } catch (e) {
    console.error('generateSVG error:', e);
    return json({ error: 'Erreur génération' }, 500);
  }
};
