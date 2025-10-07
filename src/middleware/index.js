import pb from "../utils/pb";

export const onRequest = async (context, next) => {
  // ---------- AUTH ----------
  const cookie = context.cookies.get("pb_auth")?.value;
  if (cookie) {
    pb.authStore.loadFromCookie(cookie);
    if (pb.authStore.isValid) {
      context.locals.user = pb.authStore.record; // dispo partout
    }
  }

  // Protège les endpoints API (sauf /api/login)
  if (context.url.pathname.startsWith("/api/")) {
    if (!context.locals.user && context.url.pathname !== "/api/login") {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }
    // Laisse passer vers l’API si ok
    return next();
  }

  // Redirige les pages (sauf / et /login) si pas connecté
  if (!context.locals.user) {
    const p = context.url.pathname;
    if (p !== "/" && p !== "/login") {
      return Response.redirect(new URL("/login", context.url), 303);
    }
  }

  // ---------- I18N ----------
  if (context.url.pathname.startsWith("/api/")) {
    // déjà géré au-dessus
  } else if (context.request.method === "POST") {
    const form = await context.request.formData().catch(() => null);
    const lang = form?.get("language");
    if (lang === "en" || lang === "fr") {
      context.cookies.set("locale", String(lang), {
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
      });
      return Response.redirect(
        new URL(context.url.pathname + context.url.search, context.url),
        303
      );
    }
  }
  const cookieLocale = context.cookies.get("locale")?.value;
  context.locals.lang =
    cookieLocale === "fr" || cookieLocale === "en"
      ? cookieLocale
      : context.preferredLocale ?? "en";

  return next();
};
