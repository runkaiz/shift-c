<script>
	import { onMount } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	import { _ } from 'svelte-i18n';
	import { next } from '$lib/progress';

	import { bioTreatment, melatoninScreeningPassed } from '$lib/stores';

	let shouldShow = false;
	let nextButton;
	let introEnded = false;

	let over18 = null;
	let pregnant = null;
	let medications = null;

	onMount(() => {
		shouldShow = true;
	});

	function handleWindowKeydown(e) {
		if (e.key === 'Enter' && nextButton && !nextButton.disabled) {
			nextButton.click();
		}
	}

	$: allAnswered = over18 !== null && pregnant !== null && medications !== null;
	$: disqualified = over18 === false || pregnant === true || medications === true;

	function pillClass(selected) {
		return selected
			? 'bg-indigo-600 text-white'
			: 'bg-stone-100 text-indigo-600 hover:bg-stone-200';
	}
</script>

<svelte:window on:keydown={handleWindowKeydown} />

{#if shouldShow}
	<h2
		class=" text-2xl font-semibold text-gray-800 text-center"
		in:fly={{ y: 5, duration: 1000 }}
		out:fly={{ y: -5, duration: 500 }}
	>
		{$_('survey.melatoninScreening.title')}<br />
	</h2>

	<div
		class="flex flex-col rounded-lg shadow bg-stone-50 p-6 mx-auto max-w-2xl my-16 space-y-8"
		in:fly={{ y: 5, duration: 1000, delay: 1000 }}
		out:fade={{ duration: 400 }}
	>
		<div>
			<h3 class="font-medium text-gray-800 mb-3">
				{$_('survey.melatoninScreening.over18Question')}
			</h3>
			<div class="flex gap-3">
				<button
					type="button"
					class="{pillClass(
						over18 === true
					)} px-6 py-2 text-sm font-medium rounded-full transition-colors"
					aria-pressed={over18 === true}
					on:click={() => (over18 = true)}>{$_('common.yes')}</button
				>
				<button
					type="button"
					class="{pillClass(
						over18 === false
					)} px-6 py-2 text-sm font-medium rounded-full transition-colors"
					aria-pressed={over18 === false}
					on:click={() => (over18 = false)}>{$_('common.no')}</button
				>
			</div>
		</div>

		<div>
			<h3 class="font-medium text-gray-800 mb-3">
				{$_('survey.melatoninScreening.pregnantQuestion')}
			</h3>
			<div class="flex gap-3">
				<button
					type="button"
					class="{pillClass(
						pregnant === true
					)} px-6 py-2 text-sm font-medium rounded-full transition-colors"
					aria-pressed={pregnant === true}
					on:click={() => (pregnant = true)}>{$_('common.yes')}</button
				>
				<button
					type="button"
					class="{pillClass(
						pregnant === false
					)} px-6 py-2 text-sm font-medium rounded-full transition-colors"
					aria-pressed={pregnant === false}
					on:click={() => (pregnant = false)}>{$_('common.no')}</button
				>
			</div>
		</div>

		<div>
			<h3 class="font-medium text-gray-800 mb-3">
				{$_('survey.melatoninScreening.medicationsQuestion')}
			</h3>
			<div class="flex gap-3">
				<button
					type="button"
					class="{pillClass(
						medications === true
					)} px-6 py-2 text-sm font-medium rounded-full transition-colors"
					aria-pressed={medications === true}
					on:click={() => (medications = true)}>{$_('common.yes')}</button
				>
				<button
					type="button"
					class="{pillClass(
						medications === false
					)} px-6 py-2 text-sm font-medium rounded-full transition-colors"
					aria-pressed={medications === false}
					on:click={() => (medications = false)}>{$_('common.no')}</button
				>
			</div>
		</div>
	</div>

	<p
		class="max-w-3xl text-center"
		in:fly={{ y: 5, duration: 1000, delay: 2000 }}
		out:fade={{ duration: 400 }}
	>
		{#if !allAnswered}
			<span>{$_('survey.melatoninScreening.introHint')}</span>
		{:else if disqualified}
			<span in:fade={{ duration: 500 }}>{$_('survey.melatoninScreening.disqualifiedHint')}</span>
		{:else}
			<span in:fade={{ duration: 500 }}>{$_('survey.melatoninScreening.qualifiedHint')}</span>
		{/if}
	</p>

	<div class="mt-8 z-10 flex flex-col space-y-4" out:fade={{ duration: 400 }}>
		<button
			on:click={() => {
				melatoninScreeningPassed.set(!disqualified);
				if (disqualified) {
					bioTreatment.set(false);
				}
				shouldShow = false;
				next({ to: '/app/survey/current-schedule' });
			}}
			in:fly={{ y: 8, duration: 1000, delay: 2000 }}
			on:introend={() => {
				introEnded = true;
			}}
			bind:this={nextButton}
			class="items-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-800 transition-colors disabled:opacity-50"
			disabled={!introEnded || !allAnswered}
		>
			{$_('common.next')}
		</button>
	</div>
{/if}
