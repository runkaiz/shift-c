import { locale, waitLocale } from 'svelte-i18n';

import '$lib/i18n';

/** @type {import('./$types').LayoutLoad} */
export async function load({ params }) {
	locale.set(params.locale);
	await waitLocale();

	return { locale: params.locale };
}
