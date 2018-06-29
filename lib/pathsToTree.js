/* --------------------
 * router-tree module
 * Convert array of paths to route tree
 * ------------------*/

'use strict';

// Imports
const groupPathsByType = require('./groupPathsByType'),
	loadRoutes = require('./loadRoutes'),
	createTree = require('./createTree');

// Exports
/**
 * Convert array of paths to route tree
 *
 * @param {string} path - Path of routes folder
 * @param {Array} paths - Array of paths
 * @param {Object} options - Options object
 * @returns {Object} - Route tree
 * @throws {Error} - If more than 1 file found for a path of a certain type
 */
module.exports = function(path, paths, options) {
	// Sort paths
	// NB Ensures deterministic results as async scanning of files may produce
	// different order each time
	paths.sort();

	// Group paths by type
	const groups = groupPathsByType(paths, options.types);

	// Load route files
	const routes = loadRoutes(path, groups, options);

	// Create route tree
	return createTree(routes, options.context);
};
