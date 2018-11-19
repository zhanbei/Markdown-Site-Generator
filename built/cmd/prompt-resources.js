'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const utils = require("./utils");
const strings_1 = require("./strings");
exports.MODE_DOT_HTML = 1;
exports.MODE_TRAILING_SLASH = 2;
exports.MODE_NO_TRAILING_SLASH = 3;
exports.MODES = [exports.MODE_DOT_HTML, exports.MODE_TRAILING_SLASH, exports.MODE_NO_TRAILING_SLASH];
const nonEmptyStringValidator = (value = '') => Boolean(value.trim());
const trimString = (value = '') => value.trim();
const trimRelativePath = (value = '') => utils.normalizePath(value);
exports.textTitle = {
    type: 'input',
    name: 'title',
    message: strings_1.promptMessages.hintSiteTitle,
    initial: 'My Awesome Blogs',
    validate: nonEmptyStringValidator,
    // format: trimString,
    result: trimString,
};
exports.textInputDir = (givenTargetDirLocation) => ({
    type: 'input',
    name: 'inputDir',
    skip: () => true,
    message: strings_1.promptMessages.getInputDirHint(givenTargetDirLocation),
    initial: '.',
    validate: nonEmptyStringValidator,
    // format: trimRelativePath,
    result: trimRelativePath,
});
exports.textOutputDir = (givenTargetDirLocation) => ({
    type: 'input',
    name: 'outputDir',
    message: strings_1.promptMessages.getOutputDirHint(givenTargetDirLocation),
    initial: '.site',
    validate: nonEmptyStringValidator,
    // format: trimRelativePath,
    result: trimRelativePath,
});
exports.modeSelector = {
    type: 'select',
    name: 'mode',
    message: strings_1.promptMessages.hintSiteMode,
    // 0 stands for the 1st choice.
    initial: 0,
    result: function () {
        // @see https://github.com/enquirer/enquirer/issues/51
        return this.focused.value;
    },
    choices: [{
            name: 'Dot HTML Mode',
            message: 'Dot HTML Mode (render to "test-post.html")',
            value: exports.MODE_DOT_HTML,
        }, {
            name: 'Trailing Slash Mode',
            message: 'Trailing Slash Mode (render to "test-post/index.html")',
            value: exports.MODE_TRAILING_SLASH,
        }, {
            name: 'No Trailing Slash Mode',
            message: 'No Trailing Slash Mode (render to "test-post/test-post.html")',
            value: exports.MODE_NO_TRAILING_SLASH,
        }],
};
