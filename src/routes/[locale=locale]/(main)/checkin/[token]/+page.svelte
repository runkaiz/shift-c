<script>
	import { page } from '$app/stores';
	import { _ } from 'svelte-i18n';
	import moment from 'moment/moment';

	const token = $page.params.token;
	const date = $page.url.searchParams.get('date') ?? moment().format('YYYY-MM-DD');

	let status = 'idle'; // 'idle' | 'submitting' | 'done' | 'error'
	let mode = 'ask'; // 'ask' | 'reportBedtime'
	let reportedBedtime = '';
	let errorMessage = '';

	async function submit(stuckToPlan) {
		status = 'submitting';
		errorMessage = '';

		try {
			const res = await fetch(`/api/checkin/${token}`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					date,
					stuckToPlan,
					reportedBedtime: stuckToPlan ? undefined : reportedBedtime
				})
			});
			if (!res.ok) throw new Error(await res.text());
			status = 'done';
		} catch {
			errorMessage = $_('checkin.error');
			status = 'error';
		}
	}

	function handleYes() {
		submit(true);
	}

	function handleNoStart() {
		mode = 'reportBedtime';
	}

	function handleNoSubmit() {
		submit(false);
	}
</script>

<div class="max-w-md mx-auto my-16 px-4">
	{#if status === 'done'}
		<h1 class="text-2xl font-semibold text-gray-800">{$_('checkin.thanksTitle')}</h1>
		<p class="mt-3 text-gray-600">
			{$_('checkin.thanksBody')}
		</p>
	{:else}
		<h1 class="text-2xl font-semibold text-gray-800">{$_('checkin.question')}</h1>

		{#if mode === 'ask'}
			<div class="mt-6 flex gap-3">
				<button
					type="button"
					disabled={status === 'submitting'}
					class="flex-1 rounded-md bg-indigo-600 border-2 border-indigo-600 px-4 py-2 font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50"
					on:click={handleYes}
				>
					{$_('common.yes')}
				</button>
				<button
					type="button"
					disabled={status === 'submitting'}
					class="flex-1 rounded-md bg-stone-50 border-2 border-stone-200 px-4 py-2 font-medium text-gray-700 shadow-sm hover:bg-stone-100 disabled:opacity-50"
					on:click={handleNoStart}
				>
					{$_('common.no')}
				</button>
			</div>
		{:else}
			<div class="mt-6">
				<label for="bedtime" class="block text-sm font-medium text-gray-700 mb-2">
					{$_('checkin.bedtimeQuestion')}
				</label>
				<input
					type="time"
					id="bedtime"
					bind:value={reportedBedtime}
					class="bg-transparent p-2 border-2 border-stone-200 rounded-lg w-full"
				/>
				<button
					type="button"
					disabled={!reportedBedtime || status === 'submitting'}
					class="mt-4 w-full rounded-md bg-indigo-600 border-2 border-indigo-600 px-4 py-2 font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50"
					on:click={handleNoSubmit}
				>
					{status === 'submitting' ? $_('checkin.submitting') : $_('checkin.submitAndAdjust')}
				</button>
			</div>
		{/if}

		{#if status === 'error'}
			<p class="mt-3 text-sm text-red-600">{errorMessage}</p>
		{/if}
	{/if}
</div>
