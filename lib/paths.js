/* --------------------
 * router-tree module
 * Resolve path relative to another
 * ------------------*/

'use strict';

// Exports
module.exports = {
	conformPath,
	resolvePath,
	resolveParentPath,
	trimEndSlash
};

/**
 * Conform path
 *   - '..' sections resolved
 *   - '.' sections removed
 *   - trailing slashes removed
 *   - trailing 'index' removed
 *   - './' added to start of relative paths
 *
 * @param {string} path - Input path
 * @returns {string} - Conformed path
 */
function conformPath(path) {
	if (path == null || path == '') return './';
	if (typeof path != 'string') return false;

	const parts = path.split('/');

	// Identify if path is absolute
	let absolute = parts[0] == '';
	if (absolute) parts.shift();

	// Remove '.'s + resolve '..'s
	for (let i = 0; i < parts.length; i++) {
		const part = parts[i];

		if (part == '.' || part == '') { // jshint ignore:line
			parts.splice(i, 1);
			i--;
		} else if (part == '..' && i > 0 && parts[i - 1] != '..') {
			parts.splice(i - 1, 2);
			i -= 2;
		}
	}

	// Remove index from end
	if (parts[parts.length - 1] == 'index') parts.length--;

	// Finalise path
	if (absolute) {
		// Check for path starting '/..'
		if (parts[0] == '..') return false;
		if (parts.length == 0) return '/';
		parts.unshift('');
	} else {
		if (parts.length == 0) return './';
		if (parts[0] != '..') {
			// Add './' to start of relative paths
			parts.unshift('.');
		} else if (parts[parts.length - 1] == '..') {
			// Add trailing slash to '..', '../..' etc
			parts.push('');
		}
	}

	return parts.join('/');
}

/**
 * Resolve path relative to another.
 * If `relativePath` is absolute already, return it unchanged.
 * If cannot resolve, return `false`.
 * NB `relativePath` must already be conformed
 *
 * @param {string} path - Absolute path e.g. '/abc/def'
 * @param {string} relativePath - Relative path e.g. './', '../', './abc', '../abc'
 * @returns {string|boolean} - Resulting path (or `false` if cannot resolve)
 */
function resolvePath(path, relativePath) {
	// If relative path is absolute, return it unchanged
	if (relativePath.slice(0, 1) == '/') return relativePath;

	if (path == '/') path = '';

	if (relativePath.slice(0, 2) == './') {
		// Remove './' from start of relativePath
		relativePath = relativePath.slice(2);
	} else {
		// Traverse '../'s
		while (relativePath.slice(0, 3) == '../') {
			if (path == '') return false;
			path = path.slice(0, path.lastIndexOf('/'));
			relativePath = relativePath.slice(3);
		}
	}

	// Add relativePath to end of path
	if (relativePath == '') return path || '/';
	return `${path}/${relativePath}`;
}

/**
 * Resolve path relative to another - parent style
 * If `parentPath` is absolute already, return it unchanged
 * If `parentPath` is null/undefined, return null
 * If cannot resolve, return `false`
 * NB `parentPath` must already be conformed
 *
 * @param {string} path - Absolute path e.g. '/abc/def'
 * @param {string|null} parentPath - Relative path e.g. './', '../', './abc', '../abc'
 * @returns {string|null|boolean} - Resulting path (or `false` if cannot resolve)
 */
function resolveParentPath(path, parentPath) {
	// If parent path is null or undefined, return null
	if (parentPath == null) return null;

	// Go one level down for relative paths
	const firstPart = parentPath.slice(0, parentPath.indexOf('/'));
	if (firstPart == '.') {
		parentPath = `.${parentPath}`;
	} else if (firstPart == '..') {
		parentPath = `../${parentPath}`;
	}

	return resolvePath(path, parentPath);
}

/**
 * Trim '/' off end of path
 * @param {string} path - Path
 * @returns {string} - Trimmed path
 */
function trimEndSlash(path) {
	if (path.slice(-1) == '/') return path.slice(0, -1);
	return path;
}
