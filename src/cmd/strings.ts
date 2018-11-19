'use strict';

import * as path from 'path';
import * as constants from './constants';
import * as logger from './logger';

const MODULE_SITE_CONFIGS = constants.MODULE_SITE_CONFIGS;

// Emphasize the user-input file and folder.
const emTarget = (dir) => `"${dir}"`;

// Error an specified error.
// helpError for an specified error.
// Help, notice, hint, .
export const getGenerateMdSiteErrors = (targetSiteDir, targetSiteDirLocation, targetConfigsDir, resolvedTargetConfigsDirLocation) => ({
	noSiteConfigsModulesFoundError: `No \`${emTarget(MODULE_SITE_CONFIGS)}\` module found in the target dir or the target dir ${emTarget(targetSiteDir)} is not a node module.`,
	noSiteConfigsModulesFoundHelp: `You may add a config file named \`index.js\`, \`index.json\`, \`${MODULE_SITE_CONFIGS}.js\`, \`${MODULE_SITE_CONFIGS}.json\`, \`${MODULE_SITE_CONFIGS}/index.js\`, or \`${MODULE_SITE_CONFIGS}/index.json\` to the target dir.`,

	targetSiteDirIsNotFolderError: `The target folder resolved ${emTarget(targetSiteDirLocation)} is not a folder.`,

	targetSiteConfigsDirExistedError: `Found existed folder of the site configs ${targetConfigsDir} from the given target dir.`,
	targetSiteConfigsDirExistedHelp: `Remove the folder ${emTarget(targetConfigsDir)} first before initializing site.`,

	nonEmptySiteConfigsResolvedError: `Non-empty configures resolved ${emTarget(resolvedTargetConfigsDirLocation)} from ${emTarget(targetSiteDir)}.`,
	nonEmptySiteConfigsResolvedHelp: `Cannot initialize site with valid configures; expected empty configures.`,

	invalidSiteConfigsResolvedError: 'Invalid site configs resolved:',
	invalidSiteConfigsResolvedHelp: 'You may check out https://github.com/zhanbei/Markdown-Site-Generator for help!',
});

export const getGenerateMdSiteNotices = (targetSiteDir, targetSiteDirLocation, targetConfigsDir, resolvedTargetConfigsDirLocation) => ({
	noticeSiteConfigsResolvedOkay: `The configures resolved ${emTarget(resolvedTargetConfigsDirLocation)} from ${emTarget(targetSiteDir)} is ok.`,
});

// Highlight messages as info.
const info = (msg) => logger.FG_INFO + msg + logger.FG_RESET;
// Highlight the targeted user-input file and dir.
const hlTarget = (dir) => `"${logger.FG_INFO}${dir}${logger.FG_RESET}"`;

// const givenTargetConfigsIndexJs = ;
export const getSiteInitializationNotices = (targetSiteDir, targetSiteDirLocation, targetConfigsDir) => ({
	noticeTaskInitializingExistedMdSite: `You are ${info('initialize an *existed* markdown site')} ${hlTarget(targetSiteDirLocation)} with prompts and the default templates.`,
	noticeTaskCreatingNewMdDemoSite: `You are ${info('creating a *new* markdown demo site')} to ${hlTarget(targetSiteDirLocation)} with prompts and the default templates.`,

	noticeSiteInitializingWithPrompt: 'Now we will assist you with the process.',

	noticeAbortingCauseInvalidOptions: logger.FG_ERROR + 'Aborting, cause received invalid options...' + logger.FG_RESET,
	noticeAwesomeCauseValidOptions: 'Awesome!',

	// The same as initializing existed md site.
	noticeWillGenerateSiteConfigsToExistedSite: `Will generate configs to the existed site: ${hlTarget(targetSiteDirLocation)} with the default templates.`,
	noticeWillCreateNewMdDemoSite: `Will create a *new* markdown demo site to ${hlTarget(targetSiteDirLocation)} with the default templates.`,

	noticeCopiedMdDemoSite: `Copied a markdown demo site to ${hlTarget(targetSiteDir)} for you.`,

	noticeCreatedSiteConfigsDir: `Created folder for site configures: ${hlTarget(targetConfigsDir)}.`,

	noticeGeneratedSiteConfigsEntrance: `Generated configures file: ${hlTarget(path.join(targetConfigsDir, constants.INDEX_DOT_JS))}.`,

	noticeAddSiteConfigsToVcs: `You may add the site configures(${hlTarget(targetConfigsDir)}) to Git(or other VCS) to track changes.`,

	noticeDoneSiteInitializing: `Done!`,
});

