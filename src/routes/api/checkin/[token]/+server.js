import moment from 'moment/moment';

function badRequest(message) {
	return new Response(message, { status: 400 });
}

/** @type {import('./$types').RequestHandler} */
export async function POST({ params, request, platform }) {
	const token = params.token;

	let body;
	try {
		body = await request.json();
	} catch {
		return badRequest('Expected a JSON body.');
	}

	const { date, stuckToPlan, reportedBedtime } = body ?? {};

	if (typeof date !== 'string' || !moment(date, 'YYYY-MM-DD', true).isValid()) {
		return badRequest('Missing or invalid "date" (expected YYYY-MM-DD).');
	}
	if (typeof stuckToPlan !== 'boolean') {
		return badRequest('Missing or invalid "stuckToPlan" (expected a boolean).');
	}
	if (
		!stuckToPlan &&
		(typeof reportedBedtime !== 'string' || !moment(reportedBedtime, ['HH:mm'], true).isValid())
	) {
		return badRequest('"reportedBedtime" (HH:mm) is required when stuckToPlan is false.');
	}

	const db = platform.env.DB;

	const plan = await db.prepare('SELECT token FROM plans WHERE token = ?').bind(token).first();
	if (!plan) {
		return new Response('No such plan.', { status: 404 });
	}

	const now = new Date().toISOString();

	await db
		.prepare(
			`INSERT INTO checkins (plan_token, checkin_date, responded_at, stuck_to_plan, reported_bedtime)
			 VALUES (?, ?, ?, ?, ?)
			 ON CONFLICT(plan_token, checkin_date) DO UPDATE SET
				responded_at = excluded.responded_at,
				stuck_to_plan = excluded.stuck_to_plan,
				reported_bedtime = excluded.reported_bedtime`
		)
		.bind(token, date, now, stuckToPlan ? 1 : 0, stuckToPlan ? null : reportedBedtime)
		.run();

	// Adjustment rule: only the reported bedtime is known (the email fires
	// after the plan's wake/BLT time, so wake is assumed to have happened on
	// schedule) — carry baseline_wake forward unchanged, and resume the
	// schedule the day after the reported date.
	if (!stuckToPlan) {
		await db
			.prepare('UPDATE plans SET baseline_sleep = ?, baseline_date = ? WHERE token = ?')
			.bind(reportedBedtime, date, token)
			.run();
	}

	return new Response(JSON.stringify({ ok: true }), {
		headers: { 'Content-Type': 'application/json' }
	});
}
