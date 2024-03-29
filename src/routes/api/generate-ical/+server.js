import ical from 'ical-generator';
import moment from 'moment/moment';

/** @type {import('./$types').RequestHandler} */
export async function GET({ url }) {
	const calendar = ical({ name: 'Intervention Protocol' });

	let wakeIntervention = [];
	let sleepIntervention = [];
	let bltIntervention = [];

	const enableBLT = url.searchParams.get('blt') == 1; // Determine whether to use BLT
	let BLTOffset = null;

	if (enableBLT) {
		BLTOffset = moment.duration(30, 'minutes'); // For example, the user indicates they want to do BLT 30 minutes after waking up.
	}

	const increment = 30; // In minutes, I am using this because duration is too complicated

	const tz = moment().utcOffset() - Number(url.searchParams.get('tz'));

	const interventionStart = moment(url.searchParams.get('n'), moment.ISO_8601).add(1, 'days');

	const currentWakeTime = moment(url.searchParams.get('cWake'), ['HH:mm']);
	const currentSleepTime = moment(url.searchParams.get('cSleep'), ['HH:mm']);

	const targetWakeTime = moment(url.searchParams.get('gWake'), ['HH:mm']);
	const targetSleepTime = moment(url.searchParams.get('gSleep'), ['HH:mm']);
	if (targetSleepTime.diff(currentSleepTime, 'hours') > 12) {
		targetSleepTime.subtract(1, 'day');
	}

	// Algorithm Time
	if (currentWakeTime.diff(targetWakeTime) == 0 && currentSleepTime.diff(targetSleepTime) == 0) {
		console.log("Don't need no changes!");
		return false;
	}
	const wakeShift = targetWakeTime.diff(currentWakeTime) / 60000; // Convert from milliseconds to minutes
	const sleepShift = targetSleepTime.diff(currentSleepTime) / 60000;

	const wakeShiftDays = Math.abs(Math.ceil(wakeShift / increment)); // Round up so we don't have half days.
	const sleepShiftDays = Math.abs(Math.ceil(sleepShift / increment));

	const interventionDays = wakeShiftDays > sleepShiftDays ? wakeShiftDays : sleepShiftDays; // Max number of days for the intervention

	// Initialize the first items
	if (wakeShiftDays != 0) {
		if (wakeShift > 0) {
			wakeIntervention[0] = moment(currentWakeTime).add(increment, 'minutes');
		} else {
			wakeIntervention[0] = moment(currentWakeTime).subtract(increment, 'minutes');
		}
		wakeIntervention[0].year(interventionStart.year());
		wakeIntervention[0].month(interventionStart.month());
		wakeIntervention[0].date(interventionStart.date());

		if (enableBLT) {
			bltIntervention[0] = moment(wakeIntervention[0]).add(BLTOffset);
		}
	} else {
		for (let i = 0; i < interventionDays; i++) {
			wakeIntervention[i] = moment(currentWakeTime);
			wakeIntervention[i].year(interventionStart.year());
			wakeIntervention[i].month(interventionStart.month());
			wakeIntervention[i].date(interventionStart.date());
		}
	}

	if (sleepShiftDays != 0) {
		if (sleepShift > 0) {
			sleepIntervention[0] = moment(currentSleepTime).add(increment, 'minutes');
		} else {
			sleepIntervention[0] = moment(currentSleepTime).subtract(increment, 'minutes');
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
					.add(increment, 'minutes')
					.add(1, 'days');
			} else {
				let shift = moment(wakeIntervention[i - 1]);
				shift.add(1, 'days');
				shift.subtract(increment, 'minutes');
				wakeIntervention[i] = shift;
			}
		} else {
			wakeIntervention[i] = moment(wakeIntervention[i - 1]).add(1, 'days');
		}

		if (i < sleepShiftDays) {
			if (sleepShift > 0) {
				sleepIntervention[i] = moment(sleepIntervention[i - 1])
					.add(increment, 'minutes')
					.add(1, 'days');
			} else {
				sleepIntervention[i] = moment(sleepIntervention[i - 1])
					.subtract(increment, 'minutes')
					.add(1, 'days');
			}
		} else {
			sleepIntervention[i] = moment(sleepIntervention[i - 1]).add(1, 'days');
		}

		if (enableBLT) {
			bltIntervention[i] = moment(wakeIntervention[i]).add(BLTOffset);
		}
	}

	let sleep = null;
	let wake = null;

	for (let i = 0; i < wakeIntervention.length; i++) {
		if (sleepIntervention[i]) sleep = sleepIntervention[i].add(tz, 'minutes').toDate();
		if (wakeIntervention[i]) wake = wakeIntervention[i].add(tz, 'minutes').toDate();
		calendar.createEvent({
			start: sleep,
			end: wake,
			summary: 'Sleep',
			description: `Please try to sleep during this time ;) TZ offset = ${tz}`,
			url: 'https://shiftc.app/'
		});
	}

	const res = new Response(calendar);
	res.headers.set('Content-Type', 'text/calendar;charset=utf-8');

	return res;
}
