'use strict';

import constants = require('../constants');
import {GivenSiteOptions} from './prompt-user';

// The default folder to be used to resolve site configs.
export const MODULE_SITE_CONFIGS = '.site_configs';
// The file to write in for site configs to initialize markdown sites.
export const INDEX_DOT_JS = constants.INDEX + constants.DOT + 'js';

// Render the entrance of the site configs using the template from ~/configs(which is copied from ~/.site_configs).
export const renderSiteConfigsIndexJsByTemplate = (site: GivenSiteOptions) => `'use strict';

const path = require('path');
// The selected configs of selected theme(github), which take cares of used templates and selected mode.
// Merge it into the site configs to make it work.
const configures = require('./github/no-trailing-slash-templates/configs');

// The default configs for the markdown site.
module.exports = Object.assign({
	title: '${ site.title }',

	inputDir: path.resolve(__dirname, '${ site.inputDir }'),
	outputDir: path.resolve(__dirname, '${ site.outputDir }'),

	// Filter out some files or folders.
	nameFilters: [
		(name) => name.startsWith('_reserve'),
		(name) => ['backups', 'README.md', 'Drafts', 'logs'].includes(name),
	],
	nameConverter: (name) => name.toLowerCase(),

	// Generate site in the dot-html mode, if true, and !trailingSlash and !noTrailingSlash.
	dotHTML: ${ !site.trailingSlash && !site.noTrailingSlash },
	// Generate site in the trailing-slash mode, if true and !noTrailingSlash.
	trailingSlash: ${ site.trailingSlash },
	// Generate site in the no-trailing-slash mode, if true.
	noTrailingSlash: ${ site.noTrailingSlash },

	// The default configures used, which will be override by selected templates and mode.
	assetsDir: path.resolve(__dirname, 'not-existed/assets'),
	mdPageTemplate: path.resolve(__dirname, 'not-existed/templates/page.ejs'),
	mdListTemplate: path.resolve(__dirname, 'not-existed/templates/list.ejs'),
}, configures);
`;
