'use strict';

import * as path from 'path';

// Normalize a given path to remove any redundant components using path.join().
export const normalizePath = (givenPath = '') => givenPath.trim() ? path.join('', givenPath.trim(), '') : '';
