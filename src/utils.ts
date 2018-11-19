'use strict';

import fs = require('fs');
import path = require ('path');
import constants = require('./constants');

export const filterFileName = (filters, fileName) => {
	for (let j = 0; j < filters.length; j++) {
		const filter = filters[j];
		if (filter && filter(fileName)) {
			return true;
		}
	}
	return fileName.startsWith('.') || fileName.startsWith('_');
};

export const getFilePlainName = (fileName) => fileName.substr(0, fileName.lastIndexOf('.'));

const htmlFileExtensions = ['.html', '.htm'];
const markdownFileExtensions = ['.md', '.markdown'];

export const isHtmlFile = (ext) => htmlFileExtensions.includes(ext);
export const isMarkdownFile = (ext) => markdownFileExtensions.includes(ext);

export const addTrailingSlash = (href) => path.join(href, constants.SLASH);

// mkdir if not exists.
// Return error if
export const mkdirIfNotExists = (dir, noWriting, silent) => {
	try {
		const stats = fs.statSync(dir);
		if (stats && !stats.isDirectory()) {
			return new Error('The target file exists but is not a directory.');
		}
	} catch (ex) {
		// Check the folder only if #noWriting.
		if (!noWriting) {fs.mkdirSync(dir);}
		// Print verbosely if not #silent.
		if (!silent) {console.log('Created folder:', dir);}
	}
	return null;
};
