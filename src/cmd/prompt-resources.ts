'use strict';

import utils = require('./utils');
import {promptMessages as messages} from './strings';

export const MODE_DOT_HTML = 1;
export const MODE_TRAILING_SLASH = 2;
export const MODE_NO_TRAILING_SLASH = 3;
export const MODES = [MODE_DOT_HTML, MODE_TRAILING_SLASH, MODE_NO_TRAILING_SLASH];

const nonEmptyStringValidator = (value = '') => Boolean(value.trim());
const trimString = (value = '') => value.trim();
const trimRelativePath = (value = '') => utils.normalizePath(value);

export const textTitle = {
	type: 'input',
	name: 'title',
	message: messages.hintSiteTitle,
	initial: 'My Awesome Blogs',
	validate: nonEmptyStringValidator,
	// format: trimString,
	result: trimString,
};

export const textInputDir = (givenTargetDirLocation) => ({
	type: 'input',
	name: 'inputDir',
	skip: () => true,
	message: messages.getInputDirHint(givenTargetDirLocation),
	initial: '.',
	validate: nonEmptyStringValidator,
	// format: trimRelativePath,
	result: trimRelativePath,
});

export const textOutputDir = (givenTargetDirLocation) => ({
	type: 'input',
	name: 'outputDir',
	message: messages.getOutputDirHint(givenTargetDirLocation),
	initial: '.site',
	validate: nonEmptyStringValidator,
	// format: trimRelativePath,
	result: trimRelativePath,
});

export const modeSelector = {
	type: 'select',
	name: 'mode',
	message: messages.hintSiteMode,
	// 0 stands for the 1st choice.
	initial: 0,
	result: function () {
		// @see https://github.com/enquirer/enquirer/issues/51
		return this.focused.value;
	},
	choices: [{
		name: 'Dot HTML Mode',
		// message: '-- Dot HTML Mode',
		value: MODE_DOT_HTML,
	}, {
		name: 'Trailing Slash Mode',
		// message: '-- Trailing Slash Mode',
		value: MODE_TRAILING_SLASH,
	}, {
		name: 'No Trailing Slash Mode',
		// message: '-- No Trailing Slash Mode',
		value: MODE_NO_TRAILING_SLASH,
	}],
};
