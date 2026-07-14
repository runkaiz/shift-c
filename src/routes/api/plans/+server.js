import moment from 'moment/moment';

import { computeIntervention } from '$lib/schedule';
import { MELATONIN_FEATURE_ENABLED } from '$lib/featureFlags';
import { MELATONIN_ALLOWED_COUNTRIES, MELATONIN_SCREENING_VERSION } from '$lib/melatoninPolicy';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function badRequest(message) {
	return new Response(message, { status: 400 });
}

/** @type {import('./$types').RequestHandler} */
export async function POST({ request, platform }) {
	let body;
	try {
		body = await request.json();
	} catch {
		return badRequest('Expected a JSON body.');
	}

	const { email, cWake, cSleep, gWake, gSleep, tz } = body ?? {};
	const enableBLT = body?.blt === true;
	const screeningPassed = body?.melatoninScreeningPassed === true;
	// Fail closed: request.cf is only populated with real geolocation on
	// Cloudflare's edge (absent under plain local `wrangler pages dev`), and a
	// missing/unrecognized country must never be treated as allowed.
	const countryAllowed = MELATONIN_ALLOWED_COUNTRIES.includes(request.cf?.country);
	// Chronobiotics (melatonin) forced off — never persisted as enabled while
	// MELATONIN_FEATURE_ENABLED is false, regardless of what the client sends,
	// and even once that flag is on, only enabled when the client reports a
	// passed screening AND the request geolocates to an allowed country.
	const enableMelatonin =
		MELATONIN_FEATURE_ENABLED && body?.bio === true && screeningPassed && countryAllowed;

	if (typeof email !== 'string' || !EMAIL_RE.test(email)) {
		return badRequest('Missing or invalid "email".');
	}
	if (typeof cWake !== 'string' || !moment(cWake, ['HH:mm'], true).isValid()) {
		return badRequest('Missing or invalid "cWake" (expected HH:mm).');
	}
	if (typeof cSleep !== 'string' || !moment(cSleep, ['HH:mm'], true).isValid()) {
		return badRequest('Missing or invalid "cSleep" (expected HH:mm).');
	}
	if (typeof gWake !== 'string' || !moment(gWake, ['HH:mm'], true).isValid()) {
		return badRequest('Missing or invalid "gWake" (expected HH:mm).');
	}
	if (typeof gSleep !== 'string' || !moment(gSleep, ['HH:mm'], true).isValid()) {
		return badRequest('Missing or invalid "gSleep" (expected HH:mm).');
	}
	if (typeof tz !== 'number' || !Number.isFinite(tz)) {
		return badRequest('Missing or invalid "tz" (expected a number of minutes).');
	}

	// Confirms the inputs actually produce a schedule before we persist
	// anything — mirrors the validation generate-ical already does.
	try {
		computeIntervention({
			currentWake: cWake,
			currentSleep: cSleep,
			goalWake: gWake,
			goalSleep: gSleep,
			startDate: new Date(),
			enableBLT,
			enableMelatonin
		});
	} catch {
		return badRequest('Unable to compute an intervention schedule from the given parameters.');
	}

	const token = crypto.randomUUID();
	const now = new Date().toISOString();

	// Audit trail of the screening attempt itself (what the client claimed,
	// stamped with the question version in force at the time) is independent
	// of whether it ultimately resulted in melatonin being enabled — a
	// consented_at timestamp only "counts" once it actually took effect.
	const melatoninScreeningPassedValue =
		body?.melatoninScreeningPassed === undefined ? null : screeningPassed ? 1 : 0;
	const melatoninScreeningVersionValue =
		body?.melatoninScreeningPassed === undefined ? null : MELATONIN_SCREENING_VERSION;
	const melatoninConsentedAtValue = enableMelatonin ? now : null;

	await platform.env.DB.prepare(
		`INSERT INTO plans (
			token, email, created_at, utc_offset_minutes,
			enable_blt, enable_melatonin,
			goal_wake, goal_sleep,
			baseline_wake, baseline_sleep, baseline_date,
			unsubscribed,
			melatonin_screening_passed, melatonin_screening_version, melatonin_consented_at
		) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?)`
	)
		.bind(
			token,
			email,
			now,
			tz,
			enableBLT ? 1 : 0,
			enableMelatonin ? 1 : 0,
			gWake,
			gSleep,
			cWake,
			cSleep,
			now,
			melatoninScreeningPassedValue,
			melatoninScreeningVersionValue,
			melatoninConsentedAtValue
		)
		.run();

	return new Response(JSON.stringify({ token }), {
		status: 201,
		headers: { 'Content-Type': 'application/json' }
	});
}
