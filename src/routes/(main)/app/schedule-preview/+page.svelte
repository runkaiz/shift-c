<script>
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { fade, fly } from 'svelte/transition';

	import { lightTreatment, bioTreatment } from '$lib/stores';

	import moment from 'moment/moment';
	import DayCard from '$lib/components/DayCard.svelte';

	import { read } from '$lib/progress';
	import { computeIntervention } from '$lib/schedule';

	let shouldShow = false;

	let position = 0;
	let direction = 1;
	let dateLabel = '';
	let bedTime = '';
	let wakeTime = '';
	let durationLabel = '';

	let wakeIntervention = [];
	let sleepIntervention = [];
	let bltIntervention = [];
	let melatoninIntervention = [];

	let interventionDays = 0;
	let regime = null;

	function algoTime(data) {
		if (
			!data?.current?.wakeup ||
			!data?.current?.bedtime ||
			!data?.goal?.wakeup ||
			!data?.goal?.bedtime
		) {
			goto('/app/start');
			return;
		}

		let result;
		try {
			result = computeIntervention({
				currentWake: data.current.wakeup,
				currentSleep: data.current.bedtime,
				goalWake: data.goal.wakeup,
				goalSleep: data.goal.bedtime,
				startDate: new Date(),
				enableBLT: $lightTreatment,
				enableMelatonin: $bioTreatment
			});
		} catch {
			goto('/app/start');
			return;
		}

		if (!result.changed) {
			console.log("Don't need no changes!");
			return;
		}

		interventionDays = result.days.length;
		regime = result.regime;
		wakeIntervention = result.days.map((d) => d.wake);
		sleepIntervention = result.days.map((d) => d.sleep);
		bltIntervention = result.days.map((d) => d.blt);
		melatoninIntervention = result.days.map((d) => d.melatonin);

		displayDay(0);
		shouldShow = true;
	}

	function formatDuration(totalMinutes) {
		const hours = Math.floor(totalMinutes / 60);
		const minutes = totalMinutes % 60;
		return (minutes ? `${hours}h ${minutes}m` : `${hours}h`) + ' in bed';
	}

	function displayDay(p) {
		if (p < 0 || p >= interventionDays) return;
		direction = p >= position ? 1 : -1;
		position = p;
		bedTime = sleepIntervention[p].format('HH:mm');
		wakeTime = wakeIntervention[p].format('HH:mm');
		dateLabel = wakeIntervention[p].format('ddd, MMM D');
		durationLabel = formatDuration(wakeIntervention[p].diff(sleepIntervention[p], 'minutes'));
	}

	function handleKeydown(e) {
		if (!shouldShow) return;
		if (e.key === 'ArrowLeft') displayDay(position - 1);
		if (e.key === 'ArrowRight') displayDay(position + 1);
	}

	let touchStartX = null;

	function handleTouchStart(e) {
		touchStartX = e.touches[0].clientX;
	}

	function handleTouchEnd(e) {
		if (touchStartX === null) return;
		const delta = e.changedTouches[0].clientX - touchStartX;
		touchStartX = null;
		if (Math.abs(delta) < 40) return;
		displayDay(delta < 0 ? position + 1 : position - 1);
	}

	async function downloadSchedule(data) {
		let now = new Date();
		let calendarURL = new URLSearchParams();
		calendarURL.append('blt', $lightTreatment ? '1' : '0');
		calendarURL.append('bio', $bioTreatment ? '1' : '0');
		calendarURL.append('cWake', data.current.wakeup);
		calendarURL.append('cSleep', data.current.bedtime);
		calendarURL.append('gWake', data.goal.wakeup);
		calendarURL.append('gSleep', data.goal.bedtime);
		calendarURL.append('tz', new moment().utcOffset());
		calendarURL.append('n', now.toISOString());

		goto('/api/generate-ical?' + calendarURL.toString());
	}

	onMount(() => {
		algoTime(read().data);
	});
</script>

<svelte:window on:keydown={handleKeydown} />

