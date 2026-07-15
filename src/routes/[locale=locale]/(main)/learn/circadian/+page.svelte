<script>
	import { onMount } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	import { _ } from 'svelte-i18n';

	import Seo from '$lib/components/Seo.svelte';

	let shouldShow = false;

	onMount(() => {
		shouldShow = true;
	});
</script>

<Seo
	title={$_('seo.learnCircadian.title')}
	description={$_('seo.learnCircadian.description')}
	path="/learn/circadian"
/>

{#if shouldShow}
	<h2
		class="mt-24 text-4xl font-semibold text-gray-800 text-center"
		in:fly={{ y: 5, duration: 1000 }}
		out:fly={{ y: -5, duration: 500 }}
	>
		{$_('learn.circadian.title')}<br />
	</h2>
	<div
		class="max-w-xl my-16 leading-relaxed"
		in:fade={{ duration: 500 }}
		out:fade={{ duration: 200 }}
	>
		<p>
			{$_('learn.circadian.intro')}
		</p>
		<p class="pt-4">
			{$_('learn.circadian.biologicalClock')}
		</p>
		<p class="pt-4">
			{$_('learn.circadian.sleepPressure')}
		</p>
		<p class="pt-4">
			{$_('learn.circadian.batteryAnalogy')}
		</p>
		<p class="pt-4">
			{$_('learn.circadian.adjustment')}
		</p>
	</div>
	<!-- <div class="flex flex-row max-w-xl space-x-8 my-16" out:fade={{ duration: 400 }}>
		<div
			class="basis-1/2 flex flex-col justify-start items-start rounded-lg bg-stone-50 ring-2 ring-stone-200 p-8 space-y-8"
			in:fly={{ y: 5, duration: 1000, delay: 1000 }}
		>
			<div>
				<img
					src="https://imagedelivery.net/4v3KB3Aeo_3sLg3kKoifCw/8d642a09-8bcf-427e-5509-e523c2140e00/public"
					alt="Alarm clock"
					class="w-16"
				/>
			</div>
			<p class="text-lg text-stone-600">
				<span class="font-medium text-stone-800">Your biological clock</span>
				makes you feel alert in your morning and tired in your evening.
			</p>
		</div>

		<div
			class="basis-1/2 flex flex-col justify-start items-start rounded-lg bg-stone-50 ring-2 ring-stone-200 p-8 space-y-8"
			in:fly={{ y: 5, duration: 1000, delay: 2000 }}
		>
			<div>
				<img
					src="https://imagedelivery.net/4v3KB3Aeo_3sLg3kKoifCw/e022f310-0aec-4344-5303-fc6144e85b00/public"
					alt="Battery"
					class="w-16"
				/>
			</div>
			<p class="text-lg text-stone-600">
				<span class="font-medium text-stone-800">Your sleep pressure</span>
				adds to your tiredness (or alertness) to make you feel sleepy (or sleepless).
			</p>
		</div>
	</div> -->
{/if}
