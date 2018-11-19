'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
class EjsEnv {
    constructor(configs, node) {
        this.path = path;
        this.configs = configs;
        this.node = node;
    }
}
exports.EjsEnv = EjsEnv;
exports.default = EjsEnv;
