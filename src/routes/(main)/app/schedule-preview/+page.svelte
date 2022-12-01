<script>
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { fade, fly } from 'svelte/transition';

	import { lightTreatment } from '$lib/stores';

	import moment from 'moment/moment';
	import DayCard from '$lib/components/DayCard.svelte';

	import { read } from '$lib/progress';

	let shouldShow = false;

	let position = 0;
	let day = '';
	let time = '';

	let enableBLT = false;

	let wakeIntervention = [];
	let sleepIntervention = [];
	let bltIntervention = [];

	let interventionDays = 0;

	function algoTime(data) {
		enableBLT = lightTreatment; // Determine whether to use BLT
		let testBLTOffset = null;

		if (enableBLT) {
			testBLTOffset = moment.duration(30, 'minutes'); // For example, the user indicates they want to do BLT 30 minutes after waking up.
		}

		const testIncrement = 30; // In minutes, I am using this because duration is too complicated

		const testInterventionStart = moment(new Date().toISOString(), moment.ISO_8601).add(1, 'days');

		const testCurrentWakeTime = moment(data.current.wakeup, ['HH:mm']);
		const testCurrentSleepTime = moment(data.current.bedtime, ['HH:mm']);
		if (testCurrentWakeTime.diff(testCurrentSleepTime) < 0) {
			testCurrentSleepTime.subtract(moment.duration(1, 'days'));
		}

		const testTargetWakeTime = moment(data.goal.wakeup, ['HH:mm']);
		const testTargetSleepTime = moment(data.goal.bedtime, ['HH:mm']);
		if (testTargetWakeTime.diff(testTargetSleepTime) < 0) {
			testTargetSleepTime.subtract(moment.duration(1, 'days'));
		}

		// Algorithm Time
		if (
			testCurrentWakeTime.diff(testTargetWakeTime) == 0 &&
			testCurrentSleepTime.diff(testTargetSleepTime) == 0
		) {
			console.log("Don't need no changes!");
			return false;
		}
		const wakeShift = testTargetWakeTime.diff(testCurrentWakeTime) / 60000; // Convert from milliseconds to minutes
		const sleepShift = testTargetSleepTime.diff(testCurrentSleepTime) / 60000;

		const wakeShiftDays = Math.abs(Math.ceil(wakeShift / testIncrement)); // Round up so we don't have half days.
		const sleepShiftDays = Math.abs(Math.ceil(sleepShift / testIncrement));

		interventionDays = wakeShiftDays > sleepShiftDays ? wakeShiftDays : sleepShiftDays; // Max number of days for the intervention

		// Initialize the first items
		if (wakeShiftDays != 0) {
			if (wakeShift > 0) {
				wakeIntervention[0] = moment(testCurrentWakeTime).add(
					moment.duration(testIncrement, 'minutes')
				);
			} else {
				wakeIntervention[0] = moment(testCurrentWakeTime).subtract(
					moment.duration(testIncrement, 'minutes')
				);
			}
			wakeIntervention[0].year(testInterventionStart.year());
			wakeIntervention[0].month(testInterventionStart.month());
			wakeIntervention[0].date(testInterventionStart.date());

			if (enableBLT) {
				bltIntervention[0] = moment(wakeIntervention[0]).add(testBLTOffset);
			}
		} else {
			for (let i = 0; i < interventionDays; i++) {
				wakeIntervention[i] = moment(testCurrentWakeTime);
				wakeIntervention[i].year(testInterventionStart.year());
				wakeIntervention[i].month(testInterventionStart.month());
				wakeIntervention[i].date(testInterventionStart.date());
			}
		}

		if (sleepShiftDays != 0) {
			if (sleepShift > 0) {
				sleepIntervention[0] = moment(testCurrentSleepTime).add(
					moment.duration(testIncrement, 'minutes')
				);
			} else {
				sleepIntervention[0] = moment(testCurrentSleepTime).subtract(
					moment.duration(testIncrement, 'minutes')
				);
			}
			sleepIntervention[0].year(testInterventionStart.year());
			sleepIntervention[0].month(testInterventionStart.month());
			sleepIntervention[0].date(testInterventionStart.date());
		} else {
			for (let i = 0; i < interventionDays; i++) {
				sleepIntervention[i] = moment(testCurrentSleepTime);
				sleepIntervention[i].year(testInterventionStart.year());
				sleepIntervention[i].month(testInterventionStart.month());
				sleepIntervention[i].date(testInterventionStart.date());
			}
		}

		// Calculate the rest of the days
		for (let i = 1; i < interventionDays; i++) {
			if (i < wakeShiftDays) {
				if (wakeShift > 0) {
					wakeIntervention[i] = moment(wakeIntervention[i - 1])
						.add(moment.duration(testIncrement, 'minutes'))
						.add(moment.duration(1, 'days'));
				} else {
					let shift = moment(wakeIntervention[i - 1]);
					shift.add(moment.duration(1, 'days'));
					shift.subtract(moment.duration(testIncrement, 'minutes'));
					wakeIntervention[i] = shift;
				}
			} else {
				wakeIntervention[i] = moment(wakeIntervention[i - 1]).add(1, 'days');
			}

			if (i < sleepShiftDays) {
				if (sleepShift > 0) {
					sleepIntervention[i] = moment(sleepIntervention[i - 1])
						.add(moment.duration(testIncrement, 'minutes'))
						.add(moment.duration(1, 'days'));
				} else {
					sleepIntervention[i] = moment(sleepIntervention[i - 1])
						.subtract(moment.duration(testIncrement, 'minutes'))
						.add(moment.duration(1, 'days'));
				}
			} else {
				sleepIntervention[i] = moment(sleepIntervention[i - 1]).add(1, 'days');
			}

			if (enableBLT) {
				bltIntervention[i] = moment(wakeIntervention[i]).add(testBLTOffset);
			}
		}

		return true;
	}

	function displayDay(p) {
		position = p;
		day = 'Day ' + (p + 1);
		time = `${sleepIntervention[p].format('HH:mm')} - ${wakeIntervention[p].format('HH:mm')}`;
	}

	async function downloadSchedule(data) {
        let now = new Date()
		let calendarURL = new URLSearchParams();
		calendarURL.append('blt', enableBLT ? '1' : '0');
		calendarURL.append('cWake', data.current.wakeup);
		calendarURL.append('cSleep', data.current.bedtime);
		calendarURL.append('gWake', data.goal.wakeup);
		calendarURL.append('gSleep', data.goal.bedtime);
		calendarURL.append('tz', now.getTimezoneOffset());
        calendarURL.append('n', now.toISOString())

		goto('/api/generate-ical?' + calendarURL.toString());
	}

	onMount(async () => {
		if (algoTime(read().data)) {
			displayDay(0);
			shouldShow = true;
		}
	});
