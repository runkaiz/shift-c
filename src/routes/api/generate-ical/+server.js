import ical from 'ical-generator';
import moment from 'moment/moment';

/** @type {import('./$types').RequestHandler} */
export async function GET({ url }) {
    const calendar = ical({ name: 'Intervention Protocol' });

    // Mock Data (remove after input is implemented)

    const enableBLT = true; // Determine whether to use BLT
    let testBLTOffset = null;

    if (enableBLT) {
        testBLTOffset = moment.duration(30, "minutes") // For example, the user indicates they want to do BLT 30 minutes after waking up.
    }

    const testIncrement = 30; // In minutes, I am using this because duration is too complicated

    const testInterventionStart = moment(new Date().toISOString(), moment.ISO_8601).add(5, 'days');

    const testCurrentSleepDuration = moment.duration(600, 'minutes'); // using minutes makes parsing easier
    const testTargetSleepDuration = moment.duration(480, 'minutes');

    const testCurrentWakeTime = moment('11:00', ['h:m a', 'H:m']);
    const testCurrentSleepTime = moment(testCurrentWakeTime).subtract(testCurrentSleepDuration);

    const testTargetWakeTime = moment('7:00', ['h:m a', 'H:m']);
    const testTargetSleepTime = moment(testTargetWakeTime).subtract(testTargetSleepDuration);

    // Algorithm Time
    const wakeShift = testTargetWakeTime.diff(testCurrentWakeTime) / 60000; // Convert from milliseconds to minutes
    const sleepShift = testTargetSleepTime.diff(testCurrentSleepTime) / 60000;
    const durationDelta = testTargetSleepDuration.asMinutes() - testCurrentSleepDuration.asMinutes();

    const wakeShiftDays = Math.abs(Math.ceil(wakeShift / testIncrement)); // Round up so we don't have half days.
    const sleepShiftDays = Math.abs(Math.ceil(sleepShift / testIncrement));

    const interventionDays = wakeShiftDays > sleepShiftDays ? wakeShiftDays : sleepShiftDays; // Max number of days for the intervention
    let wakeIntervention = [];
    let sleepIntervention = [];
    let bltIntervention = [];

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
        wakeIntervention[0].date(testInterventionStart.date());

        if (enableBLT) {
            bltIntervention[0] = moment(wakeIntervention[0]).add(testBLTOffset);
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
                console.log(wakeIntervention[i - 1]);
                console.log(shift);
                wakeIntervention[i] = shift;
            }
        } else {
            wakeIntervention[i] = moment(wakeIntervention[i - 1]).add(1, "days");
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
            sleepIntervention[i] = moment(sleepIntervention[i - 1]).add(1, "days");
        }

        if (enableBLT) {
            bltIntervention[i] = moment(wakeIntervention[i]).add(testBLTOffset);
        }
    }

    // End Mock Data

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
