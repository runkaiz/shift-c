async function sendCheckins(env) {
	const res = await fetch(env.TARGET_URL, {
		method: 'POST',
		headers: { Authorization: `Bearer ${env.CRON_SECRET}` }
	});
	const body = await res.text();
	if (!res.ok) {
		console.error('send-checkins failed', res.status, body);
	} else {
		console.log('send-checkins ok', body);
	}
}

export default {
	async scheduled(event, env, ctx) {
		ctx.waitUntil(sendCheckins(env));
	},
	// `wrangler dev --test-scheduled` hits this path to simulate the Cron
	// Trigger locally without waiting for the real schedule.
	async fetch(request, env) {
		if (new URL(request.url).pathname === '/__scheduled') {
			await sendCheckins(env);
			return new Response('ok');
		}
		return new Response('This worker only responds to its Cron Trigger.', { status: 404 });
	}
};
