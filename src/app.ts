'use strict';

import fs = require('fs');
import path = require('path');
import constants = require('./constants');
import renderer = require('./renderer');
import FsNode from './fs-node';
import FolderNode from './folder-node';
import GenerateMdSite = require('./cmd/generate-md-site');
import * as cmdUtils from './cmd/utils';

export class Configs {
	public title: string;
	public inputDir: string;
	public outputDir: string;
	public mdPageTemplate: string;
	public mdListTemplate: string;
	// The assets folder of the generated site to be copied to.
	public assetsName: string;
	public assetsDir: string;
	public nameFilters: string[];
	public nameConverter: (name: string, node: object) => string;
	public anchorConverter: (name: string) => string;

	// Add a prefix of baseUrl to absolute href.
	public baseUrl: string;
	// Use the relative links as the value of `node.href` in the list page, if true.
	public useRelativeLinks: boolean;

	public trailingSlash: boolean;
	public noTrailingSlash: boolean;

	// List files above folders, if true.
	public listFilesAboveFolders: boolean;

	// Print the resolved site structure.
	public print: boolean;
	// Build markdown site without writing to disk.
	public noWriting: boolean;
	// Build markdown site without cache( of static assets).
	public noCache: boolean;

	// The verbose mode, rich output, if true.
	public verbose: boolean;
	// The silent mode, no output, if true.
	public silent: boolean;

	constructor(title) {
		this.title = title;
	}
}

export class App {
	public mConfigs: object;
	public commandMdSiteGenerator: GenerateMdSite;

	public title: string;

	public assetsName: string;
	public assetsDirLocation: string;
	public inputDirLocation: string;
	public outputDirLocation: string;

	public nameFilters: string[];
	public nameConverter: (name: string, node: object) => string;

	public baseUrl: string;
	public useRelativeLinks: boolean;

	public trailingSlash: boolean = false;
	public noTrailingSlash: boolean = false;

	public listFilesAboveFolders: boolean;

	public mdPageTemplate: string;
	public mdListTemplate: string;

	public isPrinting: boolean;
	public noWriting: boolean;
	public noCache: boolean;

	public isVerbose: boolean;
	public isSilent: boolean;

	public counterValidFolders: FsNode[] = [];
	public counterEmptyFolders: FsNode[] = [];
	// Invalid folder containing invalid files and causing the folder empty.
	public counterInvalidFolders: FsNode[] = [];
	public counterRegularFiles: FsNode[] = [];
	public counterMarkdownFiles: FsNode[] = [];
	public counterHtmlFiles: FsNode[] = [];

	// ".../test-folder/test-file.md"
	public counterTestFolderTestFileFiles: FsNode[] = [];
	// ".../test-file/index.md"
	public counterTestFileIndexFiles: FsNode[] = [];
	// ".../test-file/test-file.md"
	public counterTestFileTestFileFiles: FsNode[] = [];

	// The maxDepth of folders to parse, use 16 by default.
	public maxDepth = 16;
	public maxNodesToLog = 3;
	// The min nodes required to remind user to switch building mode.
	public modeSwitchMinNodesToWarn = 2;
	public modeSwitchWarnRadio = 1.2;

	constructor(configs: Configs) {
		this.mConfigs = configs;

		// Extract configs to app.
		const {
			title,
			assetsName, assetsDir, inputDir, outputDir, mdPageTemplate, mdListTemplate,
			nameFilters, nameConverter, anchorConverter,
			baseUrl, useRelativeLinks,
			trailingSlash, noTrailingSlash,
			listFilesAboveFolders,
			print, noWriting, noCache,
			verbose, silent,
		} = configs;

		this.title = title;

		this.assetsName = assetsName || constants.DEFAULT_ASSETS_DIR_NAME;
		this.assetsDirLocation = path.resolve(assetsDir);
		this.inputDirLocation = path.resolve(inputDir);
		this.outputDirLocation = path.resolve(outputDir);

		this.mdPageTemplate = fs.readFileSync(path.resolve(mdPageTemplate), 'utf8');
		this.mdListTemplate = fs.readFileSync(path.resolve(mdListTemplate), 'utf8');

		this.nameFilters = nameFilters;
		this.nameConverter = nameConverter;
		if (anchorConverter) {renderer.configs.anchorConverter = anchorConverter;}

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
	logRareNodes(formatter: string, nodes: FsNode[]) {
		if (nodes.length === 0) {return;}
		console.log(formatter, nodes.length);
		if (nodes.length > this.maxNodesToLog) {return;}
		nodes.map(node => {
			console.log(`\t- ${node.fromFilePath}`);
		});
	}

	statAndRender() {
		console.log();
		const mdSite = FolderNode.NewInstance(this);
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
		} else {
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
		} else {
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

export default App;
