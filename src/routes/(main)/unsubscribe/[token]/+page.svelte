<script>
	export let data;
	export let form;
</script>

<div class="max-w-md mx-auto my-16 px-4 text-center">
	{#if !data.found}
		<h1 class="text-2xl font-semibold text-gray-800">Link not found</h1>
		<p class="mt-3 text-gray-600">This unsubscribe link doesn't match an active plan.</p>
	{:else if form?.done || data.alreadyUnsubscribed}
		<h1 class="text-2xl font-semibold text-gray-800">You're unsubscribed</h1>
		<p class="mt-3 text-gray-600">
			We won't send any more daily check-in emails for this plan. Your calendar subscription (if
			you're using one) will keep working.
		</p>
	{:else}
		<h1 class="text-2xl font-semibold text-gray-800">Unsubscribe from daily check-in emails?</h1>
		<p class="mt-3 text-gray-600">
			You'll stop getting the daily "did you stick with your plan?" emails. Your calendar
			subscription (if you're using one) will keep working.
		</p>
		<form method="POST" class="mt-6">
			<button
				type="submit"
				class="rounded-md bg-indigo-600 border-2 border-indigo-600 px-4 py-2 font-medium text-white shadow-sm hover:bg-indigo-700"
			>
				Unsubscribe
			</button>
		</form>
	{/if}
</div>
