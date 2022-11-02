// TODO: Complete the email scheduling system.

import moment from 'moment/moment';
import sgMail from '@sendgrid/mail';
// sgMail.setApiKey(import.meta.env.VITE_SENDGRID);

// User UNIX timestamp to schedule.

/** @type {import('./$types').RequestHandler} */
export async function GET({ url }) {
    const interventionDays = 10; // Get this from an input
    const preferredTime = moment(new Date().toISOString(), moment.ISO_8601); // Get a time of the day that the user wants emails on

    for (let i = 0; i < interventionDays; i++) {
        const msg = {
            to: 'test@example.com',
            from: 'test@example.com',
            subject: 'Sending with SendGrid is Fun',
            text: 'and easy to do anywhere, even with Node.js',
            html: '<strong>and easy to do anywhere, even with Node.js</strong>',
            send_at: preferredTime.clone().add(i, "days").valueOf()
        };
        console.log('Form submitted');
        // const output = await sgMail.send(msg);
    }

	return {
		body: output
	};
}
