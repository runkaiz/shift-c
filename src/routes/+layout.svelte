<script>
	import { page } from '$app/stores';
	import { browser } from '$app/environment';

	import { localeDir } from '$lib/i18n/constants';

	// hooks.server.js sets <html lang>/<html dir> on the initial SSR response,
	// but client-side navigation (the language switcher's goto()) never
	// re-fetches that document, so it never re-runs. Mirror it here so
	// switching to/from Arabic flips dir="rtl" without a full page reload.
	$: if (browser && $page.params.locale) {
		document.documentElement.lang = $page.params.locale;
		document.documentElement.dir = localeDir($page.params.locale);
	}
</script>

<slot />
