// src/middleware/index.js
export const onRequest = async (context, next) => {
  // Laisse passer les routes API
  if (context.url.pathname.startsWith('/api/')) return next();

  // Si on reçoit le POST du sélecteur => on pose le cookie et on redirige en GET
  if (context.request.method === 'POST') {
    const form = await context.request.formData().catch(() => null);
    const lang = form?.get('language');
    if (lang === 'en' || lang === 'fr') {
      context.cookies.set('locale', lang, { path: '/', maxAge: 60 * 60 * 24 * 365 });
      return Response.redirect(new URL(context.url.pathname + context.url.search, context.url), 303);
    }
  }

  // lit le cookie et décide la locale
  const cookieLocale = context.cookies.get('locale')?.value;
  context.locals.lang = (cookieLocale === 'fr' || cookieLocale === 'en')
    ? cookieLocale
    : (context.preferredLocale?.startsWith('fr') ? 'fr'
       : context.preferredLocale?.startsWith('en') ? 'en'
       : 'en');

  return next();
};
