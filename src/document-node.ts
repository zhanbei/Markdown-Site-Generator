'use strict';

// The node for a folder or a md document.
import * as fs from 'fs';
import * as path from 'path';
import App from './app';

export class EjsEnv {
	public node: DocumentNode;
	public nodes: DocumentNode[];
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
	// All paths are relative.
	public fromFilePath: string;
	// All locations are absolute paths.
	public fromFileLocation: string;
	public fromFolderName: string;
	// public fromFolderPath: string;

	public toFileName: string;
	public toFilePath: string;

	public stats: fs.Stats;
	public isDirectory: boolean;
	public isFile: boolean;

	// Create a file node or folder node.
	constructor(app: App, depth: number, stats: fs.Stats) {
		if (depth > app.maxDepth) {throw new Error('Max depth of folder exceeded!');}
		this.configs = app;
		this.depth = depth;
		this.stats = stats;
	}

	// fromFileName, fromFilePath, fromFileLocation, fromFolderName, toFileName, toFilePath
	initNode(folder, fileName: string) {
		const configs = this.configs;

		this.fromFileName = fileName;
		this.fromFilePath = path.join(folder.fromFilePath, fileName);
		this.fromFileLocation = path.join(folder.fromFileLocation, fileName);
		this.fromFolderName = folder.fromFileName;

		this.toFileName = configs.mNameConverter ? configs.mNameConverter(this.fromFileName, this) : this.fromFileName.toLowerCase();
		this.toFilePath = path.join(folder.toFilePath, this.toFileName);
	}
}

export default DocumentNode;
