'use strict';

export const TIME_WAIT_SAY = 500;
export const LOADING_DOTS = ['.', '.', '.', ' ', '.', '.', '.'];

// Print something with delay and no trailing newline.
export const print = async (something = '', milliseconds = TIME_WAIT_SAY / 4 * 3) => new Promise(resolve => {
	setTimeout(() => {
		something ? process.stdout.write(something) : undefined;
		resolve();
	}, milliseconds);
});

// Print with delay and a trailing newline.
export const println = async (something = '', milliseconds = TIME_WAIT_SAY) => print(something + '\n', milliseconds);

// Print dots to consuming time. :)
export const printLoadingDots = async (dots = LOADING_DOTS) => new Promise(async resolve => {
	for (let i = 0; i < dots.length; i++) {
		await print(dots[i]);
	}
	resolve();
});
