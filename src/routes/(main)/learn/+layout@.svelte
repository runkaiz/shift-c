<script>
	import { resume } from '$lib/progress';

	import '$lib/tailwind.css';

	let hide = false;
</script>

<svelte:head>
	<link href="https://cdn.jsdelivr.net/npm/remixicon@2.5.0/fonts/remixicon.css" rel="stylesheet" />
</svelte:head>

<div class="h-full overflow-auto bg-stone-100">
	<!-- Top Bar -->
	<div class="fixed z-50 top-0 left-0 right-0 p-4 flex flex-row justify-between">
		<p class="text-lg font-medium"><a href="/">Shift</a></p>
		<p class="text-lg text-indigo-600">
			<button
				class={hide ? 'hidden' : ''}
				on:click={() => {
					hide = true;
					resume({ data: { learn: 'finished' } });
				}}>Continue</button
			>
		</p>
	</div>
	<!-- Content area -->
	<div class="flex min-h-screen">
		<div class="flex mx-auto max-w-5xl px-8 py-16">
			<div class="relative flex flex-col items-center">
				<slot />
			</div>
		</div>
	</div>
</div>
