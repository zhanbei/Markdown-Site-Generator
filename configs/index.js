'use strict';

const path = require('path');
// The selected configs of selected theme(github), which take cares of used templates and selected mode.
// Merge it into the site configs to make it work.
const configures = require('./github/no-trailing-slash-templates/configs');

// The default configs for the markdown site.
module.exports = Object.assign({
	title: 'My Awesome Blogs',

	inputDir: path.resolve(__dirname, '..'),
	outputDir: path.resolve(__dirname, '../.site'),

	// Filter out some files or folders.
	nameFilters: [
		(name) => name.startsWith('_reserve'),
		(name) => ['backups', 'README.md', 'Drafts', 'logs'].includes(name),
	],
	nameConverter: (name) => name.toLowerCase(),

	// Generate site in the dot-html mode, if true, and !trailingSlash and !noTrailingSlash.
	dotHTML: true,
	// Generate site in the trailing-slash mode, if true and !noTrailingSlash.
	trailingSlash: false,
	// Generate site in the no-trailing-slash mode, if true.
	noTrailingSlash: false,

	// The default configures used, which will be override by selected templates and mode.
	assetsDir: path.resolve(__dirname, 'not-existed/assets'),
	mdPageTemplate: path.resolve(__dirname, 'not-existed/templates/page.ejs'),
	mdListTemplate: path.resolve(__dirname, 'not-existed/templates/list.ejs'),
}, configures);
