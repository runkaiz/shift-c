<script>
	import { onMount } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	import { next } from '$lib/progress';
	import Schedule from '$lib/components/Schedule.svelte';

	let shouldShow = false;

	onMount(() => {
		shouldShow = true;
	});
</script>

{#if shouldShow}
	<h2
		class=" text-2xl font-semibold text-gray-800 text-center mt-8"
		in:fly={{ y: 5, duration: 1000 }}
		out:fly={{ y: -5, duration: 500 }}
	>
		Here's the plan.<br />
	</h2>

	<div
		class="relative max-w-md space-x-8 mt-4 mb-8"
		in:fly={{ y: 5, duration: 1000 }}
		out:fade={{ y: -5, duration: 400 }}
	>
		<div
			class="flex flex-col rounded-lg shadow bg-stone-50 p-6 mx-auto my-8"
			in:fly={{ x: 8, duration: 500 }}
		>
			<h3 class="font-medium text-gray-800">
				<svg
					width="400"
					height="199"
					viewBox="0 0 400 199"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<g clip-path="url(#clip0_1_2)">
						<rect width="400" height="199" />
						<path
							d="M5.85553 123.521L53.8458 113.765C80.8761 108.27 107.266 99.9933 132.593 89.0678L245.605 40.3172C280.687 25.1838 317.757 15.1547 355.683 10.5356L396.856 5.52132"
							stroke="black"
							stroke-width="2"
						/>
						<path
							d="M5 193L39.9915 193C87.2889 193 134.212 184.612 178.579 168.224L260.536 137.954C293.699 125.705 328.339 117.907 363.552 114.763L394.5 112"
							stroke="black"
							stroke-width="2"
						/>
						<circle cx="6" cy="193" r="5" fill="white" stroke="black" stroke-width="2" />
						<circle cx="6" cy="124" r="5" fill="white" stroke="black" stroke-width="2" />
						<circle cx="394" cy="112" r="5" fill="white" stroke="black" stroke-width="2" />
						<circle cx="394" cy="6" r="5" fill="white" stroke="black" stroke-width="2" />
					</g>
					<defs>
						<clipPath id="clip0_1_2">
							<rect width="400" height="199" />
						</clipPath>
					</defs>
				</svg>
			</h3>
		</div>
		Over the next 7 days, you will be shifting your circadian clock forward by 30 minutes each day. This
		will be easier for you to go to sleep earlier and wake up earlier. At the same time, a conservative
		plan will help you to maintain your energy level. No dramatic ups and downs.
	</div>
	<div
		class="relative max-w-md my-8"
		in:fly={{ y: 5, duration: 1000 }}
		out:fade={{ y: -5, duration: 400 }}
	>
		<h2 class="text-xl font-bold">Daily details</h2>
		<div class="flex flex-row space-x-6 py-8 items-center">
			<div
				class="flex flex-col rounded-lg shadow bg-stone-50 p-6 grow"
				in:fly={{ x: 8, duration: 500 }}
			>
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
					Day 1.</span
				>
				<span class="text-3xl font-bold mt-10">22:15-7:00</span>
			</div>
			<div class="bg-gray-50 rounded-full p-4 w-14 h-14">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="1.5"
					stroke="currentColor"
					class="w-6 h-6"
				>
					<path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
				</svg>
			</div>
		</div>
		Your sleep schedule is planned by days. It is possible to have fluctuating bedtimes. Just try your
		best to stick to the wake up time.
	</div>
	<div
		class="relative max-w-md my-8"
		in:fly={{ y: 5, duration: 1000 }}
		out:fade={{ y: -5, duration: 400 }}
	>
		<h2 class="text-xl font-bold">Add to calendar</h2>
		<div class="mt-8 mb-4">
			<input
				type="text"
				class="bg-transparent p-2 border-2 border-stone-200 rounded-lg items-center placeholder:text-stone-400 w-full"
				value="https://shiftc.app/gCAEHv2sJxlBOcIOzixVIUG0xKG0mwANLmbvkmFryOI.ical"
			/>
		</div>
		<button class="underline underline-offset-3">Copy</button> the link above and add it to your calendar.
		This will be dynamically updated as you progress.
	</div>
	<div
		class="relative max-w-md my-8"
		in:fly={{ y: 5, duration: 1000 }}
		out:fade={{ y: -5, duration: 400 }}
	>
		<h2 class="text-xl font-bold">Preferences</h2>
		<div
			class="flex flex-col rounded-lg shadow bg-stone-50 p-6 mx-auto my-8"
			in:fly={{ x: 8, duration: 500 }}
		>
			<h3 class="text-lg font-medium leading-6 text-gray-900 mb-3">
				Track your progress with email
			</h3>
			<div class="mt-2 max-w-xl text-gray-500">
				<p>
					Filling in your email will automatically sign you up for a daily email-based tracking
					system. If you fail to stay with the plan, the following days will be adjusted
					automatically to get you back on track.
				</p>
			</div>
			<form class="mt-5 sm:flex sm:items-center">
				<div class="w-full sm:max-w-xs">
					<label for="email" class="sr-only">Email</label>
					<input
						type="email"
						name="email"
						id="email"
						class="bg-transparent p-2 border-2 border-stone-200 rounded-lg items-center placeholder:text-stone-400 w-full"
						placeholder="you@example.com"
					/>
				</div>
				<button
					type="submit"
					class="mt-3 inline-flex w-full items-center justify-center rounded-md bg-indigo-600 border-2 border-indigo-600 px-4 py-2 font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
					>Update</button
				>
			</form>
		</div>
	</div>
{/if}
