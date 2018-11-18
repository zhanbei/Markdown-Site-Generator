'use strict';

import * as fs from 'fs';
import * as path from 'path';
import * as constants from './constants';
import * as utils from '../utils';
import {GivenSiteOptions} from './prompt-user';

// Normalize a given path to remove any redundant components using path.join().
export const normalizePath = (givenPath = '') => givenPath.trim() ? path.join('', givenPath.trim(), '') : '';

// Return file.stat if a file exists, or null if it does not exist.
export const isFileExist = (file): fs.Stats => {
	try {
		return fs.statSync(file);
	} catch (ex) {
		return null;
	}
};

export const mkdirIfNotExists = utils.mkdirIfNotExists;

const escapeSingleQuote = (value = '') => value.replace(/'/g, '\\\'');

export const renderSiteConfigsIndexJs = (options: GivenSiteOptions) => {
	const site: GivenSiteOptions = {
		title: escapeSingleQuote(options.title),
		inputDir: escapeSingleQuote(path.join('..', options.inputDir)),
		outputDir: escapeSingleQuote(path.join('..', options.outputDir)),
		mode: options.mode,
		trailingSlash: options.trailingSlash,
		noTrailingSlash: options.noTrailingSlash,
	};
	return constants.renderSiteConfigsIndexJsByTemplate(site);
};
