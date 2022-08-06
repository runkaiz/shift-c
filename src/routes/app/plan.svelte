<script>
	import { onMount } from 'svelte';
	import { fade, fly } from 'svelte/transition';
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
		Pick your evidence-based strategies.<br />
	</h2>
	<div class="flex flex-row space-x-8 my-16" out:fade={{ duration: 400 }}>
		<!-- 
      TODO:
        When selected, the following classes should take effect:
          - ring-indigo-800
        Same for the other two cards.
     -->
		<div
			class="basis-1/2 flex flex-col justify-start items-start rounded-lg bg-stone-50 ring-2 ring-stone-200 hover:ring-indigo-800 hover:shadow-lg transition-all p-8 space-y-8"
			in:fly={{ y: 5, duration: 1000, delay: 1000 }}
		>
			<div>
				<!-- 
          TODO:
          When selected, the following classes should take effect:
            - text-indigo-800
          Same for the other two cards.
        -->
				<svg
					class="w-8 h-8 fill-current text-stone-300"
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
				is a good way to get more alertness in the morning---and it helps to shift your circadian clock
				forward.
			</p>
			<button class="text-indigo-800">Learn more</button>
		</div>

		<div
			class="basis-1/2 flex flex-col justify-start items-start rounded-lg bg-stone-50 ring-2 ring-stone-200 p-8 space-y-8"
			in:fly={{ y: 5, duration: 1000, delay: 2000 }}
		>
			<div>
				<svg
					class="w-8 h-8 fill-current text-stone-300"
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
			class="basis-1/2 flex flex-col justify-start items-start rounded-lg bg-stone-50 ring-2 ring-stone-200 p-8 space-y-8"
			in:fly={{ y: 5, duration: 1000, delay: 3000 }}
		>
			<div>
				<svg
					class="w-8 h-8 fill-current text-stone-300"
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
				No stress. We will get to the details later.
			</p>
			<button class="text-indigo-800">Learn more</button>
		</div>
	</div>
	<p
		class="max-w-3xl text-center"
		in:fly={{ y: 5, duration: 1000, delay: 4000 }}
		out:fade={{ duration: 400 }}
	>
		Pick the strategies you want to use.
	</p>

	<div class="mt-8 z-10 flex flex-col space-y-4" out:fade={{ duration: 400 }}>
		<button
			disabled
			on:click={() => {
				shouldShow = false;
				// TODO:
				// If bright light is selected, go to '/app/light'
				// Else if bed time is selected, go to '/app/bedtime'
				// Else if chronobiotics is selected, go to '/app/chronobiotics'
				// If none is selected, the button should be disabled:
				//   - disabled
				//   - text-stone-400
				//   - bg-stone-200
				//   - hover: bg-stone-200
				next({ to: '/app/survey' });
			}}
			in:fly={{ y: 8, duration: 1000, delay: 5000 }}
			on:introend={(e) => {
				e.target.removeAttribute('disabled');
			}}
			class="items-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-800 transition-colors"
		>
			🗓 Show the plan
		</button>
	</div>
{/if}
