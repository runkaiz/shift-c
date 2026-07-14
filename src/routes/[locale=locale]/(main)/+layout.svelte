<script>
	import '$lib/tailwind.css';
	import { page } from '$app/stores';

	import LanguageSwitcher from '$lib/components/LanguageSwitcher.svelte';
</script>

<svelte:head>
	<link href="https://cdn.jsdelivr.net/npm/remixicon@2.5.0/fonts/remixicon.css" rel="stylesheet" />
</svelte:head>

<div class="h-full overflow-auto bg-stone-100">
	<!-- Top Bar -->
	<div
		class="fixed z-50 top-0 inset-x-0 p-4 flex flex-row justify-between bg-stone-100/80 backdrop-blur-3xl"
	>
		<p class="text-lg font-medium"><a href="/{$page.params.locale}">Shift</a></p>
		<LanguageSwitcher />
	</div>
	<!-- Content area -->
	<div class="flex min-h-screen justify-center items-center">
		<div class="flex justify-center mx-auto max-w-5xl px-4 lg:px-8 py-16">
			<div class="relative flex flex-col justify-center items-center">
				<slot />
			</div>
		</div>
	</div>
</div>
