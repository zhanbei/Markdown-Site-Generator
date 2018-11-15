'use strict';

import path = require('path');
import {Command, flags} from '@oclif/command';
import App from './app';

const MODULE_SITE_CONFIGS = '.site_configs';

const ARGS_TARGET_DIR = 'target-dir';

// generate-md-site (-f, --config)  . // build site.
//
// generate-md-site -t, --test . // test configs without building site.
// generate-md-site -p, --print . // print the resolved site structure.
// generate-md-site -n, --no-writing . // build markdown site without writing to disk.
//
// generate-md-site -s, --silent . // use the silent mode, with no output.
// generate-md-site -V, --verbose . // use the verbose mode, with rich output.
//
// generate-md-site -v, --version . // print the version of the markdown site generator.
// generate-md-site -h, --help . // print the help document of the markdown site generator.
class GenerateMdSite extends Command {
	static description = 'A markdown site generator which generates static sites, supporting the *no-trailing-slash* mode, and can be used to generate blog sites.';

	static flags = {
		// Test configs without building site.
		// generate-md-site -t, --test .
		test: flags.boolean({char: 't', description: 'test your configs and stat out the structure of your markdown site without building.'}),
		// Print the resolved site structure.
		// generate-md-site -p, --print .
		print: flags.boolean({char: 'p', description: 'print out the resolved structure of your markdown site without building.'}),
		// Build markdown site without writing to disk.
		// generate-md-site -n, --no-writing .
		'no-writing': flags.boolean({char: 'n', description: 'build markdown site without writing to disk.'}),

		// Use the silent mode, with no output.
		// generate-md-site -s, --silent .
		silent: flags.boolean({char: 's', description: 'use the silent mode, with no output.'}),
		// Use the verbose mode, with rich output.
		// generate-md-site -V, --verbose .
		verbose: flags.boolean({char: 'x', description: 'use the verbose mode, with rich output.'}),

		version: flags.version({char: 'v', description: 'print the version information.'}),
		help: flags.help({char: 'h', description: 'print the usage document for help.'}),
	};

	static args = [{name: ARGS_TARGET_DIR, description: 'the site/configs entrance to be resolved and parsed.'}];

	async run() {
		const {args, flags} = this.parse(GenerateMdSite);

		const isTestingConfigs = flags.test;
		const isPrinting = flags.print;
		const noWriting = flags['no-writing'];

		const isSilent = flags.silent;
		const isVerbose = flags.verbose;

		const givenTargetDir = args[ARGS_TARGET_DIR];
		if (!givenTargetDir) {
			this.error('Please specify the target dir for your markdown site.', {code: 'ARGS_MISSING', exit: 1});
			return;
		}

		let resolvedTargetDir;
		let configs;

		try {
			resolvedTargetDir = path.resolve(givenTargetDir, MODULE_SITE_CONFIGS);
			configs = require(resolvedTargetDir);
		} catch (e) {
			try {
				resolvedTargetDir = path.resolve(givenTargetDir);
				configs = require(resolvedTargetDir);
			} catch (e) {
				this.error('No `.site_configs` module found in the target dir or the target dir itself is not a node module:', givenTargetDir);
				this.error(`You may add a config file named \`index.js\`, \`index.json\`, \`${MODULE_SITE_CONFIGS}.js\`, \`${MODULE_SITE_CONFIGS}.json\`, \`${MODULE_SITE_CONFIGS}/index.js\`, or \`${MODULE_SITE_CONFIGS}/index.json\` to the target dir.`,
					{code: 'CONFIGS_MISSING', exit: 1});
				return;
			}
		}

		if (!configs.title || !configs.inputDir || !configs.outputDir || !configs.mdPageTemplate) {
			this.error('Invalid configs resolved:', configs);
			this.error('You may check out https://github.com/zhanbei/Markdown-Site-Generator for help!', {code: 'INVALID_CONFIGS', exit: 1});
			return;
		}

		if (isTestingConfigs || configs.test) {
			console.log(`The configures resolved "${resolvedTargetDir}" from "${givenTargetDir}" is ok.`);
			console.log();
		}

		const app = new App(configs);
		app.commandMdSiteGenerator = this;

		if (isTestingConfigs || configs.test) {return;}

		if (isPrinting) {app.isPrinting = true;}
		if (noWriting) {app.noWriting = true;}
		if (isSilent) {app.isSilent = true;}
		if (isVerbose) {app.isVerbose = true;}

		app.statAndRender();
	}
}

export = GenerateMdSite