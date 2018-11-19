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
exports.TIME_WAIT_SAY = 500;
exports.LOADING_DOTS = ['.', '.', '.', ' ', '.', '.', '.'];
// Print something with delay and no trailing newline.
exports.print = (something = '', milliseconds = exports.TIME_WAIT_SAY / 2) => __awaiter(this, void 0, void 0, function* () {
    return new Promise(resolve => {
        setTimeout(() => {
            something ? process.stdout.write(something) : undefined;
            resolve();
        }, milliseconds);
    });
});
// Print with delay and a trailing newline.
exports.println = (something = '', milliseconds = exports.TIME_WAIT_SAY) => __awaiter(this, void 0, void 0, function* () { return exports.print(something + '\n', milliseconds); });
// Print dots to consuming time. :)
exports.printLoadingDots = (dots = exports.LOADING_DOTS) => __awaiter(this, void 0, void 0, function* () {
    return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
        for (let i = 0; i < dots.length; i++) {
            yield exports.print(dots[i]);
        }
        resolve();
    }));
});
