/* --------------------
 * router-tree module
 * Load files in folder
 * ------------------*/

'use strict';

// Imports
const Route = require('./route'),
	{conformPath, resolvePath} = require('./paths'),
	{findBefore} = require('./utils');

// Exports

/**
 * Load route files and return array of routes.
 *
 * @param {string} loadPath - Folder path (without trailing '/')
 * @param {Array} groups - Array of group objects (each of form `{ path: '/a', files: { route: 'js', react: 'jsx' } }`)
 * @param {Object} options - Options object
 * @param {Class} options.defaultRouteClass - Class to create empty routes from
 * @returns {Array} - Array of grouped paths
 * @throws {Error} - If more than 1 file found for a path of a certain type
 */
module.exports = function(loadPath, groups, options) {
	// Get internal paths, convert files to full paths,
	// and consolidate duplicate groups with same internal path
	for (let index = 0; index < groups.length; index++) {
		const group = groups[index],
			{path, files} = group;

		// Get internal path
		const internalPath = getInternalPath(path);
		group.internalPath = internalPath;

		// Find duplicate group with same internal path
		/* jshint loopfunc: true */
		const groupDup = findBefore(groups, g => g.internalPath == internalPath, index);
		if (!groupDup) continue;

		// Consolidate files objects
		const filesDup = groupDup.files;
		for (let type in files) {
			if (filesDup[type]) throw new Error(`Multiple ${type} files for path '${internalPath}': ${filesDup[type]} and ${files[type]}`);
			filesDup[type] = files[type];
		}

		// Remove redundant group
		groups.splice(index, 1);
		index--;
	}

	// Load route files + process companions
	const RouteClass = options.defaultRouteClass;

	for (let group of groups) {
		// Load route file
		const sourcePath = group.files.route;
		if (!sourcePath) continue;

		let route = require(`${loadPath}${sourcePath}`);
		route = makeRoute(route, RouteClass);
		route.sourcePath = sourcePath;
		group.route = route;

		// Process companions
		addCompanions(route, group.internalPath, groups, RouteClass);
	}

	// Add default routes and return array of routes
	return groups.map(group => {
		// If no route, make default route
		let {route, internalPath} = group;
		if (!route) {
			route = new RouteClass();
			route.sourcePath = null;
		}

		// Set route internalPath + name + files
		route.internalPath = internalPath;
		route.name = getNameFromPath(internalPath);
		route.files = group.files;

		// Return route
		return route;
	});
};

/**
 * Process companions
 * @param {Route} route - Route object
 * @param {string} path - internalPath of route
 * @param {Array} groups - groups array
 * @param {Class} RouteClass - Class to use for creating new routes
 * @returns {undefined}
 */
function addCompanions(route, path, groups, RouteClass) {
	const {companions} = route;
	if (!companions) return;

	for (let companionPath in companions) {
		// Conform path
		const relativePath = conformPath(companionPath);
		if (relativePath === false || relativePath == './') throw new Error(`Illegal companion '${companionPath}' at ${path}`);

		// Resolve companion route internalPath
		const internalPath = resolvePath(path, relativePath);
		if (internalPath === false) throw new Error(`Illegal companion '${companionPath}' at ${path}`);

		// Add to existing group or make new group
		/* jshint loopfunc: true */
		const existingGroup = groups.find(g => g.internalPath == internalPath);

		// If existing route file, it takes precedence over route defined as companion
		if (existingGroup && existingGroup.files.route) continue;

		let route = companions[companionPath];
		route = makeRoute(route, RouteClass);
		route.sourcePath = null;

		if (!existingGroup) {
			groups.push({path: null, internalPath, route, files: {}});
		} else {
			existingGroup.route = route;
		}

		// Process companion route's companions
		addCompanions(route, internalPath, groups, RouteClass);
	}
}

/**
 * Make route from object.
 * If is a Route object already, return unchanged.
 * Otherwise, make Route object.
 *
 * @param {*} route - Loaded route object
 * @param {Class} RouteClass - Default route class
 * @returns {Route}
 */
function makeRoute(route, RouteClass) {
	if (route instanceof Route) return route;
	return new RouteClass(route);
}

/**
 * Remove '/index' from end of path
 * @param {string} path - Full path (path to file without file ext)
 * @returns {string} - Internal path
 */
function getInternalPath(path) {
	if (path == '/index') return '/';
	if (path.slice(-6) == '/index') return path.slice(0, -6);
	return path;
}

/**
 * Extract name from path
 * @param {string} path - Route's internal path
 * @returns {string} - Route name
 */
function getNameFromPath(path) {
	if (path == '/') return 'root';
	return path.slice(path.lastIndexOf('/') + 1);
}
