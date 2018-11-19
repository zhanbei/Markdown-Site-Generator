'use strict';

const path = require('path');
// The selected configs of selected theme(github), which take cares of used templates and selected mode.
// Merge it into the site configures to make it work(, and existed configures may be overridden).
const configures = require('./github/dot-html-templates/configs');

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

	/* The following configures will be overridden by the configures of selected theme. */
	/* Modify the selected configures directly to customize site's templates and mode. */

	// The configures of the site building mode, which will be overridden by the selected mode.
	// Generate site in the dot-html mode, if true, and !trailingSlash and !noTrailingSlash.
	dotHTML: false,
	// Generate site in the trailing-slash mode, if true and !noTrailingSlash.
	trailingSlash: false,
	// Generate site in the no-trailing-slash mode, if true.
	noTrailingSlash: false,

	// The configures of templates and assets used, which will be overridden by the selected templates.
	assetsDir: path.resolve(__dirname, 'not-existed/assets'),
	mdPageTemplate: path.resolve(__dirname, 'not-existed/templates/page.ejs'),
	mdListTemplate: path.resolve(__dirname, 'not-existed/templates/list.ejs'),
}, configures);
