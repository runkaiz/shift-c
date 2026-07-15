<script>
	import { _ } from 'svelte-i18n';
</script>

<svelte:head>
	<title>{$_('seo.app.title')}</title>
	<meta name="robots" content="noindex, follow" />
</svelte:head>

<slot />
