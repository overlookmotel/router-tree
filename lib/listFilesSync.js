/* --------------------
 * router-tree module
 * List files in folder recursively
 * ------------------*/

'use strict';

// Modules
const fs = require('fs');

// Exports
/**
 * Syncronously recursively scan a tree of files and return array of paths.
 *
 * @param {string} path - Folder path to scan (without trailing '/')
 * @param {Object} options - Options object
 * @param {Function|RegExp} options.filterFiles - Function/Regexp to filter files with
 * @param {Function|RegExp} options.filterFolders - Function/Regexp to filter folders with
 * @returns {Array[string]} - Array of paths found (paths relative to initial path)
 * @throws {Error} - If invalid options
 */
module.exports = function(path, options) {
	// Scan file structure
	const paths = [];
	scanFolder('', path, paths, options);
	return paths;
};

function scanFolder(path, fullPath, paths, options) {
	const files = fs.readdirSync(fullPath);

	for (let filename of files) {
		const thisPath = `${path}/${filename}`,
			thisFullPath = `${fullPath}/${filename}`;

		const stat = fs.statSync(thisFullPath);
		if (stat.isDirectory()) {
			if (!options.filterFolders(filename)) continue;
			scanFolder(thisPath, thisFullPath, paths, options);
		} else {
			if (!options.filterFiles(filename)) continue;
			paths.push(thisPath);
		}
	}
}
