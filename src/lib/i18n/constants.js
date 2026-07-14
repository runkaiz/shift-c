export const SUPPORTED_LOCALES = ['en', 'zh', 'ar', 'ja', 'es', 'fr'];

export const DEFAULT_LOCALE = 'en';

export const RTL_LOCALES = ['ar'];

export const LOCALE_NAMES = {
	en: 'English',
	zh: '中文',
	ar: 'العربية',
	ja: '日本語',
	es: 'Español',
	fr: 'Français'
};

export function isSupportedLocale(locale) {
	return SUPPORTED_LOCALES.includes(locale);
}

export function localeDir(locale) {
	return RTL_LOCALES.includes(locale) ? 'rtl' : 'ltr';
}
