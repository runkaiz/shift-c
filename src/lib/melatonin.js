import moment from 'moment/moment';

import { t } from './i18n/server';

// Dosing/timing defaults derived from the melatonin PRC literature (Burgess,
// Revell & Eastman 2008/2010; see the science note this module implements).
// Kept as named constants rather than inlined so the source numbers are easy
// to audit against the note.
//
// Presented as ranges rather than a single point value: stating one specific
// milligram number for one specific person is the biggest liability driver
// identified for this feature (it reads as a personalized medical
// recommendation rather than general information). These are placeholder
// ranges pending the science review requested in
// docs/science-review-request.md — do not treat them as clinically vetted.
export const CHRONOBIOTIC_DOSE_RANGE_MG = [0.3, 0.5];
export const HYPNOTIC_DOSE_RANGE_MG = [0.2, 0.3];

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

// A short, generic sedation warning — melatonin's acute hypnotic effect
// applies regardless of which regime/dose it's used for, so this is a single
// constant rather than per-regime copy. See science note §7 (screen-first,
// don't just append a footnote) — this pairs with the screening gate, it
// doesn't replace it.
export function melatoninSafetyWarning(locale) {
	return t(locale, 'melatonin.safetyWarning');
}

// wakeShiftMinutes/sleepShiftMinutes arrive here already independently
// folded by the caller (schedule.js's WRAPAROUND_THRESHOLD_HOURS) into
// (-12h, +12h] to correct for midnight wraparound. A shift whose true
// magnitude sits close to that 12h fold boundary can land on either side of
// it from a few minutes of difference in input, which can flip the computed
// regime between advance and delay - i.e. drive light/melatonin at the
// anti-phase time. This must match schedule.js's WRAPAROUND_THRESHOLD_HOURS.
const WRAPAROUND_FOLD_BOUNDARY_MINUTES = 12 * 60;
// How close to that boundary counts as "too close to trust" - a labelled
// engineering margin, not a cited figure.
const WRAPAROUND_AMBIGUITY_MARGIN_MINUTES = 60;

/**
 * Classifies a requested schedule shift into the regime the science note
 * uses to decide melatonin (and light) strategy.
 *
 * Sleep midpoint = (sleep + wake) / 2 is linear in its two endpoints, so its
 * shift is exactly the average of the wake and sleep shifts; sleep duration
 * = wake - sleep, so its shift is exactly their difference. Both are derived
 * here rather than approximated.
 *
 * Regime (and therefore BLT light direction) is still chosen once per
 * protocol by net midpoint sign, per the note's §2 recommendation to "drive
 * light/phase strategy from the midpoint component." Melatonin dose *type*
 * is decomposed further in computeMelatoninDose() below, using
 * durationShiftMinutes returned here, so a request whose midpoint crosses
 * the phase-shift threshold but is actually dominated by a much larger
 * duration change (e.g. "advance bedtime 2h, delay wake 1h" - the note's own
 * example) doesn't get treated as a phase-shift dosing case. This
 * deliberately still caps at one melatonin recommendation per protocol - no
 * cited study in the science note validates stacking a chronobiotic and a
 * hypnotic dose in the same night, so decomposition changes *which* dose is
 * chosen, not whether more than one is.
 *
 * Wraparound-boundary safety: if either endpoint shift is close enough to
 * the caller's ±12h wraparound fold boundary that a few minutes of input
 * could have flipped which side it landed on, the resulting direction isn't
 * trustworthy (see science note "midpoint-sign wraparound instability",
 * flagged as a blocker). Rather than emit a plan that might be pointed at
 * the anti-phase time, this refuses outright.
 *
 * @param {number} wakeShiftMinutes - Signed goal-minus-current wake shift.
 * @param {number} sleepShiftMinutes - Signed goal-minus-current sleep shift.
 * @returns {{ regime: 'advance'|'delay'|'extension', midpointShiftMinutes: number, durationShiftMinutes: number }}
 * @throws {Error} 'ambiguous-shift-direction' if the requested shift is too close to the wraparound boundary to reliably classify.
 */
export function classifyRegime(wakeShiftMinutes, sleepShiftMinutes) {
	const nearWraparoundBoundary = (shiftMinutes) =>
		Math.abs(shiftMinutes) > WRAPAROUND_FOLD_BOUNDARY_MINUTES - WRAPAROUND_AMBIGUITY_MARGIN_MINUTES;

	if (nearWraparoundBoundary(wakeShiftMinutes) || nearWraparoundBoundary(sleepShiftMinutes)) {
		throw new Error('ambiguous-shift-direction');
	}

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
 * hypnotic before bed for a sleep-extension problem (never a phase-shifting
 * claim for that last case - see science note section 3/7).
 *
 * Chronobiotic dosing (advance: bedtime - 5h; delay: at wake) is only used
 * when the phase-shift component actually dominates the request - i.e.
 * regime isn't already 'extension' *and* |midpointShiftMinutes| is at least
 * as large as |durationShiftMinutes|. Otherwise this falls back to the
 * hypnotic dose even if `regime` (computed for BLT purposes) says
 * advance/delay, since a request like "advance bedtime 2h, delay wake 1h"
 * has a small midpoint shift riding on a much larger duration change, and
 * dosing it as a phase-shift case would apply the wrong-purpose dose to the
 * dominant part of the request (science note §2, Q2).
 *
 * Citations: advance 0.5mg at bedtime-5h and delay 0.5mg at wake both derive
 * from the same PRC (Burgess, Revell & Eastman 2008; Burgess, Revell,
 * Molina & Eastman 2010) - the delay peak is "not as distinct" per that
 * paper, and light is the stronger, better-evidenced lever for delays (see
 * the delay copy in ical.js). Extension/hypnotic 0.3mg is Zhdanova et al.
 * 1996/2001.
 *
 * doseRangeMg is a [min, max] pair rather than a single value — see the
 * comment on CHRONOBIOTIC_DOSE_RANGE_MG/HYPNOTIC_DOSE_RANGE_MG above for why.
 *
 * Never mutates wakeMoment/sleepMoment.
 *
 * @param {'advance'|'delay'|'extension'} regime
 * @param {moment.Moment} wakeMoment
 * @param {moment.Moment} sleepMoment
 * @param {number} midpointShiftMinutes
 * @param {number} durationShiftMinutes
 * @returns {{ time: moment.Moment, doseRangeMg: [number, number], chronobiotic: boolean }}
 */
export function computeMelatoninDose(
	regime,
	wakeMoment,
	sleepMoment,
	midpointShiftMinutes,
	durationShiftMinutes
) {
	const phaseShiftDominant =
		regime !== 'extension' && Math.abs(midpointShiftMinutes) >= Math.abs(durationShiftMinutes);

	if (phaseShiftDominant && regime === 'advance') {
		return {
			time: moment(sleepMoment).subtract(ADVANCE_DOSE_OFFSET_MINUTES, 'minutes'),
			doseRangeMg: CHRONOBIOTIC_DOSE_RANGE_MG,
			chronobiotic: true
		};
	}

	if (phaseShiftDominant && regime === 'delay') {
		return {
			time: moment(wakeMoment),
			doseRangeMg: CHRONOBIOTIC_DOSE_RANGE_MG,
			chronobiotic: true
		};
	}

	return {
		time: moment(sleepMoment).subtract(EXTENSION_HYPNOTIC_OFFSET_MINUTES, 'minutes'),
		doseRangeMg: HYPNOTIC_DOSE_RANGE_MG,
		chronobiotic: false
	};
}
