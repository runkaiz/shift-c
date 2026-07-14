<script>
	import { onMount } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	import { _ } from 'svelte-i18n';
	import { next } from '$lib/progress';

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
		{$_('survey.start.title')}<br />
	</h2>
	<div
		class="flex flex-col lg:flex-row max-w-2xl space-y-4 lg:space-y-0 lg:space-x-8 my-8 lg:my-16"
		out:fade={{ duration: 400 }}
	>
		<div
			class="basis-1/2 flex flex-col justify-start items-start rounded-lg bg-stone-50 ring-2 ring-stone-200 p-8 space-y-8"
			in:fly={{ y: 5, duration: 1000, delay: 1000 }}
		>
			<div>
				<img src="/images/battery.png" alt="Battery" class="w-16" />
			</div>
			<p class="text-lg text-stone-600">
				<span class="font-medium text-stone-800">{$_('survey.start.pressure.label')}</span>
				{$_('survey.start.pressure.text')}
			</p>
		</div>

		<div
			class="basis-1/2 flex flex-col justify-start items-start rounded-lg bg-stone-50 ring-2 ring-stone-200 p-8 space-y-8"
			in:fly={{ y: 5, duration: 1000, delay: 2000 }}
		>
			<div>
				<img src="/images/moon.png" alt="Moon" class="w-16" />
			</div>
			<p class="text-lg text-stone-600">
				<span class="font-medium text-stone-800">{$_('survey.start.clock.label')}</span>
				{$_('survey.start.clock.text')}
			</p>
		</div>
	</div>
	<p
		class="max-w-3xl text-center"
		in:fly={{ y: 5, duration: 1000, delay: 3000 }}
		out:fade={{ duration: 400 }}
	>
		{$_('survey.start.explanationLine1')}
		<br />
		{$_('survey.start.explanationLine2')}
	</p>

	<div class="mt-8 z-10 flex flex-col space-y-2 lg:space-y-4" out:fade={{ duration: 400 }}>
		<button
			disabled
			on:click={() => {
				shouldShow = false;
				next({ to: '/app/survey/ideal-schedule' });
			}}
			in:fly={{ y: 8, duration: 1000, delay: 9000 }}
			on:introend={(e) => {
				e.target.removeAttribute('disabled');
			}}
			class="items-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-800 transition-colors"
		>
			💪 {$_('survey.start.letsDoThis')}
		</button>
		<button
			disabled
			on:click={() => {
				shouldShow = false;
				next({
					to: '/learn/circadian',
					nextStep: '/app/survey/ideal-schedule',
					data: { learn: 'started' }
				});
			}}
			in:fly={{ y: 8, duration: 1000, delay: 9400 }}
			on:introend={(e) => {
				e.target.removeAttribute('disabled');
			}}
			class="text-center px-6 py-3 border border-transparent text-base rounded-full text-indigo-600 bg-stone-100"
		>
			{$_('common.learnMore')}
		</button>
	</div>

	<div
		class="absolute z-0 bottom-2 items-center px-6 py-3 border border-transparent"
		in:fly={{ y: 8, duration: 1000, delay: 3000 }}
	>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			width="24"
			height="24"
			class="animate-spin fill-current text-indigo-600"
			><path fill="none" d="M0 0h24v24H0z" /><path
				d="M12 3a9 9 0 0 1 9 9h-2a7 7 0 0 0-7-7V3z"
			/></svg
		>
	</div>
{/if}
