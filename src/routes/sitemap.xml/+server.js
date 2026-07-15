import { SUPPORTED_LOCALES, DEFAULT_LOCALE } from '$lib/i18n/constants';

// Only pages meant to be indexed — the app funnel, checkin, and unsubscribe
// routes are per-user/session and marked noindex, so they're deliberately
// left out of the sitemap.
const INDEXABLE_PATHS = ['', '/learn/circadian'];

export function GET({ url }) {
	const origin = url.origin;

	const urls = INDEXABLE_PATHS.flatMap((path) =>
		SUPPORTED_LOCALES.map((locale) => {
			const loc = `${origin}/${locale}${path}`;
			const alternates = SUPPORTED_LOCALES.map(
				(altLocale) =>
					`\n\t\t<xhtml:link rel="alternate" hreflang="${altLocale}" href="${origin}/${altLocale}${path}" />`
			).join('');
			const xDefault = `\n\t\t<xhtml:link rel="alternate" hreflang="x-default" href="${origin}/${DEFAULT_LOCALE}${path}" />`;

			return `\t<url>\n\t\t<loc>${loc}</loc>${alternates}${xDefault}\n\t</url>`;
		})
	);

	const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join('\n')}
</urlset>
`;

	return new Response(body, {
		headers: { 'Content-Type': 'application/xml' }
	});
}
