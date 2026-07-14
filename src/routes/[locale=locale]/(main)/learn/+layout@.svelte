<script>
	import { page } from '$app/stores';
	import { _ } from 'svelte-i18n';

	import { resume } from '$lib/progress';
	import LanguageSwitcher from '$lib/components/LanguageSwitcher.svelte';

	import '$lib/tailwind.css';

	let hide = false;
</script>

<svelte:head>
	<link href="https://cdn.jsdelivr.net/npm/remixicon@2.5.0/fonts/remixicon.css" rel="stylesheet" />
</svelte:head>

<div class="h-full overflow-auto bg-stone-100">
	<!-- Top Bar -->
	<div class="fixed z-50 top-0 inset-x-0 p-4 flex flex-row justify-between items-center">
		<p class="text-lg font-medium"><a href="/{$page.params.locale}">Shift</a></p>
		<div class="flex flex-row items-center gap-4">
			<LanguageSwitcher />
			<p class="text-lg text-indigo-600">
				<button
					class={hide ? 'hidden' : ''}
					on:click={() => {
						hide = true;
						resume({ data: { learn: 'finished' }, fallback: '/' });
					}}>{$_('learn.layout.continue')}</button
				>
			</p>
		</div>
	</div>
	<!-- Content area -->
	<div class="flex min-h-screen">
		<div class="flex mx-auto max-w-5xl px-8 py-16">
			<div class="relative flex flex-col items-center">
				<slot />
			</div>
		</div>
	</div>
</div>
