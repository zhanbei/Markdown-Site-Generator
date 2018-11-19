#!/usr/bin/env node

require('../built/cmd/generate-md-site').run()
	.catch(require('@oclif/errors/handle'));
