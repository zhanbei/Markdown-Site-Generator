'use strict';

import * as fs from 'fs';
import * as path from 'path';
import * as ejs from 'ejs';
import * as constants from './constants';
import * as utils from './utils';
import App from './app';
import DocumentNode, {EjsEnv} from './document-node';
import {FileNode} from './file-node';

export class FolderNode extends DocumentNode {
	// The sub files of a folder.
	public fileNames: string[] = [];
	public files: FileNode[] = [];
	public _files: DocumentNode[] = [];
	public mdFilesNumber: number = 0;
	public folders: FolderNode[] = [];
	public _folders: DocumentNode[] = [];
	// The nodes of _files and _folders.
	public nodes: DocumentNode[] = [];
	// The page for a folder.
	public pageDocumentNode: FileNode;

	// The entrance of the markdown blog.
	static NewInstance(app: App): FolderNode {
		const stats = fs.statSync(app.mInputDirLocation);
		if (!stats.isDirectory()) {throw new Error('target dir is not a dir.');}

		const entrance = new FolderNode(app, 0, stats);
		// Use the title as the from folder name.
		entrance.fromFileName = app.title;
		entrance.fromFilePath = constants.DOT;
		entrance.fromFileLocation = app.mInputDirLocation;
		entrance.fromFolderName = null;
		entrance.toFileName = null;
		entrance.toFilePath = constants.DOT;
		entrance.statFolder(null);
		return entrance;
	}

	constructor(app: App, depth: number, stats: fs.Stats) {
		super(app, depth, stats);
		this.isDirectory = true;
		this.isFile = false;
	}

	statFolder(parent: FolderNode) {
		const configs = this.configs;

		// Initialize this folder.
		const fileNames = fs.readdirSync(this.fromFileLocation);
		fileNames.map(fileName => {
			// Filter out the filename.
			if (utils.filterFileName(configs.mNameFilters, fileName)) {return console.log('> Filtered out:', path.join(this.fromFilePath, fileName));}
			this.fileNames.push(fileName);
		});

		if (this.fileNames.length === 0) {return configs.mCounterEmptyFolders.push(this);}

		this.fileNames.map(fileName => {
			const stats = fs.statSync(path.join(this.fromFileLocation, fileName));
			if (stats.isDirectory()) {
				const child = new FolderNode(configs, this.depth + 1, stats);
				child.initNode(this, fileName);
				child.statFolder(this);
			} else if (stats.isFile()) {
				new FileNode(configs, this.depth + 1, stats).statFile(this, fileName);
			} else {
				// Ignoring the unknown file type.
				console.error('Unknown file type!');
			}
		});

		if (this.files.length === 0 && this.folders.length === 0 && !this.pageDocumentNode) {return configs.mCounterInvalidFolders.push(this);}
		this.files.map(item => this._files.push(item));
		this.folders.map(item => {
			if (item.files.length === 0 && this.folders.length === 0 && this.pageDocumentNode) {
				// This folder is just a wrapper of a md document file.
				this._files.push(item);
			} else {
				this._folders.push(item);
			}
		});

		this.nodes = configs.mListFilesAboveFolders ? [...this._files, ...this._folders] : [...this._folders, ...this._files];

		if (parent) {parent.pushFolder(this);}
	}

	setFolderPage(node: FileNode) {
		if (node.isFile && node.isMarkdownFile) {
			this.configs.mCounterMarkdownFiles.push(node);
		}
		this.pageDocumentNode = node;
	}

	// For folder.
	pushFolder(node: FolderNode) {
		const configs = this.configs;
		configs.mCounterValidFolders.push(node);
		this.folders.push(node);
	}

	// For folder.
	pushFile(node: FileNode) {
		const configs = this.configs;
		// The HTML files are filtered.
		if (node.isMarkdownFile) {
			this.mdFilesNumber++;
			configs.mCounterMarkdownFiles.push(node);
		} else {
			configs.mCounterRegularFiles.push(node);
		}
		this.files.push(node);
	}

	print() {
		if (this.files.length === 0 && this.folders.length === 0) {return;}
		if (this.pageDocumentNode) {
			console.log(`${constants.TAB.repeat(this.depth)}- /${this.toFilePath} <<-- ${this.pageDocumentNode.fromFilePath}`);
		} else {
			console.log(`${constants.TAB.repeat(this.depth)}- /${this.toFilePath}`);
		}
		this.folders.map(folders => folders.print());
		this.files.map(file => file.print());
	}

	render() {
		const configs = this.configs;

		const output = configs.mOutputDirLocation;
		const err = utils.mkdirIfNotExists(path.join(output, this.toFilePath));
		if (err) {throw err;}
		console.log(`${constants.TAB.repeat(this.depth)}- /${this.toFilePath}`);

		// Render folders and files first to get titles from markdown files.
		this.folders.map(node => node.render());
		this.files.map(node => node.render());

		if (this.pageDocumentNode) {
			this.pageDocumentNode.render();
			// Use the #pageDocumentNode's title as its own title.
			this.title = this.pageDocumentNode.title;
			return;
		}
		// Ignore the folder page if no template or no sub md files.
		if (!configs.mMdListTemplate || (this.mdFilesNumber === 0 && this.folders.length === 0)) {return;}
		// Rendering a folder page using the list template.
		let toFolderPageLocation;
		if (configs.mNoTrailingSlash) {
			// this.toFileName will be null for the input folder.
			const toFileName = (this.toFileName || constants.INDEX) + constants.DOT_HTML;
			toFolderPageLocation = path.join(output, this.toFilePath, toFileName);
			console.log(`${constants.TAB.repeat(this.depth + 1)}- /${toFileName} <<-- List Template.`);
		} else {
			toFolderPageLocation = path.join(output, this.toFilePath, constants.INDEX_DOT_HTML);
			console.log(`${constants.TAB.repeat(this.depth + 1)}- /${constants.INDEX_DOT_HTML} <<-- List Template.`);
		}
		this.title = this.fromFileName + ' - Collection';
		const env = new EjsEnv(configs, this);
		env.nodes = this.nodes;
		fs.writeFileSync(toFolderPageLocation, ejs.render(configs.mMdListTemplate, env));
		// console.warn('Rendered folder page using list template:', this.fromFileLocation, '-->>', toFolderPageLocation);
	}
}

export default FolderNode;