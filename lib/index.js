/* --------------------
 * router-tree module
 * ------------------*/

'use strict';

// Imports
const listFilesAsync = require('./listFilesAsync'),
	listFilesSync = require('./listFilesSync'),
	pathsToTree = require('./pathsToTree'),
	Route = require('./route'),
	{createFilterFiles, createFilterFolders} = require('./filters'),
	{trimEndSlash} = require('./paths'),
	traverseAsync = require('./traverseAsync'),
	{flatten, traverse, isString, isSubclassOf} = require('./utils');

// Exports
/*
 * API:
 * routerTree(path, options) - Load routes async
 * routerTree.sync(path, options) - Load routes sync
 * routerTree.Route - Route class
 * routerTree.traverse - Traverse a route tree
 * routerTree.traverseAsync - Asynchronously traverse a route tree
 * routerTree.flatten - Flatten route tree to array
 */
exports = module.exports = loadAsync;
exports.sync = loadSync;
exports.Route = Route;
exports.traverse = traverse;
exports.traverseAsync = traverseAsync;
exports.flatten = flatten;

/**
 * Load routes from folder structure and return route tree.
 * Asynchronous - returns Promise
 *
 * @param {string} path - Folder path to scan
 * @param {Object} [options] - Options object
 * @param {Object} [options.types] - Types object (of form `{ route: ['js'], react: ['jsx'] }`)
 * @param {Class} [options.defaultRouteClass] - Class to create empty routes from
 * @param {Function|RegExp} [options.filterFiles] - Function/Regexp to filter files with
 * @param {Function|RegExp} [options.filterFolders] - Function/Regexp to filter folders with
 * @param {number} [options.maxConcurrent] - Max concurrent async file operations (default 5)
 * @param {*} [options.context] - Object to pass to routes' `.init()` method
 * @returns {Promise} - Promise of Route tree
 */
function loadAsync(path, options) {
	// Conform & validate arguments
	path = conformPath(path);
	options = conformOptions(options);

	// Scan paths
	return listFilesAsync(path, options).then(paths => {
		// Convert to tree
		return pathsToTree(path, paths, options);
	});
}

/**
 * Load routes from folder structure and return route tree.
 * Synchronous
 *
 * @param {string} path - Folder path to scan
 * @param {Object} [options] - Options object
 * @param {Object} [options.types] - Types object (of form `{ route: ['js'], react: ['jsx'] }`)
 * @param {Class} [options.defaultRouteClass] - Class to create empty routes from
 * @param {Function|RegExp} [options.filterFiles] - Function/Regexp to filter files with
 * @param {Function|RegExp} [options.filterFolders] - Function/Regexp to filter folders with
 * @param {*} [options.context] - Object to pass to routes' `.init()` method
 * @returns {Object} - Route tree
 * @throws {Error} - If problem loading route tree
 */
function loadSync(path, options) {
	// Conform & validate arguments
	path = conformPath(path);
	options = conformOptions(options);

	// Scan paths
	const paths = listFilesSync(path, options);

	// Convert to tree
	return pathsToTree(path, paths, options);
}

/*
 * Functions to conform arguments to `loadSync()` and `loadAsync()`
 */

/**
 * Remove trailing slash from path
 * @param {string} path - Path
 * @returns {string} - Path without trailing slash
 */
function conformPath(path) {
	if (typeof path != 'string') throw new Error('path must be a string');
	return trimEndSlash(path);
}

/**
 * Conform options object inc options.types
 * @param {Object} [options] - Options object
 * @returns {Object} - Options object conformed
 */
function conformOptions(options) {
	options = Object.assign({}, options);

	// Conform types
	options.types = conformTypes(options.types);

	// Conform `filterFiles` and `filterFolders` options to functions
	options.filterFiles = createFilterFiles(options.filterFiles, options.types);
	options.filterFolders = createFilterFolders(options.filterFolders);

	// Validate + conform `defaultRouteClass` option
	let {defaultRouteClass} = options;
	if (defaultRouteClass) {
		if (!isSubclassOf(defaultRouteClass, Route)) throw new Error('defaultRouteClass option must be a subclass of routerTree.Route');
	} else {
		options.defaultRouteClass = Route;
	}

	return options;
}

/**
 * Conform types object.
 * Type object should be of form: { route: ['js'], react: ['jsx'] }
 * Strings can be substituted for arrays e.g. { route: 'js' } => { route: ['js'] }
 * If null/undefined, create default { route: ['js'] }
 *
 * @param {Object} [types] - Types object (optional)
 * @returns {Object} - types object
 * @throws {Error} - If object is malformed
 */
function conformTypes(types) {
	let clonedTypes = false;
	if (types == null) {
		types = {};
		clonedTypes = true;
	} else if (typeof types != 'object') {
		throw new Error('types option must be an object');
	}

	for (let type in types) {
		const exts = types[type];
		if (Array.isArray(exts)) {
			for (let ext of exts) {
				if (!isString(ext)) throw new Error(`type '${type}' array contains non-string or empty string`);
			}
		} else if (isString(exts)) {
			if (!clonedTypes) {
				types = Object.assign({}, types);
				clonedTypes = true;
			}

			types[type] = [exts];
		} else {
			throw new Error(`type '${type}' is not a string or array of strings`);
		}
	}
	if (!types.route) types.route = ['js'];

	return types;
}
