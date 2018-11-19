'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const constants = require("./constants");
exports.filterFileName = (filters, fileName) => {
    for (let j = 0; j < filters.length; j++) {
        const filter = filters[j];
        if (filter && filter(fileName)) {
            return true;
        }
    }
    return fileName.startsWith('.') || fileName.startsWith('_');
};
exports.getFilePlainName = (fileName) => fileName.substr(0, fileName.lastIndexOf('.'));
const htmlFileExtensions = ['.html', '.htm'];
const markdownFileExtensions = ['.md', '.markdown'];
exports.isHtmlFile = (ext) => htmlFileExtensions.includes(ext);
exports.isMarkdownFile = (ext) => markdownFileExtensions.includes(ext);
exports.addTrailingSlash = (href) => path.join(href, constants.SLASH);
// mkdir if not exists.
// Return error if
exports.mkdirIfNotExists = (dir, noWriting, silent) => {
    try {
        const stats = fs.statSync(dir);
        if (stats && !stats.isDirectory()) {
            return new Error('The target file exists but is not a directory.');
        }
    }
    catch (ex) {
        // Check the folder only if #noWriting.
        if (!noWriting) {
            fs.mkdirSync(dir);
        }
        // Print verbosely if not #silent.
        if (!silent) {
            console.log('Created folder:', dir);
        }
    }
    return null;
};
