# Markdown Site Generator

<!-- > 2018-07-16T21:15:25+0800 -->

A markdown site generator which generates static sites, supporting the *no-trailing-slash* mode of sites, and can be used for generating a blogs site.

## Installation

Currently you can clone this repository and run `npm install . --global` inside the root folder.

```bash
git clone https://github.com/zhanbei/Markdown-Site-Generator

cd Markdown-Site-Generator

sudo npm install -g .
```

## Usage

After installation, you will get a `generate-md-site` command available. Create a file `.site_configs/index.js` in your markdown-based site and export an object to configure the site generator. Then you can run `generate-md-site .` to generate your  website.

```bash
generate-md-site .
```

## Configuration

In your configuration file,

- `inputDir` [`required`]
	- The root dir of your markdown site.
- `outputDir` [`required`]
	- The root dir of the generated site.
- `mdPageTemplate` [`required`]
	- The template(using the [ejs](http://ejs.co/) engine) for the rendered markdown document.

Here is a demo of configuration.

```js
// .site_configs/index.js
const path = require('path');

module.exports = {
	title: "My Site",
	inputDir: path.resolve(__dirname, '..'),
	outputDir: path.resolve(__dirname, '../.site'),
	mdPageTemplate: path.resolve(__dirname, 'github/no-trailing-slash-templates/page.ejs'),
	mdPageTemplateName: 'page.ejs',
	mdListTemplate: path.resolve(__dirname, 'github/no-trailing-slash-templates/list.ejs'),
	mdListTemplateName: 'list.ejs',
	assetsDir: path.resolve(__dirname, 'github/assets'),
	// Filter out some files or folders.
	nameFilters: [(name) => name.startsWith('_reserve'), (name) => name === 'backups'],
	nameConverter: (name) => name.toLowerCase(),
	// Whether to generate site in the no-trailing-slash mode.
	noTrailingSlash: true,
	folderIndexConversion: true,
};
```
