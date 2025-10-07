import pb from "../../utils/pb";
import { Collections } from "../../utils/pocketbase-types";

export const POST = async ({ request, cookies }) => {
  const { email, password } = await request.json();

  try {
    const auth = await pb
      .collection(Collections.Users)
      .authWithPassword(email, password);

    // stocke le token PB dans un cookie httpOnly
    cookies.set("pb_auth", pb.authStore.exportToCookie(), {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    });

    return new Response(JSON.stringify({ user: auth.record }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err) {
    console.error("login error:", err);
    return new Response(JSON.stringify({ error: "Identifiants invalides" }), {
      headers: { "Content-Type": "application/json" },
      status: 401,
    });
  }
};
