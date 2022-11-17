<script>
	import { fly } from 'svelte/transition';

    export let day = "Unknown Day";
    export let time = "22:15-7:00";
</script>

<div class="flex flex-col rounded-lg shadow bg-stone-50 p-6 grow" in:fly={{ x: 8, duration: 500 }}>
	<span class="inline-flex items-center">
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 20 20"
			fill="currentColor"
			class="w-5 h-5 mr-2"
		>
			<path
				fill-rule="evenodd"
				d="M7.455 2.004a.75.75 0 01.26.77 7 7 0 009.958 7.967.75.75 0 011.067.853A8.5 8.5 0 116.647 1.921a.75.75 0 01.808.083z"
				clip-rule="evenodd"
			/>
		</svg>
		{day}</span
	>
	<span class="text-3xl font-bold mt-10">{time}</span>
</div>
