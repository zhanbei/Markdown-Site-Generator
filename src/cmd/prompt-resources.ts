'use strict';

import path = require('path');
import utils = require('./utils');

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
	message: 'The title of your site:',
	initial: 'My Awesome Blogs',
	validate: nonEmptyStringValidator,
	// format: trimString,
	result: trimString,
};

export const textInputDir = givenTargetDir => ({
	type: 'input',
	name: 'inputDir',
	skip: () => true,
	message:
		`The entrance/root folder of your markdown site, relative to the given target dir "${path.resolve(givenTargetDir)}".\n` +
		`Input(Markdown Site) Folder:`,
	initial: '.',
	validate: nonEmptyStringValidator,
	// format: trimRelativePath,
	result: trimRelativePath,
});

export const textOutputDir = givenTargetDir => ({
	type: 'input',
	name: 'outputDir',
	message:
		`The entrance/root folder of your markdown site is set to "${path.resolve(givenTargetDir)}".\n` +
		`Now set the the output folder for the generated site, relative to the given target dir "${path.resolve(givenTargetDir)}".\n` +
		'Output(Generated Site) Folder:',
	initial: '.site',
	validate: nonEmptyStringValidator,
	// format: trimRelativePath,
	result: trimRelativePath,
});

export const modeSelector = {
	type: 'select',
	name: 'mode',
	message:
		'There are three modes supported by the Markdown Site Generator.\n' +
		'Which mode to build your site:' +
		'Choose MODE:',
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
