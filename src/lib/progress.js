import { goto, prefetch } from '$app/navigation';

function next({ to, shouldPrefetch, nextStep, data }) {
	if (shouldPrefetch) {
		prefetch(to);
	}

	if (!nextStep || !to) {
		if (!nextStep && !to) {
			throw new Error('to or nextStep must be defined');
		}

		if (nextStep) {
			to = nextStep;
		}

		if (to) {
			nextStep = to;
		}
	}

	const progress = JSON.parse(localStorage.getItem('progress'));

	// Write progress to local storage
	localStorage.setItem(
		'progress',
		JSON.stringify({
			step: nextStep,
			finished: false,
			data: progress ? { ...progress.data, ...data } : { data }
		})
	);

	// Wait for 400 ms for the animation to finish
	setTimeout(() => {
		goto(to);
	}, 400);
}

function resume({ data }) {
	const progress = JSON.parse(localStorage.getItem('progress'));

	// Write progress to local storage
	localStorage.setItem(
		'progress',
		JSON.stringify({
			step: progress.step,
			finished: false,
			data: { ...progress.data, ...data }
		})
	);

	// Wait for 400 ms for the animation to finish
	setTimeout(() => {
		goto(progress.step);
	}, 400);
}

export { next, resume };
