'use strict';

import * as fs from 'fs';
import * as path from 'path';
import {Command} from '@oclif/command';
import * as constants from './constants';
import * as logger from './logger';
import * as utils from './utils';
// The delayed console; currently named like *fmt* in golang. :(
import * as fmt from './prompt-console';
import promptForSiteOptions, {GivenSiteOptions, isGivenSiteOptionsValid} from './prompt-user';

const time = fmt.TIME_WAIT_SAY;

// targetSiteDir, targetSiteDirLocation, Boolean(stat), targetConfigsDir, targetConfigsDirLocation
const promptAndInitializeSite = async (
	cmd: Command,
	targetSiteDir, targetSiteDirLocation, isTargetSiteDirExisted: boolean,
	targetConfigsDir, targetConfigsDirLocation,
) => new Promise(async resolve => {

	// Notice purpose and goals of this scripts.
	if (isTargetSiteDirExisted) {
		await fmt.println(`You are ${logger.FG_INFO}initialize an *existed* markdown site${logger.FG_RESET} "${targetSiteDirLocation}" with prompts and the default templates.`);
	} else {
		await fmt.println(`You are ${logger.FG_INFO}creating a *new* markdown demo site${logger.FG_RESET} to "${targetSiteDirLocation}" with prompts and the default templates.`);
	}
	await fmt.println('');

	// Notice for coming prompts.
	await fmt.println('Now we will assist you with the process.', time * 2);
	await fmt.println('', time * 3);

	promptForSiteOptions(targetSiteDir).then(async (options: GivenSiteOptions) => {

		// Received user-given options.
		await fmt.println('', time * 2);

		if (!isGivenSiteOptionsValid(options)) {
			// await utils.println('');
			await fmt.println('Aborting, cause received invalid options...');
			resolve();
			return;
		}

		// Notice for accepted user-given options.
		await fmt.print('Awesome, ');
		await fmt.printLoadingDots();
		await fmt.println();
		await fmt.println();

		// Confirm to proceeding.
		if (isTargetSiteDirExisted) {
			await fmt.println(`will generate configs to the existed site: "${targetSiteDirLocation}" with the default templates.`);
		} else {
			await fmt.println(`will create a *new* markdown demo site to "${targetSiteDirLocation}" with the default templates.`);
		}
		await fmt.println();

		if (!isTargetSiteDirExisted) {
			// Copy blogs files of the sample site.
			await fmt.println('will create a markdown sample site: ' + options.title);
		}

		// Creating folder for configures.
		const err = utils.mkdirIfNotExists(targetConfigsDirLocation, false, false);
		if (err) {
			cmd.error(err);
			cmd.exit(1);
			resolve();
			return;
		}
		await fmt.println(`Created folder for site configures: "${targetConfigsDir}".`);
		await fmt.println();

		// Generate configures.
		const givenTargetConfigsIndexJs = path.join(targetConfigsDir, constants.INDEX_DOT_JS);
		const givenTargetConfigsIndexJsLocation = path.join(targetConfigsDirLocation, constants.INDEX_DOT_JS);
		fs.writeFileSync(givenTargetConfigsIndexJsLocation, utils.renderSiteConfigsIndexJs(options));
		await fmt.println(`Generated configures file: "${givenTargetConfigsIndexJs}".`);
		await fmt.println();

		// TO-DO Copy github theme(modes and templates).

		// Notice to use VCS.
		await fmt.println(`You may add the site configures(${targetConfigsDir}) to Git(or other VCS) to track changes.`);
		await fmt.println();

		// Done all initializations.
		await fmt.print(`Done, `);
		await fmt.printLoadingDots();
		await fmt.println();

	}).catch(ex => {
		cmd.error(ex);
		cmd.exit(1);
	});
	resolve();
});

export default promptAndInitializeSite;
