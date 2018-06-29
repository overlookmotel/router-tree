/* --------------------
 * router-tree module
 * Group paths by type
 * ------------------*/

'use strict';

// Exports

/**
 * Group array of paths by type.
 * Types are defined by array of extensions.
 * e.g.:
 *   paths: ['/a.js', '/a.jsx', '/b.js', '/b.test.js']
 *   types: { controller: ['js'], react: ['jsx'], test: ['test.js'] }
 *   => [
 *        { path: '/a', files: { controller: 'js', react: 'jsx' } },
 *        { path: '/b', files: { controller: 'js', test: 'test.js' } }
 *      ]
 *
 * @param {Array[string]} paths - Array of paths
 * @param {Object} types - Object defining types
 * @returns {Array} - Array of groups
 * @throws {Error} - If more than 1 file found for a path of a certain type
 */
module.exports = function(paths, types) {
	// Order exts by length i.e. 'test.js' before 'js'
	const matchers = [];
	for (let type in types) {
		for (let ext of types[type]) {
			matchers.push({ext: `.${ext}`, type, len: ext.length + 1});
		}
	}
	matchers.sort((a, b) => a.len < b.len ? 1 : a.len > b.len ? -1 : 0);

	// Group paths by type
	const groups = [],
		refs = {};

	for (let path of paths) {
		/* jshint loopfunc: true */
		const match = matchers.find(({ext, len}) => path.slice(-len) == ext);
		if (!match) continue;

		const {type, len} = match,
			pathShort = path.slice(0, -len);

		if (type == 'ignore') continue;

		let group = refs[pathShort];
		if (!group) {
			group = {path: pathShort, files: {}};
			groups.push(group);
			refs[pathShort] = group;
		} else if (group.files[type]) {
			// Throw if more than one file found for any type for each path
			throw new Error(`Multiple ${type} files for path '${pathShort}': .${group.files[type]} and .${path}`);
		}

		group.files[type] = path;
	}

	return groups;
};
