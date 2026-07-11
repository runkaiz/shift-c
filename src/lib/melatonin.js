import moment from 'moment/moment';

// Dosing/timing defaults derived from the melatonin PRC literature (Burgess,
// Revell & Eastman 2008/2010; see the science note this module implements).
// Kept as named constants rather than inlined so the source numbers are easy
// to audit against the note.
export const CHRONOBIOTIC_DOSE_MG = 0.5;
export const HYPNOTIC_DOSE_MG = 0.3;

// Below this magnitude of sleep-midpoint shift, treat the plan as a pure
// sleep-extension problem rather than a phase-shift problem (science note
// section 5). Real regimes have a 30-60min gray zone the note leaves
// undiagnosed; we route all of that into the phase-shift branches rather
// than adding a fourth bucket.
export const REGIME_MIDPOINT_THRESHOLD_MINUTES = 30;

// Advance dosing: DLMO is approximated as 2h before habitual bedtime
// (Burgess & Eastman 2005), and the optimal 0.5mg offset before DLMO is
// 2-4h (we use the 3h midpoint) -> bedtime - 2h - 3h = bedtime - 5h. This
// independently matches the note's simpler "4-6h before bedtime" heuristic.
export const ADVANCE_DOSE_OFFSET_MINUTES = 300;

// Hypnotic (extension-regime) dosing: 30-60 min before bedtime; we use the
// midpoint of that range.
export const EXTENSION_HYPNOTIC_OFFSET_MINUTES = 45;

// Delay-regime evening light: the note endorses evening bright light for
// delays but gives no specific offset before bedtime. This value is a
// placeholder, not derived from a cited figure.
export const EVENING_LIGHT_OFFSET_MINUTES = 90;

/**
 * Classifies a requested schedule shift into the regime the science note
 * uses to decide melatonin (and light) strategy.
 *
 * Sleep midpoint = (sleep + wake) / 2 is linear in its two endpoints, so its
 * shift is exactly the average of the wake and sleep shifts; sleep duration
 * = wake - sleep, so its shift is exactly their difference. Both are derived
 * here rather than approximated.
 *
 * Known simplification: the note's "mixed" regime (advance one end, delay
 * the other) is folded into 'advance'/'delay' by the sign of the net
 * midpoint shift rather than being decomposed into separate midpoint- and
 * duration-shift interventions, since a single regime is chosen once for
 * the whole protocol (this is also what keeps us from ever stacking an AM
 * and a PM chronobiotic dose against each other).
 *
 * Known limitation: wakeShiftMinutes/sleepShiftMinutes already carry the
 * caller's independent per-endpoint midnight-wraparound correction. In rare
 * inputs where only one endpoint crosses that ~12h wraparound boundary, the
 * resulting midpoint sign (and therefore advance-vs-delay dosing direction)
 * can be unstable. Not solved here.
 *
 * @param {number} wakeShiftMinutes - Signed goal-minus-current wake shift.
 * @param {number} sleepShiftMinutes - Signed goal-minus-current sleep shift.
 * @returns {{ regime: 'advance'|'delay'|'extension', midpointShiftMinutes: number, durationShiftMinutes: number }}
 */
export function classifyRegime(wakeShiftMinutes, sleepShiftMinutes) {
	const midpointShiftMinutes = (wakeShiftMinutes + sleepShiftMinutes) / 2;
	const durationShiftMinutes = wakeShiftMinutes - sleepShiftMinutes;

	let regime;
	if (Math.abs(midpointShiftMinutes) < REGIME_MIDPOINT_THRESHOLD_MINUTES) {
		regime = 'extension';
	} else {
		regime = midpointShiftMinutes < 0 ? 'advance' : 'delay';
	}

	return { regime, midpointShiftMinutes, durationShiftMinutes };
}

/**
 * Computes that day's Bright Light Therapy time. Morning light advances the
 * clock, so it's used for 'advance' (and, for its alertness benefit rather
 * than any phase-shift claim, 'extension'). Morning light opposes a delay,
 * so 'delay' gets evening light instead.
 *
 * Never mutates wakeMoment/sleepMoment.
 *
 * @param {'advance'|'delay'|'extension'} regime
 * @param {moment.Moment} wakeMoment
 * @param {moment.Moment} sleepMoment
 * @param {number} bltOffsetMinutes
 * @returns {{ time: moment.Moment, direction: 'morning'|'evening' }}
 */
export function computeBltTime(regime, wakeMoment, sleepMoment, bltOffsetMinutes) {
	if (regime === 'delay') {
		return {
			time: moment(sleepMoment).subtract(EVENING_LIGHT_OFFSET_MINUTES, 'minutes'),
			direction: 'evening'
		};
	}

	return {
		time: moment(wakeMoment).add(bltOffsetMinutes, 'minutes'),
		direction: 'morning'
	};
}

/**
 * Computes that day's melatonin dose: a PM chronobiotic dose for an
 * advance, an on-waking chronobiotic dose for a delay, or a low-dose
 * hypnotic before bed for a pure sleep-extension problem (never a
 * phase-shifting claim for that last case - see science note section 3/7).
 *
 * Never mutates wakeMoment/sleepMoment.
 *
 * @param {'advance'|'delay'|'extension'} regime
 * @param {moment.Moment} wakeMoment
 * @param {moment.Moment} sleepMoment
 * @returns {{ time: moment.Moment, doseMg: number, chronobiotic: boolean }}
 */
export function computeMelatoninDose(regime, wakeMoment, sleepMoment) {
	if (regime === 'advance') {
		return {
			time: moment(sleepMoment).subtract(ADVANCE_DOSE_OFFSET_MINUTES, 'minutes'),
			doseMg: CHRONOBIOTIC_DOSE_MG,
			chronobiotic: true
		};
	}

	if (regime === 'delay') {
		return {
			time: moment(wakeMoment),
			doseMg: CHRONOBIOTIC_DOSE_MG,
			chronobiotic: true
		};
	}

	return {
		time: moment(sleepMoment).subtract(EXTENSION_HYPNOTIC_OFFSET_MINUTES, 'minutes'),
		doseMg: HYPNOTIC_DOSE_MG,
		chronobiotic: false
	};
}
