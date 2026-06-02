import type { MiddlewareHandler } from 'astro';
import { parseAcceptLanguage, localePath } from '@/i18n/index';

/**
 * Root-path Accept-Language redirect.
 * In static mode this file is never invoked at runtime.
 * With the Cloudflare Pages adapter, it runs at the edge for every request to '/'.
 * 302 (not 301): preferred locale varies per visitor; permanent redirect would cache incorrectly.
 */
export const onRequest: MiddlewareHandler = async (context, next) => {
  const { pathname } = context.url;

  if (pathname === '/') {
    const acceptLang = context.request.headers.get('accept-language') ?? '';
    const locale = parseAcceptLanguage(acceptLang);
    return context.redirect(localePath(locale), 302);
  }

  return next();
};
