import moment from 'moment/moment';

import { melatoninSafetyWarning } from './melatonin';
import { t } from './i18n/server';

const BLT_DURATION_MINUTES = 15;
const MELATONIN_DURATION_MINUTES = 5;

// BLT/melatonin descriptions are keyed off the regime computeIntervention()
// already classified (see src/lib/melatonin.js) rather than recomputed here,
// so the light/dose guidance always matches the actual timing that was used.
function describeBlt(regime, locale) {
	if (regime === 'delay') {
		return t(locale, 'ical.blt.delay');
	}
	if (regime === 'extension') {
		return t(locale, 'ical.blt.extension');
	}
	return t(locale, 'ical.blt.advance');
}

function describeMelatonin(melatonin, regime, locale) {
	const [minDose, maxDose] = melatonin.doseRangeMg;
	const values = {
		minDose,
		maxDose,
		safetyWarning: melatoninSafetyWarning(locale),
		disclaimer: t(locale, 'ical.melatonin.disclaimer')
	};

	if (!melatonin.chronobiotic) {
		return t(locale, 'ical.melatonin.sleepAid', values);
	}
	if (regime === 'delay') {
		return t(locale, 'ical.melatonin.delay', values);
	}
	return t(locale, 'ical.melatonin.advance', values);
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
 * @param {{ regime: string, days: Array<{ wake: moment.Moment, sleep: moment.Moment, blt: moment.Moment|null, melatonin: {time: moment.Moment, doseRangeMg: [number, number], chronobiotic: boolean}|null }> }} params.result - Output of computeIntervention().
 * @param {number} params.tzOffsetMinutes - Minutes to add to the (server-local) computed times to get the user's actual local wall-clock instant.
 * @param {string} [params.locale] - Drives the language of event summaries/descriptions; falls back to English.
 * @param {string} [params.calendarName]
 * @param {string} [params.eventUrl]
 */
export function buildScheduleIcs({
	uidPrefix,
	result,
	tzOffsetMinutes,
	locale = 'en',
	calendarName = t(locale, 'ical.calendarName'),
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
			summary: t(locale, 'ical.sleep.summary'),
			description: t(locale, 'ical.sleep.description', { offset: tzOffsetMinutes }),
			url: eventUrl
		});

		if (day.blt) {
			const bltStart = moment(day.blt).add(tzOffsetMinutes, 'minutes');
			const bltEnd = moment(bltStart).add(BLT_DURATION_MINUTES, 'minutes');

			events.push({
				uid: `${uidPrefix}-blt-${dateKey}@shiftc.app`,
				start: bltStart.toDate(),
				end: bltEnd.toDate(),
				summary: t(locale, 'ical.blt.summary'),
				description: describeBlt(result.regime, locale),
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
				summary: t(locale, 'ical.melatonin.summary', {
					minDose: day.melatonin.doseRangeMg[0],
					maxDose: day.melatonin.doseRangeMg[1]
				}),
				description: describeMelatonin(day.melatonin, result.regime, locale),
				url: eventUrl
			});
		}
	}

	return buildIcs({ name: calendarName, events });
}

export { describeBlt, describeMelatonin };
