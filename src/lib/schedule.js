import moment from 'moment/moment';
import { classifyRegime, computeBltTime, computeMelatoninDose } from './melatonin';

export const MS_PER_MINUTE = 60000;
export const DEFAULT_INCREMENT_MINUTES = 30;
export const DEFAULT_BLT_OFFSET_MINUTES = 30;
export const WRAPAROUND_THRESHOLD_HOURS = 12;

/**
 * Computes the day-by-day sleep/wake shifting schedule between a current
 * sleep/wake pair and a goal sleep/wake pair, starting the day after
 * `startDate`.
 *
 * @param {object} params
 * @param {string} params.currentWake - Current wake time, 'HH:mm'.
 * @param {string} params.currentSleep - Current sleep (bed) time, 'HH:mm'.
 * @param {string} params.goalWake - Goal wake time, 'HH:mm'.
 * @param {string} params.goalSleep - Goal sleep (bed) time, 'HH:mm'.
 * @param {Date|string} params.startDate - Date/ISO string for "today"; the
 *   intervention begins the day after this date.
 * @param {boolean} [params.enableBLT=false] - Whether to compute Bright
 *   Light Therapy times.
 * @param {boolean} [params.enableMelatonin=false] - Whether to compute
 *   melatonin dose times.
 * @param {number} [params.incrementMinutes=DEFAULT_INCREMENT_MINUTES]
 * @param {number} [params.bltOffsetMinutes=DEFAULT_BLT_OFFSET_MINUTES]
 * @returns {{ changed: boolean, regime: ('advance'|'delay'|'extension')|null, midpointShiftMinutes: number|null, days: Array<{ wake: moment.Moment, sleep: moment.Moment, blt: moment.Moment|null, melatonin: {time: moment.Moment, doseMg: number, chronobiotic: boolean}|null }> }}
 */
