import ical from 'ical-generator';

/** @type {import('./$types').RequestHandler} */
export async function GET({ url }) {
	const calendar = ical({ name: 'my first iCal' });
	const startTime = new Date();
	const endTime = new Date();
	endTime.setHours(startTime.getHours() + 1);
	calendar.createEvent({
		start: startTime,
		end: endTime,
		summary: '',
		description: 'Remember to set your alarm.'
	});

	const res = new Response(await calendar);
	res.headers.set('Content-Type', 'text/calendar;charset=utf-8');

	return res;
}
