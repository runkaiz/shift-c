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

function buildBody({ today, nextDay, regime, goalSleep, checkinUrl, unsubscribeUrl, locale }) {
	const safetyWarning = melatoninSafetyWarning(locale);

	// Retrospective reminder for "Did you stick with your plan yesterday?".
	// `today` is the day object keyed by *this morning's* wake date (see
	// send-checkins/+server.js findDayForDate), so `today.sleep` is the bedtime
	// the user was aiming for last night — exactly what the question is about.
	// Bedtime is the only figure the check-in actually records
	// (checkins.reported_bedtime/stuck_to_plan), and it's the one that
	// unambiguously belongs to "yesterday" (today.wake already happened this
	// morning), so the recap leads with it alone.
	const recap = t(locale, 'email.checkin.recap', { time: formatTime(today.sleep) });

	// Prospective "today's plan": the actions still ahead of the user today.
	// Tonight's real bedtime is the *next* day object's sleep — today.sleep is
	// already behind them (the source of the off-by-one this fixes: it used to
	// render today.sleep under "tonight's bedtime"). Light and melatonin anchor
	// to different day objects depending on regime: morning bright light
	// (advance/extension) is this morning's `today.blt`; evening light (delay)
	// is tonight's `nextDay.blt`; the delay melatonin dose is taken on waking
	// (`today.melatonin`) while advance/extension dose before tonight's bed
	// (`nextDay.melatonin`). See computeBltTime/computeMelatoninDose in
	// ../melatonin.js for the per-regime anchoring.
	// On the final transition day there's no next day object — the user has
	// reached their goal schedule, whose bedtime isn't a row in `days`. Fall
	// back to the goal bedtime so the email still gives tonight's target rather
	// than dropping the forward-looking section entirely.
	const tonightSleep = nextDay?.sleep ?? goalSleep ?? null;
	const tonightBedtimeLine = tonightSleep
		? t(locale, 'email.checkin.bedtimeLine', { time: formatTime(tonightSleep) })
		: null;

	const todayBlt = regime === 'delay' ? nextDay?.blt : today.blt;
	const bltLine = todayBlt
		? t(locale, 'email.checkin.bltLine', { time: formatTime(todayBlt) })
		: null;

	const todayMelatonin = regime === 'delay' ? today.melatonin : nextDay?.melatonin;
	const [minDose, maxDose] = todayMelatonin?.doseRangeMg ?? [];
	const melatoninLine = todayMelatonin
		? todayMelatonin.chronobiotic
			? t(locale, 'email.checkin.melatoninChronobioticLine', {
					minDose,
					maxDose,
					time: formatTime(todayMelatonin.time),
					safetyWarning
			  })
			: t(locale, 'email.checkin.melatoninSleepAidLine', {
					minDose,
					maxDose,
					time: formatTime(todayMelatonin.time),
					safetyWarning
			  })
		: null;

	const reminderLines = [tonightBedtimeLine, bltLine, melatoninLine].filter(Boolean);

	// No next day object means this is the final transition day and the bedtime
	// above came from the goal fallback — say so, otherwise "tonight's bedtime"
	// silently matching last night's reads like the schedule stopped moving by
	// accident. Gated on the bedtime line actually rendering, since the copy
	// refers to it.
	const goalReachedLine =
		!nextDay && tonightBedtimeLine ? t(locale, 'email.checkin.goalReached') : null;

	// On the final transition day there's no next day object (tonight's target
	// is the goal schedule, which isn't a row in `days`), so the forward-looking
	// section can be empty — omit it rather than print an empty "today's plan".
	const textParts = [t(locale, 'email.checkin.question'), '', recap];
	if (reminderLines.length) {
		textParts.push(
			'',
			t(locale, 'email.checkin.intro'),
			...reminderLines.map((line) => `- ${line}`)
		);
	}
	if (goalReachedLine) {
		textParts.push('', goalReachedLine);
	}
	textParts.push(
		'',
		t(locale, 'email.checkin.fellOffTrack', { checkinUrl }),
		'',
		t(locale, 'email.checkin.unsubscribeLine', { unsubscribeUrl })
	);
	const text = textParts.join('\n');

	const todayHtml = reminderLines.length
		? `<p>${t(locale, 'email.checkin.intro')}</p>
		<ul>${reminderLines.map((line) => `<li>${line}</li>`).join('')}</ul>`
		: '';
	const goalReachedHtml = goalReachedLine ? `<p>${goalReachedLine}</p>` : '';
	const html = `
		<p>${t(locale, 'email.checkin.question')}</p>
		<p>${recap}</p>
		${todayHtml}
		${goalReachedHtml}
		<p>${t(locale, 'email.checkin.fellOffTrackHtml', { checkinUrl })}</p>
		<p style="color:#888;font-size:12px;">${t(locale, 'email.checkin.unsubscribeLineHtml', {
			unsubscribeUrl
		})}</p>
	`.trim();

	return { text, html };
}

/**
 * @typedef {{ sleep: moment.Moment, wake: moment.Moment, blt: moment.Moment|null, melatonin: {time: moment.Moment, doseRangeMg: [number, number], chronobiotic: boolean}|null }} InterventionDay
 */

/**
 * @param {object} env - platform.env (needs EMAIL, EMAIL_FROM_ADDRESS, DRY_RUN_EMAIL)
 * @param {object} params
 * @param {string} params.to
 * @param {InterventionDay} params.today - Day object for this morning's wake
 *   date; its `sleep` is last night's target bedtime (what the check-in asks
 *   about).
 * @param {InterventionDay|null} params.nextDay - Day object for tomorrow's wake
 *   date, i.e. tonight's sleep; null on the final transition day.
 * @param {'advance'|'delay'|'extension'} params.regime - Selects which day
 *   object's bright-light/melatonin timing counts as "today's" (see buildBody).
 * @param {moment.Moment} params.goalSleep - The plan's goal bedtime, used as
 *   tonight's bedtime on the final transition day (when nextDay is null).
 * @param {string} params.checkinUrl
 * @param {string} params.unsubscribeUrl
 * @param {string} params.locale
 */
export async function sendCheckInEmail(
	env,
	{ to, today, nextDay, regime, goalSleep, checkinUrl, unsubscribeUrl, locale }
) {
	const subject = t(locale, 'email.checkin.subject');
	const { text, html } = buildBody({
		today,
		nextDay,
		regime,
		goalSleep,
		checkinUrl,
		unsubscribeUrl,
		locale
	});

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
