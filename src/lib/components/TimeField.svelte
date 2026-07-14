<script>
	import { _ } from 'svelte-i18n';

	export let time = '00:00';
	export let placeholder = '00:00';
	// 'wake' | 'bedtime' | null - drives the 12h preview's "unusual for a
	// wake/bedtime" nudge below. Purely a UX aid, doesn't affect validation.
	export let kind = null;

	const timeValidRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

	// This field is plain 24h digits with no AM/PM concept at all (see the
	// segment inputs below) - someone who means "11:30 PM" but thinks in
	// 12h time can easily type "11:30" and get 11:30 AM instead, with
	// nothing in the raw digit entry to catch it. A live 12h readout plus a
	// one-tap fix for a time that's unusual for its kind (a 2pm bedtime, a
	// 9pm wake) surfaces that mismatch before the user moves on.
	// Hour ranges (inclusive) considered unusual enough to nudge on. Product
	// heuristics, not derived from any data - deliberately generous so
	// shift workers/night owls aren't constantly flagged.
	const UNUSUAL_HOUR_RANGES = { bedtime: [5, 17], wake: [14, 23] };

	function formatAmPm(hhmm) {
		const [h, m] = hhmm.split(':').map(Number);
		const period = h < 12 ? $_('components.timeField.am') : $_('components.timeField.pm');
		const h12 = h % 12 === 0 ? 12 : h % 12;
		return `${h12}:${String(m).padStart(2, '0')} ${period}`;
	}

	function flip12h(hhmm) {
		const [h, m] = hhmm.split(':').map(Number);
		return `${String((h + 12) % 24).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
	}

	// Each segment box only shows a digit once the user has actually typed
	// into it (see `filled` below) - preserves the original "empty until
	// typed, ghost placeholder until then" feel. The flip-to-other-half-of-
	// the-day button marks all four filled at once so the corrected digits
	// are actually visible, not just reflected in the preview text.
	let filled = [false, false, false, false];

	function applyFlip() {
		time = flip12h(time);
		filled = [true, true, true, true];
	}

	$: isValidTime = timeValidRegex.test(time);
	$: period = isValidTime
		? Number(time.split(':')[0]) < 12
			? $_('components.timeField.am')
			: $_('components.timeField.pm')
		: '';
	$: unusualRange = kind ? UNUSUAL_HOUR_RANGES[kind] : null;
	$: isUnusual =
		isValidTime &&
		unusualRange &&
		Number(time.split(':')[0]) >= unusualRange[0] &&
		Number(time.split(':')[0]) <= unusualRange[1];

	// Tracks which input id (if any) most recently rejected a keystroke, so we
	// can show a brief, non-disruptive invalid cue on just that input.
	let invalidInputId = null;

	$: segments = [
		{
			id: 'goal-bedtime-hour-1',
			charIndex: 0,
			nextId: 'goal-bedtime-hour-2',
			label: $_('components.timeField.hourFirstDigit')
		},
		{
			id: 'goal-bedtime-hour-2',
			charIndex: 1,
			nextId: 'goal-bedtime-minute-1',
			label: $_('components.timeField.hourSecondDigit')
		},
		{
			id: 'goal-bedtime-minute-1',
			charIndex: 3,
			nextId: 'goal-bedtime-minute-2',
			label: $_('components.timeField.minuteFirstDigit')
		},
		{
			id: 'goal-bedtime-minute-2',
			charIndex: 4,
			nextId: null,
			label: $_('components.timeField.minuteSecondDigit')
		}
	];

	function flagInvalid(id) {
		invalidInputId = id;
		setTimeout(() => {
			if (invalidInputId === id) {
				invalidInputId = null;
			}
		}, 600);
	}

	function handleSegmentInput(e, segmentIndex, charIndex, nextInputId) {
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
				filled[segmentIndex] = true;
			} else {
				e.target.value = '';
				flagInvalid(e.target.id);
			}
			if (nextInputId) {
				document.getElementById(nextInputId).focus();
			}
		}
	}

	function handleSegmentKeydown(e, prevIndex) {
		if (e.key !== 'Backspace' && e.key !== 'Delete') return;
		if (e.target.value !== '' || prevIndex < 0) return;
		e.preventDefault();
		filled[prevIndex] = false;
		const prevInput = document.getElementById(segments[prevIndex].id);
		prevInput.value = '';
		prevInput.focus();
	}
</script>

<div class="flex flex-row space-x-4 mt-5">
	{#each segments as segment, i (segment.id)}
		<input
			type="text"
			placeholder={placeholder.substring(segment.charIndex, segment.charIndex + 1)}
			value={filled[i] ? time.substring(segment.charIndex, segment.charIndex + 1) : ''}
			id={segment.id}
			aria-label={segment.label}
			aria-invalid={invalidInputId === segment.id}
			class="bg-transparent h-16 w-12 border-2 rounded-lg flex items-center text-center text-3xl placeholder:text-stone-400 {invalidInputId ===
			segment.id
				? 'border-red-500'
				: 'border-stone-200'}"
			on:input={(e) => handleSegmentInput(e, i, segment.charIndex, segment.nextId)}
			on:keydown={(e) => handleSegmentKeydown(e, i - 1)}
		/>
		{#if i === 1}
			<p class="text-4xl my-2">:</p>
		{/if}
	{/each}
</div>

{#if isValidTime}
	<p class="mt-2 text-sm text-stone-400 text-center">{period}</p>
	{#if isUnusual}
		<p class="mt-1 text-sm text-amber-600 text-center">
			<button type="button" class="underline underline-offset-2 font-medium" on:click={applyFlip}>
				{$_('components.timeField.didYouMean', { values: { time: formatAmPm(flip12h(time)) } })}
			</button>
		</p>
	{/if}
{/if}