{#if shouldShow}
	<h2
		class="text-2xl font-semibold text-gray-800 text-center mt-8"
		in:fly={{ y: 5, duration: 1000 }}
		out:fly={{ y: -5, duration: 500 }}
	>
		Here's the plan.<br />
	</h2>

	<div
		class="relative max-w-md my-8"
		in:fly={{ y: 5, duration: 1000 }}
		out:fade={{ y: -5, duration: 400 }}
	>
		<!-- <div
			class="flex flex-col rounded-lg shadow bg-stone-50 p-6 mx-auto my-8"
			in:fly={{ x: 8, duration: 500 }}
		/> -->
		{#if regime === 'delay'}
			Over the next {interventionDays} day{interventionDays === 1 ? '' : 's'}, you will be shifting
			your circadian clock later by up to 30 minutes each day. This will be easier for you to go to
			sleep later and wake up later. At the same time, a conservative plan will help you to maintain
			your energy level. No dramatic ups and downs.
		{:else if regime === 'advance'}
			Over the next {interventionDays} day{interventionDays === 1 ? '' : 's'}, you will be shifting
			your circadian clock earlier by up to 30 minutes each day. This will be easier for you to go
			to sleep earlier and wake up earlier. At the same time, a conservative plan will help you to
			maintain your energy level. No dramatic ups and downs.
		{:else}
			Over the next {interventionDays} day{interventionDays === 1 ? '' : 's'}, you will be gradually
			adjusting your sleep and wake times by up to 30 minutes each day. A conservative plan like
			this helps you maintain your energy level. No dramatic ups and downs.
		{/if}
	</div>

	<div
		class="relative max-w-md my-8"
		in:fly={{ y: 5, duration: 1000 }}
		out:fade={{ y: -5, duration: 400 }}
	>
		<h2 class="text-xl font-bold mb-6">Daily details</h2>

		<div
			class="relative touch-pan-y"
			on:touchstart={handleTouchStart}
			on:touchend={handleTouchEnd}
		>
			{#key position}
				<div in:fly={{ x: direction * 24, duration: 250 }}>
					<DayCard
						dayNumber={position + 1}
						totalDays={interventionDays}
						{dateLabel}
						{bedTime}
						{wakeTime}
						{durationLabel}
						bltTime={bltIntervention[position] ? bltIntervention[position].format('HH:mm') : null}
						melatoninTime={melatoninIntervention[position]
							? melatoninIntervention[position].time.format('HH:mm')
							: null}
						melatoninDoseMg={melatoninIntervention[position]
							? melatoninIntervention[position].doseMg
							: null}
					/>
				</div>
			{/key}
		</div>

		<div class="flex items-center gap-2 mt-5">
			<button
				type="button"
				class="{position == 0
					? 'text-stone-300 cursor-default'
					: 'text-indigo-800 hover:bg-stone-200 cursor-pointer'} shrink-0 bg-stone-50 ring-1 ring-stone-200 rounded-full p-2.5 w-10 h-10 transition-colors"
				aria-label="Previous day"
				disabled={position == 0}
				on:click={() => displayDay(position - 1)}
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="1.5"
					stroke="currentColor"
					class="w-5 h-5"
				>
					<path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
				</svg>
			</button>

			<div class="flex-1 flex items-center gap-1.5 overflow-x-auto snap-x snap-mandatory no-scrollbar py-1">
				{#each Array(interventionDays) as _, i}
					<button
						type="button"
						class="{i === position
							? 'bg-indigo-800 text-white'
							: 'bg-stone-200/70 text-stone-500 hover:bg-stone-300'} shrink-0 snap-center w-8 h-8 rounded-full text-xs font-medium transition-colors"
						aria-label={`Go to day ${i + 1}`}
						aria-current={i === position}
						on:click={() => displayDay(i)}
					>
						{i + 1}
					</button>
				{/each}
			</div>

			<button
				type="button"
				class="{position == interventionDays - 1
					? 'text-stone-300 cursor-default'
					: 'text-indigo-800 hover:bg-stone-200 cursor-pointer'} shrink-0 bg-stone-50 ring-1 ring-stone-200 rounded-full p-2.5 w-10 h-10 transition-colors"
				aria-label="Next day"
				disabled={position == interventionDays - 1}
				on:click={() => displayDay(position + 1)}
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="1.5"
					stroke="currentColor"
					class="w-5 h-5"
				>
					<path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
				</svg>
			</button>
		</div>

		<p class="mt-5 text-sm text-stone-500">
			Your sleep schedule is planned by days. It is possible to have fluctuating bedtimes. Just try
			your best to stick to the wake up time.
		</p>
	</div>

	<div
		class="relative max-w-md my-8"
		in:fly={{ y: 5, duration: 1000 }}
		out:fade={{ y: -5, duration: 400 }}
	>
		<h2 class="text-xl font-bold">Add to calendar</h2>
		<!-- <div class="mt-8 mb-4">
			<input
				type="text"
				class="bg-transparent p-2 border-2 border-stone-200 rounded-lg items-center placeholder:text-stone-400 w-full"
				value="https://shiftc.app/gCAEHv2sJxlBOcIOzixVIUG0xKG0mwANLmbvkmFryOI.ical"
			/>
		</div>
		<button class="underline underline-offset-3">Copy</button> the link above and add it to your calendar.
		This will be dynamically updated as you progress. -->
		<button class="underline underline-offset-3" on:click={() => downloadSchedule(read().data)}
			>Download</button
		> your schedule and add it to your calendar. The iCal file contains your sleep schedule and you can
		easily copy it to other devices should you need to.
	</div>

	<!-- <div
		class="relative max-w-md my-8"
		in:fly={{ y: 5, duration: 1000 }}
		out:fade={{ y: -5, duration: 400 }}
	>
		<h2 class="text-xl font-bold">Preferences</h2>
		<div
			class="flex flex-col rounded-lg shadow bg-stone-50 p-6 mx-auto my-8"
			in:fly={{ x: 8, duration: 500 }}
		>
			<h3 class="text-lg font-medium leading-6 text-gray-900 mb-3">
				Track your progress with email
			</h3>
			<div class="mt-2 max-w-xl text-gray-500">
				<p>
					Filling in your email will automatically sign you up for a daily email-based tracking
					system. If you find it difficult to stay with the plan, the following days will be
					adjusted automatically to get you back on track.
				</p>
			</div>
			<form class="mt-5 sm:flex sm:items-center">
				<div class="w-full sm:max-w-xs">
					<label for="email" class="sr-only">Email</label>
					<input
						type="email"
						name="email"
						id="email"
						class="bg-transparent p-2 border-2 border-stone-200 rounded-lg items-center placeholder:text-stone-400 w-full"
						placeholder="you@example.com"
					/>
				</div>
				<button
					type="submit"
					class="mt-3 inline-flex w-full items-center justify-center rounded-md bg-indigo-600 border-2 border-indigo-600 px-4 py-2 font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
					>Update</button
				>
			</form>
		</div>
	</div> -->
{/if}

<style>
	.no-scrollbar {
		scrollbar-width: none;
		-ms-overflow-style: none;
	}
	.no-scrollbar::-webkit-scrollbar {
		display: none;
	}
</style>
