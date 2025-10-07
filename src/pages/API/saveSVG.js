// src/pages/api/saveSVG.js
import pb from "../../utils/pb";
import { Collections } from "../../utils/pocketbase-types";

export async function POST({ request }) {
  const data = await request.json();

  // normalisation des champs
  const payload = {
    title: data.title ?? data.nom ?? "",                // 👈 garantit "title"
    code_svg: String(data.code_svg ?? ""),
    chat_history: Array.isArray(data.chat_history)
      ? data.chat_history
      : (typeof data.chat_history === "string"
          ? (JSON.parse(data.chat_history || "[]"))
          : []),
    ...(data.user ? { user: data.user } : {}),
  };

  try {
    const record = await pb.collection(Collections.Svg).create(payload);
    return new Response(JSON.stringify({ success: true, id: record.id }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error saving SVG:", err);
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
}
