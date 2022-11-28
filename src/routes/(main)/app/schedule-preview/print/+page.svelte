<script>
	import { onMount } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	import Schedule from '$lib/components/Schedule.svelte';

	let shouldShow = false;

	onMount(() => {
		shouldShow = true;
	});
</script>

{#if shouldShow}
	<h2
		class=" text-2xl font-semibold text-gray-800 text-center"
		in:fly={{ y: 5, duration: 1000 }}
		out:fly={{ y: -5, duration: 500 }}
	>
		Your 7-day bed time schedule.<br />
	</h2>

	<div
		class="relative max-w-2xl space-x-8 my-16"
		in:fly={{ y: 5, duration: 1000 }}
		out:fade={{ y: -5, duration: 400 }}
	>
		<Schedule />
	</div>
{/if}
