<script>
	import Entry from './Entry.svelte';

	export let time = '';
	export let date = '';
	export let isLast = false;
</script>

<Entry
	{time}
	{date}
	{isLast}
	colorClass="bg-yellow-400"
	icon="blt"
	label="Get some bright light around"
/>
