'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const constants = require("./constants");
const renderer = require("./renderer");
const folder_node_1 = require("./folder-node");
const cmdUtils = require("./cmd/utils");
class Configs {
    constructor(title) {
        this.title = title;
    }
}
exports.Configs = Configs;
class App {
    constructor(configs) {
        this.trailingSlash = false;
        this.noTrailingSlash = false;
        this.counterValidFolders = [];
        this.counterEmptyFolders = [];
        // Invalid folder containing invalid files and causing the folder empty.
        this.counterInvalidFolders = [];
        this.counterRegularFiles = [];
        this.counterMarkdownFiles = [];
        this.counterHtmlFiles = [];
        // ".../test-folder/test-file.md"
        this.counterTestFolderTestFileFiles = [];
        // ".../test-file/index.md"
        this.counterTestFileIndexFiles = [];
        // ".../test-file/test-file.md"
        this.counterTestFileTestFileFiles = [];
        // The maxDepth of folders to parse, use 16 by default.
        this.maxDepth = 16;
        this.maxNodesToLog = 3;
        // The min nodes required to remind user to switch building mode.
        this.modeSwitchMinNodesToWarn = 2;
        this.modeSwitchWarnRadio = 1.2;
        this.mConfigs = configs;
        // Extract configs to app.
        const { title, assetsName, assetsDir, inputDir, outputDir, mdPageTemplate, mdListTemplate, nameFilters, nameConverter, anchorConverter, baseUrl, useRelativeLinks, trailingSlash, noTrailingSlash, listFilesAboveFolders, print, noWriting, noCache, verbose, silent, } = configs;
        this.title = title;
        this.assetsName = assetsName || constants.DEFAULT_ASSETS_DIR_NAME;
        this.assetsDirLocation = path.resolve(assetsDir);
        this.inputDirLocation = path.resolve(inputDir);
        this.outputDirLocation = path.resolve(outputDir);
        this.mdPageTemplate = fs.readFileSync(path.resolve(mdPageTemplate), 'utf8');
        this.mdListTemplate = fs.readFileSync(path.resolve(mdListTemplate), 'utf8');
        this.nameFilters = nameFilters;
        this.nameConverter = nameConverter;
        if (anchorConverter) {
            renderer.configs.anchorConverter = anchorConverter;
        }
        this.baseUrl = baseUrl;
        this.useRelativeLinks = useRelativeLinks;
        this.trailingSlash = trailingSlash;
        this.noTrailingSlash = noTrailingSlash;
        this.listFilesAboveFolders = listFilesAboveFolders;
        this.isPrinting = print;
        this.noWriting = noWriting;
        this.noCache = noCache;
        this.isVerbose = verbose;
        this.isSilent = silent;
        const mode = noTrailingSlash ? 'no-trailing-slash' : trailingSlash ? 'trailing-slash' : 'regular';
        console.log(`Resolved markdown site titled "${title}" in the "${mode}" mode.`);
        console.log(`Resolved input: "${this.inputDirLocation}" and output: "${this.outputDirLocation}".`);
    }
    // Log the rare nodes to notice user.
    logRareNodes(formatter, nodes) {
        if (nodes.length === 0) {
            return;
        }
        console.log(formatter, nodes.length);
        if (nodes.length > this.maxNodesToLog) {
            return;
        }
        nodes.map(node => {
            console.log(`\t- ${node.fromFilePath}`);
        });
    }
    statAndRender() {
        console.log();
        const mdSite = folder_node_1.default.NewInstance(this);
        console.log();
        this.logRareNodes('Found %d valid folders:', this.counterValidFolders);
        this.logRareNodes('Found and ignored %d empty folders:', this.counterEmptyFolders);
        this.logRareNodes('Found and ignored $d invalid folders:', this.counterInvalidFolders);
        this.logRareNodes('Found and ignored %d HTML files:', this.counterHtmlFiles);
        this.logRareNodes('Found and will copy %d regular files:', this.counterRegularFiles);
        console.log('Found and will render %d markdown documents:', this.counterMarkdownFiles.length);
        this.logRareNodes('Found %d files in the format of ".../test-folder/test-file.md":', this.counterTestFolderTestFileFiles);
        this.logRareNodes('Found %d files in the format of ".../test-file/index.md":', this.counterTestFileIndexFiles);
        this.logRareNodes('Found %d files in the format of ".../test-file/test-file.md":', this.counterTestFileTestFileFiles);
        console.log();
        const ntsFiles = this.counterTestFileTestFileFiles.length;
        const tsFiles = this.counterTestFileTestFileFiles.length;
        if (!this.noTrailingSlash && ntsFiles > this.modeSwitchMinNodesToWarn && ntsFiles > this.modeSwitchWarnRadio * tsFiles) {
            console.log('Your site may prefer the no-trailing-slash mode.');
            console.log();
        }
        if ((this.noTrailingSlash || !this.trailingSlash) && tsFiles > this.modeSwitchMinNodesToWarn && tsFiles > this.modeSwitchWarnRadio * ntsFiles) {
            console.log('Your site may prefer the trailing-slash mode.');
            console.log();
        }
        if (this.isPrinting) {
            console.log(`Resolved site from: "${mdSite.fromFileLocation}".`);
            mdSite.print();
            return;
        }
        if (this.noWriting) {
            console.log('[FAKE] Rendering:', mdSite.fromFileLocation);
        }
        else {
            console.log('Rendering:', mdSite.fromFileLocation);
        }
        mdSite.render();
        console.log();
        // Wait for the .site folder be created; then copy the static assets.
        this.copyAssets();
    }
    copyAssets() {
        const target = path.join(this.outputDirLocation, this.assetsName);
        if (!this.noCache && cmdUtils.isFileExist(target)) {
            console.log('Found cached static assets and skip coping the static assets.');
            console.log();
            return;
        }
        if (this.noWriting) {
            console.log('[FAKE] Copied static assets from configs/theme.');
            console.log();
        }
        else {
            // Initialize static assets.
            cmdUtils.copyFolder(this.assetsDirLocation, target).then(() => {
                console.log('Copied static assets from configs/theme.');
                console.log();
            }).catch(ex => {
                throw ex;
            });
        }
    }
}
exports.App = App;
exports.default = App;