</script>

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
		Over the next 7 days, you will be shifting your circadian clock forward by 30 minutes each day. This
		will be easier for you to go to sleep earlier and wake up earlier. At the same time, a conservative
		plan will help you to maintain your energy level. No dramatic ups and downs.
	</div>

	<div
		class="relative max-w-md my-8"
		in:fly={{ y: 5, duration: 1000 }}
		out:fade={{ y: -5, duration: 400 }}
	>
		<h2 class="text-xl font-bold">Daily details</h2>
		<div class="flex flex-row space-x-6 py-8 items-center">
			<DayCard {day} {time} />
			<div>
				<div
					class="{position == 0
						? 'text-gray-300 cursor-default'
						: 'hover:shadow-md cursor-pointer'} bg-gray-50 rounded-full p-4 w-14 h-14 transition-all"
					on:click={() => {
						if (position > 0) {
							displayDay(position - 1);
						}
					}}
					on:keypress={() => {
						if (position > 0) {
							displayDay(position - 1);
						}
					}}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="1.5"
						stroke="currentColor"
						class="w-6 h-6"
					>
						<path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
					</svg>
				</div>
				<br />
				<div
					class="{position == interventionDays - 1
						? 'text-gray-300 cursor-default'
						: 'hover:shadow-md cursor-pointer'} bg-gray-50 rounded-full p-4 w-14 h-14 transition-all"
					disabled={position == interventionDays - 1}
					on:click={() => {
						if (position < interventionDays - 1) {
							displayDay(position + 1);
						}
					}}
					on:keypress={() => {
						if (position < interventionDays - 1) {
							displayDay(position + 1);
						}
					}}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="1.5"
						stroke="currentColor"
						class="w-6 h-6"
					>
						<path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
					</svg>
				</div>
			</div>
		</div>
		Your sleep schedule is planned by days. It is possible to have fluctuating bedtimes. Just try your
		best to stick to the wake up time.
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
