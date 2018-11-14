'use strict';

import App from './app';
import FsNode from './fs-node';

export class EjsEnv {
	public node: FsNode;
	public nodes: FsNode[];
	public configs: App;

	// The rendered content.
	public html: string;

	constructor(configs, node) {
		this.configs = configs;
		this.node = node;
	}
}

export default EjsEnv;
