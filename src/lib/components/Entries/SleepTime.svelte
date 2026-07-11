<script>
	import Entry from './Entry.svelte';

	export let time = '';
	export let date = '';
	export let isLast = false;
</script>

<Entry {time} {date} {isLast} colorClass="bg-purple-400" icon="sleep" label="Aim to sleep around" />
