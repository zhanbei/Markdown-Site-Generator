#!/usr/bin/env node

const path = require('path');
const App = require('../src/app');
const configsModule = '.site_configs';

const targetDir = process.argv[2];
let configs;

try {
	configs = require(path.resolve(targetDir, configsModule));
} catch (e) {
	try {
		configs = require(path.resolve(targetDir));
	} catch (e) {
		console.error('No `.site_configs` module found in the target dir or the target dir itself is not a node module:', targetDir);
		console.error(`You may add a file named \`${configsModule}.js\`, \`${configsModule}.json\`, \`${configsModule}/index.js\`, or \`${configsModule}/index.json\` to the target dir.`);
		process.exit(1);
	}
}

if (!configs.inputDir || !configs.outputDir || !configs.mdPageTemplate) {
	console.error('Invalid configs:', configs);
	console.error('You may check out https://github.com/zhanbei/Markdown-Site-Generator for help!');
	process.exit(1);
}

console.log('Resolved configs:', configs);
const app = new App(configs);
app.statAndRender();
