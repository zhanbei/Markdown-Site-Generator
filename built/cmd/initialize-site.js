'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const constants = require("./constants");
const utils = require("./utils");
// The delayed console; currently named like *fmt* in golang. :(
const fmt = require("./prompt-console");
const prompt_user_1 = require("./prompt-user");
const strings_1 = require("./strings");
const time = fmt.TIME_WAIT_SAY;
// targetSiteDir, targetSiteDirLocation, Boolean(stat), targetConfigsDir, targetConfigsDirLocation
const promptAndInitializeSite = (cmd, targetSiteDir, targetSiteDirLocation, isTargetSiteDirExisted, targetConfigsDir, targetConfigsDirLocation) => __awaiter(this, void 0, void 0, function* () {
    return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
        const notices = strings_1.getSiteInitializationNotices(targetSiteDir, targetSiteDirLocation, targetConfigsDir);
        // Notice purpose and goals of this scripts.
        if (isTargetSiteDirExisted) {
            yield fmt.println(notices.noticeTaskInitializingExistedMdSite);
        }
        else {
            yield fmt.println(notices.noticeTaskCreatingNewMdDemoSite);
        }
        yield fmt.println();
        // Notice for coming prompts.
        yield fmt.println(notices.noticeSiteInitializingWithPrompt, time * 2);
        yield fmt.println('', time * 3);
        prompt_user_1.default(targetSiteDir, targetSiteDirLocation).then((options) => __awaiter(this, void 0, void 0, function* () {
            // Received user-given options.
            yield fmt.println('', time * 2);
            if (!prompt_user_1.isGivenSiteOptionsValid(options)) {
                // await utils.println('');
                yield fmt.println(notices.noticeAbortingCauseInvalidOptions);
                resolve();
                return;
            }
            // Notice for accepted user-given options.
            yield fmt.println(notices.noticeAwesomeCauseValidOptions);
            yield fmt.println();
            // Confirm to proceeding.
            if (isTargetSiteDirExisted) {
                yield fmt.println(notices.noticeWillGenerateSiteConfigsToExistedSite, time * 2);
            }
            else {
                yield fmt.println(notices.noticeWillCreateNewMdDemoSite, time * 2);
            }
            yield fmt.println();
            // Loading.
            yield fmt.printLoadingDots();
            yield fmt.println();
            yield fmt.println();
            if (!isTargetSiteDirExisted) {
                // Copy blogs files of the sample site.
                // await fmt.println(`Will create a demo markdown site to "${targetSiteDir}" for you.`, time * 2);
                yield utils.copyDemoMarkdownSite(targetSiteDirLocation);
                yield fmt.println(notices.noticeCopiedMdDemoSite, time * 2);
                yield fmt.println();
            }
            // Creating the not existed folder for configures.
            const err = utils.makeNotExistedDir(targetConfigsDirLocation);
            if (err) {
                cmd.error(err);
                cmd.exit(1);
                resolve();
                return;
            }
            yield fmt.println(notices.noticeCreatedSiteConfigsDir);
            yield fmt.println();
            // Generate configures.
            const givenTargetConfigsIndexJsLocation = path.join(targetConfigsDirLocation, constants.INDEX_DOT_JS);
            fs.writeFileSync(givenTargetConfigsIndexJsLocation, utils.renderSiteConfigsIndexJs(options));
            yield fmt.println(notices.noticeGeneratedSiteConfigsEntrance);
            yield fmt.println();
            // Copy github theme(modes and templates).
            // Throwing error ???
            yield utils.copySiteConfigsThemeGithub(targetConfigsDirLocation);
            // Notice to use VCS.
            yield fmt.println(notices.noticeAddSiteConfigsToVcs);
            yield fmt.println();
            // Done all initializations.
            yield fmt.println(notices.noticeDoneSiteInitializing);
            yield fmt.println();
        })).catch(ex => {
            cmd.error(ex);
            cmd.exit(1);
        });
        resolve();
    }));
});
exports.default = promptAndInitializeSite;
