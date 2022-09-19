<script>
	import { goto } from '$app/navigation';

	import { onMount } from 'svelte';
	import { fade, fly } from 'svelte/transition';

	let shouldShow = false;

	onMount(() => {
		shouldShow = true;
	});
</script>

{#if shouldShow}
	<h2
		class="mt-24 text-4xl font-semibold text-gray-800 text-center"
		in:fly={{ y: 5, duration: 1000 }}
		out:fly={{ y: -5, duration: 500 }}
	>
		Your circadian rhythm.<br />
	</h2>
	<div
		class="max-w-xl my-16 leading-relaxed"
		in:fade={{ duration: 500 }}
		out:fade={{ duration: 200 }}
	>
		<p>
			The key to mastering your sleep schedule (or jet lag) is understanding that your circadian
			rhythm is... actually two things! They work together to make you sleepy or sleepless.
		</p>
		<p class="pt-4">
			Your biological clock. If the time you go to sleep and wake up is relatively consistent, your
			biological clock will make you feel more or less alert in a predictable way. If you usually
			wake up at 7:00 am and go to sleep at 10:00 pm, your biological clock will make you feel alert
			around 7:00 am and less alert around 10:00 pm. But your biological clock alone usually can't
			put you to sleep. You will need your sleep pressure too.
		</p>
		<p class="pt-4">
			Your sleep pressure builds up as you spend more time being awake. Usually, we start to feel
			tired after staying awake for 16 consecutive hours. Sleep pressure is kind of like a battery
			that runs out. This is why after a late night and sleep-in, you might feel like you can't fall
			asleep at your usual bedtime. You haven't been awake for a long enough time to build up your
			sleep pressure, so a dip in alertness isn't enough to put you asleep. It's hard to fall asleep
			when you still have 50% of your battery left.
		</p>
		<p class="pt-4">
			So, your sleep pressure and your biological clock work kind of like a battery and a charger.
			For you to power off, you need to have a near-empty battery and the charger unplugged. Your
			biological clock controls the time to pull the plug, but it only gives your a small time
			window before starting to charge again over your usual sleep time. This is why you tend to
			feel less sleepy as you pass your usual bedtime (at least for a while).
		</p>
		<p class="pt-4">
			Hmmm... But what if you start waking up at 11:00 am and going to sleep at 3:00 am? Your
			biological clock will adjust to make you feel alert around 11:00 am and sleepy around 3:00 am.
			It really doesn't care about the objective time of day. It's all about your personal time of
			day. That's why after a while, you'll notice it's tough to fall asleep at 11 pm again;
			biological clock thinks 11 pm is just the beginning of your evening. Time to pArTay!
		</p>
	</div>
	<!-- <div class="flex flex-row max-w-xl space-x-8 my-16" out:fade={{ duration: 400 }}>
		<div
			class="basis-1/2 flex flex-col justify-start items-start rounded-lg bg-stone-50 ring-2 ring-stone-200 p-8 space-y-8"
			in:fly={{ y: 5, duration: 1000, delay: 1000 }}
		>
			<div>
				<img
					src="https://imagedelivery.net/4v3KB3Aeo_3sLg3kKoifCw/8d642a09-8bcf-427e-5509-e523c2140e00/public"
					alt="Alarm clock"
					class="w-16"
				/>
			</div>
			<p class="text-lg text-stone-600">
				<span class="font-medium text-stone-800">Your biological clock</span>
				makes you feel alert in your morning and tired in your evening.
			</p>
		</div>

		<div
			class="basis-1/2 flex flex-col justify-start items-start rounded-lg bg-stone-50 ring-2 ring-stone-200 p-8 space-y-8"
			in:fly={{ y: 5, duration: 1000, delay: 2000 }}
		>
			<div>
				<img
					src="https://imagedelivery.net/4v3KB3Aeo_3sLg3kKoifCw/e022f310-0aec-4344-5303-fc6144e85b00/public"
					alt="Battery"
					class="w-16"
				/>
			</div>
			<p class="text-lg text-stone-600">
				<span class="font-medium text-stone-800">Your sleep pressure</span>
				adds to your tiredness (or alertness) to make you feel sleepy (or sleepless).
			</p>
		</div>
	</div> -->
{/if}
