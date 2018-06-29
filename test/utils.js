/* --------------------
 * router-tree module
 * Utils for tests
 * ------------------*/

'use strict';

// Modules
const {flatten} = require('../lib/utils');

// Exports
module.exports = {
	flatten,

	/**
	 * Convert array of routes to array of `internalPath`s
	 * @param {Array[Route]} - Array of routes
	 * @returns {Array[string]} - Array of `internalPath`s
	 */
	routesToInternalPaths: function(routes) {
		return routes.map(route => route.internalPath).sort();
	},

	/**
	 * Convert array of routes to array of `sourcePath`s
	 * @param {Array[Route]} - Array of routes
	 * @returns {Array[string]} - Array of `sourcePath`s
	 */
	routesToSourcePaths: function(routes) {
		return routes.map(route => route.sourcePath).sort();
	},

	/**
	 * Create function to return route by `internalPath`
	 * @param {Array[Route]} - Array of routes
	 * @returns {Function} - Function to find route by `internalPath`
	 */
	makeGetRoute: function(routes) {
		return path => routes.find(r => r.internalPath == path);
	}
};
