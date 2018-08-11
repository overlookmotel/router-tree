/* --------------------
 * router-tree module
 * TraverseAsync utility
 * ------------------*/

'use strict';

// Modules
const {Queue, promiseMethod} = require('promise-methods');

// Exports
class Traverser {
	constructor(root, fn, options) {
		// Save root
		this.root = root;

		// Promisify function
		this.fn = promiseMethod(fn);

		// Init queue
		this.queue = new Queue(options);
	}

	run() {
		this.runRoute(this.root);
		return this.queue.promise;
	}

	runRoute(route) {
		const {fn} = this;
		this.queue.add(() =>
			fn(route).then(() => this.resolvedOne(route))
		);
	}

	resolvedOne(route) {
		// Add children to queue
		const {children} = route;
		for (let name in children) {
			this.runRoute(children[name]);
		}
	}
}

/**
 * Traverse route tree asyncronously with promises.
 * `fn` will be called with each route in the tree.
 * If `fn` returns a Promise, it will be awaited before processing children.
 * `options.concurrency` limits number of routes processed concurrently
 *   - 0 = no concurrency limit (default).
 * Regardless of `options.concurrency`, `fn` is not called on children until
 * `fn` has completed running on parent.
 *
 * @param {Route} tree - Route tree
 * @param {Function} fn - Function to run on each route, called with args (route)
 * @param {Object} [options] - Options object
 * @param {number} [options.concurrency=0] - Maximum concurrency (0 for unlimited)
 * @returns {Promise<undefined>} - Resolves when `fn` has been run on all routes
 */
module.exports = (tree, fn, options) => {
	const traverser = new Traverser(tree, fn, options);
	return traverser.run();
};
