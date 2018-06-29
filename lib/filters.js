/* --------------------
 * router-tree module
 * Functions to manipulate filters
 * ------------------*/

'use strict';

// Imports
const {pushArray} = require('./utils');

// Exports
module.exports = {
	createFilterFiles,
	createFilterFolders
};

/**
 * Create files filter.
 * Combines provided filter with filter for type extensions.
 *
 * @param {Function|RegExp} [filter] - Existing filter
 * @param {Object} types - Types object
 * @returns {Function} - Combined filter function
 * @throws {Error} - If existing filter is not function or RegExp
 */
function createFilterFiles(filter, types) {
	const extsFilter = createFilterTypes(types);

	if (filter == null) return extsFilter;

	if (filter instanceof RegExp) {
		filter = regexpToFunction(filter);
	} else if (typeof filter != 'function') {
		throw new Error('filterFiles option must be a function or RegExp if provided');
	}

	return filename => filter(filename) && extsFilter(filename);
}

/**
 * Create folders filter.
 *   Function => return unchanged
 *   RegExp => convert to function
 *   null/undefined => function that always returns true
 *   other => throw error
 *
 * @param {Function|RegExp} [filter] - Existing filter
 * @returns {Function} - Filter function
 * @throws {Error} - If existing filter is not function or RegExp
 */
function createFilterFolders(filter) {
	if (typeof filter == 'function') return filter;
	if (filter instanceof RegExp) return regexpToFunction(filter);
	if (filter == null) return () => true;

	throw new Error('filterFolders option must be a function or RegExp if provided');
}

/**
 * Create filter function that matches extensions of all types.
 * e.g. { route: ['js'], view: ['html', 'ejs'] } => /\.(js|html|ejs)$/
 * @param {Object} types - Types object
 * @returns {Function}
 */
function createFilterTypes(types) {
	const extAll = [];
	for (let type in types) {
		pushArray(extAll, types[type]);
	}

	const regexp = new RegExp(`\\.(${extAll.join('|')})$`);
	return regexpToFunction(regexp);
}

/**
 * Create function from RegExp.
 * @param {RegExp} regexp
 * @returns {Function}
 */
function regexpToFunction(regexp) {
	return input => regexp.test(input);
}
