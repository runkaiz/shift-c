// Builds and sends the daily check-in email via Cloudflare's Email Service
// binding (`env.EMAIL.send(EmailMessageBuilder)` — see @cloudflare/workers-types
// `SendEmail`/`EmailMessageBuilder`). Requires the sending domain to be
// onboarded in the Cloudflare dashboard; until then (or whenever
// DRY_RUN_EMAIL is set), the composed email is logged instead of sent so the
// rest of the check-in flow can be developed/verified without live
// credentials.

import { melatoninSafetyWarning } from '../melatonin';
import { t } from '../i18n/server';

function formatTime(momentInstance) {
	return momentInstance.format('h:mm A');
}

function buildBody({ today, checkinUrl, unsubscribeUrl, locale }) {
	const safetyWarning = melatoninSafetyWarning(locale);
	const bedtimeLine = t(locale, 'email.checkin.bedtimeLine', { time: formatTime(today.sleep) });
	const [minDose, maxDose] = today.melatonin?.doseRangeMg ?? [];
	const melatoninLine = today.melatonin
		? today.melatonin.chronobiotic
			? t(locale, 'email.checkin.melatoninChronobioticLine', {
					minDose,
					maxDose,
					time: formatTime(today.melatonin.time),
					safetyWarning
			  })
			: t(locale, 'email.checkin.melatoninSleepAidLine', {
					minDose,
					maxDose,
					time: formatTime(today.melatonin.time),
					safetyWarning
			  })
		: null;
	const bltLine = today.blt
		? t(locale, 'email.checkin.bltLine', { time: formatTime(today.blt) })
		: null;

	const reminderLines = [bedtimeLine, bltLine, melatoninLine].filter(Boolean);

	const text = [
		t(locale, 'email.checkin.question'),
		'',
		t(locale, 'email.checkin.intro'),
		...reminderLines.map((line) => `- ${line}`),
		'',
		t(locale, 'email.checkin.fellOffTrack', { checkinUrl }),
		'',
		t(locale, 'email.checkin.unsubscribeLine', { unsubscribeUrl })
	].join('\n');

	const html = `
		<p>${t(locale, 'email.checkin.question')}</p>
		<p>${t(locale, 'email.checkin.intro')}</p>
		<ul>${reminderLines.map((line) => `<li>${line}</li>`).join('')}</ul>
		<p>${t(locale, 'email.checkin.fellOffTrackHtml', { checkinUrl })}</p>
		<p style="color:#888;font-size:12px;">${t(locale, 'email.checkin.unsubscribeLineHtml', {
			unsubscribeUrl
		})}</p>
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
 * @param {string} params.locale
 */
export async function sendCheckInEmail(env, { to, today, checkinUrl, unsubscribeUrl, locale }) {
	const subject = t(locale, 'email.checkin.subject');
	const { text, html } = buildBody({ today, checkinUrl, unsubscribeUrl, locale });

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
