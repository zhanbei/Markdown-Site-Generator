'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
// @see https://en.wikipedia.org/wiki/ANSI_escape_code#Colors
exports.FG_RESET = '\x1b[0m';
exports.STYLE_BOLD = '\x1b[1m';
exports.STYLE_RESET_BOLD = '\x1b[22m'; // Neither bold nor faint
exports.FG_RED = '\x1b[31m';
exports.FG_GREEN = '\x1b[32m';
exports.FG_YELLOW = '\x1b[33m';
// Info for import information.
exports.FG_INFO = exports.FG_GREEN;
exports.FG_WARN = exports.FG_YELLOW;
exports.FG_ERROR = exports.FG_RED;
// Referred the command#error from #oclif.
exports.PREFIX_SPACES = ' ›   ';
exports.log = (...messages) => {
    console.log(...messages);
};
// @see https://stackoverflow.com/questions/9781218/how-to-change-node-jss-console-font-color
exports.warn = (msg, ...messages) => {
    console.warn();
    if (msg || messages.length > 0) {
        console.warn(`${exports.PREFIX_SPACES}${exports.FG_WARN}%s${exports.FG_RESET}`, msg, ...messages);
    }
};
exports.error = (msg, ...messages) => {
    console.error();
    if (msg || messages.length > 0) {
        console.error(`${exports.PREFIX_SPACES}${exports.FG_ERROR}%s${exports.FG_RESET}`, msg, ...messages);
    }
};