export function computeIntervention({
	currentWake,
	currentSleep,
	goalWake,
	goalSleep,
	startDate,
	enableBLT = false,
	enableMelatonin = false,
	incrementMinutes = DEFAULT_INCREMENT_MINUTES,
	bltOffsetMinutes = DEFAULT_BLT_OFFSET_MINUTES
}) {
	const currentWakeTime = moment(currentWake, ['HH:mm']);
	const currentSleepTime = moment(currentSleep, ['HH:mm']);
	const targetWakeTime = moment(goalWake, ['HH:mm']);
	const targetSleepTime = moment(goalSleep, ['HH:mm']);

	if (
		!currentWakeTime.isValid() ||
		!currentSleepTime.isValid() ||
		!targetWakeTime.isValid() ||
		!targetSleepTime.isValid()
	) {
		throw new Error('invalid-time');
	}

	const interventionStart = (
		startDate instanceof Date ? moment(startDate) : moment(startDate, moment.ISO_8601)
	).add(1, 'days');

	// Midnight wraparound heuristic, applied symmetrically to both the wake
	// pair and the sleep pair (bug fix: previously only the sleep pair got
	// this correction), and in both directions (bug fix: previously only
	// "target looks much later than current" was corrected by subtracting a
	// day; "target looks much earlier than current" - e.g. a bedtime moving
	// from 23:00 to 00:30, which needs to wrap forward - was never
	// corrected, silently flipping the shift's sign).
	if (targetWakeTime.diff(currentWakeTime, 'hours') > WRAPAROUND_THRESHOLD_HOURS) {
		targetWakeTime.subtract(1, 'day');
	} else if (targetWakeTime.diff(currentWakeTime, 'hours') < -WRAPAROUND_THRESHOLD_HOURS) {
		targetWakeTime.add(1, 'day');
	}
	if (targetSleepTime.diff(currentSleepTime, 'hours') > WRAPAROUND_THRESHOLD_HOURS) {
		targetSleepTime.subtract(1, 'day');
	} else if (targetSleepTime.diff(currentSleepTime, 'hours') < -WRAPAROUND_THRESHOLD_HOURS) {
		targetSleepTime.add(1, 'day');
	}

	const wakeShift = targetWakeTime.diff(currentWakeTime) / MS_PER_MINUTE; // Convert from milliseconds to minutes
	const sleepShift = targetSleepTime.diff(currentSleepTime) / MS_PER_MINUTE;

	// Round up so we don't have half days. Take the absolute value before
	// rounding up so that shifts of the same magnitude in either direction
	// round to the same number of days (bug fix: previously Math.ceil was
	// applied to the signed shift before Math.abs).
	const wakeShiftDays = Math.ceil(Math.abs(wakeShift) / incrementMinutes);
	const sleepShiftDays = Math.ceil(Math.abs(sleepShift) / incrementMinutes);

	// "No meaningful change" is fully captured by both day counts rounding
	// to zero (bug fix: previously an exact-equality check on the current
	// vs target times was used instead, which could be bypassed by a small
	// non-zero shift that still rounds to zero days, leaving the day
	// arrays empty and crashing downstream indexing).
	if (wakeShiftDays === 0 && sleepShiftDays === 0) {
		return { changed: false, regime: null, midpointShiftMinutes: null, days: [] };
	}

	const { regime, midpointShiftMinutes } = classifyRegime(wakeShift, sleepShift);

	const interventionDays = wakeShiftDays > sleepShiftDays ? wakeShiftDays : sleepShiftDays; // Max number of days for the intervention

	const wakeIntervention = [];
	const sleepIntervention = [];

	// Initialize the first items
	if (wakeShiftDays !== 0) {
		if (wakeShift > 0) {
			wakeIntervention[0] = moment(currentWakeTime).add(incrementMinutes, 'minutes');
		} else {
			wakeIntervention[0] = moment(currentWakeTime).subtract(incrementMinutes, 'minutes');
		}
		wakeIntervention[0].year(interventionStart.year());
		wakeIntervention[0].month(interventionStart.month());
		wakeIntervention[0].date(interventionStart.date());
	} else {
		for (let i = 0; i < interventionDays; i++) {
			wakeIntervention[i] = moment(currentWakeTime);
			wakeIntervention[i].year(interventionStart.year());
			wakeIntervention[i].month(interventionStart.month());
			wakeIntervention[i].date(interventionStart.date());
		}
	}

	if (sleepShiftDays !== 0) {
		if (sleepShift > 0) {
			sleepIntervention[0] = moment(currentSleepTime).add(incrementMinutes, 'minutes');
		} else {
			sleepIntervention[0] = moment(currentSleepTime).subtract(incrementMinutes, 'minutes');
		}
		sleepIntervention[0].year(interventionStart.year());
		sleepIntervention[0].month(interventionStart.month());
		sleepIntervention[0].date(interventionStart.date());
	} else {
		for (let i = 0; i < interventionDays; i++) {
			sleepIntervention[i] = moment(currentSleepTime);
			sleepIntervention[i].year(interventionStart.year());
			sleepIntervention[i].month(interventionStart.month());
			sleepIntervention[i].date(interventionStart.date());
		}
	}

	if (wakeIntervention[0].diff(sleepIntervention[0]) < 0) {
		wakeIntervention[0].date(interventionStart.date()).add(1, 'day');
	}

	// Calculate the rest of the days
	for (let i = 1; i < interventionDays; i++) {
		if (i < wakeShiftDays) {
			if (wakeShift > 0) {
				wakeIntervention[i] = moment(wakeIntervention[i - 1])
					.add(incrementMinutes, 'minutes')
					.add(1, 'days');
			} else {
				let shift = moment(wakeIntervention[i - 1]);
				shift.add(1, 'days');
				shift.subtract(incrementMinutes, 'minutes');
				wakeIntervention[i] = shift;
			}
		} else {
			wakeIntervention[i] = moment(wakeIntervention[i - 1]).add(1, 'days');
		}

		if (i < sleepShiftDays) {
			if (sleepShift > 0) {
				sleepIntervention[i] = moment(sleepIntervention[i - 1])
					.add(incrementMinutes, 'minutes')
					.add(1, 'days');
			} else {
				sleepIntervention[i] = moment(sleepIntervention[i - 1])
					.subtract(incrementMinutes, 'minutes')
					.add(1, 'days');
			}
		} else {
			sleepIntervention[i] = moment(sleepIntervention[i - 1]).add(1, 'days');
		}
	}

	// BLT/melatonin times are derived here, after wakeIntervention/
	// sleepIntervention are fully finalized (including the day-0
	// wake-before-sleep correction above), and always by cloning rather
	// than mutating those arrays. Deriving them earlier, inline during
	// array construction, previously caused day 0's BLT time to be cloned
	// from a wake moment that was *not yet* corrected, silently landing it
	// ~24h off from the actual wake event for a normal PM-bedtime user.
	const days = [];
	for (let i = 0; i < interventionDays; i++) {
		const wake = wakeIntervention[i];
		const sleep = sleepIntervention[i];

		days.push({
			wake,
			sleep,
			blt: enableBLT ? computeBltTime(regime, wake, sleep, bltOffsetMinutes).time : null,
			melatonin: enableMelatonin ? computeMelatoninDose(regime, wake, sleep) : null
		});
	}

	return { changed: true, regime, midpointShiftMinutes, days };
}
