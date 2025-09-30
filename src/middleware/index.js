// src/middleware/index.js
export const onRequest = async (context, next) => {
  // laisser passer les endpoints API
  if (context.url.pathname.startsWith('/api/')) return next();

  // formulaire de langue -> POST
  if (context.request.method === 'POST') {
    const form = await context.request.formData().catch(() => null);
    const lang = form?.get('language');

    if (lang === 'en' || lang === 'fr') {
      context.cookies.set('locale', String(lang), {
        path: '/',              // valable sur tout le site
        maxAge: 60 * 60 * 24 * 365, // 1 an
      });

      // rediriger en GET sur la même page (évite le resubmit)
      return Response.redirect(
        new URL(context.url.pathname + context.url.search, context.url),
        303
      );
    }
  }

  // déterminer la langue pour cette requête
  const cookieLocale = context.cookies.get('locale')?.value;
  context.locals.lang =
    cookieLocale === 'fr' || cookieLocale === 'en'
      ? cookieLocale
      : context.preferredLocale ?? 'en';

  return next();
};
