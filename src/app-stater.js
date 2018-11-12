'use strict';

const fs = require('fs');
const path = require('path');
const constants = require('./constants');
const utils = require('./utils');

// stat the input dir.
exports.statInputDir = function () {
	const targetDirLocation = path.resolve(this.mInputDirLocation);
	const targetDirName = path.basename(targetDirLocation);
	const targetDirPath = '.';
	const stats = fs.statSync(targetDirPath);
	const node = {
		name: targetDirName,
		urlName: '',
		path: targetDirPath,
		urlPath: '',
		location: targetDirLocation,
		parentDirUrlName: '',
		parentDirName: '',
		stats: stats,
		isDirectory: stats.isDirectory(),
		isFile: stats.isFile(),
		renderFolderPage: true,
	};
	this.mInputTree = node;
	// The files number with trailing slash and '.html'.
	this.mCounterTrailingSlashFiles = 0;
	// The files number with no trailing slash and no '.html'.
	this.mCounterNoTrailingSlashFiles = 0;
	// The html files number.
	this.mCounterHtmlFiles = 0;
	if (node.isDirectory) {
		this.statFolder(node);
		console.log('--> HTML Files:', this.mCounterHtmlFiles, '; TrailingSlashFiles:', this.mCounterTrailingSlashFiles, '; NoTrailingSlashFiles:', this.mCounterNoTrailingSlashFiles);
	} else {
		throw new Error('target dir is not a dir.');
	}
};

// get and set the stats of files of a folder recursively.
exports.statFolder = function (folder) {
	folder.fileNames = fs.readdirSync(folder.location);
	folder.files = [];
	// Whether to render the folder page using the template?
	folder.renderFolderPage = true;
	for (let i = 0; i < folder.fileNames.length; i++) {
		const fileName = folder.fileNames[i];
		const fileLocation = path.resolve(folder.location, fileName);

		// Filter out the filename.
		let filtered = utils.filterFileName(this.mNameFilters, fileName);
		if (filtered) {
			console.log('Filtered out:', fileLocation);
			continue;
		}
		if (fileName.startsWith('.') || fileName.startsWith('_')) {filtered = true;}
		if (filtered) {
			console.log('> Filtered out:', fileLocation);
			continue;
		}

		const stats = fs.statSync(fileLocation);
		const filePath = path.join(folder.path, fileName);
		const node = {
			name: fileName,
			// Name used in the output.
			urlName: '',
			// The node path related to the root dir.
			path: filePath,
			// Path used in the output.
			urlPath: '',
			// The node location.
			location: fileLocation,
			// The url name of the parent dir of the node.
			parentDirUrlName: folder.urlName,
			stats: stats,
			isDirectory: stats.isDirectory(),
			isFile: stats.isFile(),
		};
		node.urlName = this.mNameConverter ? this.mNameConverter(node.name, node) : node.name.toLowerCase();
		node.urlPath = path.join(folder.path, node.urlName);
		folder.files.push(node);
		if (node.isDirectory) {
			this.statFolder(node);
		} else if (node.isFile) {
			if (utils.isHtmlFile(node.name)) {
				this.mCounterHtmlFiles++;
			} else if (utils.isMarkdownFile(node.name)) {

				if (node.urlPlainName === node.parentDirUrlName) {
					this.mCounterNoTrailingSlashFiles++;
				} else {
					this.mCounterTrailingSlashFiles++;
				}

				node.urlPlainName = node.urlName.substr(0, node.urlName.lastIndexOf('.'));

				if (this.mNoTrailingSlash) {
					if (node.urlPlainName === node.parentDirUrlName) {
						folder.renderFolderPage = false;
						node.urlName = node.urlPlainName + constants.DOT_HTML;
						node.urlPath = path.join(folder.urlPath, node.urlName);
					} else if ((node.urlPlainName === constants.INDEX || node.urlPlainName === constants.README) && this.mFolderIndexConversion) {
						folder.renderFolderPage = false;
						node.urlName = node.parentDirUrlName + constants.DOT_HTML;
						node.urlPath = path.join(folder.urlPath, node.urlName);
					} else {
						// Create a folder to store the html if in the no-trailing-slash mode.
						// Folder to be created.
						node.parentDirUrlPath = path.join(folder.urlPath, node.urlPlainName);
						node.urlName = node.urlPlainName + constants.DOT_HTML;
						node.urlPath = path.join(node.parentDirUrlPath, node.urlName);
					}
				} else {
					if ((node.urlPlainName === node.parentDirUrlName || node.urlPlainName === constants.README) && this.mFolderIndexConversion) {
						folder.renderFolderPage = false;
						// file name equals folder name but not in the no-trailing-slash-mode.
						node.urlName = constants.INDEX_DOT_HTML;
						node.urlPath = path.join(folder.urlPath, node.urlName);
					} else {
						if (node.urlPlainName === constants.INDEX) {folder.renderFolderPage = false;}
						node.urlName = node.urlPlainName + constants.DOT_HTML;
						node.urlPath = path.join(folder.urlPath, node.urlName);
					}
				}
			}
		} else {
			console.error('Unknown file type!');
		}
	}
};
