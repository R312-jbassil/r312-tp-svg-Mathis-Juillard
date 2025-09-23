// src/pages/api/generateSVG.js
import { OpenAI } from 'openai';

const OR_TOKEN = import.meta.env.OR_TOKEN;
const OR_URL   = import.meta.env.OR_URL  || 'https://openrouter.ai/api/v1';
const OR_MODEL = import.meta.env.OR_MODEL || 'openai/gpt-oss-20b:free';

const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

export const GET = () => json({ ok: true, hint: 'POST only' });

export const POST = async ({ request }) => {
  try {
    if (!OR_TOKEN) return json({ error: 'OR_TOKEN manquant' }, 500);

    const body = await request.json();
    // Compat : accepte soit un tableau de messages [{role,content}], soit {prompt:"..."}
    const messages = Array.isArray(body)
      ? body
      : (Array.isArray(body?.messages) ? body.messages
         : (body?.prompt ? [{ role: 'user', content: body.prompt }] : []));

    const systemMessage = {
      role: 'system',
      content:
        'You are an SVG code generator. Generate only raw SVG code for the following messages. ' +
        'Make sure to include ids for each important part of the SVG.',
    };

    const client = new OpenAI({
      baseURL: OR_URL,
      apiKey : OR_TOKEN,
    });

    const resp = await client.chat.completions.create({
      model: OR_MODEL,
      messages: [systemMessage, ...messages],
      temperature: 0.3,
      max_tokens: 2048,
    });

    const content = resp.choices?.[0]?.message?.content ?? '';
    const match   = content.match(/<svg[\s\S]*?<\/svg>/i);
    const svg     = match ? match[0] : '';

    // On renvoie un "message" assistant pour coller au TP
    return json({ svg: { role: 'assistant', content: svg } });
  } catch (e) {
    console.error('generateSVG error:', e);
    return json({ error: 'Erreur serveur generateSVG' }, 500);
  }
};
