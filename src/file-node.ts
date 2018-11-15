'use strict';

import fs = require('fs');
import path = require('path');
import ejs = require('ejs');
import constants = require('./constants');
import utils = require('./utils');
import renderer = require('./renderer');
import App from './app';
import FsNode from './fs-node';
import FolderNode from './folder-node';
import EjsEnv from './ejs-env';

export class FileNode extends FsNode {

	// Valid only for a regular file.
	public fromFilePlainName: string;
	public fromFileExtension: string;

	// The plain name without extension(md/html) of the output file to be rendered.
	public toFilePlainName: string;
	// The folder to be created for a markdown document.
	public toFolderPath: string;
	public isHtmlFile: boolean;
	public isMarkdownFile: boolean;

	constructor(app: App, depth: number, stats: fs.Stats) {
		super(app, depth, stats);
		this.isDirectory = false;
		this.isFile = true;
	}

	// Initialize the target file.
	statFile(folder: FolderNode, fileName: string) {
		const configs = this.configs;

		this.initNode(folder, fileName);

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
			this.toFileName = this.toFilePlainName + constants.DOT_HTML;
			this.toFilePath = path.join(folder.toFilePath, this.toFileName);
			switch (this.toFilePlainName) {
				case folder.toFileName:
					folder.setFolderPage(this);
					break;
				// case constants.README:
				case constants.INDEX:
					// Set the folder page if not set yet.
					if (!folder.page) {folder.setFolderPage(this);}
					break;
				default:
					// Create a folder to store the html in the no-trailing-slash mode.
					this.toFolderPath = path.join(folder.toFilePath, this.toFilePlainName);
					this.toFilePath = path.join(this.toFolderPath, this.toFileName);
					folder.pushFile(this);
					break;
			}
			return;
		}
		if (configs.trailingSlash) {
			// Case 2. Rendering in the trailing slash mode.
			if (this.toFilePlainName === constants.INDEX) {
				this.toFileName = this.toFilePlainName + constants.DOT_HTML;
				this.toFilePath = path.join(folder.toFilePath, this.toFileName);
				folder.setFolderPage(this);
			} else {
				// Create a folder to store the html in the trailing-slash mode.
				this.toFolderPath = path.join(folder.toFilePath, this.toFilePlainName);
				// Render the markdown document to index.html to add a trailing slash.
				this.toFilePath = path.join(this.toFolderPath, constants.INDEX_DOT_HTML);
				folder.pushFile(this);
			}
			return;
		}
		// Case 3. Rendering in the default mode.
		this.toFileName = this.toFilePlainName + constants.DOT_HTML;
		this.toFilePath = path.join(folder.toFilePath, this.toFileName);
		if (this.toFilePlainName === constants.INDEX) {
			folder.setFolderPage(this);
		} else {
			folder.pushFile(this);
		}
	}

	print() {
		if (this.toFolderPath) {
			console.log(`${constants.TAB.repeat(this.depth)}- /${path.basename(this.toFolderPath)}`);
			console.log(`${constants.TAB.repeat(this.depth + 1)}- /${this.toFileName} <<-- ${this.fromFilePath}`);
		} else {
			console.log(`${constants.TAB.repeat(this.depth)}- /${this.toFileName} <<-- ${this.fromFilePath}`);
		}
	}

	render() {
		const configs = this.configs;
		const output = configs.outputDirLocation;
		if (!this.isFile) {return console.error('FATAL Found ignored file of the unknown file type:', JSON.stringify(this));}
		if (this.isHtmlFile) {return console.log('FATAL Found ignored file:', this.fromFilePath);}
		if (!this.isMarkdownFile) {
			const toFileLocation = path.join(output, this.toFilePath);
			// @see https://stackoverflow.com/questions/11293857/fastest-way-to-copy-file-in-node-js
			fs.createReadStream(this.fromFileLocation).pipe(fs.createWriteStream(toFileLocation));
			// console.warn('Copied file:', this.fromFileLocation, '-->>', toFileLocation);
			console.log(`${constants.TAB.repeat(this.depth)}- /${this.toFileName} <- ${this.fromFilePath}`);
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
			const err = utils.mkdirIfNotExists(path.join(output, this.toFolderPath));
			if (err) {throw err;}
			console.log(`${constants.TAB.repeat(this.depth)}- /${path.basename(this.toFolderPath)}`);
		}

		const env = new EjsEnv(configs, this);
		env.html = html;
		fs.writeFileSync(toFileLocation, ejs.render(configs.mdPageTemplate, env));
		// console.warn('Rendered file:', this.fromFileLocation, '-->>', toFileLocation);

		if (this.toFolderPath) {
			console.log(`${constants.TAB.repeat(this.depth + 1)}- /${this.toFileName} <<-- ${this.fromFilePath}`);
		} else {
			console.log(`${constants.TAB.repeat(this.depth)}- /${this.toFileName} <<-- ${this.fromFilePath}`);
		}
	}
}


export default FileNode;
