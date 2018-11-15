'use strict';

import fs = require('fs');
import path = require('path');
import renderer = require('./renderer');
import FsNode from './fs-node';
import FolderNode from './folder-node';

export class Configs {
	public title: string;
	public inputDir: string;
	public outputDir: string;
	public mdPageTemplate: string;
	public mdListTemplate: string;
	public assetsDir: string;
	public nameFilters: string[];
	public nameConverter: (name: string, node: object) => string;
	public anchorConverter: (name: string) => string;
	public trailingSlash: boolean;
	public noTrailingSlash: boolean;
	// List files above folders, if true.
	public listFilesAboveFolders: boolean;

	constructor(title) {
		this.title = title;
	}
}

export class App {
	public mConfigs: object;

	public title: string;

	public assetsDirLocation: string;
	public inputDirLocation: string;
	public outputDirLocation: string;

	public nameFilters: string[];
	public nameConverter: (name: string, node: object) => string;

	public trailingSlash: boolean = false;
	public noTrailingSlash: boolean = false;

	public listFilesAboveFolders: boolean;

	public mdPageTemplate: string;
	public mdListTemplate: string;

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
			assetsDir, inputDir, outputDir, mdPageTemplate, mdListTemplate,
			nameFilters, nameConverter, anchorConverter,
			trailingSlash, noTrailingSlash,
			listFilesAboveFolders,
		} = configs;

		this.title = title;

		this.assetsDirLocation = path.resolve(assetsDir);
		this.inputDirLocation = path.resolve(inputDir);
		this.outputDirLocation = path.resolve(outputDir);

		this.mdPageTemplate = fs.readFileSync(path.resolve(mdPageTemplate), 'utf8');
		this.mdListTemplate = fs.readFileSync(path.resolve(mdListTemplate), 'utf8');

		this.nameFilters = nameFilters;
		this.nameConverter = nameConverter;
		if (anchorConverter) {renderer.configs.anchorConverter = anchorConverter;}

		this.trailingSlash = trailingSlash;
		this.noTrailingSlash = noTrailingSlash;

		this.listFilesAboveFolders = listFilesAboveFolders;

		console.log();
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

		this.logRareNodes('Found and will render %d markdown files:', this.counterMarkdownFiles);
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

		// console.log(`Resolved site from: "${mdSite.fromFileLocation}".`);
		// mdSite.print();
		// console.log();

		console.log('Rendering:', mdSite.fromFileLocation);
		mdSite.render();
		console.log();
	}
}

export default App;
