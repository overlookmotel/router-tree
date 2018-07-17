/* --------------------
 * router-tree module
 * Route class
 * ------------------*/

'use strict';

// Imports
const {trimEndSlash} = require('./paths'),
	{isString} = require('./utils');

// Exports
class Route {
	constructor(obj) {
		// Define standard properties
		this.path = undefined;
		this.name = undefined;
		this.internalPath = undefined;
		this.sourcePath = undefined;

		this.parent = undefined;
		this.children = undefined;

		this.files = undefined;

		this.companions = {};

		this.parentPath = undefined;
		this.pathPart = undefined;
		this.endSlash = false;
		this.param = null;

		// Set properties from passed object
		Object.assign(this, obj);
	}

	init() {}

	getPath() {
		// Get parent path
		const {parent} = this;
		const parts = [parent ? trimEndSlash(parent.path) : ''];

		// Add partPart
		let {pathPart} = this;
		if (pathPart === '' || (!parent && pathPart === undefined)) { // jshint ignore:line
			this.pathPart = null;
		} else if (pathPart !== null) {
			if (pathPart === undefined) {
				pathPart = this.pathPart = this.name;
			} else if (typeof pathPart != 'string') {
				throw new Error(`pathPart must be a string at ${this.internalPath}`);
			}
			parts.push(pathPart);
		}

		// Add param
		let {param} = this;
		if (isString(param)) {
			parts.push(`:${param}`);
		} else if (Array.isArray(param)) {
			for (let p of param) {
				if (!isString(p)) throw new Error(`param must be a string or array of strings or null at ${this.internalPath}`);
				parts.push(`:${p}`);
			}
		} else if (param !== null) {
			throw new Error(`param must be a string or array of strings or null at ${this.internalPath}`);
		}

		// Add end slash
		if (this.endSlash) parts.push('');

		// If resolves to root, return '/'
		if (parts.length == 1 && parts[0] == '') return '/';

		// Return path
		return parts.join('/');
	}
}

module.exports = Route;
