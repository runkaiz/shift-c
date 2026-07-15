<script>
	// Per-page SEO tags. Must stay outside any `onMount`/`browser` gate in the
	// consuming page so these render in the initial SSR HTML for crawlers.
	import { page } from '$app/stores';
	import { SUPPORTED_LOCALES, DEFAULT_LOCALE } from '$lib/i18n/constants';

	export let title;
	export let description;
	// Path relative to the locale segment, e.g. '' for the landing page or
	// '/learn/circadian'. Used to build the canonical URL and hreflang set.
	export let path = '';
	// Token/session pages (checkin, unsubscribe) and the app funnel carry
	// per-user or in-progress state that shouldn't be indexed or crawled
	// across locale variants.
	export let indexable = true;

	$: origin = $page.url.origin;
	$: locale = $page.params.locale ?? DEFAULT_LOCALE;
	$: canonical = `${origin}/${locale}${path}`;
	$: ogImage = `${origin}/images/og-cover.png`;
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />
	<link rel="canonical" href={canonical} />
	{#if indexable}
		{#each SUPPORTED_LOCALES as loc}
			<link rel="alternate" hreflang={loc} href={`${origin}/${loc}${path}`} />
		{/each}
		<link rel="alternate" hreflang="x-default" href={`${origin}/${DEFAULT_LOCALE}${path}`} />
	{:else}
		<meta name="robots" content="noindex, follow" />
	{/if}

	<meta property="og:type" content="website" />
	<meta property="og:site_name" content="Shift" />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:url" content={canonical} />
	<meta property="og:image" content={ogImage} />
	<meta property="og:locale" content={locale} />

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image" content={ogImage} />
</svelte:head>
