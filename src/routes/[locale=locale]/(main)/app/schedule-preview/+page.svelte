<script>
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	import { _ } from 'svelte-i18n';

	import { lightTreatment, bioTreatment, melatoninScreeningPassed } from '$lib/stores';
	import { MELATONIN_FEATURE_ENABLED } from '$lib/featureFlags';

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

	$: dayWord =
		interventionDays === 1
			? $_('schedulePreview.dayWord.singular')
			: $_('schedulePreview.dayWord.plural');

	function algoTime(data) {
		if (
			!data?.current?.wakeup ||
			!data?.current?.bedtime ||
			!data?.goal?.wakeup ||
			!data?.goal?.bedtime
		) {
			goto(`/${$page.params.locale}/app/start`);
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
				enableMelatonin: MELATONIN_FEATURE_ENABLED && $bioTreatment
			});
		} catch {
			goto(`/${$page.params.locale}/app/start`);
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
		const duration = minutes ? `${hours}h ${minutes}m` : `${hours}h`;
		return $_('schedulePreview.dailyDetails.inBed', { values: { duration } });
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
		calendarURL.append('bio', MELATONIN_FEATURE_ENABLED && $bioTreatment ? '1' : '0');
		calendarURL.append('cWake', data.current.wakeup);
		calendarURL.append('cSleep', data.current.bedtime);
		calendarURL.append('gWake', data.goal.wakeup);
		calendarURL.append('gSleep', data.goal.bedtime);
		calendarURL.append('tz', new moment().utcOffset());
		calendarURL.append('n', now.toISOString());
		calendarURL.append('locale', $page.params.locale);

		goto('/api/generate-ical?' + calendarURL.toString());
	}

	let email = '';
	let signupStatus = 'idle'; // 'idle' | 'submitting' | 'success' | 'error'
	let signupError = '';
	let subscribeUrl = '';
	let webcalUrl = '';
	let justCopied = false;

	async function signUpForTracking(data) {
		signupStatus = 'submitting';
		signupError = '';

		const payload = {
			email,
			blt: $lightTreatment,
			bio: MELATONIN_FEATURE_ENABLED && $bioTreatment,
			melatoninScreeningPassed: $melatoninScreeningPassed,
			cWake: data.current.wakeup,
			cSleep: data.current.bedtime,
			gWake: data.goal.wakeup,
			gSleep: data.goal.bedtime,
			tz: new moment().utcOffset(),
			locale: $page.params.locale
		};

		try {
			const res = await fetch('/api/plans', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload)
			});
			if (!res.ok) throw new Error(await res.text());
			const { token } = await res.json();
			subscribeUrl = `${location.origin}/api/calendar/${token}.ics`;
			webcalUrl = subscribeUrl.replace(/^https?:\/\//, 'webcal://');
			signupStatus = 'success';
		} catch {
			signupError = $_('schedulePreview.calendar.signupError');
			signupStatus = 'error';
		}
	}

	function copySubscribeUrl() {
		navigator.clipboard?.writeText(subscribeUrl)?.catch(() => {});
		justCopied = true;
		setTimeout(() => (justCopied = false), 1500);
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
		{$_('schedulePreview.title')}<br />
	</h2>

	<div
		class="relative max-w-md my-8"
		in:fly={{ y: 5, duration: 1000 }}
		out:fade={{ y: -5, duration: 400 }}
	>
		{#if regime === 'delay'}
			{$_('schedulePreview.summary.delay', { values: { days: interventionDays, dayWord } })}
		{:else if regime === 'advance'}
			{$_('schedulePreview.summary.advance', { values: { days: interventionDays, dayWord } })}
		{:else}
			{$_('schedulePreview.summary.extension', { values: { days: interventionDays, dayWord } })}
		{/if}
	</div>

	<div
		class="relative max-w-md my-8"
		in:fly={{ y: 5, duration: 1000 }}
		out:fade={{ y: -5, duration: 400 }}
	>
		<h2 class="text-xl font-bold mb-6">{$_('schedulePreview.dailyDetails.title')}</h2>

		<div class="relative touch-pan-y" on:touchstart={handleTouchStart} on:touchend={handleTouchEnd}>
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
						melatoninDoseRangeMg={melatoninIntervention[position]
							? melatoninIntervention[position].doseRangeMg
							: null}
						melatoninChronobiotic={melatoninIntervention[position]
							? melatoninIntervention[position].chronobiotic
							: true}
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
				aria-label={$_('schedulePreview.dailyDetails.previousDay')}
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

			<div
				class="flex-1 flex items-center gap-1.5 overflow-x-auto snap-x snap-mandatory no-scrollbar py-1"
			>
				{#each Array(interventionDays) as unusedDay, i (i)}
					<button
						type="button"
						class="{i === position
							? 'bg-indigo-800 text-white'
							: 'bg-stone-200/70 text-stone-500 hover:bg-stone-300'} shrink-0 snap-center w-8 h-8 rounded-full text-xs font-medium transition-colors"
						aria-label={$_('schedulePreview.dailyDetails.goToDay', { values: { day: i + 1 } })}
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
				aria-label={$_('schedulePreview.dailyDetails.nextDay')}
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
			{$_('schedulePreview.dailyDetails.hint')}
		</p>
	</div>

	<div
		class="relative max-w-md my-8"
		in:fly={{ y: 5, duration: 1000 }}
		out:fade={{ y: -5, duration: 400 }}
	>
		<h2 class="text-xl font-bold">{$_('schedulePreview.calendar.title')}</h2>
		<div
			class="flex flex-col rounded-lg shadow bg-stone-50 p-6 mx-auto my-8"
			in:fly={{ x: 8, duration: 500 }}
		>
			<h3 class="text-lg font-medium leading-6 text-gray-900 mb-3">
				{$_('schedulePreview.calendar.subscribeTitle')}
			</h3>
			<div class="mt-2 max-w-xl text-gray-500">
				<p>
					{$_('schedulePreview.calendar.subscribeDescription')}
				</p>
			</div>

			{#if signupStatus === 'success'}
				<div class="mt-5 text-sm text-gray-700">
					<p>{$_('schedulePreview.calendar.successIntro')}</p>
					<p class="mt-3 font-medium text-gray-900">
						{$_('schedulePreview.calendar.subscribeCta')}
					</p>
					<a
						href={webcalUrl}
						class="mt-2 inline-block text-indigo-700 underline underline-offset-2"
					>
						{$_('schedulePreview.calendar.openInCalendarApp')}
					</a>
					<div class="mt-2 flex items-center gap-2">
						<input
							type="text"
							readonly
							value={subscribeUrl}
							class="bg-white p-2 border-2 border-stone-200 rounded-lg w-full text-xs text-stone-600"
							on:click={(e) => e.currentTarget.select()}
						/>
						<button
							type="button"
							class="shrink-0 rounded-md bg-indigo-600 border-2 border-indigo-600 px-3 py-2 text-xs font-medium text-white shadow-sm hover:bg-indigo-700"
							on:click={copySubscribeUrl}
							>{justCopied
								? $_('schedulePreview.calendar.copied')
								: $_('schedulePreview.calendar.copyLink')}</button
						>
					</div>
					<p class="mt-2 text-xs text-stone-400">
						{$_('schedulePreview.calendar.addSubscriptionHint')}
					</p>
				</div>
			{:else}
				<form
					class="mt-5 sm:flex sm:items-center"
					on:submit|preventDefault={() => signUpForTracking(read().data)}
				>
					<div class="w-full sm:max-w-xs">
						<label for="email" class="sr-only">{$_('schedulePreview.calendar.emailLabel')}</label>
						<input
							type="email"
							name="email"
							id="email"
							required
							bind:value={email}
							disabled={signupStatus === 'submitting'}
							class="bg-transparent p-2 border-2 border-stone-200 rounded-lg items-center placeholder:text-stone-400 w-full"
							placeholder={$_('schedulePreview.calendar.emailPlaceholder')}
						/>
					</div>
					<button
						type="submit"
						disabled={signupStatus === 'submitting'}
						class="mt-3 inline-flex w-full items-center justify-center rounded-md bg-indigo-600 border-2 border-indigo-600 px-4 py-2 font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 sm:mt-0 sm:ms-3 sm:w-auto sm:text-sm"
						>{signupStatus === 'submitting'
							? $_('schedulePreview.calendar.signingUp')
							: $_('schedulePreview.calendar.update')}</button
					>
				</form>
				{#if signupStatus === 'error'}
					<p class="mt-2 text-sm text-red-600">{signupError}</p>
				{/if}
				<p class="mt-4 text-xs text-stone-400">
					{$_('schedulePreview.calendar.preferNotToShare')}
					<button
						type="button"
						class="underline underline-offset-2"
						on:click={() => downloadSchedule(read().data)}
						>{$_('schedulePreview.calendar.downloadOneTime')}</button
					>
					{$_('schedulePreview.calendar.downloadHint')}
				</p>
			{/if}
		</div>
	</div>
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
