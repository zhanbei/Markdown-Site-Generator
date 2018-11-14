'use strict';

import * as fs from 'fs';
import * as path from 'path';
import DocumentNode from './node';

export class Configs {
	public title: string;
	public inputDir: string;
	public outputDir: string;
	public mdPageTemplate: string;
	public mdListTemplate: string;
	public assetsDir: string;
	public nameFilters: string[];
	public nameConverter: (name: string, node: object) => string;
	public trailingSlash: boolean;
	public noTrailingSlash: boolean;

	constructor(title) {
		this.title = title;
	}
}

export class App {
	public mConfigs: object;

	public title: string;

	public mAssetsDirLocation: string;
	// public mInputDir: string;
	public mInputDirLocation: string;
	// public mOutputDir: string;
	public mOutputDirLocation: string;

	public mNameFilters: string[];
	public mNameConverter: (name: string, node: object) => string;

	public mTrailingSlash: boolean = false;
	public mNoTrailingSlash: boolean = false;

	// public mMdPageTemplateLocation: string;
	public mMdPageTemplate: string;
	// public mMdListTemplateLocation: string;
	public mMdListTemplate: string;

	public mCounterValidFolders: DocumentNode[] = [];
	public mCounterEmptyFolders: DocumentNode[] = [];
	// Invalid folder containing invalid files and causing the folder empty.
	public mCounterInvalidFolders: DocumentNode[] = [];
	public mCounterRegularFiles: DocumentNode[] = [];
	public mCounterMarkdownFiles: DocumentNode[] = [];
	public mCounterHtmlFiles: DocumentNode[] = [];

	// ".../test-folder/test-file.md"
	public mCounterTestFolderTestFileFiles: DocumentNode[] = [];
	// ".../test-file/index.md"
	public mCounterTestFileIndexFiles: DocumentNode[] = [];
	// ".../test-file/test-file.md"
	public mCounterTestFileTestFileFiles: DocumentNode[] = [];

	// The maxDepth of folders to parse, use 16 by default.
	public maxDepth = 16;
	public maxNodesToLog = 3;

	public modeSwitchWarnRadio = 1.2;

	constructor(configs: Configs) {
		this.mConfigs = configs;

		// Extract configs to app.
		const {
			title,
			assetsDir, inputDir, outputDir, mdPageTemplate, mdListTemplate,
			nameFilters, nameConverter,
			trailingSlash, noTrailingSlash,
		} = configs;

		this.title = title;

		this.mAssetsDirLocation = path.resolve(assetsDir);
		// this.mInputDir = inputDir;
		this.mInputDirLocation = path.resolve(inputDir);
		// this.mOutputDir = outputDir;
		this.mOutputDirLocation = path.resolve(outputDir);

		this.mMdPageTemplate = fs.readFileSync(path.resolve(mdPageTemplate), 'utf8');
		this.mMdListTemplate = fs.readFileSync(path.resolve(mdListTemplate), 'utf8');

		this.mNameFilters = nameFilters;
		this.mNameConverter = nameConverter;

		this.mTrailingSlash = trailingSlash;
		this.mNoTrailingSlash = noTrailingSlash;

		console.log();
		const mode = noTrailingSlash ? 'no-trailing-slash' : trailingSlash ? 'trailing-slash' : 'regular';
		console.log(`Resolved markdown site titled "${title}" in the "${mode}" mode.`);
		console.log(`Resolved input: "${this.mInputDirLocation}" and output: "${this.mOutputDirLocation}".`);
	}

	// Log the rare nodes to notice user.
	logRareNodes(formatter: string, nodes: DocumentNode[]) {
		if (nodes.length === 0) {return;}
		console.log(formatter, nodes.length);
		if (nodes.length > this.maxNodesToLog) {return;}
		nodes.map(node => {
			console.log(`\t- ${node.fromFilePath}`);
		});
	}

	statAndRender() {
		console.log();
		const mdSite = DocumentNode.NewInstance(this);
		console.log();
		this.logRareNodes('Found %d valid folders:', this.mCounterValidFolders);
		this.logRareNodes('Found and ignored %d empty folders:', this.mCounterEmptyFolders);
		this.logRareNodes('Found and ignored $d invalid folders:', this.mCounterInvalidFolders);

		this.logRareNodes('Found and ignored %d HTML files:', this.mCounterHtmlFiles);
		this.logRareNodes('Found and will copy %d regular files:', this.mCounterRegularFiles);

		this.logRareNodes('Found and will render %d markdown files:', this.mCounterMarkdownFiles);
		this.logRareNodes('Found %d files in the format of ".../test-folder/test-file.md":', this.mCounterTestFolderTestFileFiles);
		this.logRareNodes('Found %d files in the format of ".../test-file/index.md":', this.mCounterTestFileIndexFiles);
		this.logRareNodes('Found %d files in the format of ".../test-file/test-file.md":', this.mCounterTestFileTestFileFiles);
		console.log();

		const ntsFiles = this.mCounterTestFileTestFileFiles.length;
		const tsFiles = this.mCounterTestFileTestFileFiles.length;
		if (!this.mNoTrailingSlash && ntsFiles > 2 && ntsFiles > 1.2 * tsFiles) {
			console.log('Your site may prefer the no-trailing-slash mode.');
			console.log();
		}
		if ((this.mNoTrailingSlash || !this.mTrailingSlash) && tsFiles > 2 && tsFiles > this.modeSwitchWarnRadio * ntsFiles) {
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
