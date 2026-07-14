<script>
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { _ } from 'svelte-i18n';

	import { LOCALE_NAMES, SUPPORTED_LOCALES } from '$lib/i18n/constants';

	let open = false;
	let container;

	$: currentLocale = $page.params.locale;

	function pathForLocale(newLocale) {
		const segments = $page.url.pathname.split('/');
		segments[1] = newLocale;
		return segments.join('/') + $page.url.search;
	}

	function select(newLocale) {
		open = false;
		if (newLocale === currentLocale) return;

		document.cookie = `locale=${newLocale};path=/;max-age=31536000;samesite=lax`;
		goto(pathForLocale(newLocale));
	}

	function handleWindowClick(event) {
		if (open && container && !container.contains(event.target)) {
			open = false;
		}
	}
</script>

<svelte:window on:click={handleWindowClick} />

<div class="relative" bind:this={container}>
	<button
		type="button"
		class="flex items-center gap-1 text-sm font-medium text-stone-700"
		aria-label={$_('nav.languageSwitcher.label')}
		aria-haspopup="listbox"
		aria-expanded={open}
		on:click={() => (open = !open)}
	>
		<i class="ri-global-line text-lg" aria-hidden="true" />
		<span>{LOCALE_NAMES[currentLocale]}</span>
	</button>

	{#if open}
		<ul
			class="absolute end-0 mt-2 w-36 rounded-md bg-white shadow-lg ring-1 ring-black/5 py-1 z-50"
			role="listbox"
		>
			{#each SUPPORTED_LOCALES as loc (loc)}
				<li>
					<button
						type="button"
						class="w-full text-start px-3 py-1.5 text-sm hover:bg-stone-100 {loc === currentLocale
							? 'font-semibold text-indigo-600'
							: 'text-stone-700'}"
						role="option"
						aria-selected={loc === currentLocale}
						on:click={() => select(loc)}
					>
						{LOCALE_NAMES[loc]}
					</button>
				</li>
			{/each}
		</ul>
	{/if}
</div>
