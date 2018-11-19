'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const ncp_1 = require("ncp");
const constants = require("./constants");
// Normalize a given path to remove any redundant components using path.join().
exports.normalizePath = (givenPath = '') => givenPath.trim() ? path.join('', givenPath.trim(), '') : '';
// Return file.stat if a file exists, or null if it does not exist.
exports.isFileExist = (file) => {
    try {
        return fs.statSync(file);
    }
    catch (ex) {
        return null;
    }
};
exports.makeNotExistedDir = (dir) => {
    try {
        const stats = fs.statSync(dir);
        if (stats) {
            return new Error('The target file exists but is not a directory.');
        }
    }
    catch (ex) {
        try {
            fs.mkdirSync(dir);
        }
        catch (ex) {
            return ex;
        }
    }
    return null;
};
const escapeSingleQuote = (value = '') => value.replace(/'/g, '\\\'');
exports.renderSiteConfigsIndexJs = (options) => {
    const site = {
        title: escapeSingleQuote(options.title),
        inputDir: escapeSingleQuote(path.join('..', options.inputDir)),
        outputDir: escapeSingleQuote(path.join('..', options.outputDir)),
        mode: options.mode,
        trailingSlash: options.trailingSlash,
        noTrailingSlash: options.noTrailingSlash,
    };
    return constants.renderSiteConfigsIndexJsByTemplate(site);
};
// Copy folders.
exports.copyFolder = (source, destination, options = constants.NCP_DEFAULT_OPTIONS) => new Promise((resolve, reject) => {
    ncp_1.ncp(source, destination, options, (err) => {
        if (err) {
            return reject(err);
        }
        resolve();
    });
});
exports.copyDemoMarkdownSite = (targetSiteDirLocation) => __awaiter(this, void 0, void 0, function* () { return exports.copyFolder(constants.DEMO_MARKDOWN_SITE_DIR_LOCATION, targetSiteDirLocation); });
exports.copySiteConfigsThemeGithub = (targetConfigsDirLocation) => __awaiter(this, void 0, void 0, function* () { return exports.copyFolder(constants.SITE_CONFIGS_THEME_GITHUB_DIR_LOCATION, path.join(targetConfigsDirLocation, constants.THEME_GITHUB_DIR)); });
