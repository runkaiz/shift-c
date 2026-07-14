<script>
	import { _ } from 'svelte-i18n';

	export let data;
	export let form;
</script>

<div class="max-w-md mx-auto my-16 px-4 text-center">
	{#if !data.found}
		<h1 class="text-2xl font-semibold text-gray-800">{$_('unsubscribe.notFoundTitle')}</h1>
		<p class="mt-3 text-gray-600">{$_('unsubscribe.notFoundBody')}</p>
	{:else if form?.done || data.alreadyUnsubscribed}
		<h1 class="text-2xl font-semibold text-gray-800">{$_('unsubscribe.doneTitle')}</h1>
		<p class="mt-3 text-gray-600">
			{$_('unsubscribe.doneBody')}
		</p>
	{:else}
		<h1 class="text-2xl font-semibold text-gray-800">{$_('unsubscribe.confirmTitle')}</h1>
		<p class="mt-3 text-gray-600">
			{$_('unsubscribe.confirmBody')}
		</p>
		<form method="POST" class="mt-6">
			<button
				type="submit"
				class="rounded-md bg-indigo-600 border-2 border-indigo-600 px-4 py-2 font-medium text-white shadow-sm hover:bg-indigo-700"
			>
				{$_('unsubscribe.cta')}
			</button>
		</form>
	{/if}
</div>
