'use strict';

const fs = require('fs');
const path = require('path');
const ejs = require('ejs');
const constants = require('./constants');
const renderer = require('./renderer');
const utils = require('./utils');

exports.render = function () {
	const tree = this.mInputTree;
	this.renderDir(tree);
};

exports.renderDir = function (folder) {
	const output = this.mOutputDir;
	const targetDir = path.resolve(output, folder.urlPath);
	const err = utils.mkdirIfNotExists(targetDir);
	if (err) {throw err;}

	folder.files.map(node => {
		const targetPath = path.resolve(output, node.path);
		if (node.isDirectory) {
			this.renderDir(node);
		} else if (node.isFile) {
			if (utils.isHtmlFile(node.name)) {
				console.log('Ignored file:', node.path);
			} else if (utils.isMarkdownFile(node.name)) {
				const htmlFile = path.resolve(output, node.urlPath);
				const content = fs.readFileSync(node.location, 'utf8');
				const tokens = renderer.lexer(content);
				const heading = renderer.getHeadingFromTokens(tokens);
				const html = renderer.parserTokens(tokens);
				// The title of a post: metadata.title > markdown.heading > file.name.
				node.title = heading || node.name.substr(0, node.name.lastIndexOf('.')) || 'Unknown HTML Title';

				if (this.mNoTrailingSlash) {
					// folder.md -> folder.html
					// others.md -> others/others.html
					if (node.parentDirUrlPath) {
						const htmlDir = path.resolve(output, node.parentDirUrlPath);
						const err = utils.mkdirIfNotExists(htmlDir);
						if (err) {throw err;}
					} else {
						// Set the folder title of the content.
						folder.title = node.title;
					}
				}

				fs.writeFileSync(htmlFile, ejs.render(this.mMdPageTemplate, {
					...node,
					content: html,
				}));
				console.log('Rendered file:', node.location, '-->>', htmlFile);
			} else {
				// @see https://stackoverflow.com/questions/11293857/fastest-way-to-copy-file-in-node-js
				fs.createReadStream(node.location).pipe(fs.createWriteStream(targetPath));
				console.log('Copied file:', node.location, '-->>', targetPath);
			}
		} else {
			console.error('Ignoring the node because of the unknown file type:', JSON.stringify(node));
		}
	});

	if (this.mMdListTemplate && folder.renderFolderPage) {
		let folderPagePath;
		if (this.mNoTrailingSlash) {
			folderPagePath = path.resolve(output, folder.urlPath, (folder.urlName || constants.INDEX) + constants.DOT_HTML);
		} else {
			folderPagePath = path.resolve(output, folder.urlPath, constants.INDEX_DOT_HTML);
		}
		folder.title = folder.name + ' - Collection';
		fs.writeFileSync(folderPagePath, ejs.render(this.mMdListTemplate, folder));
		console.log('Rendered folder:', folder.location, '-->>', folderPagePath);
	}
};
