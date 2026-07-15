// Wraps the SvelteKit-generated Worker (.svelte-kit/cloudflare/_worker.js) so
// the same deployment also handles the check-in Cron Trigger. adapter-cloudflare
// only builds a fetch handler, so `scheduled` re-enters that same handler with
// a synthetic request rather than duplicating the send-checkins logic here.
import worker from './.svelte-kit/cloudflare/_worker.js';

async function sendCheckins(env, ctx) {
	const req = new Request(`${env.SITE_ORIGIN}/api/cron/send-checkins`, {
		method: 'POST',
		headers: { Authorization: `Bearer ${env.CRON_SECRET}` }
	});
	const res = await worker.fetch(req, env, ctx);
	if (!res.ok) {
		console.error('send-checkins failed', res.status, await res.text());
	} else {
		console.log('send-checkins ok', await res.text());
	}
}

export default {
	fetch: worker.fetch,
	async scheduled(event, env, ctx) {
		ctx.waitUntil(sendCheckins(env, ctx));
	}
};
