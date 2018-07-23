const fs = require('fs');
const path = require('path');

exports.filterFileName = (filters, fileName) => {
	for (let j = 0; j < filters.length; j++) {
		const filter = filters[j];
		if (filter && filter(fileName)) {return true;}
	}
	return false;
};

const htmlFileExtensions = ['.html', '.htm'];
const markdownFileExtensions = ['.md', '.markdown'];

exports.isHtmlFile = (name) => htmlFileExtensions.includes(path.extname(name));
exports.isMarkdownFile = (name) => markdownFileExtensions.includes(path.extname(name));

// mkdir if not exists.
// Return error if
exports.mkdirIfNotExists = (dir) => {
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
