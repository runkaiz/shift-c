// Standalone locale lookup for code that runs outside any Svelte component
// tree (check-in emails, .ics generation) — deliberately not svelte-i18n's
// `$_`/`locale` store, since a single Worker invocation (the check-in cron)
// can process plans for many different locales in one pass, and a shared
// mutable store would race across them.

import en from './locales/en.json';
import zh from './locales/zh.json';
import ar from './locales/ar.json';
import ja from './locales/ja.json';
import es from './locales/es.json';
import fr from './locales/fr.json';

import { DEFAULT_LOCALE } from './constants';

const catalogs = { en, zh, ar, ja, es, fr };

function getByPath(catalog, key) {
	return key
		.split('.')
		.reduce((node, part) => (node && typeof node === 'object' ? node[part] : undefined), catalog);
}

/**
 * @param {string} locale
 * @param {string} key - dot-separated path into the catalog, e.g. 'ical.sleep.summary'
 * @param {Record<string, string|number>} [values] - interpolated into `{name}` placeholders
 */
export function t(locale, key, values = {}) {
	const catalog = catalogs[locale] ?? catalogs[DEFAULT_LOCALE];
	let str = getByPath(catalog, key);
	if (typeof str !== 'string') {
		str = getByPath(catalogs[DEFAULT_LOCALE], key);
	}
	if (typeof str !== 'string') {
		return key;
	}

	for (const [name, value] of Object.entries(values)) {
		str = str.replaceAll(`{${name}}`, value);
	}

	return str;
}
