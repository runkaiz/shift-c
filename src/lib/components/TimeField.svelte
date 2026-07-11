<script>
	export let time = '00:00';
	export let placeholder = '00:00';

	const timeValidRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

	// Tracks which input id (if any) most recently rejected a keystroke, so we
	// can show a brief, non-disruptive invalid cue on just that input.
	let invalidInputId = null;

	const segments = [
		{
			id: 'goal-bedtime-hour-1',
			charIndex: 0,
			nextId: 'goal-bedtime-hour-2',
			label: 'Hour, first digit'
		},
		{
			id: 'goal-bedtime-hour-2',
			charIndex: 1,
			nextId: 'goal-bedtime-minute-1',
			label: 'Hour, second digit'
		},
		{
			id: 'goal-bedtime-minute-1',
			charIndex: 3,
			nextId: 'goal-bedtime-minute-2',
			label: 'Minute, first digit'
		},
		{ id: 'goal-bedtime-minute-2', charIndex: 4, nextId: null, label: 'Minute, second digit' }
	];

	function flagInvalid(id) {
		invalidInputId = id;
		setTimeout(() => {
			if (invalidInputId === id) {
				invalidInputId = null;
			}
		}, 600);
	}

	function handleSegmentInput(e, charIndex, nextInputId) {
		if (isNaN(e.target.value)) {
			e.target.value = '';
			flagInvalid(e.target.id);
		}
		if (e.target.value.length > 1) {
			e.target.value = e.target.value.slice(0, 1);
		}
		if (e.target.value.length === 1) {
			const chars = Array.from(time);
			chars[charIndex] = e.target.value;
			if (timeValidRegex.test(chars.join(''))) {
				time = chars.join('');
			} else {
				e.target.value = '';
				flagInvalid(e.target.id);
			}
			if (nextInputId) {
				document.getElementById(nextInputId).focus();
			}
		}
	}
</script>

<div class="flex flex-row space-x-4 mt-5">
	{#each segments as segment, i (segment.id)}
		<input
			type="text"
			placeholder={placeholder.substring(segment.charIndex, segment.charIndex + 1)}
			id={segment.id}
			aria-label={segment.label}
			aria-invalid={invalidInputId === segment.id}
			class="bg-transparent h-16 w-12 border-2 rounded-lg flex items-center text-center text-3xl placeholder:text-stone-400 {invalidInputId ===
			segment.id
				? 'border-red-500'
				: 'border-stone-200'}"
			on:input={(e) => handleSegmentInput(e, segment.charIndex, segment.nextId)}
		/>
		{#if i === 1}
			<p class="text-4xl my-2">:</p>
		{/if}
	{/each}
</div>
