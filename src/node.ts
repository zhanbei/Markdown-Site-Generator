'use strict';

// The node for a folder or a md document.
// A folder will be rendered
// The md document will be rendered as html.
import * as path from 'path';
import * as fs from 'fs';
import * as ejs from 'ejs';
import * as constants from './constants';
import * as renderer from './renderer';
import * as utils from './utils';
import App from './app';

export class EjsEnv {
	public title: string;
	public node: DocumentNode;
	public configs: App;

	// The rendered content.
	public html: string;

	constructor(configs, node) {
		this.configs = configs;
		this.node = node;
	}
}

// A markdown or regular file.
export class DocumentNode {
	public configs: App;
	public depth: number;

	// The Html Title.
	public title: string;

	public fromFileName: string;
	// Valid only for a regular file.
	public fromFilePlainName: string;
	public fromFileExtension: string;
	// All paths are relative.
	public fromFilePath: string;
	// All locations are absolute paths.
	public fromFileLocation: string;
	public fromFolderName: string;
	// public fromFolderPath: string;

	public toFileName: string;
	public toFilePlainName: string;
	public toFilePath: string;

	public stats: fs.Stats;
	public isDirectory: boolean;
	public isFile: boolean;

	// The sub files of a folder.
	public fileNames: string[];
	public files: DocumentNode[];
	// The page for a folder.
	public pageDocumentNode: DocumentNode;
	public mdFilesNumber: number;

	// The folder to be created for a markdown document.
	public toFolderPath: string;
	public isHtmlFile: boolean;
	public isMarkdownFile: boolean;

	// The entrance of the markdown blog.
	static NewInstance(app: App): DocumentNode {
		const entrance = new DocumentNode(app, 0);
		// Use the title as the from folder name.
		entrance.fromFileName = app.title;
		entrance.fromFilePath = constants.DOT;
		entrance.fromFileLocation = app.mInputDirLocation;
		entrance.fromFolderName = null;
		entrance.toFileName = null;
		entrance.toFilePath = constants.DOT;
		entrance.stats = fs.statSync(entrance.fromFileLocation);
		entrance.isDirectory = entrance.stats.isDirectory();
		entrance.isFile = entrance.stats.isFile();

		if (!entrance.isDirectory) {throw new Error('target dir is not a dir.');}
		entrance.statFolder(null);
		return entrance;
	}

	// Create a file node or folder node.
	constructor(app: App, depth: number) {
		if (depth > app.maxDepth) {throw new Error('Max depth of folder exceeded!');}
		this.configs = app;
		this.depth = depth;
	}

	statFolder(parent: DocumentNode) {
		const configs = this.configs;

		this.fileNames = [];
		this.files = [];
		this.mdFilesNumber = 0;

		// Initialize this folder.
		const fileNames = fs.readdirSync(this.fromFileLocation);
		fileNames.map(fileName => {
			// Filter out the filename.
			if (utils.filterFileName(configs.mNameFilters, fileName)) {return console.log('> Filtered out:', path.join(this.fromFilePath, fileName));}
			this.fileNames.push(fileName);
		});

		if (this.fileNames.length === 0) {return configs.mCounterEmptyFolders.push(this);}

		this.fileNames.map(fileName => {
			new DocumentNode(configs, this.depth + 1).statFile(this, fileName);
		});

		if (this.files.length === 0 && !this.pageDocumentNode) {return configs.mCounterInvalidFolders.push(this);}

		if (parent) {parent.pushFile(this);}
	}

	setFolderPage(node: DocumentNode) {
		if (node.isFile && node.isMarkdownFile) {
			this.configs.mCounterMarkdownFiles.push(node);
		}
		this.pageDocumentNode = node;
	}

	// For folder.
	pushFile(node: DocumentNode) {
		const configs = this.configs;
		if (node.isDirectory) {
			configs.mCounterValidFolders.push(node);
		} else if (node.isFile) {
			// The HTML files are filtered.
			if (node.isMarkdownFile) {
				this.mdFilesNumber++;
				configs.mCounterMarkdownFiles.push(node);
			} else {
				configs.mCounterRegularFiles.push(node);
			}
		}
		this.files.push(node);
	}

