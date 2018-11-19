'use strict';

import {MODULE_SITE_CONFIGS} from './constants';

// Error an specified error.
// helpError for an specified error.
// Help, notice, hint, .
export const getGenerateMdSiteErrors = (targetSiteDir, targetSiteDirLocation, targetConfigsDir, resolvedTargetConfigsDirLocation) => ({
	noSiteConfigsModulesFoundError: `No \`${MODULE_SITE_CONFIGS}\` module found in the target dir or the target dir ${targetSiteDir} is not a node module.`,
	noSiteConfigsModulesFoundHelp: `You may add a config file named \`index.js\`, \`index.json\`, \`${MODULE_SITE_CONFIGS}.js\`, \`${MODULE_SITE_CONFIGS}.json\`, \`${MODULE_SITE_CONFIGS}/index.js\`, or \`${MODULE_SITE_CONFIGS}/index.json\` to the target dir.`,

	targetSiteDirIsNotFolderError: `The target folder resolved "${targetSiteDirLocation}" is not a folder.`,

	targetSiteConfigsDirExistedError: `Found existed folder of the site configs "${targetConfigsDir}" from the given target dir.`,
	targetSiteConfigsDirExistedHelp: `Remove the folder "${targetConfigsDir}" first before initializing site.`,

	nonEmptySiteConfigsResolvedError: `Non-empty configures resolved "${resolvedTargetConfigsDirLocation}" from "${targetSiteDir}".`,
	nonEmptySiteConfigsResolvedHelp: `Cannot initialize site with valid configures; expected empty configures.`,

	invalidSiteConfigsResolvedError: 'Invalid site configs resolved:',
	invalidSiteConfigsResolvedHelp: 'You may check out https://github.com/zhanbei/Markdown-Site-Generator for help!',
});

export const getGenerateMdSiteNotices = (targetSiteDir, targetSiteDirLocation, targetConfigsDir, resolvedTargetConfigsDirLocation) => ({
	noticeSiteConfigsResolvedOkay: `The configures resolved "${resolvedTargetConfigsDirLocation}" from "${targetSiteDir}" is ok.`,
});

