/* --------------------
 * router-tree module
 * Flatten utility
 * ------------------*/

'use strict';

// Modules
const sort = require('sort-route-paths');

// Imports
const {flatten} = require('./utils');

// Exports

/**
 * Flatten routes tree to array of routes.
 * Sort by `path` with static routes given priority over dynamic
 * i.e. `/artists/new` before `/artists/:id`
 *
 * @param {Route} tree - Route tree
 * @returns {Array} - Array of route objects
 */
module.exports = function(tree) {
	// Make array of routes
	const routes = flatten(tree);

	// Sort by path
	return sort(routes, 'path');
};
