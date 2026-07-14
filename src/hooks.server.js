import { redirect } from '@sveltejs/kit';

import { DEFAULT_LOCALE, isSupportedLocale, localeDir } from '$lib/i18n/constants';

const LOCALE_COOKIE = 'locale';

// Paths that existed before locale-prefixed routing shipped. Emails already
// sent to users link to these bare paths, so they must keep resolving.
const LEGACY_PREFIXES = ['/checkin/', '/unsubscribe/', '/app/', '/learn/'];

function resolveLocale(event) {
	const cookieLocale = event.cookies.get(LOCALE_COOKIE);
	if (isSupportedLocale(cookieLocale)) return cookieLocale;

	const acceptLanguage = event.request.headers.get('accept-language');
	if (acceptLanguage) {
		const preferred = acceptLanguage
			.split(',')
			.map((part) => part.split(';')[0].trim().toLowerCase());
		for (const lang of preferred) {
			const base = lang.split('-')[0];
			if (isSupportedLocale(base)) return base;
		}
	}

	return DEFAULT_LOCALE;
}

/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
	const { pathname, search } = event.url;

	if (pathname === '/' || LEGACY_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
		const target = resolveLocale(event);
		const suffix = pathname === '/' ? '' : pathname;
		throw redirect(308, `/${target}${suffix}${search}`);
	}

	const locale = isSupportedLocale(event.params.locale) ? event.params.locale : DEFAULT_LOCALE;
	const dir = localeDir(locale);

	return resolve(event, {
		transformPageChunk: ({ html }) =>
			html.replace('<html lang="en">', `<html lang="${locale}" dir="${dir}">`)
	});
}
