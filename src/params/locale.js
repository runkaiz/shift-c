import { SUPPORTED_LOCALES } from '$lib/i18n/constants';

/** @type {import('@sveltejs/kit').ParamMatcher} */
export function match(param) {
	return SUPPORTED_LOCALES.includes(param);
}
