#!/usr/bin/env node

require('../built/generate-md-site').run()
	.catch(require('@oclif/errors/handle'));
