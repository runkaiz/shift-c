<script>
	import { onMount } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	import { next } from '$lib/progress';

	import { lightTreatment, bioTreatment } from '$lib/stores';

	let shouldShow = false;

	onMount(() => {
		shouldShow = true;
	});

	function handleCardKeydown(e, store) {
		if (e.key === 'Enter' || e.key === ' ') {
			if (e.key === ' ') {
				e.preventDefault();
			}
			store.update((v) => !v);
		}
	}
</script>

{#if shouldShow}
	<h1
		class="text-2xl font-semibold text-gray-800 text-center"
		in:fly={{ y: 5, duration: 1000 }}
		out:fly={{ y: -5, duration: 500 }}
	>
		Pick your evidence-based strategies.<br />
	</h1>
	<div
		class="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-8 my-16"
		out:fade={{ duration: 400 }}
	>
		<!-- This cannot be deselected -->
		<div
			class="basis-1/2 flex flex-col justify-between items-start rounded-lg bg-stone-50 ring-2 ring-indigo-800 p-8"
			in:fly={{ y: 5, duration: 1000, delay: 1000 }}
		>
			<div class="space-y-8">
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
					is essential for shifting your circadian clock. It means gradually moving your bedtime by 30
					minutes a night, earlier or later depending on your goal.
				</p>
			</div>
			<button class="text-indigo-800 mt-8">Learn more</button>
		</div>

		<div
			class="{$lightTreatment
				? 'ring-indigo-800'
				: 'ring-stone-200'} cursor-pointer basis-1/2 flex flex-col justify-between items-start rounded-lg bg-stone-50 ring-2 hover:ring-indigo-800 hover:shadow-lg transition-all p-8"
			in:fly={{ y: 5, duration: 1000, delay: 2000 }}
			tabindex="0"
			role="button"
			aria-pressed={$lightTreatment}
			on:click={() => lightTreatment.update((v) => !v)}
			on:keydown={(e) => handleCardKeydown(e, lightTreatment)}
		>
			<div class="space-y-8">
				<div>
					<svg
						class="{$lightTreatment ? 'text-indigo-800' : 'text-stone-300'} w-8 h-8 fill-current"
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
					<span class="font-medium text-stone-800">Bright light exposure</span>
					helps shift your circadian clock in the right direction — we'll time it for morning or evening
					based on your plan — and morning light also gives you a boost of alertness.
				</p>
			</div>
			<button class="text-indigo-800 mt-8" on:click|stopPropagation>Learn more</button>
		</div>

		<div
			class="{$bioTreatment
				? 'ring-indigo-800'
				: 'ring-stone-200'} cursor-pointer basis-1/2 flex flex-col justify-between items-start rounded-lg bg-stone-50 ring-2 hover:ring-indigo-800 hover:shadow-lg transition-all p-8"
			in:fly={{ y: 5, duration: 1000, delay: 3000 }}
			tabindex="0"
			role="button"
			aria-pressed={$bioTreatment}
			on:click={() => bioTreatment.update((v) => !v)}
			on:keydown={(e) => handleCardKeydown(e, bioTreatment)}
		>
			<div class="space-y-8">
				<div>
					<svg
						class="{$bioTreatment ? 'text-indigo-800' : 'text-stone-300'} w-8 h-8 fill-current"
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
					use a small, precisely-timed dose of melatonin. We'll pick the timing and amount that fits
					your plan — not the same for everyone. General estimate, not medical advice — check with a
					clinician if you're pregnant, on other medications, or have a health condition.
				</p>
			</div>
			<button class="text-indigo-800 mt-8" on:click|stopPropagation>Learn more</button>
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
