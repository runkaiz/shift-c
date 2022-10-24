import moment from 'moment/moment';

/** @type {import('./$types').RequestHandler} */
export function GET({ url }) {
    const increment = url.searchParams.get('increment'); // configurable increments

    const interventionStart = moment(url.searchParams.get('start'), moment.ISO_8601);

    const currentSleepDuration = moment(url.searchParams.get('cDuration'), ['h:m a', 'H:m']).format(
        'HH:mm'
    );
    const currentWakeTime = moment(url.searchParams.get('cWake'), ['h:m a', 'H:m']).format('HH:mm');
    const targetSleepDuration = moment(url.searchParams.get('tDuration'), ['h:m a', 'H:m']).format(
        'HH:mm'
    );
    const targetWakeTime = moment(url.searchParams.get('tWake'), ['h:m a', 'H:m']).format('HH:mm');

    const bltOffset = moment.duration(url.searchParams.get('bltOffset'), "minutes");

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

    for (let i = 1; i < wakeShiftDays; i++) {
        if (wakeShift > 0) {
            wakeIntervention[i] = moment(wakeIntervention[i - 1])
                .add(moment.duration(testIncrement, 'minutes'))
                .add(moment.duration(1, 'days'));
        } else {
            wakeIntervention[i] = moment(wakeIntervention[i - 1])
                .subtract(moment.duration(testIncrement, 'minutes'))
                .add(moment.duration(1, 'days'));
        }

        if (enableBLT) {
            bltIntervention[i] = wakeIntervention[i].add(testBLTOffset);
        }
    }

    for (let i = 1; i < sleepShiftDays; i++) {
        if (sleepShift > 0) {
            sleepIntervention[i] = moment(sleepIntervention[i - 1])
                .add(moment.duration(testIncrement, 'minutes'))
                .add(moment.duration(1, 'days'));
        } else {
            sleepIntervention[i] = moment(sleepIntervention[i - 1])
                .subtract(moment.duration(testIncrement, 'minutes'))
                .add(moment.duration(1, 'days'));
        }
    }

    return new Response(
        String(`Testing Algorithm...
    Intervention Start Date: ${testInterventionStart}

    Current Sleep time: ${testCurrentSleepTime.format('HH:mm')}
    Current Wake time: ${testCurrentWakeTime.format('HH:mm')}
    Current Sleep Duration: ${testCurrentSleepDuration.humanize()}

    Target Sleep time: ${testTargetSleepTime.format('HH:mm')}
    Target Wake time: ${testTargetWakeTime.format('HH:mm')}
    Target Sleep Duration: ${testTargetSleepDuration.humanize()}

    Increment: ${testIncrement} minutes
    Is BLT Enabled: ${enableBLT}

    Wake Shift: ${wakeShift} minutes
    Sleep Shift: ${sleepShift} minutes
    Duration Delta: ${durationDelta} minutes

    Days to shift wake time: ${wakeShiftDays}
    Days to shift sleep time: ${sleepShiftDays}

    Days of intervention protocol: ${interventionDays}

    Intervention Schedule:
        Wake: ${wakeIntervention}
        Sleep: ${sleepIntervention}
        BLT: ${bltIntervention}
  `)
    );
}
