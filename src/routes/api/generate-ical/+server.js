import ical from 'ical-generator';
import moment from 'moment/moment';

import { computeIntervention } from '$lib/schedule';

const BLT_DURATION_MINUTES = 15;

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
	const tz = moment().utcOffset() - Number(tzParam);

	let result;
	try {
		result = computeIntervention({
			currentWake: cWake,
			currentSleep: cSleep,
			goalWake: gWake,
			goalSleep: gSleep,
			startDate: n,
			enableBLT
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

	const calendar = ical({ name: 'Intervention Protocol' });

	for (const day of result.days) {
		const sleep = moment(day.sleep).add(tz, 'minutes').toDate();
		const wake = moment(day.wake).add(tz, 'minutes').toDate();

		calendar.createEvent({
			start: sleep,
			end: wake,
			summary: 'Sleep',
			description: `Please try to sleep during this time ;) TZ offset = ${tz}`,
			url: 'https://shiftc.app/'
		});

		if (day.blt) {
			const bltStart = moment(day.blt).add(tz, 'minutes').toDate();
			const bltEnd = moment(bltStart).add(BLT_DURATION_MINUTES, 'minutes').toDate();

			calendar.createEvent({
				start: bltStart,
				end: bltEnd,
				summary: 'Bright Light Therapy',
				description: 'Get some bright light exposure to help shift your circadian clock.',
				url: 'https://shiftc.app/'
			});
		}
	}

	const res = new Response(calendar);
	res.headers.set('Content-Type', 'text/calendar;charset=utf-8');

	return res;
}
