// Unsubscribing must not happen on GET — email clients and corporate link
// scanners (Gmail/Outlook "Safe Links") prefetch links in delivered emails,
// which would silently unsubscribe users the moment the email arrives if
// this mutated state on load. The mutation only happens in the POST action
// below, triggered by an explicit button click.

/** @type {import('./$types').PageServerLoad} */
export async function load({ params, platform }) {
	const plan = await platform.env.DB.prepare('SELECT unsubscribed FROM plans WHERE token = ?')
		.bind(params.token)
		.first();

	return { found: !!plan, alreadyUnsubscribed: plan?.unsubscribed === 1 };
}

/** @type {import('./$types').Actions} */
export const actions = {
	default: async ({ params, platform }) => {
		const result = await platform.env.DB.prepare(
			'UPDATE plans SET unsubscribed = 1 WHERE token = ?'
		)
			.bind(params.token)
			.run();

		return { done: result.meta.changes > 0 };
	}
};
