<script>
	import '$lib/tailwind.css';
	let soundOn = false;
</script>

<svelte:head>
	<link href="https://cdn.jsdelivr.net/npm/remixicon@2.5.0/fonts/remixicon.css" rel="stylesheet" />
	<script
		async
		defer
		data-website-id="7f58609e-0ca4-4ece-a15b-e863ba42bf51"
		src="https://umami.y3.ink/umami.js"
	></script>
</svelte:head>

<div class="h-full overflow-auto bg-stone-100">
	<!-- Top Bar -->
	<div
		class="fixed z-50 top-0 left-0 right-0 p-4 flex flex-row justify-between bg-stone-100/80 backdrop-blur-3xl"
	>
		<p class="text-lg font-medium"><a href="/">Shift</a></p>
		<button
			label=""
			on:click={() => {
				soundOn = !soundOn;
			}}
		>
			{#if soundOn}
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-6 w-6"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
					/>
				</svg>
				<span class="sr-only">Mute</span>
			{:else}
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-6 w-6"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
						clip-rule="evenodd"
					/>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
					/>
				</svg>
				<span class="sr-only">Unmute</span>
			{/if}
		</button>
	</div>
	<!-- Content area -->
	<div class="flex min-h-screen justify-center items-center">
		<div class="flex justify-center mx-auto max-w-5xl px-4 lg:px-8 py-16">
			<div class="relative flex flex-col justify-center items-center">
				<slot />
			</div>
		</div>
	</div>
</div>
