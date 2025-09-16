import pb from '../../utils/pb';

const COLLECTION = import.meta.env.PB_SVG_COLLECTION ?? 'svgs'; // ← change si besoin

const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

export const POST = async ({ request }) => {
  try {
    const { title, svg } = await request.json();
    if (!title || !svg) return json({ error: 'title et svg requis' }, 400);

    // Assure-toi que ta collection possède les champs: title (text) et code (text/textarea)
    const record = await pb.collection(COLLECTION).create({ title, code: svg });

    return json({ id: record.id });
  } catch (e) {
    console.error('saveSVG error:', e);
    return json({ error: 'Erreur enregistrement' }, 500);
  }
};
