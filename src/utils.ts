'use strict';

const fs = require('fs');

export const filterFileName = (filters, fileName) => {
	for (let j = 0; j < filters.length; j++) {
		const filter = filters[j];
		if (filter && filter(fileName)) {
			return true;
		}
	}
	return fileName.startsWith('.') || fileName.startsWith('_');
};

const htmlFileExtensions = ['.html', '.htm'];
const markdownFileExtensions = ['.md', '.markdown'];

export const isHtmlFile = (ext) => htmlFileExtensions.includes(ext);
export const isMarkdownFile = (ext) => markdownFileExtensions.includes(ext);

// mkdir if not exists.
// Return error if
export const mkdirIfNotExists = (dir) => {
	try {
		const stats = fs.statSync(dir);
		if (!stats.isDirectory()) {
			return new Error('The target file exists but is not a directory.');
		}
	} catch (ex) {
		fs.mkdirSync(dir);
		console.log('Created folder:', dir);
	}
	return null;
};
