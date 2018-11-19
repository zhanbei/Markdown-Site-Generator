'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const constants = require("../constants");
// The default folder to be used to resolve site configs.
exports.MODULE_SITE_CONFIGS = '.site_configs';
// The file to write in for site configs to initialize markdown sites.
exports.INDEX_DOT_JS = constants.INDEX + constants.DOT + 'js';
// The built-in demo markdown site to be generated for user.
exports.DEMO_MARKDOWN_SITE_DIR_LOCATION = path.join(__dirname, '../../blogs');
exports.THEME_GITHUB_DIR = 'github';
// The built-in and default github theme to be copied when initializing a new/existed markdown site.
exports.SITE_CONFIGS_THEME_GITHUB_DIR_LOCATION = path.join(__dirname, '../../configs', exports.THEME_GITHUB_DIR);
// @see https://www.npmjs.com/package/ncp
exports.NCP_DEFAULT_OPTIONS = {
    // No overwriting.
    clobber: false,
    // No following symbolic link.
    dereference: false,
    // Stop on first error.
    stopOnErr: true,
};
const getModeIdInGithubTheme = (noTrailingSlash, trailingSlash) => noTrailingSlash ? 'no-trailing-slash' : trailingSlash ? 'trailing-slash' : 'dot-html';
// Render the entrance of the site configs using the template from ~/configs(which is copied from ~/.site_configs).
exports.renderSiteConfigsIndexJsByTemplate = (site) => `'use strict';

const path = require('path');
// The selected configs of selected theme(github), which take cares of used templates and selected mode.
// Merge it into the site configures to make it work(, and existed configures may be overridden).
const configures = require('./github/${getModeIdInGithubTheme(site.noTrailingSlash, site.trailingSlash)}-templates/configs');

// The default configs for the markdown site.
module.exports = Object.assign({
	title: '${site.title}',

	inputDir: path.resolve(__dirname, '${site.inputDir}'),
	outputDir: path.resolve(__dirname, '${site.outputDir}'),

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
`;
