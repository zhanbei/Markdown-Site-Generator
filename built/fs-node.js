'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const constants = require("./constants");
// A markdown or regular file.
class FsNode {
    // Create a file node or folder node.
    constructor(app, depth, parent, stats) {
        if (depth > app.maxDepth) {
            throw new Error('Max depth of folder exceeded!');
        }
        this.parent = parent;
        this.configs = app;
        this.depth = depth;
        this.stats = stats;
    }
    // fromFileName, fromFilePath, fromFileLocation, fromFolderName, toFileName, toFilePath
    initNode(fileName) {
        const configs = this.configs;
        const folder = this.parent;
        this.fromFileName = fileName;
        this.fromFilePath = path.join(folder.fromFilePath, fileName);
        this.fromFileLocation = path.join(folder.fromFileLocation, fileName);
        this.fromFolderName = folder.fromFileName;
        this.toFileName = configs.nameConverter ? configs.nameConverter(this.fromFileName, this) : this.fromFileName.toLowerCase();
        this.toFilePath = path.join(folder.toFilePath, this.toFileName);
        this.setHref(this.toFileName, this.toFilePath);
    }
    // Set relative, absolute, and the default href in the site.
    setHref(relative, absolute) {
        const { baseUrl = '', useRelativeLinks } = this.configs;
        this.hrefRelative = relative;
        this.hrefAbsolute = path.join(constants.SLASH, baseUrl, absolute);
        if (useRelativeLinks) {
            this.href = this.hrefRelative;
        }
        else {
            this.href = this.hrefAbsolute;
        }
    }
}
exports.FsNode = FsNode;
exports.default = FsNode;
