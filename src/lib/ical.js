import moment from 'moment/moment';

const BLT_DURATION_MINUTES = 15;
const MELATONIN_DURATION_MINUTES = 5;
const MELATONIN_DISCLAIMER =
	'General estimate, not medical advice — check with a clinician if you are pregnant, on other medications, or have a health condition.';

// BLT/melatonin descriptions are keyed off the regime computeIntervention()
// already classified (see src/lib/melatonin.js) rather than recomputed here,
// so the light/dose guidance always matches the actual timing that was used.
function describeBlt(regime) {
	if (regime === 'delay') {
		return 'Get some bright light exposure in the evening to help shift your circadian clock later. Avoid bright light after waking, until your target wake time.';
	}
	if (regime === 'extension') {
		return 'Get some bright light exposure shortly after waking for alertness. Your plan mainly needs more sleep opportunity rather than a clock shift, so this step is optional.';
	}
	return 'Get some bright light exposure shortly after waking to help shift your circadian clock earlier. Keep the 2-3 hours before your bedtime dim to reinforce the shift.';
}

function describeMelatonin(melatonin, regime) {
	if (!melatonin.chronobiotic) {
		return `Take ${melatonin.doseMg} mg melatonin now as a sleep aid before bed. This dose is for falling asleep, not for shifting your clock. ${MELATONIN_DISCLAIMER}`;
	}
	if (regime === 'delay') {
		return `Take ${melatonin.doseMg} mg melatonin now, right on waking, to help shift your circadian clock later (optional — light is the stronger signal for a delay). Avoid bright light after waking until your target wake time. ${MELATONIN_DISCLAIMER}`;
	}
	return `Take ${melatonin.doseMg} mg melatonin now to help shift your circadian clock earlier. Keep lights dim for the next 2-3 hours, especially close to bedtime. ${MELATONIN_DISCLAIMER}`;
}

// Minimal RFC 5545 text escaping: backslash, semicolon, comma, then newlines.
// Order matters — backslash must be escaped first so the newline/semicolon/
// comma escapes below don't get double-escaped.
function escapeText(text) {
	return String(text)
		.replace(/\\/g, '\\\\')
		.replace(/;/g, '\\;')
		.replace(/,/g, '\\,')
		.replace(/\n/g, '\\n');
}

// RFC 5545 requires content lines to be folded at 75 octets, continuation
// lines prefixed with a single space.
function foldLine(line) {
	if (line.length <= 75) return line;
	const chunks = [];
	let rest = line;
	while (rest.length > 75) {
		chunks.push(rest.slice(0, 75));
		rest = ' ' + rest.slice(75);
	}
	chunks.push(rest);
	return chunks.join('\r\n');
}

function formatDateUTC(date) {
	return moment(date).utc().format('YYYYMMDDTHHmmss[Z]');
}

/**
 * Serializes a list of events into an RFC 5545 .ics document, without
 * depending on a Node-only library (ical-generator pulls in `fs` at the top
 * level for its unused save() methods, which breaks bundling for the
 * Cloudflare Workers/Pages edge runtime).
 *
 * @param {object} params
 * @param {string} params.name - Calendar name (X-WR-CALNAME).
 * @param {Array<{uid: string, start: Date, end: Date, summary: string, description?: string, url?: string}>} params.events
 * @returns {string}
 */
export function buildIcs({ name, events }) {
	const lines = [
		'BEGIN:VCALENDAR',
		'VERSION:2.0',
		'PRODID:-//shiftc.app//shift-c//EN',
		'CALSCALE:GREGORIAN',
		`X-WR-CALNAME:${escapeText(name)}`
	];

	const dtstamp = formatDateUTC(new Date());
	for (const event of events) {
		lines.push('BEGIN:VEVENT');
		lines.push(`UID:${event.uid}`);
		lines.push(`DTSTAMP:${dtstamp}`);
		lines.push(`DTSTART:${formatDateUTC(event.start)}`);
		lines.push(`DTEND:${formatDateUTC(event.end)}`);
		lines.push(`SUMMARY:${escapeText(event.summary)}`);
		if (event.description) lines.push(`DESCRIPTION:${escapeText(event.description)}`);
		if (event.url) lines.push(`URL:${event.url}`);
		lines.push('END:VEVENT');
	}

	lines.push('END:VCALENDAR');
	return lines.map(foldLine).join('\r\n') + '\r\n';
}

/**
 * Builds the .ics document for a computed intervention schedule. Shared by
 * the anonymous one-off download (`/api/generate-ical`) and the per-plan
 * calendar subscription feed (`/api/calendar/[token]`).
 *
 * Event UIDs are derived from `uidPrefix` + the event's local calendar date
 * (not a timestamp), so that when a plan's schedule is later recomputed from
 * an adjusted baseline, the event for "day N" keeps the same UID and
 * subscribing calendar clients update it in place instead of duplicating it.
 *
 * @param {object} params
 * @param {string} params.uidPrefix - Stable per-plan/download identifier, e.g. a plan token.
 * @param {{ regime: string, days: Array<{ wake: moment.Moment, sleep: moment.Moment, blt: moment.Moment|null, melatonin: {time: moment.Moment, doseMg: number, chronobiotic: boolean}|null }> }} params.result - Output of computeIntervention().
 * @param {number} params.tzOffsetMinutes - Minutes to add to the (server-local) computed times to get the user's actual local wall-clock instant.
 * @param {string} [params.calendarName]
 * @param {string} [params.eventUrl]
 */
export function buildScheduleIcs({
	uidPrefix,
	result,
	tzOffsetMinutes,
	calendarName = 'Intervention Protocol',
	eventUrl = 'https://shiftc.app/'
}) {
	const events = [];

	for (const day of result.days) {
		const sleep = moment(day.sleep).add(tzOffsetMinutes, 'minutes');
		const wake = moment(day.wake).add(tzOffsetMinutes, 'minutes');
		const dateKey = wake.format('YYYY-MM-DD');

		events.push({
			uid: `${uidPrefix}-sleep-${dateKey}@shiftc.app`,
			start: sleep.toDate(),
			end: wake.toDate(),
			summary: 'Sleep',
			description: `Please try to sleep during this time ;) TZ offset = ${tzOffsetMinutes}`,
			url: eventUrl
		});

		if (day.blt) {
			const bltStart = moment(day.blt).add(tzOffsetMinutes, 'minutes');
			const bltEnd = moment(bltStart).add(BLT_DURATION_MINUTES, 'minutes');

			events.push({
				uid: `${uidPrefix}-blt-${dateKey}@shiftc.app`,
				start: bltStart.toDate(),
				end: bltEnd.toDate(),
				summary: 'Bright Light Therapy',
				description: describeBlt(result.regime),
				url: eventUrl
			});
		}

		if (day.melatonin) {
			const melatoninStart = moment(day.melatonin.time).add(tzOffsetMinutes, 'minutes');
			const melatoninEnd = moment(melatoninStart).add(MELATONIN_DURATION_MINUTES, 'minutes');

			events.push({
				uid: `${uidPrefix}-melatonin-${dateKey}@shiftc.app`,
				start: melatoninStart.toDate(),
				end: melatoninEnd.toDate(),
				summary: `Take Melatonin (${day.melatonin.doseMg} mg)`,
				description: describeMelatonin(day.melatonin, result.regime),
				url: eventUrl
			});
		}
	}

	return buildIcs({ name: calendarName, events });
}

export { describeBlt, describeMelatonin };
