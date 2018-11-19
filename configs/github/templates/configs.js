'use strict';

const path = require('path');

module.exports = {
	trailingSlash: true,
	noTrailingSlash: false,
	assetsDir: path.resolve(__dirname, '../assets'),
	mdPageTemplate: path.resolve(__dirname, 'page.ejs'),
	mdListTemplate: path.resolve(__dirname, 'list.ejs'),
};
