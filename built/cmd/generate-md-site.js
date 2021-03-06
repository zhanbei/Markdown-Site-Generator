'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const path = require("path");
const command_1 = require("@oclif/command");
const constants = require("./constants");
const logger = require("./logger");
const utils = require("./utils");
const app_1 = require("../app");
const initialize_site_1 = require("./initialize-site");
const strings_1 = require("./strings");
const _package = require('../../package.json');
const command = _package.oclif.bin;
const documentation = `
The *Markdown Site Generator* supports sites in the following three different modes:

1. The     **Dot  HTML**     Mode:  In this mode, every markdown file is rendered directly to the corresponding HTML file.
2. The  **Trailing  Slash**  Mode:  This mode abandons the ending *.html* and appends a trailing slash to the URL.
3. The **No Trailing Slash** Mode:  Site generated and hosted in the *no-trailing-slash* mode has no trailing slash in the URL.

`;
// A markdown site generator which generates static sites, supporting the *no-trailing-slash* mode, and can be used to generate blog sites.
const _description = `${_package.description}\n\n${documentation}`;
const MODULE_SITE_CONFIGS = constants.MODULE_SITE_CONFIGS;
const ARGS_TARGET_DIR = 'target-dir';
// generate-md-site .                   // build your markdown site and generate a static site.
// generate-md-site -c, --config .      // build your markdown site and generate a static site.
// generate-md-site -c, --configs .     // build your markdown site and generate a static site.
//
// There should be no existed configures.
// generate-md-site -i, --init .            // initialize an existed markdown site with prompts and the default configures.`,
// generate-md-site -i, --init <site-name>  // create a new markdown demo site with prompts and the default configures.`,
//
// The following commands/options can not be used as mixed.
// generate-md-site -t, --test .        // test configs without building site.
// generate-md-site -p, --print .       // print the resolved site structure.
// generate-md-site -n, --no-writing .  // build markdown site without writing to disk.
// generate-md-site -f, --force .       // build your markdown site without cache( of static assets).
// generate-md-site -f, --no-cache .    // build your markdown site without cache( of static assets).
//
// generate-md-site -s, --silent .      // use the silent mode, with no output.
// generate-md-site -V, --verbose .     // use the verbose mode, with rich output.
//
// generate-md-site -v, --version .     // print the version of the markdown site generator.
// generate-md-site -h, --help .        // print the help document of the markdown site generator.
class GenerateMdSite extends command_1.Command {
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            const { args, flags } = this.parse(GenerateMdSite);
            // The configures should be invalid, if #isInitializing.
            const isInitializing = flags.init;
            const isTestingConfigs = flags.test;
            const isPrinting = flags.print;
            const noWriting = flags['no-writing'];
            const noCache = flags['no-cache'];
            const isSilent = flags.silent;
            const isVerbose = flags.verbose;
            const argTargetSiteDir = args[ARGS_TARGET_DIR];
            if (!argTargetSiteDir || !argTargetSiteDir.trim()) {
                logger.error('Please specify the target dir for your markdown site.');
                logger.log();
                this._help();
                // Missing required arguments.
                this.exit(1);
                return;
            }
            const targetSiteDir = utils.normalizePath(argTargetSiteDir);
            const targetSiteDirLocation = path.resolve(targetSiteDir);
            const targetConfigsDir = path.join(targetSiteDir, MODULE_SITE_CONFIGS);
            const targetConfigsDirLocation = path.join(targetSiteDirLocation, MODULE_SITE_CONFIGS);
            // The resolved site configs location.
            let resolvedTargetConfigsDirLocation = targetConfigsDirLocation;
            let configs;
            try {
                configs = require(resolvedTargetConfigsDirLocation);
            }
            catch (e) {
                try {
                    resolvedTargetConfigsDirLocation = targetSiteDirLocation;
                    configs = require(resolvedTargetConfigsDirLocation);
                }
                catch (e) { }
            }
            const errors = strings_1.getGenerateMdSiteErrors(targetSiteDir, targetSiteDirLocation, targetConfigsDir, resolvedTargetConfigsDirLocation);
            const notices = strings_1.getGenerateMdSiteNotices(targetSiteDir, targetSiteDirLocation, targetConfigsDir, resolvedTargetConfigsDirLocation);
            if (!configs) {
                if (!isInitializing) {
                    logger.error(errors.noSiteConfigsModulesFoundError);
                    logger.error(errors.noSiteConfigsModulesFoundHelp);
                    // Missing configures from given target directory.
                    this.exit(1);
                    return;
                }
                // TRY Initializing markdown site.
                const stat = utils.isFileExist(targetSiteDirLocation);
                if (stat && !stat.isDirectory()) {
                    // Abort if #givenTargetSiteDir exist and is not a folder.
                    logger.error(errors.targetSiteDirIsNotFolderError);
                    this.exit(1);
                    return;
                }
                if (stat && utils.isFileExist(targetConfigsDirLocation)) {
                    // Abort if #givenTargetSiteDir/.site_configs exist.
                    logger.error(errors.targetSiteConfigsDirExistedError);
                    logger.error(errors.targetSiteConfigsDirExistedHelp);
                    this.exit(1);
                    return;
                }
                yield initialize_site_1.default(this, targetSiteDir, targetSiteDirLocation, Boolean(stat), targetConfigsDir, targetConfigsDirLocation);
                return;
            }
            if (isInitializing) {
                logger.error(errors.nonEmptySiteConfigsResolvedError);
                logger.error(errors.nonEmptySiteConfigsResolvedHelp);
                // Try initializing existed configures.
                this.exit(1);
                return;
            }
            if (!configs.title || !configs.inputDir || !configs.outputDir || !configs.mdPageTemplate) {
                logger.error(errors.invalidSiteConfigsResolvedError, configs);
                logger.error(errors.invalidSiteConfigsResolvedHelp);
                // Invalid configures.
                this.exit(1);
                return;
            }
            if (isTestingConfigs || configs.test) {
                logger.log(notices.noticeSiteConfigsResolvedOkay);
                logger.log();
            }
            const app = new app_1.default(configs);
            app.commandMdSiteGenerator = this;
            if (isTestingConfigs || configs.test) {
                return;
            }
            if (isPrinting) {
                app.isPrinting = true;
            }
            if (noWriting) {
                app.noWriting = true;
            }
            if (isSilent) {
                app.isSilent = true;
            }
            if (isVerbose) {
                app.isVerbose = true;
            }
            if (noCache) {
                app.noCache = noCache;
            }
            app.statAndRender();
        });
    }
}
GenerateMdSite.description = _description;
GenerateMdSite.args = [{ name: ARGS_TARGET_DIR, description: 'the site/configs entrance to be resolved and parsed.' }];
// static usage = `<TARGET-DIR>`;
GenerateMdSite.examples = [
    ``,
    `$ ${command} .                     # build your markdown site and generate a static site.`,
    ``,
    // The four sub options/commands can not be used as mixed.
    `$ ${command} --init .              # initialize an existed markdown site with prompts and the default configures.`,
    `$ ${command} --init <site-name>    # create a new markdown demo site with prompts and the default configures.`,
    `$ ${command} --test .              # test configs without building site.`,
    `$ ${command} --print .             # print the resolved site structure.`,
    `$ ${command} --no-writing .        # build markdown site without writing to disk.`,
    `$ ${command} --no-cache .          # build markdown site without cache( of static assets).`,
    ``,
    `$ ${command} --version             # print the version of the markdown site generator.`,
    `$ ${command} --help                # print the help document of the markdown site generator.`,
];
GenerateMdSite.flags = {
    init: command_1.flags.boolean({
        // @see https://oclif.io/docs/flags
        char: 'i', exclusive: ['test', 'print', 'no-writing'],
        description: 'initialize a new or an existed markdown site with prompts and the default configures.',
    }),
    // Test configs without building site.
    // generate-md-site -t, --test .
    test: command_1.flags.boolean({ char: 't', description: 'test your configs and stat out the structure of your markdown site without building.' }),
    // Print the resolved site structure.
    // generate-md-site -p, --print .
    print: command_1.flags.boolean({ char: 'p', description: 'print out the resolved structure of your markdown site without building.' }),
    // Build markdown site without writing to disk.
    // generate-md-site -n, --no-writing .
    'no-writing': command_1.flags.boolean({ char: 'n', description: 'build markdown site without writing to disk.' }),
    // Use the silent mode, with no output.
    // generate-md-site -s, --silent .
    silent: command_1.flags.boolean({ char: 's', description: 'use the silent mode, with no output.' }),
    // Use the verbose mode, with rich output.
    // generate-md-site -V, --verbose .
    verbose: command_1.flags.boolean({ char: 'x', description: 'use the verbose mode, with rich output.' }),
    version: command_1.flags.version({ char: 'v', description: 'print the version information.' }),
    help: command_1.flags.help({ char: 'h', description: 'print the usage document for help.' }),
};
module.exports = GenerateMdSite;
