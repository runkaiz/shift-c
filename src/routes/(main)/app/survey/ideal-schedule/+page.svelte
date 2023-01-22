<script>
	import { onMount } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	import { next } from '$lib/progress';
	import TimeField from '$lib/components/TimeField.svelte';

	let shouldShow = false;
	let data = {
		goal: {
			wakeup: '08:00',
			bedtime: '23:30'
		}
	};
	let step = 0;

	onMount(() => {
		shouldShow = true;
	});

	function calcBedtime(wakeup) {
		// Calculate bedtime based on hour and minute in string format (e.g. '8:00')
		// Bedtime should minus 8 hours
		const wakeupHour = parseInt(wakeup.split(':')[0]);
		const wakeupMinute = wakeup.split(':')[1];
		const bedtimeHour = wakeupHour - 8;

		// If bedtime is less than 0, add 24 hours to it
		if (bedtimeHour < 0) {
			return `${24 + bedtimeHour}:${wakeupMinute}`;
		}

		// If bedtime is less than 10, add 0 to it
		if (bedtimeHour < 10) {
			return `0${bedtimeHour}:${wakeupMinute}`;
		}

		return `${bedtimeHour}:${wakeupMinute}`;
	}
</script>

{#if shouldShow}
	<h2
		class=" text-2xl font-semibold text-gray-800 text-center"
		in:fly={{ y: 5, duration: 1000 }}
		out:fly={{ y: -5, duration: 500 }}
	>
		Let's set a goal.<br />
	</h2>
	<div class="relative max-w-2xl space-x-8 my-16" out:fade={{ duration: 400 }}>
		{#if step === 0}
			<div
				class="flex flex-col rounded-lg shadow bg-stone-50 p-6 mx-auto"
				in:fly={{ y: 5, duration: 1000, delay: 1000 }}
				out:fly={{ x: -8, duration: 500 }}
				on:outroend={() => {
					data.goal.bedtime = calcBedtime(data.goal.wakeup);
					step = 1;
				}}
			>
				<h3 class="font-medium text-gray-800">When do you want to wake up?</h3>
				<TimeField bind:time={data.goal.wakeup} placeholder={data.goal.wakeup} />
			</div>
		{:else if step === 1}
			<div
				class="flex flex-col rounded-lg shadow bg-stone-50 p-6 mx-auto"
				in:fly={{ x: 8, duration: 500 }}
			>
				<h3 class="font-medium text-gray-800">What's your ideal bedtime?</h3>
				<TimeField bind:time={data.goal.bedtime} placeholder={data.goal.bedtime} />
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
				Your wakeup time should be feasible for you.
				<br />
				Pick a time that can best fit your existing schedule.
			</span>
		{:else if step === 1}
			<span in:fade={{ duration: 500 }}>
				For 8 hours of sleep, your bedtime should be earlier than {calcBedtime(data.goal.wakeup)}.
				<br />
				Be sure to consider the time you need to fall asleep.
			</span>
		{/if}
	</p>

	<div class="mt-8 z-10 flex flex-col space-y-4" out:fade={{ duration: 400 }}>
		<button
			disabled
			on:click={() => {
				if (step !== 1) {
					step = -1; // This is an intermidiate step to trigger outroend, so that step can be set to 1 without two transitions appearing at the same time.
				} else {
					shouldShow = false;
					next({
						to: '/app/plan',
						nextStep: '/app/plan',
						data: { goal: data.goal }
					});
				}
			}}
			in:fly={{ y: 8, duration: 1000, delay: 2000 }}
			on:introend={(e) => {
				e.target.removeAttribute('disabled');
			}}
			class="items-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-800 transition-colors"
		>
			Next
		</button>
	</div>
{/if}
