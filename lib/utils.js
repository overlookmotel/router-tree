/* --------------------
 * router-tree module
 * Utility functions
 * ------------------*/

'use strict';

// Exports
const utils = module.exports = {
	isSubclassOf: function(obj, Class) {
	 	if (obj == null) return false;
		if (obj === Class) return true;
		while (true) {
			let next = Object.getPrototypeOf(obj);
			if (next === Class) return true;
			if (!next) return false;
			obj = next;
		}
	},

	forIn: function(obj, fn) {
		for (let name in obj) {
			fn(obj[name], name, obj);
		}
	},

	/**
	 * Walk routes tree and call `fn()` with each node.
	 * Starts at root of tree and traverses upwards.
	 * @param {Route} route - Route tree
	 * @param {Function} fn - Function to call with each node
	 * @returns {undefined}
	 */
	traverse: function traverse(route, fn) {
		fn(route);
		utils.forIn(route.children, route => traverse(route, fn));
	},

	/**
	 * Flatten routes tree to array of routes
	 * @param {Route} tree - Route tree
	 * @returns {Array} - Array of route objects
	 */
	flatten: function(tree) {
		const routes = [];
		utils.traverse(tree, route => routes.push(route));
		return routes;
	},

	isString: function(str) {
		if (typeof str != 'string') return false;
		if (str == '') return false;
		return true;
	},

	pushArray: function(arr, arr2) {
		arr.push.apply(arr, arr2);
		return arr;
	},

	/**
	 * Like `Array.prototype.find()` except stops searching at endIndex.
	 * @param {Array} arr - Array
	 * @param {Function} fn - Search function
	 * @param {number} endIndex - Index to stop searching at
	 * @returns {}
	 */
	findBefore: function(arr, fn, endIndex) {
		// Call `fn()` on each array item and return item if `fn()` returns truthy
		for (let i = 0; i < endIndex; i++) {
			const item = arr[i];
			if (fn(item, i, arr)) return item;
		}

		// No match found - return `undefined`
		return undefined;
	}
};
