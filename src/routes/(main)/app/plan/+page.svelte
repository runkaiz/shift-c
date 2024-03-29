<script>
	import { onMount } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	import { next } from '$lib/progress';

	import { lightTreatment, bioTreatment } from '$lib/stores';

	let enableBLT;
	let enableBio;

	let shouldShow = false;

	lightTreatment.subscribe((value) => {
		enableBLT = value;
	});

	bioTreatment.subscribe((value) => {
		enableBio = value;
	});

	onMount(() => {
		shouldShow = true;
	});
</script>

{#if shouldShow}
	<h2
		class="text-2xl font-semibold text-gray-800 text-center"
		in:fly={{ y: 5, duration: 1000 }}
		out:fly={{ y: -5, duration: 500 }}
	>
		Pick your evidence-based strategies.<br />
	</h2>
	<div
		class="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-8 my-16"
		out:fade={{ duration: 400 }}
	>
		<!-- This cannot be deselected -->
		<div
			class="basis-1/2 flex flex-col justify-start items-start rounded-lg bg-stone-50 ring-2 ring-indigo-800 p-8 space-y-8"
			in:fly={{ y: 5, duration: 1000, delay: 1000 }}
		>
			<div>
				<svg
					class="w-8 h-8 fill-current text-indigo-800"
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 20 20"
					fill="currentColor"
				>
					<path
						fill-rule="evenodd"
						d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
						clip-rule="evenodd"
					/>
				</svg>
			</div>
			<p class="text-lg text-stone-600">
				<span class="font-medium text-stone-800">Bed time planning</span>
				is essential if you want to shift your circadian clock forward. It means going to bed 30 to 60
				minutes earlier every night.
			</p>
			<button class="text-indigo-800">Learn more</button>
		</div>

		<div
			class="{enableBLT
				? 'ring-indigo-800'
				: 'ring-stone-200'} cursor-pointer basis-1/2 flex flex-col justify-start items-start rounded-lg bg-stone-50 ring-2 hover:ring-indigo-800 hover:shadow-lg transition-all p-8 space-y-8"
			in:fly={{ y: 5, duration: 1000, delay: 2000 }}
			on:click={() => lightTreatment.update((v) => !v)}
			on:keyup={() => lightTreatment.update((v) => !v)}
		>
			<div>
				<svg
					class="{enableBLT ? 'text-indigo-800' : 'text-stone-300'} w-8 h-8 fill-current"
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 20 20"
					fill="currentColor"
				>
					<path
						fill-rule="evenodd"
						d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
						clip-rule="evenodd"
					/>
				</svg>
			</div>
			<p class="text-lg text-stone-600">
				<span class="font-medium text-stone-800">Morning bright light exposure</span>
				is a good way to get more alertness in the morning—and it helps to shift your circadian clock
				forward.
			</p>
			<button class="text-indigo-800">Learn more</button>
		</div>

		<div
			class="{enableBio
				? 'ring-indigo-800'
				: 'ring-stone-200'} cursor-pointer basis-1/2 flex flex-col justify-start items-start rounded-lg bg-stone-50 ring-2 hover:ring-indigo-800 hover:shadow-lg transition-all p-8 space-y-8"
			in:fly={{ y: 5, duration: 1000, delay: 3000 }}
			on:click={() => bioTreatment.update((v) => !v)}
			on:keyup={() => bioTreatment.update((v) => !v)}
		>
			<div>
				<svg
					class="{enableBio ? 'text-indigo-800' : 'text-stone-300'} w-8 h-8 fill-current"
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 20 20"
					fill="currentColor"
				>
					<path
						fill-rule="evenodd"
						d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
						clip-rule="evenodd"
					/>
				</svg>
			</div>
			<p class="text-lg text-stone-600">
				<span class="font-medium text-stone-800">Chronobiotics</span>
				are probiotics for your biological clock! This involves taking melatonin in a scheduled way.
				No stress. We will get to the details later. (Work in Progress)
			</p>
			<button class="text-indigo-800">Learn more</button>
		</div>
	</div>
	<p
		class="max-w-3xl text-center"
		in:fly={{ y: 5, duration: 1000, delay: 4000 }}
		out:fade={{ duration: 400 }}
	>
		Pick additional strategies you want to use.
		<br />
		You can change this later.
	</p>

	<div class="mt-8 z-10 flex flex-col space-y-4" out:fade={{ duration: 400 }}>
		<button
			disabled
			on:click={() => {
				shouldShow = false;
				next({ to: '/app/survey/current-schedule' });
			}}
			in:fly={{ y: 8, duration: 1000, delay: 5000 }}
			on:introend={(e) => {
				e.target.removeAttribute('disabled');
			}}
			class="items-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-800 transition-colors"
		>
			Next
		</button>
	</div>
{/if}
