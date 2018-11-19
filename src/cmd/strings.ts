'use strict';

import * as path from 'path';
import * as constants from './constants';
import * as logger from './logger';

const MODULE_SITE_CONFIGS = constants.MODULE_SITE_CONFIGS;

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

// const givenTargetConfigsIndexJs = ;
export const getSiteInitializationNotices = (targetSiteDir, targetSiteDirLocation, targetConfigsDir) => ({
	noticeTaskInitializingExistedMdSite: `You are ${logger.FG_INFO}initialize an *existed* markdown site${logger.FG_RESET} "${targetSiteDirLocation}" with prompts and the default templates.`,
	noticeTaskCreatingNewMdDemoSite: `You are ${logger.FG_INFO}creating a *new* markdown demo site${logger.FG_RESET} to "${targetSiteDirLocation}" with prompts and the default templates.`,

	noticeSiteInitializingWithPrompt: 'Now we will assist you with the process.',

	noticeAbortingCauseInvalidOptions: 'Aborting, cause received invalid options...',
	noticeAwesomeCauseValidOptions: 'Awesome!',

	// The same as initializing existed md site.
	noticeWillGenerateSiteConfigsToExistedSite: `Will generate configs to the existed site: "${targetSiteDirLocation}" with the default templates.`,
	noticeWillCreateNewMdDemoSite: `Will create a *new* markdown demo site to "${targetSiteDirLocation}" with the default templates.`,

	noticeCopiedMdDemoSite: `Copied a markdown demo site to "${targetSiteDir}" for you.`,

	noticeCreatedSiteConfigsDir: `Created folder for site configures: "${targetConfigsDir}".`,

	noticeGeneratedSiteConfigsEntrance: `Generated configures file: "${path.join(targetConfigsDir, constants.INDEX_DOT_JS)}".`,

	noticeAddSiteConfigsToVcs: `You may add the site configures(${targetConfigsDir}) to Git(or other VCS) to track changes.`,

	noticeDoneSiteInitializing: `Done!`,
});

