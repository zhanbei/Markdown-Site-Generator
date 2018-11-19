'use strict';

import * as fs from 'fs';
import * as path from 'path';
import {Command} from '@oclif/command';
import * as constants from './constants';
import * as utils from './utils';
// The delayed console; currently named like *fmt* in golang. :(
import * as fmt from './prompt-console';
import promptForSiteOptions, {GivenSiteOptions, isGivenSiteOptionsValid} from './prompt-user';
import {getSiteInitializationNotices} from './strings';

const time = fmt.TIME_WAIT_SAY;

// targetSiteDir, targetSiteDirLocation, Boolean(stat), targetConfigsDir, targetConfigsDirLocation
const promptAndInitializeSite = async (
	cmd: Command,
	targetSiteDir, targetSiteDirLocation, isTargetSiteDirExisted: boolean,
	targetConfigsDir, targetConfigsDirLocation,
) => new Promise(async resolve => {

	const notices = getSiteInitializationNotices(targetSiteDir, targetSiteDirLocation, targetConfigsDir);

	// Notice purpose and goals of this scripts.
	if (isTargetSiteDirExisted) {
		await fmt.println(notices.noticeTaskInitializingExistedMdSite);
	} else {
		await fmt.println(notices.noticeTaskCreatingNewMdDemoSite);
	}
	await fmt.println();

	// Notice for coming prompts.
	await fmt.println(notices.noticeSiteInitializingWithPrompt, time * 2);
	await fmt.println('', time * 3);

	promptForSiteOptions(targetSiteDir).then(async (options: GivenSiteOptions) => {

		// Received user-given options.
		await fmt.println('', time * 2);

		if (!isGivenSiteOptionsValid(options)) {
			// await utils.println('');
			await fmt.println(notices.noticeAbortingCauseInvalidOptions);
			resolve();
			return;
		}

		// Notice for accepted user-given options.
		await fmt.println(notices.noticeAwesomeCauseValidOptions);
		await fmt.println();

		// Confirm to proceeding.
		if (isTargetSiteDirExisted) {
			await fmt.println(notices.noticeWillGenerateSiteConfigsToExistedSite, time * 2);
		} else {
			await fmt.println(notices.noticeWillCreateNewMdDemoSite, time * 2);
		}
		await fmt.println();

		// Loading.
		await fmt.printLoadingDots();
		await fmt.println();
		await fmt.println();

		if (!isTargetSiteDirExisted) {
			// Copy blogs files of the sample site.
			// await fmt.println(`Will create a demo markdown site to "${targetSiteDir}" for you.`, time * 2);
			await utils.copyDemoMarkdownSite(targetSiteDirLocation);
			await fmt.println(notices.noticeCopiedMdDemoSite, time * 2);
			await fmt.println();
		}

		// Creating the not existed folder for configures.
		const err = utils.makeNotExistedDir(targetConfigsDirLocation);
		if (err) {
			cmd.error(err);
			cmd.exit(1);
			resolve();
			return;
		}
		await fmt.println(notices.noticeCreatedSiteConfigsDir);
		await fmt.println();

		// Generate configures.
		const givenTargetConfigsIndexJsLocation = path.join(targetConfigsDirLocation, constants.INDEX_DOT_JS);
		fs.writeFileSync(givenTargetConfigsIndexJsLocation, utils.renderSiteConfigsIndexJs(options));
		await fmt.println(notices.noticeGeneratedSiteConfigsEntrance);
		await fmt.println();

		// Copy github theme(modes and templates).
		// Throwing error ???
		await utils.copySiteConfigsThemeGithub(targetConfigsDirLocation);

		// Notice to use VCS.
		await fmt.println(notices.noticeAddSiteConfigsToVcs);
		await fmt.println();

		// Done all initializations.
		await fmt.println(notices.noticeDoneSiteInitializing);
		await fmt.println();

	}).catch(ex => {
		cmd.error(ex);
		cmd.exit(1);
	});
	resolve();
});

export default promptAndInitializeSite;
