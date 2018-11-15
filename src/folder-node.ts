'use strict';

import fs = require('fs');
import path = require('path');
import ejs = require('ejs');
import constants = require('./constants');
import utils = require('./utils');
import App from './app';
import FsNode from './fs-node';
import FileNode from './file-node';
import EjsEnv from './ejs-env';

export class FolderNode extends FsNode {
	// The sub files of a folder.
	public fileNames: string[] = [];
	public files: FileNode[] = [];
	public _files: FsNode[] = [];
	public mdFilesNumber: number = 0;
	public folders: FolderNode[] = [];
	public _folders: FsNode[] = [];
	// The nodes of _files and _folders.
	public nodes: FsNode[] = [];
	// The page for a folder.
	public page: FileNode;

	// The entrance of the markdown blog.
	static NewInstance(app: App): FolderNode {
		const stats = fs.statSync(app.inputDirLocation);
		if (!stats.isDirectory()) {throw new Error('target dir is not a dir.');}

		const entrance = new FolderNode(app, 0, stats);
		// Use the title as the from folder name.
		entrance.fromFileName = app.title;
		entrance.fromFilePath = constants.DOT;
		entrance.fromFileLocation = app.inputDirLocation;
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
			if (utils.filterFileName(configs.nameFilters, fileName)) {return console.log('> Filtered out:', path.join(this.fromFilePath, fileName));}
			this.fileNames.push(fileName);
		});

		if (this.fileNames.length === 0) {return configs.counterEmptyFolders.push(this);}

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

		if (this.files.length === 0 && this.folders.length === 0 && !this.page) {return configs.counterInvalidFolders.push(this);}
		this.files.map(item => this._files.push(item));
		this.folders.map(item => {
			if (item.files.length === 0 && this.folders.length === 0 && this.page) {
				// This folder is just a wrapper of a md document file.
				this._files.push(item);
			} else {
				this._folders.push(item);
			}
		});

		this.nodes = configs.listFilesAboveFolders ? [...this._files, ...this._folders] : [...this._folders, ...this._files];

		if (parent) {parent.pushFolder(this);}
	}

	setFolderPage(node: FileNode) {
		if (node.isFile && node.isMarkdownFile) {
			this.configs.counterMarkdownFiles.push(node);
		}
		this.page = node;
	}

	// For folder.
	pushFolder(node: FolderNode) {
		const configs = this.configs;
		configs.counterValidFolders.push(node);
		this.folders.push(node);
	}

	// For folder.
	pushFile(node: FileNode) {
		const configs = this.configs;
		// The HTML files are filtered.
		if (node.isMarkdownFile) {
			this.mdFilesNumber++;
			configs.counterMarkdownFiles.push(node);
		} else {
			configs.counterRegularFiles.push(node);
		}
		this.files.push(node);
	}

	print() {
		if (this.files.length === 0 && this.folders.length === 0) {return;}
		if (this.page) {
			console.log(`${constants.TAB.repeat(this.depth)}- /${this.toFilePath} <<-- ${this.page.fromFilePath}`);
		} else {
			console.log(`${constants.TAB.repeat(this.depth)}- /${this.toFilePath}`);
		}
		this.folders.map(folders => folders.print());
		this.files.map(file => file.print());
	}

	render() {
		const configs = this.configs;

		const output = configs.outputDirLocation;
		const err = utils.mkdirIfNotExists(path.join(output, this.toFilePath), configs.noWriting, configs.isSilent);
		if (err) {throw err;}
		console.log(`${constants.TAB.repeat(this.depth)}- /${this.toFilePath}`);

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
		if (!configs.mdListTemplate || (this.mdFilesNumber === 0 && this.folders.length === 0)) {return;}
		// Rendering a folder page using the list template.
		let toFolderPageLocation;
		if (configs.noTrailingSlash) {
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
		if (!configs.noWriting) {fs.writeFileSync(toFolderPageLocation, ejs.render(configs.mdListTemplate, env));}
		// console.warn('Rendered folder page using list template:', this.fromFileLocation, '-->>', toFolderPageLocation);
	}
}

export default FolderNode;