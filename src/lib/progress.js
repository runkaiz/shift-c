import { goto, preloadData } from '$app/navigation';

function readProgress() {
	try {
		return JSON.parse(localStorage.getItem('progress'));
	} catch {
		return null;
	}
}

function next({ to, shouldPrefetch, nextStep, data }) {
	if (shouldPrefetch) {
		preloadData(to);
	}

	if (!nextStep && !to) {
		throw new Error('to or nextStep must be defined');
	}

	to = to || nextStep;
	nextStep = nextStep || to;

	const progress = readProgress();

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

function resume({ data, fallback }) {
	const progress = readProgress();

	if (!progress) {
		// Wait for 400 ms for the animation to finish
		setTimeout(() => {
			goto(fallback);
		}, 400);
		return;
	}

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

function read() {
	const progress = readProgress();

	if (!progress) {
		return { step: null, finished: false, data: {} };
	}

	return progress;
}

export { next, resume, read };
