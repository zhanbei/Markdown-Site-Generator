'use strict';

import * as enquirer from 'enquirer';
import * as resources from './prompt-resources';

// The user-desired site options.
export interface GivenSiteOptions {
	title: string;
	inputDir: string;
	outputDir: string;
	mode: number;
	trailingSlash: boolean;
	noTrailingSlash: boolean;
}

export const isGivenSiteOptionsValid = (options: GivenSiteOptions) => {
	return options.title && options.inputDir && options.outputDir && resources.MODES.includes(options.mode);
};

export const promptForSiteOptions = (givenTargetDir): Promise<GivenSiteOptions> => {
	return enquirer.prompt([
		resources.textTitle,
		resources.textInputDir(givenTargetDir),
		resources.textOutputDir(givenTargetDir),
		resources.modeSelector,
	]).then((options: GivenSiteOptions) => {
		options.inputDir = options.inputDir || '.';
		options.trailingSlash = false;
		options.noTrailingSlash = false;
		switch (options.mode) {
			case resources.MODE_DOT_HTML:
				break;
			case resources.MODE_TRAILING_SLASH:
				options.trailingSlash = true;
				break;
			case resources.MODE_NO_TRAILING_SLASH:
				options.noTrailingSlash = true;
				break;
			default:
				// THE USER ABORTED THE PROMPT PROCESS.
				// DO NOTHING AND LET IT GO. :)
				// throw new Error('The given is unexpected!');
				break;
		}
		return options;
	});
};

export default promptForSiteOptions;
