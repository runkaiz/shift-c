<script>
	import { page } from '$app/stores';
</script>

<svelte:head>
	<title>{$page.status} — Shift</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<div class="flex min-h-screen items-center justify-center p-8 text-center">
	<div>
		<h1 class="text-2xl font-semibold text-gray-800">{$page.status}</h1>
		<p class="mt-2 text-gray-600">{$page.error?.message}</p>
	</div>
</div>
