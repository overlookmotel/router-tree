/* --------------------
 * router-tree module
 * Convert array of routes to tree
 * ------------------*/

'use strict';

// Imports
const {conformPath, resolveParentPath} = require('./paths'),
	{traverse, isString} = require('./utils');

// Exports
/**
 * Convert array of routes to tree
 *
 * @param {Array} routes - Array of route objects
 * @param {*} [context] - Object to pass to routes' `.init()` methods
 * @returns {Route} - Route tree
 * @throws {Error} - If more than 1 file found for a path of a certain type,
 *   or no root, or more than 1 root
 */
module.exports = function(routes, context) {
	// Init empty children object for each route
	for (let route of routes) {
		route.children = {};
	}

	// Get parent for each route
	const orphans = [];
	for (let route of routes) {
		route.parentPath = getParentPath(route);
		const parentPath = resolveParentPath(route.internalPath, route.parentPath);
		if (parentPath === false) throw new Error(`Illegal parentPath at ${route.internalPath}`);

		if (!parentPath) {
			route.parent = null;
			orphans.push(route);
			continue;
		}

		// Find parent
		/* jshint loopfunc: true */
		const parent = routes.find(parent => parent.internalPath == parentPath);
		if (!parent) throw new Error(`Cannot find parent ${parentPath} at ${route.internalPath}`);

		route.parent = parent;
		parent.children[route.name] = route;
	}

	// Check only one route with no parent
	if (orphans.length == 0) throw new Error('No root route found');
	if (orphans.length > 1) throw new Error(`${orphans.length} root routes found: ${orphans.map(r => r.internalPath).join(', ')}`);
	const tree = orphans[0];

	// Run `.init()` method on each route
	traverse(tree, route => route.init(context));

	// Get paths for each route - run `.getPath()` method on each route where not manually defined
	traverse(tree, route => {
		if (route.path == null) route.path = route.getPath();
		if (!isString(route.path)) throw new Error(`path must be a string if defined at ${route.internalPath}`);
	});

	// Return route tree
	return tree;
};

function getParentPath(route) {
	let {parentPath} = route;

	// If set as `null` exit
	if (parentPath === null) return null;

	// If not set, set as default
	if (parentPath === undefined) {
		if (route.internalPath == '/') return null;
		return './';
	}

	// Check is string
	if (!isString(parentPath)) throw new Error(`parentPath must be a non-empty string if provided at ${route.internalPath}`);

	// Conform path
	parentPath = conformPath(parentPath);
	if (parentPath === false) throw new Error(`Illegal parentPath at ${route.internalPath}`);
	return parentPath;
}
