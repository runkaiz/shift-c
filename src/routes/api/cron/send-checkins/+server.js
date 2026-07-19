import moment from 'moment/moment';

import { computeIntervention } from '$lib/schedule';
import { sendCheckInEmail } from '$lib/server/email';
import { MELATONIN_FEATURE_ENABLED } from '$lib/featureFlags';

// How late (past the target send time) the cron is still allowed to send
// today's check-in. Larger than the cron's own interval so a single missed
// run doesn't skip the day entirely, but small enough that a multi-hour
// outage doesn't send a very stale reminder.
const SEND_WINDOW_MINUTES = 90;

/**
 * Finds the day entry (from computeIntervention's result.days) whose local
 * calendar date matches `dateStr`, if the plan's intervention covers it.
 */
function findDayForDate(days, dateStr) {
	return days.find((day) => day.wake.format('YYYY-MM-DD') === dateStr) ?? null;
}

/** @type {import('./$types').RequestHandler} */
export async function POST({ request, platform }) {
	const auth = request.headers.get('Authorization');
	if (auth !== `Bearer ${platform.env.CRON_SECRET}`) {
		return new Response('Unauthorized', { status: 401 });
	}

	const origin = new URL(request.url).origin;
	const db = platform.env.DB;

	const { results: plans } = await db.prepare('SELECT * FROM plans WHERE unsubscribed = 0').all();

	let sent = 0;
	let skipped = 0;

	for (const plan of plans) {
		let result;
		try {
			result = computeIntervention({
				currentWake: plan.baseline_wake,
				currentSleep: plan.baseline_sleep,
				goalWake: plan.goal_wake,
				goalSleep: plan.goal_sleep,
				startDate: plan.baseline_date,
				enableBLT: !!plan.enable_blt,
				// Forced off regardless of the stored column — see
				// src/lib/featureFlags.js. Existing rows from before the feature
				// was disabled must not resurface melatonin content in the email.
				enableMelatonin: MELATONIN_FEATURE_ENABLED && !!plan.enable_melatonin
			});
		} catch {
			skipped++;
			continue;
		}

		if (!result.changed) {
			skipped++;
			continue;
		}

		// The plan's schedule is built from "naive" moments (see src/lib/ical.js
		// for the fuller explanation) that represent local wall-clock readings.
		// To compare against "now" in the plan's local time, shift the current
		// UTC instant back by the same offset used to convert those naive
		// moments to real UTC instants for the calendar feed.
		const tzOffsetMinutes = moment().utcOffset() - plan.utc_offset_minutes;
		const nowNaive = moment.utc().subtract(tzOffsetMinutes, 'minutes');
		const todayStr = nowNaive.format('YYYY-MM-DD');

		const today = findDayForDate(result.days, todayStr);
		if (!today) {
			skipped++;
			continue;
		}

		// Gate the morning check-in on this morning's wake, always. The day
		// object is keyed by its wake date, so `today.wake` is reliably this
		// morning; `today.blt` is not a safe target because for a delay regime
		// BLT is *evening* light anchored to that day's sleep (the previous
		// night's bedtime, hours before now) — using it skipped delay+BLT users
		// every day. The check-in is a morning reminder, not the light action,
		// so wake is the right anchor for every regime; for morning-light
		// regimes BLT is only ~30min after wake anyway, well inside the window.
		const target = today.wake;
		const minutesPastTarget = nowNaive.diff(target, 'minutes');
		if (minutesPastTarget < 0 || minutesPastTarget > SEND_WINDOW_MINUTES) {
			skipped++;
			continue;
		}

		const existing = await db
			.prepare('SELECT id FROM checkins WHERE plan_token = ? AND checkin_date = ?')
			.bind(plan.token, todayStr)
			.first();
		if (existing) {
			skipped++;
			continue;
		}

		await sendCheckInEmail(platform.env, {
			to: plan.email,
			today,
			checkinUrl: `${origin}/${plan.locale}/checkin/${plan.token}?date=${todayStr}`,
			unsubscribeUrl: `${origin}/${plan.locale}/unsubscribe/${plan.token}`,
			locale: plan.locale
		});

		await db
			.prepare('INSERT INTO checkins (plan_token, checkin_date, sent_at) VALUES (?, ?, ?)')
			.bind(plan.token, todayStr, new Date().toISOString())
			.run();

		sent++;
	}

	return new Response(JSON.stringify({ sent, skipped, total: plans.length }), {
		headers: { 'Content-Type': 'application/json' }
	});
}
