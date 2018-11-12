'use strict';

const fs = require('fs');
const path = require('path');
const appRender = require('./app-render');
const appStater = require('./app-stater');

class App {
	constructor(configs) {
		this.mConfigs = configs;
		const {
			inputDir, outputDir, mdPageTemplate, mdPageTemplateName, mdListTemplate, mdListTemplateName,
			nameFilters, nameConverter, noTrailingSlash, folderIndexConversion,
		} = configs;
		this.mInputDir = inputDir;
		this.mInputDirLocation = path.resolve(inputDir);
		this.mOutputDir = outputDir;
		this.mMdPageTemplateLocation = path.resolve(mdPageTemplate);
		this.mMdPageTemplate = fs.readFileSync(mdPageTemplate, 'utf8');
		this.mMdPageTemplateName = mdPageTemplateName;
		this.mMdListTemplateLocation = path.resolve(mdListTemplate);
		this.mMdListTemplate = fs.readFileSync(mdListTemplate, 'utf8');
		this.mMdListTemplateName = mdListTemplateName;
		this.mNameFilters = nameFilters;
		this.mNameConverter = nameConverter;
		this.mNoTrailingSlash = noTrailingSlash;
		this.mFolderIndexConversion = folderIndexConversion;
	}

	statAndRender() {
		this.statInputDir();
		// console.log('Resolved structure:', JSON.stringify(this.mInputTree));
		this.render();
	}
}

App.prototype.statInputDir = appStater.statInputDir;
App.prototype.statFolder = appStater.statFolder;
App.prototype.render = appRender.render;
App.prototype.renderDir = appRender.renderDir;

module.exports = App;
