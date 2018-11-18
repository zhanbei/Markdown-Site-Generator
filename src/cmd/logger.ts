'use strict';

export const FG_RESET = '\x1b[0m';
export const FG_RED = '\x1b[31m';
export const FG_GREEN = '\x1b[32m';
export const FG_YELLOW = '\x1b[33m';

// Info for import information.
export const FG_INFO = FG_GREEN;
export const FG_WARN = FG_YELLOW;
export const FG_ERROR = FG_RED;
export const PREFIX_SPACES = ' '.repeat(4);

export const log = (...messages) => {
	console.log(...messages);
};

// @see https://stackoverflow.com/questions/9781218/how-to-change-node-jss-console-font-color
export const warn = (msg: string, ...messages) => {
	console.warn();
	if (msg || messages.length > 0) {
		console.warn(`${PREFIX_SPACES}${FG_WARN}%s${FG_RESET}`, msg, ...messages);
	}
};

export const error = (msg: string, ...messages) => {
	console.error();
	if (msg || messages.length > 0) {
		console.error(`${PREFIX_SPACES}${FG_ERROR}%s${FG_RESET}`, msg, ...messages);
	}
};
