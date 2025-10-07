import pb from "../../utils/pb";
import { Collections } from "../../utils/pocketbase-types";

export const POST = async ({ request, cookies }) => {
  const body = await request.json();

  // Récupère l’utilisateur authentifié depuis le cookie
  const cookie = cookies.get("pb_auth")?.value;
  if (!cookie) return new Response("Unauthorized", { status: 401 });

  pb.authStore.loadFromCookie(cookie);
  if (!pb.authStore.isValid) return new Response("Unauthorized", { status: 401 });

  // On ignore un "user" venu du client : on met celui du cookie
  const payload = {
    nom: body.nom,
    code_svg: body.code_svg,
    chat_history: typeof body.chat_history === "string"
      ? JSON.parse(body.chat_history || "[]")
      : (body.chat_history ?? []),
    user: pb.authStore.record.id,
  };

  try {
    const rec = await pb.collection(Collections.Svg).create(payload);
    return new Response(JSON.stringify({ success: true, id: rec.id }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (e) {
    console.error("saveSVG error:", e);
    return new Response(JSON.stringify({ success: false, error: String(e) }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
};
