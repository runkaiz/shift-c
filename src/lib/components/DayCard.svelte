<script>
	import { MELATONIN_SAFETY_WARNING } from '$lib/melatonin';

	export let dayNumber = 1;
	export let totalDays = 1;
	export let dateLabel = '';
	export let bedTime = '--:--';
	export let wakeTime = '--:--';
	export let durationLabel = '';
	export let bltTime = null;
	export let melatoninTime = null;
	export let melatoninDoseRangeMg = null;
	export let melatoninChronobiotic = true;
</script>

<div
	class="flex flex-col rounded-2xl shadow-sm ring-1 ring-stone-200 bg-stone-50 p-6 sm:p-8 w-full"
>
	<div class="flex items-center justify-between">
		<span
			class="inline-flex items-center rounded-full bg-indigo-800/10 text-indigo-800 text-xs font-semibold px-2.5 py-1"
		>
			Day {dayNumber} of {totalDays}
		</span>
		{#if dateLabel}
			<span class="text-sm text-stone-500">{dateLabel}</span>
		{/if}
	</div>

	<div class="mt-8 flex items-stretch justify-between">
		<div class="flex flex-col items-start">
			<span
				class="inline-flex items-center gap-1.5 text-stone-500 text-xs font-medium uppercase tracking-wide"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 20 20"
					fill="currentColor"
					class="w-3.5 h-3.5"
					aria-hidden="true"
				>
					<path
						fill-rule="evenodd"
						d="M7.455 2.004a.75.75 0 01.26.77 7 7 0 009.958 7.967.75.75 0 011.067.853A8.5 8.5 0 116.647 1.921a.75.75 0 01.808.083z"
						clip-rule="evenodd"
					/>
				</svg>
				Bedtime
			</span>
			<span class="text-3xl sm:text-4xl font-bold text-stone-800 mt-1 tabular-nums">{bedTime}</span>
		</div>

		<div class="flex-1 flex flex-col items-center justify-end pb-1.5 px-3 sm:px-6 min-w-0">
			{#if durationLabel}
				<span class="text-xs text-stone-400 mb-1.5 whitespace-nowrap">{durationLabel}</span>
			{/if}
			<div class="w-full h-px bg-stone-300 relative">
				<span class="absolute left-0 -top-[3px] w-1.5 h-1.5 rounded-full bg-stone-400" />
				<span class="absolute right-0 -top-[3px] w-1.5 h-1.5 rounded-full bg-indigo-800" />
			</div>
		</div>

		<div class="flex flex-col items-end">
			<span
				class="inline-flex items-center gap-1.5 text-stone-500 text-xs font-medium uppercase tracking-wide"
			>
				Wake
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="1.5"
					stroke="currentColor"
					class="w-3.5 h-3.5"
					aria-hidden="true"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-6.364-.386 1.591-1.591M3 12h2.25m.386-6.364 1.591 1.591M12 8.25a3.75 3.75 0 100 7.5 3.75 3.75 0 000-7.5z"
					/>
				</svg>
			</span>
			<span class="text-3xl sm:text-4xl font-bold text-stone-800 mt-1 tabular-nums">{wakeTime}</span
			>
		</div>
	</div>

	{#if bltTime || melatoninTime}
		<div class="mt-8 pt-6 border-t border-stone-200 space-y-4">
			{#if bltTime}
				<div class="flex items-center gap-3">
					<span
						class="flex shrink-0 items-center justify-center w-9 h-9 rounded-full bg-amber-100 text-amber-600"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke-width="1.5"
							stroke="currentColor"
							class="w-5 h-5"
							aria-hidden="true"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-6.364-.386 1.591-1.591M3 12h2.25m.386-6.364 1.591 1.591M12 8.25a3.75 3.75 0 100 7.5 3.75 3.75 0 000-7.5z"
							/>
						</svg>
					</span>
					<div class="flex flex-col">
						<span class="text-sm font-medium text-stone-800">Bright light</span>
						<span class="text-xs text-stone-500">around {bltTime}</span>
					</div>
				</div>
			{/if}
			{#if melatoninTime}
				<div class="flex items-center gap-3">
					<span
						class="flex shrink-0 items-center justify-center w-9 h-9 rounded-full bg-indigo-100 text-indigo-700"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="1.5"
							class="w-5 h-5"
							aria-hidden="true"
						>
							<rect x="2.5" y="9.5" width="19" height="5" rx="2.5" transform="rotate(-45 12 12)" />
							<path d="M8.5 8.5l7 7" />
						</svg>
					</span>
					<div class="flex flex-col">
						<span class="text-sm font-medium text-stone-800"
							>Melatonin{melatoninChronobiotic ? '' : ' (optional)'} &middot; {melatoninDoseRangeMg?.[0]}&ndash;{melatoninDoseRangeMg?.[1]}
							mg</span
						>
						<span class="text-xs text-stone-500">around {melatoninTime}</span>
					</div>
				</div>
				{#if !melatoninChronobiotic}
					<p class="text-xs text-stone-400">
						Mainly a sleep-opportunity night — a consistent bedtime and a dark, cool room usually
						help more than this.
					</p>
				{/if}
				<p class="text-xs text-stone-400">{MELATONIN_SAFETY_WARNING}</p>
			{/if}
		</div>
	{/if}
</div>
