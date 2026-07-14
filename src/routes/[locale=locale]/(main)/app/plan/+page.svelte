<script>
	import { onMount } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	import { _ } from 'svelte-i18n';
	import { next } from '$lib/progress';

	import { lightTreatment, bioTreatment } from '$lib/stores';
	import { MELATONIN_FEATURE_ENABLED } from '$lib/featureFlags';
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
		{$_('plan.title')}<br />
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
					<span class="font-medium text-stone-800">{$_('plan.bedtime.label')}</span>
					{$_('plan.bedtime.text')}
				</p>
			</div>
			<button class="text-indigo-800 mt-8" on:click={() => (openModal = 'bedtime')}
				>{$_('common.learnMore')}</button
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
					<span class="font-medium text-stone-800">{$_('plan.light.label')}</span>
					{$_('plan.light.text')}
				</p>
			</div>
			<button class="text-indigo-800 mt-8" on:click|stopPropagation={() => (openModal = 'light')}
				>{$_('common.learnMore')}</button
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
						<span class="font-medium text-stone-800">{$_('plan.chronobiotics.label')}</span>
						{$_('plan.chronobiotics.text')}
					</p>
				</div>
				<button
					class="text-indigo-800 mt-8"
					on:click|stopPropagation={() => (openModal = 'chronobiotics')}
					>{$_('common.learnMore')}</button
				>
			</div>
		{/if}
	</div>
	<p
		class="max-w-3xl text-center"
		in:fly={{ y: 5, duration: 1000, delay: 4000 }}
		out:fade={{ duration: 400 }}
	>
		{$_('plan.hint.line1')}
		<br />
		{$_('plan.hint.line2')}
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
			{$_('common.next')}
		</button>
	</div>

	{#if openModal === 'bedtime'}
		<InfoModal title={$_('plan.modal.bedtime.title')} on:close={() => (openModal = null)}>
			<p>
				{$_('plan.modal.bedtime.paragraph1')}
			</p>
			<p>
				{$_('plan.modal.bedtime.paragraph2')}
			</p>
		</InfoModal>
	{:else if openModal === 'light'}
		<InfoModal title={$_('plan.modal.light.title')} on:close={() => (openModal = null)}>
			<p>
				{$_('plan.modal.light.paragraph1')}
			</p>
			<p>
				{$_('plan.modal.light.paragraph2')}
			</p>
			<p>
				{$_('plan.modal.light.paragraph3')}
			</p>
		</InfoModal>
	{:else if openModal === 'chronobiotics'}
		<InfoModal title={$_('plan.modal.chronobiotics.title')} on:close={() => (openModal = null)}>
			<p>
				{$_('plan.modal.chronobiotics.paragraph1')}
			</p>
			<p>
				{$_('plan.modal.chronobiotics.paragraph2')}
			</p>
			<p>
				{$_('plan.modal.chronobiotics.paragraph3')}
			</p>
			<p
				class="rounded-lg bg-amber-50 border-2 border-amber-200 px-4 py-3 font-medium text-amber-800"
			>
				{$_('melatonin.safetyWarning')}
			</p>
		</InfoModal>
	{/if}
{/if}
