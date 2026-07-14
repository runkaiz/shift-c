<script>
	import { next } from '$lib/progress';
	import { onMount } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	import { _ } from 'svelte-i18n';

	let shouldShow = false;

	onMount(() => {
		shouldShow = true;
	});
</script>

{#if shouldShow}
	<h1
		class="text-3xl lg:text-8xl text-center font-semibold text-indigo-800"
		in:fade={{ duration: 1000, delay: 400 }}
		out:fade={{ duration: 400 }}
	>
		{$_('landing.hero.greeting')}
	</h1>
	<h1
		class="mt-4 text-5xl lg:text-8xl text-center font-semibold text-indigo-800"
		in:fade={{ duration: 1000, delay: 1400 }}
		out:fade={{ duration: 400 }}
	>
		{$_('landing.hero.prompt')}
	</h1>
	<p
		class="mt-16 lg:mt-32 max-w-3xl text-center"
		in:fade={{ duration: 1000, delay: 2400 }}
		out:fade={{ duration: 400 }}
	>
		{$_('landing.hero.description')}
	</p>
	<div class="mt-8" in:fly={{ y: 8, duration: 1000, delay: 3400 }} out:fade={{ duration: 400 }}>
		<button
			on:click={() => {
				shouldShow = false;
				next({ to: '/app/start', shouldPrefetch: true });
			}}
			class="items-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-indigo-800 hover:bg-indigo-900 transition-colors"
		>
			{$_('landing.hero.cta')}
		</button>
	</div>
{/if}
