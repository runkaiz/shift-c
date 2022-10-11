<script>
	import Line from './Line.svelte';

	export let time = '';
	export let date = '';
	export let isLast = false;
</script>

<li>
	<div class="relative pb-10">
		{#if !isLast}
			<Line />
		{/if}
		<div class="relative flex space-x-5">
			<div>
				<span
					class="h-12 w-12 rounded-full bg-orange-400 flex items-center justify-center ring-8 ring-white"
				>
					<svg
						class="h-8 w-8 text-white"
						xmlns="http://www.w3.org/2000/svg"
						fill="currentColor"
						viewBox="0 0 24 24"
						strokeWidth={1.5}
						stroke="currentColor"
						aria-hidden="true"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
						/>
					</svg>
				</span>
			</div>
			<div class="flex min-w-0 flex-1 justify-between space-x-4 pt-3">
				<div>
					<p class="text-sm text-gray-500">
						Aim to wake up around <span class="font-medium text-gray-900">{time}</span>
					</p>
				</div>
				<div class="whitespace-nowrap text-right text-sm text-gray-500">
					<time datetime={date}>{date}</time>
				</div>
			</div>
		</div>
	</div>
</li>
