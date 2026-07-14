<script>
	import { onMount } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	import { next } from '$lib/progress';

	import { lightTreatment, bioTreatment } from '$lib/stores';
	import { MELATONIN_FEATURE_ENABLED } from '$lib/featureFlags';
	import { MELATONIN_SAFETY_WARNING } from '$lib/melatonin';
	import InfoModal from '$lib/components/InfoModal.svelte';

	let shouldShow = false;
	// null | 'bedtime' | 'light' | 'chronobiotics' - which card's overlay is open.
	let openModal = null;

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
			<button class="text-indigo-800 mt-8" on:click={() => (openModal = 'bedtime')}
				>Learn more</button
			>
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
			<button class="text-indigo-800 mt-8" on:click|stopPropagation={() => (openModal = 'light')}
				>Learn more</button
			>
		</div>

		{#if MELATONIN_FEATURE_ENABLED}
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
						use a small dose of melatonin, generally timed around your plan — this is general guidance,
						not a personalized prescription. Check with a clinician if you're pregnant, on other medications,
						or have a health condition.
					</p>
				</div>
				<button
					class="text-indigo-800 mt-8"
					on:click|stopPropagation={() => (openModal = 'chronobiotics')}>Learn more</button
				>
			</div>
		{/if}
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
				next({
					to: $bioTreatment ? '/app/survey/melatonin-screening' : '/app/survey/current-schedule'
				});
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

	{#if openModal === 'bedtime'}
		<InfoModal title="Bed time planning" on:close={() => (openModal = null)}>
			<p>
				Moving your bedtime (and wake time) by 30 minutes a day is a conservative pace — the fastest
				phase shift achievable with an optimally-timed combination of light, schedule, and melatonin
				tops out around 1 hour a day, and advances are generally harder to achieve than delays.
				Staying at 30 minutes a day keeps the plan comfortably inside that ceiling, which is the
				safer direction to err.
			</p>
			<p>
				On its own, a prescribed sleep/wake schedule like this one hasn't been independently shown
				to shift your circadian clock — the clinical evidence is strongest for light exposure. So
				think of this schedule as the scaffold that the bright light (and, if enabled, melatonin)
				steps work through, rather than a treatment by itself.
			</p>
		</InfoModal>
	{:else if openModal === 'light'}
		<InfoModal title="Bright light exposure" on:close={() => (openModal = null)}>
			<p>
				Light is the best-evidenced lever in this plan. Morning light after your target wake time
				helps shift your clock earlier; light in the evening, before bedtime, helps shift it later —
				we pick the direction automatically based on whether your plan is an advance or a delay.
			</p>
			<p>
				For an earlier (advance) plan, morning light also means keeping the few hours before bedtime
				relatively dim, since evening light works against the shift you're going for. For a later
				(delay) plan, avoiding light right after your old wake time matters at least as much as
				getting evening light.
			</p>
			<p>
				If your plan is mainly about getting more sleep opportunity rather than shifting your clock,
				morning light is still useful — just for alertness, not as a clock-shifting signal.
			</p>
		</InfoModal>
	{:else if openModal === 'chronobiotics'}
		<InfoModal title="Chronobiotics" on:close={() => (openModal = null)}>
			<p>
				Melatonin timing differs depending on whether you're shifting your schedule earlier, later,
				or mainly need more sleep opportunity — we pick the general approach that matches your plan.
			</p>
			<p>
				If your goal is mainly more sleep rather than a clock shift, a consistent bedtime, a dark
				and cool room, and cutting morning light/noise usually matter more than melatonin does,
				which is why we treat it as optional in that case.
			</p>
			<p>
				This isn't a personal dosing recommendation, and it isn't a substitute for talking to a
				clinician, especially if you're pregnant, on other medications, or have a health condition.
				Full citations are pending an in-progress science review.
			</p>
			<p
				class="rounded-lg bg-amber-50 border-2 border-amber-200 px-4 py-3 font-medium text-amber-800"
			>
				{MELATONIN_SAFETY_WARNING}
			</p>
		</InfoModal>
	{/if}
{/if}
