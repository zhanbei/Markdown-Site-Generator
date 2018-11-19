'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const enquirer = require("enquirer");
const resources = require("./prompt-resources");
exports.isGivenSiteOptionsValid = (options) => {
    return options.title && options.inputDir && options.outputDir && resources.MODES.includes(options.mode);
};
exports.promptForSiteOptions = (givenTargetDir, givenTargetDirLocation) => {
    return enquirer.prompt([
        resources.textTitle,
        resources.textInputDir(givenTargetDirLocation),
        resources.textOutputDir(givenTargetDirLocation),
        resources.modeSelector,
    ]).then((options) => {
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
exports.default = exports.promptForSiteOptions;
