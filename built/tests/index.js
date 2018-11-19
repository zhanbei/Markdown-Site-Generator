'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const cmdConstants = require("../cmd/constants");
const cmdUtils = require("../cmd/utils");
assert.ok(cmdUtils.isFileExist(cmdConstants.DEMO_MARKDOWN_SITE_DIR_LOCATION), 'The expected demo site does not exist.');
assert.ok(cmdUtils.isFileExist(cmdConstants.SITE_CONFIGS_THEME_GITHUB_DIR_LOCATION), 'The expected entrance for site configs does not exist.');
