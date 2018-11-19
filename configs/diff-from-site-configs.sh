#!/usr/bin/env bash
#
# diff to show differences between the built-in site configures and the site configures from external library.
# which should be strictly equal.
#

diff -r configs/index.js .site_configs/index.js
diff -r configs/github .site_configs/github
