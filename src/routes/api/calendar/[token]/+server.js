import moment from 'moment/moment';

import { computeIntervention } from '$lib/schedule';
import { buildScheduleIcs, buildIcs } from '$lib/ical';
import { MELATONIN_FEATURE_ENABLED } from '$lib/featureFlags';
import { t } from '$lib/i18n/server';

/** @type {import('./$types').RequestHandler} */
export async function GET({ params, platform }) {
	const token = params.token.replace(/\.ics$/i, '');

	const plan = await platform.env.DB.prepare('SELECT * FROM plans WHERE token = ?')
		.bind(token)
		.first();

	if (!plan) {
		return new Response('No such calendar subscription.', { status: 404 });
	}

	// A subscription feed should always return a valid (possibly empty)
	// calendar with 200 — unlike the one-off /api/generate-ical download,
	// some calendar clients treat a non-200/non-calendar response as a
	// broken subscription and stop polling it.
	let ics;
	try {
		const result = computeIntervention({
			currentWake: plan.baseline_wake,
			currentSleep: plan.baseline_sleep,
			goalWake: plan.goal_wake,
			goalSleep: plan.goal_sleep,
			startDate: plan.baseline_date,
			enableBLT: !!plan.enable_blt,
			// Forced off regardless of the stored column — see
			// src/lib/featureFlags.js. Existing rows from before the feature
			// was disabled must not resurface melatonin content.
			enableMelatonin: MELATONIN_FEATURE_ENABLED && !!plan.enable_melatonin
		});

		const tzOffsetMinutes = moment().utcOffset() - plan.utc_offset_minutes;

		ics = result.changed
			? buildScheduleIcs({ uidPrefix: token, result, tzOffsetMinutes, locale: plan.locale })
			: buildIcs({ name: t(plan.locale, 'ical.calendarName'), events: [] });
	} catch {
		ics = buildIcs({ name: t(plan.locale, 'ical.calendarName'), events: [] });
	}

	return new Response(ics, {
		headers: {
			'Content-Type': 'text/calendar;charset=utf-8',
			'Cache-Control': 'no-cache'
		}
	});
}
