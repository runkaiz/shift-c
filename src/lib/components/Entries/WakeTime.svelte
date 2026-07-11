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
	colorClass="bg-orange-400"
	icon="wake"
	label="Aim to wake up around"
/>
