'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const ejs = require("ejs");
const constants = require("./constants");
const utils = require("./utils");
const renderer = require("./renderer");
const fs_node_1 = require("./fs-node");
const ejs_env_1 = require("./ejs-env");
class FileNode extends fs_node_1.default {
    constructor(app, depth, folder, stats) {
        super(app, depth, folder, stats);
        this.isDirectory = false;
        this.isFile = true;
    }
    // Initialize the target file.
    statFile(fileName) {
        const configs = this.configs;
        const folder = this.parent;
        this.initNode(fileName);
        this.fromFilePlainName = utils.getFilePlainName(this.fromFileName);
        this.fromFileExtension = path.extname(this.fromFileName);
        this.isHtmlFile = utils.isHtmlFile(this.fromFileExtension);
        this.isMarkdownFile = utils.isMarkdownFile(this.fromFileExtension);
        if (this.isHtmlFile) {
            configs.counterHtmlFiles.push(this);
            // Ignoring the HTML files.
            return;
        }
        if (!this.isMarkdownFile) {
            folder.pushFile(this);
            return;
        }
        this.toFilePlainName = utils.getFilePlainName(this.toFileName);
        this.toFileName = this.toFilePlainName + constants.DOT_HTML;
        this.toFilePath = path.join(folder.toFilePath, this.toFileName);
        this.setHref(this.toFileName, this.toFilePath);
        switch (this.toFilePlainName) {
            case constants.INDEX:
                configs.counterTestFileIndexFiles.push(this);
                break;
            case folder.toFileName:
                configs.counterTestFileTestFileFiles.push(this);
                break;
            default:
                configs.counterTestFolderTestFileFiles.push(this);
                break;
        }
        if (configs.noTrailingSlash) {
            // Case 1. Rendering in the no trailing slash mode.
            switch (this.toFilePlainName) {
                case folder.toFileName:
                    this.toFileName = folder.toFileName + constants.DOT_HTML;
                    this.toFilePath = path.join(folder.toFilePath, this.toFileName);
                    // The href is useless as a list page, the same of its folder.
                    this.setHref(folder.toFileName, folder.toFilePath);
                    folder.setFolderPage(this);
                    break;
                // case constants.README:
                case constants.INDEX:
                    // index.md -> ${folder.toFileName}.html
                    this.toFileName = folder.toFileName + constants.DOT_HTML;
                    this.toFilePath = path.join(folder.toFilePath, this.toFileName);
                    // The href is useless as a list page, the same of its folder.
                    this.setHref(folder.toFileName, folder.toFilePath);
                    // Set the folder page if not set yet.
                    if (!folder.page) {
                        folder.setFolderPage(this);
                    }
                    break;
                default:
                    this.toFileName = this.toFilePlainName + constants.DOT_HTML;
                    // Create a folder to store the html in the no-trailing-slash mode.
                    this.toFolderPath = path.join(folder.toFilePath, this.toFilePlainName);
                    this.toFilePath = path.join(this.toFolderPath, this.toFileName);
                    // The folder is created for the document, so the href is #toFolderPath.
                    this.setHref(this.toFilePlainName, this.toFolderPath);
                    folder.pushFile(this);
                    break;
            }
            return;
        }
        if (configs.trailingSlash) {
            // Case 2. Rendering in the trailing slash mode.
            this.toFileName = constants.INDEX_DOT_HTML;
            if (this.toFilePlainName === constants.INDEX) {
                this.toFilePath = path.join(folder.toFilePath, constants.INDEX_DOT_HTML);
                // The folder is for the document, so the href is folder#toFolderPath.
                // this.setHref(utils.addTrailingSlash(folder.toFileName), utils.addTrailingSlash(folder.toFilePath));
                // this.setHref(folder.toFileName, folder.toFilePath);
                this.setHref(folder.hrefRelative, folder.hrefAbsolute);
                folder.setFolderPage(this);
            }
            else {
                // Create a folder to store the html in the trailing-slash mode.
                this.toFolderPath = path.join(folder.toFilePath, this.toFilePlainName);
                // Render the markdown document to index.html to add a trailing slash.
                this.toFilePath = path.join(this.toFolderPath, constants.INDEX_DOT_HTML);
                // The folder is created for the document, so the href is #toFolderPath.
                this.setHref(utils.addTrailingSlash(this.toFilePlainName), utils.addTrailingSlash(this.toFolderPath));
                folder.pushFile(this);
            }
            return;
        }
        // Case 3. Rendering in the default mode.
        this.toFileName = this.toFilePlainName + constants.DOT_HTML;
        this.toFilePath = path.join(folder.toFilePath, this.toFileName);
        if (this.toFilePlainName === constants.INDEX) {
            // The folder is for the document, so the href is folder#toFolderPath.
            this.setHref(folder.hrefRelative, folder.hrefAbsolute);
            folder.setFolderPage(this);
        }
        else {
            this.setHref(this.toFileName, this.toFilePath);
            folder.pushFile(this);
        }
    }
    print() {
        if (!this.isMarkdownFile) {
            return this.logCopiedFile();
        }
        this.logCreatedFolderIfAny();
        this.logRenderedDocument();
    }
    logCreatedFolderIfAny() {
        if (!this.toFolderPath) {
            return;
        }
        console.log(`${constants.TAB.repeat(this.depth)}- /${path.basename(this.toFolderPath)}`);
    }
    logRenderedDocument() {
        const tabs = constants.TAB.repeat(this.toFolderPath ? this.depth + 1 : this.depth);
        console.log(`${tabs}- /${this.toFileName} <<-- ${this.fromFilePath}`);
    }
    logCopiedFile() {
        console.log(`${constants.TAB.repeat(this.depth)}- /${this.toFileName} <- ${this.fromFilePath}`);
    }
    render() {
        const configs = this.configs;
        const output = configs.outputDirLocation;
        if (!this.isFile) {
            return console.error('FATAL Found ignored file of the unknown file type:', JSON.stringify(this));
        }
        if (this.isHtmlFile) {
            return console.error('FATAL Found ignored file:', this.fromFilePath);
        }
        if (!this.isMarkdownFile) {
            const toFileLocation = path.join(output, this.toFilePath);
            // @see https://stackoverflow.com/questions/11293857/fastest-way-to-copy-file-in-node-js
            if (!configs.noWriting) {
                fs.createReadStream(this.fromFileLocation).pipe(fs.createWriteStream(toFileLocation));
            }
            // console.warn('Copied file:', this.fromFileLocation, '-->>', toFileLocation);
            this.logCopiedFile();
            return;
        }
        const toFileLocation = path.join(output, this.toFilePath);
        const content = fs.readFileSync(this.fromFileLocation, 'utf8');
        const tokens = renderer.lexer(content);
        const heading = renderer.getHeadingFromTokens(tokens);
        const html = renderer.parserTokens(tokens);
        // The title of a post: metadata.title > markdown.heading > file.name.
        this.title = heading || this.fromFilePlainName || 'Unknown HTML Title';
        if (this.toFolderPath) {
            const err = utils.mkdirIfNotExists(path.join(output, this.toFolderPath), configs.noWriting, configs.isSilent);
            if (err) {
                throw err;
            }
            this.logCreatedFolderIfAny();
        }
        const env = new ejs_env_1.default(configs, this);
        env.html = html;
        if (!configs.noWriting) {
            fs.writeFileSync(toFileLocation, ejs.render(configs.mdPageTemplate, env));
        }
        // console.warn('Rendered file:', this.fromFileLocation, '-->>', toFileLocation);
        this.logRenderedDocument();
    }
}
exports.FileNode = FileNode;
exports.default = FileNode;
