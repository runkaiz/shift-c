<script>
	import { onMount, onDestroy, createEventDispatcher } from 'svelte';
	import { fade, fly } from 'svelte/transition';

	export let title = '';

	const dispatch = createEventDispatcher();
	function close() {
		dispatch('close');
	}
	function handleKeydown(e) {
		if (e.key === 'Escape') close();
	}
	function handleBackdropClick(e) {
		if (e.target === e.currentTarget) close();
	}

	onMount(() => {
		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		return () => {
			document.body.style.overflow = previousOverflow;
		};
	});
	onDestroy(() => {
		document.body.style.overflow = '';
	});
</script>

<svelte:window on:keydown={handleKeydown} />

<div
	class="fixed inset-0 z-50 flex items-center justify-center sm:p-4 bg-black/50"
	role="presentation"
	on:click={handleBackdropClick}
	transition:fade={{ duration: 150 }}
>
	<div
		class="bg-white sm:rounded-lg shadow-xl w-full h-full sm:h-auto sm:max-w-lg sm:max-h-[85vh] overflow-y-auto p-6 sm:p-8"
		role="dialog"
		aria-modal="true"
		aria-label={title}
		in:fly={{ y: 12, duration: 200 }}
	>
		<div class="flex items-start justify-between gap-4 mb-4">
			<h3 class="text-xl font-bold text-gray-900">{title}</h3>
			<button
				type="button"
				class="shrink-0 text-stone-400 hover:text-stone-600"
				on:click={close}
				aria-label="Close"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="1.5"
					stroke="currentColor"
					class="w-6 h-6"
				>
					<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
				</svg>
			</button>
		</div>
		<div class="text-lg text-stone-600 space-y-3 leading-relaxed">
			<slot />
		</div>
	</div>
</div>
