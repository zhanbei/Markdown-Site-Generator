'use strict';

// The node for a folder or a md document.
import fs = require('fs');
import path = require('path');
import constants = require('./constants');
import App from './app';
import FolderNode from './folder-node';

// A markdown or regular file.
export class FsNode {
	public configs: App;
	public depth: number;

	// The parent folder of the current node.
	public parent: FolderNode;

	// The Html Title.
	public title: string;

	public fromFileName: string;
	// All paths are relative.
	public fromFilePath: string;
	// All locations are absolute paths.
	public fromFileLocation: string;
	public fromFolderName: string;
	// public fromFolderPath: string;

	public toFileName: string;
	public toFilePath: string;

	// The absolute or relative href of the node, following configs#useRelativeLinks.
	public href: string;
	public hrefAbsolute: string;
	public hrefRelative: string;

	public stats: fs.Stats;
	public isDirectory: boolean;
	public isFile: boolean;

	// Create a file node or folder node.
	constructor(app: App, depth: number, parent: FolderNode, stats: fs.Stats) {
		if (depth > app.maxDepth) {throw new Error('Max depth of folder exceeded!');}
		this.parent = parent;
		this.configs = app;
		this.depth = depth;
		this.stats = stats;
	}

	// fromFileName, fromFilePath, fromFileLocation, fromFolderName, toFileName, toFilePath
	initNode(fileName: string) {
		const configs = this.configs;
		const folder = this.parent;

		this.fromFileName = fileName;
		this.fromFilePath = path.join(folder.fromFilePath, fileName);
		this.fromFileLocation = path.join(folder.fromFileLocation, fileName);
		this.fromFolderName = folder.fromFileName;

		this.toFileName = configs.nameConverter ? configs.nameConverter(this.fromFileName, this) : this.fromFileName.toLowerCase();
		this.toFilePath = path.join(folder.toFilePath, this.toFileName);

		this.setHref(this.toFileName, this.toFilePath);
	}

	// Set relative, absolute, and the default href in the site.
	setHref(relative, absolute) {
		const {baseUrl = '', useRelativeLinks} = this.configs;
		this.hrefRelative = relative;
		this.hrefAbsolute = path.join(constants.SLASH, baseUrl, absolute);
		if (useRelativeLinks) {
			this.href = this.hrefRelative;
		} else {
			this.href = this.hrefAbsolute;
		}
	}
}

export default FsNode;
