// Builds and sends the daily check-in email via Cloudflare's Email Service
// binding (`env.EMAIL.send(EmailMessageBuilder)` — see @cloudflare/workers-types
// `SendEmail`/`EmailMessageBuilder`). Requires the sending domain to be
// onboarded in the Cloudflare dashboard; until then (or whenever
// DRY_RUN_EMAIL is set), the composed email is logged instead of sent so the
// rest of the check-in flow can be developed/verified without live
// credentials.

import { MELATONIN_SAFETY_WARNING } from '../melatonin';

function formatTime(momentInstance) {
	return momentInstance.format('h:mm A');
}

function buildBody({ today, checkinUrl, unsubscribeUrl }) {
	const bedtimeLine = `Tonight's bedtime: ${formatTime(today.sleep)}`;
	const [minDose, maxDose] = today.melatonin?.doseRangeMg ?? [];
	const melatoninLine = today.melatonin
		? today.melatonin.chronobiotic
			? `Melatonin: commonly ${minDose}–${maxDose} mg around ${formatTime(
					today.melatonin.time
			  )} — talk to a clinician about what's right for you. ${MELATONIN_SAFETY_WARNING}`
			: `Optional sleep aid (not a clock-shift dose): commonly ${minDose}–${maxDose} mg around ${formatTime(
					today.melatonin.time
			  )} if you want it — a consistent bedtime and a dark, cool room usually help more. ${MELATONIN_SAFETY_WARNING}`
		: null;
	const bltLine = today.blt ? `Bright light therapy: around ${formatTime(today.blt)}` : null;

	const reminderLines = [bedtimeLine, bltLine, melatoninLine].filter(Boolean);

	const text = [
		'Did you stick with your plan yesterday?',
		'',
		`If yes — nice work, no need to do anything. Here's today's plan:`,
		...reminderLines.map((line) => `- ${line}`),
		'',
		`If you fell off track, let us know so we can adjust the rest of your plan: ${checkinUrl}`,
		'',
		`Unsubscribe from these emails: ${unsubscribeUrl}`
	].join('\n');

	const html = `
		<p>Did you stick with your plan yesterday?</p>
		<p>If yes — nice work, no need to do anything. Here's today's plan:</p>
		<ul>${reminderLines.map((line) => `<li>${line}</li>`).join('')}</ul>
		<p>If you fell off track, <a href="${checkinUrl}">let us know</a> so we can adjust the rest of your plan.</p>
		<p style="color:#888;font-size:12px;"><a href="${unsubscribeUrl}">Unsubscribe</a> from these emails.</p>
	`.trim();

	return { text, html };
}

/**
 * @param {object} env - platform.env (needs EMAIL, EMAIL_FROM_ADDRESS, DRY_RUN_EMAIL)
 * @param {object} params
 * @param {string} params.to
 * @param {{ sleep: moment.Moment, wake: moment.Moment, blt: moment.Moment|null, melatonin: {time: moment.Moment, doseRangeMg: [number, number], chronobiotic: boolean}|null }} params.today
 * @param {string} params.checkinUrl
 * @param {string} params.unsubscribeUrl
 */
export async function sendCheckInEmail(env, { to, today, checkinUrl, unsubscribeUrl }) {
	const subject = 'Did you stick with your plan yesterday?';
	const { text, html } = buildBody({ today, checkinUrl, unsubscribeUrl });

	if (env.DRY_RUN_EMAIL === '1' || !env.EMAIL) {
		console.log('[DRY_RUN_EMAIL] would send:', { to, subject, text });
		return { dryRun: true, to, subject, text, html };
	}

	return env.EMAIL.send({
		from: env.EMAIL_FROM_ADDRESS,
		to,
		subject,
		text,
		html
	});
}
