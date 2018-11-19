'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const ejs = require("ejs");
const constants = require("./constants");
const utils = require("./utils");
const fs_node_1 = require("./fs-node");
const file_node_1 = require("./file-node");
const ejs_env_1 = require("./ejs-env");
class FolderNode extends fs_node_1.default {
    constructor(app, depth, parent, stats) {
        super(app, depth, parent, stats);
        // The sub files of a folder.
        this.fileNames = [];
        this.files = [];
        this._files = [];
        this.mdFilesNumber = 0;
        this.folders = [];
        this._folders = [];
        // The nodes of _files and _folders.
        this.nodes = [];
        this.isDirectory = true;
        this.isFile = false;
    }
    // The entrance of the markdown blog.
    static NewInstance(app) {
        const stats = fs.statSync(app.inputDirLocation);
        if (!stats.isDirectory()) {
            throw new Error('target dir is not a dir.');
        }
        const entrance = new FolderNode(app, 0, null, stats);
        // Use the title as the from folder name.
        entrance.fromFileName = app.title;
        entrance.fromFilePath = constants.DOT;
        entrance.fromFileLocation = app.inputDirLocation;
        entrance.fromFolderName = null;
        entrance.toFileName = '';
        entrance.toFilePath = constants.DOT;
        entrance.setHref(constants.SLASH, constants.SLASH);
        entrance.statFolder();
        return entrance;
    }
    statFolder() {
        const configs = this.configs;
        const parent = this.parent;
        if (configs.noTrailingSlash) {
            // No trailing slash to be appended to the path for folders in the no-trailing-slash mode.
            this.setHref(this.toFileName, this.toFilePath);
        }
        else {
            this.setHref(utils.addTrailingSlash(this.toFileName), utils.addTrailingSlash(this.toFilePath));
        }
        // Initialize this folder.
        const fileNames = fs.readdirSync(this.fromFileLocation);
        fileNames.map(fileName => {
            // Filter out the filename.
            if (utils.filterFileName(configs.nameFilters, fileName)) {
                return console.log('> Filtered out:', path.join(this.fromFilePath, fileName));
            }
            this.fileNames.push(fileName);
        });
        if (this.fileNames.length === 0) {
            return configs.counterEmptyFolders.push(this);
        }
        this.fileNames.map(fileName => {
            const stats = fs.statSync(path.join(this.fromFileLocation, fileName));
            if (stats.isDirectory()) {
                const child = new FolderNode(configs, this.depth + 1, this, stats);
                child.initNode(fileName);
                child.statFolder();
            }
            else if (stats.isFile()) {
                new file_node_1.default(configs, this.depth + 1, this, stats).statFile(fileName);
            }
            else {
                // Ignoring the unknown file type.
                console.error('Ignoring the unsupported file type:', stats);
            }
        });
        if (this.files.length === 0 && this.folders.length === 0 && !this.page) {
            return configs.counterInvalidFolders.push(this);
        }
        this.files.map(item => this._files.push(item));
        this.folders.map(item => {
            if (item.files.length === 0 && this.folders.length === 0 && this.page) {
                // This folder is just a wrapper of a md document file.
                this._files.push(item);
            }
            else {
                this._folders.push(item);
            }
        });
        this.nodes = configs.listFilesAboveFolders ? [...this._files, ...this._folders] : [...this._folders, ...this._files];
        if (parent) {
            parent.pushFolder(this);
        }
    }
    setFolderPage(node) {
        if (node.isFile && node.isMarkdownFile) {
            this.configs.counterMarkdownFiles.push(node);
        }
        this.page = node;
    }
    // For folder.
    pushFolder(node) {
        const configs = this.configs;
        configs.counterValidFolders.push(node);
        this.folders.push(node);
    }
    // For folder.
    pushFile(node) {
        const configs = this.configs;
        // The HTML files are filtered.
        if (node.isMarkdownFile) {
            this.mdFilesNumber++;
            configs.counterMarkdownFiles.push(node);
        }
        else {
            configs.counterRegularFiles.push(node);
        }
        this.files.push(node);
    }
    print() {
        if (this.files.length === 0 && this.folders.length === 0 && !this.page) {
            return;
        }
        this.logCopiedFolder();
        this.folders.map(folders => folders.print());
        this.files.map(file => file.print());
        this.logRenderedListPage();
    }
    logCopiedFolder() {
        console.log(`${constants.TAB.repeat(this.depth)}- /${this.toFilePath}`);
    }
    logRenderedListPage() {
        if (this.page) {
            return this.page.render();
        }
        const configs = this.configs;
        if (!configs.mdListTemplate || (this.mdFilesNumber === 0 && this.folders.length === 0)) {
            return;
        }
        if (configs.noTrailingSlash) {
            const toFileName = (this.toFileName || constants.INDEX) + constants.DOT_HTML;
            console.log(`${constants.TAB.repeat(this.depth + 1)}- /${toFileName} <<-- List Template.`);
        }
        else {
            console.log(`${constants.TAB.repeat(this.depth + 1)}- /${constants.INDEX_DOT_HTML} <<-- List Template.`);
        }
    }
    render() {
        const configs = this.configs;
        const output = configs.outputDirLocation;
        const err = utils.mkdirIfNotExists(path.join(output, this.toFilePath), configs.noWriting, configs.isSilent);
        if (err) {
            throw err;
        }
        this.logCopiedFolder();
        // Render folders and files first to get titles from markdown files.
        this.folders.map(node => node.render());
        this.files.map(node => node.render());
        if (this.page) {
            this.page.render();
            // Use the #page's title as its own title.
            this.title = this.page.title;
            return;
        }
        // Ignore the folder page if no template or no sub md files.
        if (!configs.mdListTemplate || (this.mdFilesNumber === 0 && this.folders.length === 0)) {
            return;
        }
        // Rendering a folder page using the list template.
        let toFolderPageLocation;
        if (configs.noTrailingSlash) {
            // this.toFileName will be null for the input folder.
            const toFileName = (this.toFileName || constants.INDEX) + constants.DOT_HTML;
            toFolderPageLocation = path.join(output, this.toFilePath, toFileName);
        }
        else {
            toFolderPageLocation = path.join(output, this.toFilePath, constants.INDEX_DOT_HTML);
        }
        this.title = this.fromFileName + ' - Collection';
        const env = new ejs_env_1.default(configs, this);
        env.nodes = this.nodes;
        if (!configs.noWriting) {
            fs.writeFileSync(toFolderPageLocation, ejs.render(configs.mdListTemplate, env));
        }
        // console.warn('Rendered folder page using list template:', this.fromFileLocation, '-->>', toFolderPageLocation);
        this.logRenderedListPage();
    }
}
exports.FolderNode = FolderNode;
exports.default = FolderNode;
