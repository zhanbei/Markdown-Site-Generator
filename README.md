# Markdown Site Generator

<!-- > 2018-07-16T21:15:25+0800 -->

A markdown site generator which generates static sites, supporting the *no-trailing-slash* mode of sites, and can be used for generating a blogs site.

## TO DO

- [ ] Copy static assets to generated site with cache.
- [ ] Generate default configs on initialize.
- [ ] Update documents of usage of configs.
- [ ] Fix the conflict between HTML base and anchor.
- [ ] Parse markdown document metadata.
- [ ] Parse folder/index.json metadata.
- [ ] Fix non-character anchors.

## Installation

Currently you can clone this repository and run `npm install . --global` inside the root folder.

```bash
git clone https://github.com/zhanbei/Markdown-Site-Generator

cd Markdown-Site-Generator

sudo npm install -g .
```

## Get Started

You may check out the [instructions to start a brand new blog site](https://github.com/zhanbei/.markdown-site-configs#start-a-brand-new-blog) with the [github flavored markdown](https://github.github.com/gfm/) supported.

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

## Modes of the Markdown Site Generator

- **The Default Mode**:
By default, every markdown file is rendered directly to the corresponding HTML file.
- **Trailing Slash Mode(No Ending Dot HTML)**:
This mode abandons the ending *.html* and prefers a trailing slash in the URL.
- **No Trailing Slash Mode**:
In this mode, site generated and hosted in the *no trailing slash* has no trailing slash in the URL.

## (Blog) Site Structure

The site structure of your original content and the generated.

- (Markdown) **Demo Site**
	- Index.md
	- README.md
	- Test-File.md
	- Test-Folder.md
	- Test-Folder
		- Index.md
		- Test-Folder.md
		- Test-File.md
		- Test-File.any
- Rendering by **Default** and Host Normally
	- index.html `/`
	- readme.html `/readme.html`
	- test-file.html `/test-file.html`
	- test-folder.html `/test-folder.html`
	- test-folder
		- index.html `/test-folder/`
		- test-folder.html `/test-folder/test-folder.html`
		- test-file.html `/test-file.html`
		- test-file.any `/test-file.any`
- Rendering in the **Trailing Slash Mode** and Host Normally
	- index.html `/`
	- readme
		- index.html `/readme/`
	- test-file
		- index.html `/test-file/`
	- test-folder
		- index.html `/test-folder/`
		- test-folder
			- index.html `/test-folder/test-folder/`
		- test-file
			- index.html `/test-file/`
		- test-file.any `/test-file.any`
- Rendering in the **No Trailing Slash Mode** and Host in the *No Trailing Slash Mode*
	- index.html `/`
	- readme
		- readme.html `/readme`
	- test-file
		- test-file.html `/test-file`
	- test-folder
		- test-folder.html `/test-folder`
			- the original `test-folder/test-folder.md` is rendered prior to the `test-folder/index.md`.
		- test-file
			- test-file.html `/test-folder/test-file`
		- test-file.any `/test-folder/test-file.any`

## References

- [Hugo support for URLs without a trailing slash?](https://discourse.gohugo.io/t/hugo-support-for-urls-without-a-trailing-slash/6763) -
discourse.gohugo.io
