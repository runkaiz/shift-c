<script>
	import { onMount } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	import { _ } from 'svelte-i18n';
	import { next } from '$lib/progress';
	import TimeField from '$lib/components/TimeField.svelte';

	let shouldShow = false;
	let data = {
		current: {
			wakeup: '08:00',
			bedtime: '23:30'
		}
	};
	let step = 0;
	let nextButton;

	onMount(() => {
		shouldShow = true;
	});

	function handleWindowKeydown(e) {
		if (e.key === 'Enter' && nextButton && !nextButton.disabled) {
			nextButton.click();
		}
	}
</script>

<svelte:window on:keydown={handleWindowKeydown} />

{#if shouldShow}
	<h2
		class=" text-2xl font-semibold text-gray-800 text-center"
		in:fly={{ y: 5, duration: 1000 }}
		out:fly={{ y: -5, duration: 500 }}
	>
		{$_('survey.currentSchedule.title')}<br />
	</h2>
	<div class="relative max-w-2xl space-x-8 my-16" out:fade={{ duration: 400 }}>
		{#if step === 0}
			<div
				class="flex flex-col rounded-lg shadow bg-stone-50 p-6 mx-auto"
				in:fly={{ y: 5, duration: 1000, delay: 1000 }}
				out:fly={{ x: -8, duration: 500 }}
				on:outroend={() => {
					step = 1;
				}}
			>
				<h3 class="font-medium text-gray-800">{$_('survey.currentSchedule.wakeQuestion')}</h3>
				<TimeField bind:time={data.current.wakeup} placeholder={data.current.wakeup} kind="wake" />
			</div>
		{:else if step === 1}
			<div
				class="flex flex-col rounded-lg shadow bg-stone-50 p-6 mx-auto"
				in:fly={{ x: 8, duration: 500 }}
			>
				<h3 class="font-medium text-gray-800">{$_('survey.currentSchedule.sleepQuestion')}</h3>
				<TimeField
					bind:time={data.current.bedtime}
					placeholder={data.current.bedtime}
					kind="bedtime"
				/>
			</div>
		{/if}
	</div>
	<p
		class="max-w-3xl text-center"
		in:fly={{ y: 5, duration: 1000, delay: 2000 }}
		out:fade={{ duration: 400 }}
	>
		{#if step === 0}
			<span out:fade={{ duration: 500 }}>
				{$_('survey.currentSchedule.wakeHintLine1')}
				<br />
				{$_('survey.currentSchedule.hintLine2')}
			</span>
		{:else if step === 1}
			<span in:fade={{ duration: 500 }}>
				{$_('survey.currentSchedule.sleepHintLine1')}
				<br />
				{$_('survey.currentSchedule.hintLine2')}
			</span>
		{/if}
	</p>

	<div class="mt-8 z-10 flex flex-col space-y-4" out:fade={{ duration: 400 }}>
		<button
			disabled
			on:click={() => {
				if (step !== 1) {
					step = -1;
				} else {
					shouldShow = false;
					next({
						to: '/app/schedule-preview',
						nextStep: '/app/schedule-preview',
						data: { current: data.current }
					});
				}
			}}
			in:fly={{ y: 8, duration: 1000, delay: 2000 }}
			on:introend={(e) => {
				e.target.removeAttribute('disabled');
			}}
			bind:this={nextButton}
			class="items-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-800 transition-colors"
		>
			{$_('common.next')}
		</button>
	</div>
{/if}
