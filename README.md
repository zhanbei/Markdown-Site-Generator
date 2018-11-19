# Markdown Site Generator

<!-- > 2018-07-16T21:15:25+0800 -->

A markdown site generator which generates static sites, supporting the *no-trailing-slash* mode, and can be used to generate blog sites.

## TO DO

- [ ] Parse markdown document metadata.
- [ ] Parse folder/index.json metadata.

## Installation

Currently you can clone this repository and run `npm install . --global` inside the root folder.

```bash
git clone https://github.com/zhanbei/Markdown-Site-Generator

cd Markdown-Site-Generator

sudo npm install -g .
```

After installation, you will get the `generate-md-site` command available.

## Get Started

Run the `generate-md-site My-Blogs` to generate a markdown site for test,
and you will follow the built-in instructions to get started.

## Usage

Run the `generate-md-site --help` to get available options and usage examples like shown following:

```text
fisher@zb ~/workspace $ generate-md-site

 ›   Please specify the target dir for your markdown site.

A markdown site generator which generates static sites, supporting the *no-trailing-slash* mode, and can be used to generate blog sites.

USAGE
  $ generate-md-site [TARGET-DIR]

ARGUMENTS
  TARGET-DIR  the site/configs entrance to be resolved and parsed.

OPTIONS
  -h, --help        print the usage document for help.
  -i, --init        initialize a new or an existed markdown site with prompts and the default configures.
  -n, --no-writing  build markdown site without writing to disk.
  -p, --print       print out the resolved structure of your markdown site without building.
  -s, --silent      use the silent mode, with no output.
  -t, --test        test your configs and stat out the structure of your markdown site without building.
  -v, --version     print the version information.
  -x, --verbose     use the verbose mode, with rich output.

DESCRIPTION
  The *Markdown Site Generator* supports sites in the following three different modes:

  1. The     **Dot  HTML**     Mode:  In this mode, every markdown file is rendered directly to the corresponding HTML file.
  2. The  **Trailing  Slash**  Mode:  This mode abandons the ending *.html* and appends a trailing slash to the URL.
  3. The **No Trailing Slash** Mode:  Site generated and hosted in the *no-trailing-slash* mode has no trailing slash in the URL.

EXAMPLES

  $ generate-md-site .                     # build your markdown site and generate a static site.

  $ generate-md-site --init .              # initialize an existed markdown site with prompts and the default configures.
  $ generate-md-site --init <site-name>    # create a new markdown demo site with prompts and the default configures.
  $ generate-md-site --test .              # test configs without building site.
  $ generate-md-site --print .             # print the resolved site structure.
  $ generate-md-site --no-writing .        # build markdown site without writing to disk.
  $ generate-md-site --no-cache .          # build markdown site without cache( of static assets).

  $ generate-md-site --version             # print the version of the markdown site generator.
  $ generate-md-site --help                # print the help document of the markdown site generator.
```

## Configuration

The site configs may consist of the following fields:

> The mark "`- [x]`" stands for required field while "`- [ ]`" stands for optional field.

- [x] `title`
	- The site title.
- [x] `inputDir`
	- The root dir of your markdown site.
- [x] `outputDir`
	- The root dir of the generated site.
- [x] `mdPageTemplate`
	- The template(using the [ejs](http://ejs.co/) engine) for the rendered markdown document.

Here is a [demo of configuration](.site_configs/index.js):

```js
// .site_configs/index.js
'use strict';

const path = require('path');
// The selected configs of selected theme(github), which take cares of used templates and selected mode.
// Merge it into the site configs to make it work.
const configures = require('./github/no-trailing-slash-templates/configs');

// The default configs for the markdown site.
module.exports = Object.assign({
	title: 'My Awesome Blogs',

	inputDir: path.resolve(__dirname, '..'),
	outputDir: path.resolve(__dirname, '../.site'),

	// Filter out some files or folders.
	nameFilters: [
		(name) => name.startsWith('_reserve'),
		(name) => ['backups', 'README.md', 'Drafts', 'logs'].includes(name),
	],
	nameConverter: (name) => name.toLowerCase(),

	// Generate site in the dot-html mode, if true, and !trailingSlash and !noTrailingSlash.
	dotHTML: true,
	// Generate site in the trailing-slash mode, if true and !noTrailingSlash.
	trailingSlash: false,
	// Generate site in the no-trailing-slash mode, if true.
	noTrailingSlash: false,

	// The default configures used, which will be override by selected templates and mode.
	assetsDir: path.resolve(__dirname, 'not-existed/assets'),
	mdPageTemplate: path.resolve(__dirname, 'not-existed/templates/page.ejs'),
	mdListTemplate: path.resolve(__dirname, 'not-existed/templates/list.ejs'),
}, configures);
```

## Modes of the Markdown Site Generator

- **The Dot HTML Mode**:
In this mode, every markdown file is rendered directly to the corresponding HTML file.
- **The Trailing Slash Mode**:
This mode abandons the ending *.html* and appends a trailing slash to the URL.
- **The No Trailing Slash Mode**:
Site generated and hosted in the *no-trailing-slash* mode has no trailing slash in the URL.

## (Blog) Site Structure

The site structure of your original content and the generated.

- **A Demo Markdown Site**
	- Index.md
	- README.md
	- Test-File.md
	- Test-Folder.md
	- Test-Folder
		- Index.md
		- Test-Folder.md
		- Test-File.md
		- Test-File.any
- Rendering in the **Dot HTML Mode** and Host Normally
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
