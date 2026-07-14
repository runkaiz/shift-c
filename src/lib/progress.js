import { get } from 'svelte/store';
import { goto, preloadData } from '$app/navigation';
import { page } from '$app/stores';

import { DEFAULT_LOCALE } from './i18n/constants';

function readProgress() {
	try {
		return JSON.parse(localStorage.getItem('progress'));
	} catch {
		return null;
	}
}

// Bare app paths (e.g. '/app/start') are stored/passed around unprefixed so
// callers don't need to know the current locale; this resolves them against
// whatever locale the user is on right now, right before navigating.
// `/api/*` routes live outside the [locale] segment and must stay untouched.
function withLocale(path) {
	if (!path || path.startsWith('/api/')) return path;
	const locale = get(page).params.locale ?? DEFAULT_LOCALE;
	return path === '/' ? `/${locale}` : `/${locale}${path}`;
}

function next({ to, shouldPrefetch, nextStep, data }) {
	if (!nextStep && !to) {
		throw new Error('to or nextStep must be defined');
	}

	to = to || nextStep;
	nextStep = nextStep || to;

	const target = withLocale(to);

	if (shouldPrefetch) {
		preloadData(target);
	}

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
		goto(target);
	}, 400);
}

function resume({ data, fallback }) {
	const progress = readProgress();

	if (!progress) {
		// Wait for 400 ms for the animation to finish
		setTimeout(() => {
			goto(withLocale(fallback));
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
		goto(withLocale(progress.step));
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