	// Initialize the target file.
	statFile(folder: DocumentNode, fileName: string) {
		const configs = this.configs;

		this.fromFileName = fileName;
		this.fromFilePlainName = this.fromFileName.substr(0, this.fromFileName.lastIndexOf('.'));
		this.fromFileExtension = path.extname(this.fromFileName);
		this.fromFilePath = path.join(folder.fromFilePath, fileName);
		this.fromFileLocation = path.join(folder.fromFileLocation, fileName);
		this.fromFolderName = folder.fromFileName;
		this.stats = fs.statSync(this.fromFileLocation);
		this.isDirectory = this.stats.isDirectory();
		this.isFile = this.stats.isFile();
		this.isHtmlFile = utils.isHtmlFile(this.fromFileExtension);
		this.isMarkdownFile = utils.isMarkdownFile(this.fromFileExtension);

		this.toFileName = configs.mNameConverter ? configs.mNameConverter(this.fromFileName, this) : this.fromFileName.toLowerCase();
		this.toFilePath = path.join(folder.toFilePath, this.toFileName);
		if (this.isDirectory) {
			this.statFolder(folder);
			return;
		}
		if (!this.isFile) {
			console.error('Unknown file type!');
			// Ignoring the unknown file type.
			return;
		}
		if (this.isHtmlFile) {
			configs.mCounterHtmlFiles.push(this);
			// Ignoring the HTML files.
			return;
		}
		if (!this.isMarkdownFile) {
			folder.pushFile(this);
			return;
		}
		this.toFilePlainName = this.toFileName.substr(0, this.toFileName.lastIndexOf('.'));

		switch (this.toFilePlainName) {
			case constants.INDEX:
				configs.mCounterTestFileIndexFiles.push(this);
				break;
			case folder.toFileName:
				configs.mCounterTestFileTestFileFiles.push(this);
				break;
			default:
				configs.mCounterTestFolderTestFileFiles.push(this);
				break;
		}

		if (configs.mNoTrailingSlash) {
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
					if (!folder.pageDocumentNode) {folder.setFolderPage(this);}
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
		if (configs.mTrailingSlash) {
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
		if (this.isDirectory) {
			if (this.files.length === 0) {return;}
			if (this.pageDocumentNode) {
				console.log(`${constants.TAB.repeat(this.depth)}- /${this.toFilePath} <<-- ${this.pageDocumentNode.fromFilePath}`);
			} else {
				console.log(`${constants.TAB.repeat(this.depth)}- /${this.toFilePath}`);
			}
			this.files.map(file => file.print());
			return;
		}
		if (this.toFolderPath) {
			console.log(`${constants.TAB.repeat(this.depth)}- /${path.basename(this.toFolderPath)}`);
			console.log(`${constants.TAB.repeat(this.depth + 1)}- /${this.toFileName} <<-- ${this.fromFilePath}`);
		} else {
			console.log(`${constants.TAB.repeat(this.depth)}- /${this.toFileName} <<-- ${this.fromFilePath}`);
		}
	}

	render() {
		if (!this.isDirectory) {throw new Error('Trying to render a regular file!');}
		this.renderFolder();
	}

	renderFolder() {
		const configs = this.configs;

		const output = configs.mOutputDirLocation;
		const err = utils.mkdirIfNotExists(path.join(output, this.toFilePath));
		if (err) {throw err;}
		console.log(`${constants.TAB.repeat(this.depth)}- /${this.toFilePath}`);

		// Render files first to get titles from markdown files.
		this.files.map(node => node.renderFile());

		if (this.pageDocumentNode) {return this.pageDocumentNode.renderFile();}
		// Ignore the folder page if no template or no sub md files.
		if (!configs.mMdListTemplate || this.mdFilesNumber === 0) {return;}
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
		fs.writeFileSync(toFolderPageLocation, ejs.render(configs.mMdListTemplate, new EjsEnv(configs, this)));
		// console.warn('Rendered folder page using list template:', this.fromFileLocation, '-->>', toFolderPageLocation);
	}

	renderFile() {
		const configs = this.configs;
		const output = configs.mOutputDirLocation;
		if (this.isDirectory) {
			this.renderFolder();
			return;
		}
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
		fs.writeFileSync(toFileLocation, ejs.render(configs.mMdPageTemplate, env));
		// console.warn('Rendered file:', this.fromFileLocation, '-->>', toFileLocation);

		if (this.toFolderPath) {
			console.log(`${constants.TAB.repeat(this.depth + 1)}- /${this.toFileName} <<-- ${this.fromFilePath}`);
		} else {
			console.log(`${constants.TAB.repeat(this.depth)}- /${this.toFileName} <<-- ${this.fromFilePath}`);
		}
	}
}

export default DocumentNode;
