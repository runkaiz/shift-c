import ical from 'ical-generator';
import moment from 'moment/moment';

/** @type {import('./$types').RequestHandler} */
export async function GET({ url }) {
	const calendar = ical({ name: 'Intervention Protocol' });

    let wakeIntervention = [];
	let sleepIntervention = [];
	let bltIntervention = [];

	const enableBLT = url.searchParams.get('blt') == 1; // Determine whether to use BLT
	let testBLTOffset = null;

	if (enableBLT) {
		testBLTOffset = moment.duration(30, 'minutes'); // For example, the user indicates they want to do BLT 30 minutes after waking up.
	}

	const testIncrement = 30; // In minutes, I am using this because duration is too complicated

	const testInterventionStart = moment(new Date().toISOString(), moment.ISO_8601).add(1, 'days');

	const testCurrentWakeTime = moment(url.searchParams.get('cWake'), ['HH:mm']);
	const testCurrentSleepTime = moment(url.searchParams.get('cSleep'), ['HH:mm']);
	if (testCurrentWakeTime.diff(testCurrentSleepTime) > 0) {
		testCurrentSleepTime.subtract(moment.duration(1, 'days'));
	}

	const testTargetWakeTime = moment(url.searchParams.get('gWake'), ['HH:mm']);
	const testTargetSleepTime = moment(url.searchParams.get('gSleep'), ['HH:mm']);
	if (testTargetWakeTime.diff(testTargetSleepTime) > 0) {
		testTargetSleepTime.subtract(moment.duration(1, 'days'));
	}

	// Algorithm Time
	if (
		testCurrentWakeTime.diff(testTargetWakeTime) == 0 &&
		testCurrentSleepTime.diff(testTargetSleepTime) == 0
	) {
		console.log("Don't need no changes!");
		return false;
	}
	const wakeShift = testTargetWakeTime.diff(testCurrentWakeTime) / 60000; // Convert from milliseconds to minutes
	const sleepShift = testTargetSleepTime.diff(testCurrentSleepTime) / 60000;

	const wakeShiftDays = Math.abs(Math.ceil(wakeShift / testIncrement)); // Round up so we don't have half days.
	const sleepShiftDays = Math.abs(Math.ceil(sleepShift / testIncrement));

	const interventionDays = wakeShiftDays > sleepShiftDays ? wakeShiftDays : sleepShiftDays; // Max number of days for the intervention

	// Initialize the first items
	if (wakeShiftDays != 0) {
		if (wakeShift > 0) {
			wakeIntervention[0] = moment(testCurrentWakeTime).add(
				moment.duration(testIncrement, 'minutes')
			);
		} else {
			wakeIntervention[0] = moment(testCurrentWakeTime).subtract(
				moment.duration(testIncrement, 'minutes')
			);
		}
		wakeIntervention[0].year(testInterventionStart.year());
		wakeIntervention[0].month(testInterventionStart.month());
		wakeIntervention[0].date(testInterventionStart.date() + 1);

		if (enableBLT) {
			bltIntervention[0] = moment(wakeIntervention[0]).add(testBLTOffset);
		}
	} else {
		for (let i = 0; i < interventionDays; i++) {
			wakeIntervention[i] = moment(testCurrentWakeTime);
			wakeIntervention[i].year(testInterventionStart.year());
			wakeIntervention[i].month(testInterventionStart.month());
			wakeIntervention[i].date(testInterventionStart.date());
		}
	}

	if (sleepShiftDays != 0) {
		if (sleepShift > 0) {
			sleepIntervention[0] = moment(testCurrentSleepTime).add(
				moment.duration(testIncrement, 'minutes')
			);
		} else {
			sleepIntervention[0] = moment(testCurrentSleepTime).subtract(
				moment.duration(testIncrement, 'minutes')
			);
		}
		sleepIntervention[0].year(testInterventionStart.year());
		sleepIntervention[0].month(testInterventionStart.month());
		sleepIntervention[0].date(testInterventionStart.date());
	} else {
		for (let i = 0; i < interventionDays; i++) {
			sleepIntervention[i] = moment(testCurrentSleepTime);
			sleepIntervention[i].year(testInterventionStart.year());
			sleepIntervention[i].month(testInterventionStart.month());
			sleepIntervention[i].date(testInterventionStart.date());
		}
	}

	// Calculate the rest of the days
	for (let i = 1; i < interventionDays; i++) {
		if (i < wakeShiftDays) {
			if (wakeShift > 0) {
				wakeIntervention[i] = moment(wakeIntervention[i - 1])
					.add(moment.duration(testIncrement, 'minutes'))
					.add(moment.duration(1, 'days'));
			} else {
				let shift = moment(wakeIntervention[i - 1]);
				shift.add(moment.duration(1, 'days'));
				shift.subtract(moment.duration(testIncrement, 'minutes'));
				wakeIntervention[i] = shift;
			}
		} else {
			wakeIntervention[i] = moment(wakeIntervention[i - 1]).add(1, 'days');
		}

		if (i < sleepShiftDays) {
			if (sleepShift > 0) {
				sleepIntervention[i] = moment(sleepIntervention[i - 1])
					.add(moment.duration(testIncrement, 'minutes'))
					.add(moment.duration(1, 'days'));
			} else {
				sleepIntervention[i] = moment(sleepIntervention[i - 1])
					.subtract(moment.duration(testIncrement, 'minutes'))
					.add(moment.duration(1, 'days'));
			}
		} else {
			sleepIntervention[i] = moment(sleepIntervention[i - 1]).add(1, 'days');
		}

		if (enableBLT) {
			bltIntervention[i] = moment(wakeIntervention[i]).add(testBLTOffset);
		}
	}

	let sleep = null;
	let wake = null;

	for (let i = 0; i < wakeIntervention.length; i++) {
		if (sleepIntervention[i]) sleep = sleepIntervention[i].toDate();
		if (wakeIntervention[i]) wake = wakeIntervention[i].toDate();
		calendar.createEvent({
			start: sleep,
			end: wake,
			summary: 'Sleep',
			description: 'Please try to sleep during this time ;)',
			url: 'https://shiftc.app/'
		});
	}

	const res = new Response(await calendar);
	res.headers.set('Content-Type', 'text/calendar;charset=utf-8');

	return res;
}
