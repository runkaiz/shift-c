<script>
	import Blt from './Entries/BLT.svelte';
	import SleepTime from './Entries/SleepTime.svelte';
	import WakeTime from './Entries/WakeTime.svelte';

	// TODO: I will relocate this somewhere else if needed, also optimize later
	let day1 = new Date();
	let day2 = new Date(day1);
	let day3 = new Date(day1);
	let day4 = new Date(day1);
	let day5 = new Date(day1);
	let day6 = new Date(day1);
	let day7 = new Date(day1);
	let day8 = new Date(day1);
	let day9 = new Date(day1);
	let day10 = new Date(day1);
	let day11 = new Date(day1);
	let day12 = new Date(day1);
	let day13 = new Date(day1);
	let day14 = new Date(day1);

	day2.setDate(day1.getDate() + 1);
	day3.setDate(day1.getDate() + 2);
	day4.setDate(day1.getDate() + 3);
	day5.setDate(day1.getDate() + 4);
	day6.setDate(day1.getDate() + 5);
	day7.setDate(day1.getDate() + 6);
	day8.setDate(day1.getDate() + 7);
	day9.setDate(day1.getDate() + 8);
	day10.setDate(day1.getDate() + 9);
	day11.setDate(day1.getDate() + 10);
	day12.setDate(day1.getDate() + 11);
	day13.setDate(day1.getDate() + 12);
	day14.setDate(day1.getDate() + 13);
</script>

<!-- Web view -->
<div class="print:hidden">
	<div class="flow-root">
		<ul class="-mb-8">
			<WakeTime date={day1.toDateString()} time="10:00AM" />
            <Blt date={day1.toDateString()} time="10:30AM"/>
			<SleepTime date={day1.toDateString()} time="9:20PM" />
			<WakeTime date={day2.toDateString()} time="10:00AM" />
			<SleepTime date={day2.toDateString()} time="9:20PM" />
			<WakeTime date={day3.toDateString()} time="10:00AM" />
			<WakeTime date={day3.toDateString()} time="10:00AM" />
			<SleepTime date={day4.toDateString()} time="9:20PM" />
			<WakeTime date={day4.toDateString()} time="10:00AM" />
			<SleepTime date={day5.toDateString()} time="9:20PM" />
			<WakeTime date={day5.toDateString()} time="10:00AM" />
			<WakeTime date={day6.toDateString()} time="10:00AM" />
			<SleepTime date={day6.toDateString()} time="9:20PM" />
			<WakeTime date={day7.toDateString()} time="10:00AM" />
			<SleepTime date={day7.toDateString()} time="9:20PM" />
			<WakeTime date={day8.toDateString()} time="10:00AM" />
			<SleepTime date={day8.toDateString()} time="9:20PM" isLast />
		</ul>
	</div>
</div>

<!-- Print view -->
<div class="hidden print:block">
	<div class="flow-root">
		<ul class="-mb-8">
			<WakeTime date={day1.toDateString()} time="10:00AM" />
			<SleepTime date={day1.toDateString()} time="9:20PM" />
			<WakeTime date={day2.toDateString()} time="10:00AM" />
			<SleepTime date={day2.toDateString()} time="9:20PM" />
			<WakeTime date={day3.toDateString()} time="10:00AM" />
			<WakeTime date={day3.toDateString()} time="10:00AM" />
			<SleepTime date={day4.toDateString()} time="9:20PM" />
			<WakeTime date={day4.toDateString()} time="10:00AM" />
			<SleepTime date={day5.toDateString()} time="9:20PM" />
			<WakeTime date={day5.toDateString()} time="10:00AM" />
			<WakeTime date={day6.toDateString()} time="10:00AM" />
			<SleepTime date={day6.toDateString()} time="9:20PM" />
			<WakeTime date={day7.toDateString()} time="10:00AM" />
			<SleepTime date={day7.toDateString()} time="9:20PM" />
			<WakeTime date={day8.toDateString()} time="10:00AM" />
			<SleepTime date={day8.toDateString()} time="9:20PM" isLast />
		</ul>
	</div>
</div>
