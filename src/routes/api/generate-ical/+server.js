import moment from 'moment/moment';

import { computeIntervention } from '$lib/schedule';
import { buildScheduleIcs } from '$lib/ical';

/** @type {import('./$types').RequestHandler} */
export async function GET({ url }) {
	const n = url.searchParams.get('n');
	const cWake = url.searchParams.get('cWake');
	const cSleep = url.searchParams.get('cSleep');
	const gWake = url.searchParams.get('gWake');
	const gSleep = url.searchParams.get('gSleep');
	const tzParam = url.searchParams.get('tz');

	if (!n || !moment(n, moment.ISO_8601).isValid()) {
		return new Response('Missing or invalid "n" query parameter (expected an ISO date).', {
			status: 400
		});
	}
	if (!cWake || !moment(cWake, ['HH:mm']).isValid()) {
		return new Response('Missing or invalid "cWake" query parameter (expected HH:mm).', {
			status: 400
		});
	}
	if (!cSleep || !moment(cSleep, ['HH:mm']).isValid()) {
		return new Response('Missing or invalid "cSleep" query parameter (expected HH:mm).', {
			status: 400
		});
	}
	if (!gWake || !moment(gWake, ['HH:mm']).isValid()) {
		return new Response('Missing or invalid "gWake" query parameter (expected HH:mm).', {
			status: 400
		});
	}
	if (!gSleep || !moment(gSleep, ['HH:mm']).isValid()) {
		return new Response('Missing or invalid "gSleep" query parameter (expected HH:mm).', {
			status: 400
		});
	}
	if (tzParam === null || tzParam === '' || !Number.isFinite(Number(tzParam))) {
		return new Response('Missing or invalid "tz" query parameter (expected a number).', {
			status: 400
		});
	}

	const enableBLT = url.searchParams.get('blt') == 1; // Determine whether to use BLT
	const enableMelatonin = url.searchParams.get('bio') == 1; // Determine whether to use Chronobiotics (melatonin)
	const tz = moment().utcOffset() - Number(tzParam);

	let result;
	try {
		result = computeIntervention({
			currentWake: cWake,
			currentSleep: cSleep,
			goalWake: gWake,
			goalSleep: gSleep,
			startDate: n,
			enableBLT,
			enableMelatonin
		});
	} catch {
		return new Response('Unable to compute intervention schedule from the given parameters.', {
			status: 400
		});
	}

	if (!result.changed) {
		console.log("Don't need no changes!");
		return new Response(null, { status: 204 });
	}

	const ics = buildScheduleIcs({ uidPrefix: 'adhoc', result, tzOffsetMinutes: tz });

	return new Response(ics, { headers: { 'Content-Type': 'text/calendar;charset=utf-8' } });
}
