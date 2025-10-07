// src/middleware/index.js
import pb from "../utils/pb";

/**
 * S'exécute avant chaque requête (pages + /api/*).
 * - Auth:
 *   - charge pb_auth du cookie et met l'utilisateur dans context.locals.user
 *   - protège toutes les routes API sauf /api/login et /api/signup
 *   - protège les pages (tout sauf /, /login, /signup)
 * - I18N:
 *   - gère le POST du sélecteur de langue (écrit le cookie 'locale')
 *   - met la langue finale dans context.locals.lang
 */
export const onRequest = async (context, next) => {
  // -------- AUTH: charger l'utilisateur depuis le cookie --------
  const cookieAuth = context.cookies.get("pb_auth")?.value;
  if (cookieAuth) {
    pb.authStore.loadFromCookie(cookieAuth);
    if (pb.authStore.isValid) {
      context.locals.user = pb.authStore.record; // dispo partout
    }
  }

  // -------- ROUTES API --------
  if (context.url.pathname.startsWith("/api/")) {
    // API publiques autorisées sans auth
    const publicApi = ["/api/login", "/api/signup"];
    if (publicApi.includes(context.url.pathname)) {
      return next();
    }

    // Toutes les autres APIs nécessitent une auth
    if (!context.locals.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    return next();
  }

  // -------- PAGES (non-API) protégées --------
  const publicPages = new Set(["/", "/login", "/signup"]);
  if (!context.locals.user && !publicPages.has(context.url.pathname)) {
    return Response.redirect(new URL("/login", context.url), 303);
  }

  // ===================== I18N =====================

  // 1) Si formulaire de langue (POST), on écrit le cookie et on redirige en GET
  if (context.request.method === "POST") {
    const form = await context.request.formData().catch(() => null);
    const lang = form?.get("language");
    if (lang === "en" || lang === "fr") {
      context.cookies.set("locale", String(lang), {
        path: "/",
        maxAge: 60 * 60 * 24 * 365, // 1 an
      });
      return Response.redirect(
        new URL(context.url.pathname + context.url.search, context.url),
        303
      );
    }
  }

  // 2) Déterminer la langue finale pour cette requête
  const cookieLocale = context.cookies.get("locale")?.value;
  context.locals.lang =
    cookieLocale === "fr" || cookieLocale === "en"
      ? cookieLocale
      : context.preferredLocale ?? "en";

  // Continuer vers la page demandée
  return next();
};
