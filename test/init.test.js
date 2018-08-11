/* --------------------
 * router-tree module
 * Tests
 * ------------------*/

'use strict';

// Modules
const chai = require('chai'),
	{expect} = chai,
	pathJoin = require('path').join,
	routerTree = require('../lib/'),
	{Route} = routerTree;

// Init
chai.config.includeStack = true;

/* global describe, it */
/* jshint expr: true */

// Tests
const path = pathJoin(__dirname, 'fixtures/init');

function load(options) {
	return routerTree.sync(path, options);
}

function loadWithSpy(options) {
	const calls = [];
	class SpyRoute extends Route {
		init(context) {
			super.init(context);
			calls.push({path: this.internalPath, context});
		}
	}

	options = Object.assign({defaultRouteClass: SpyRoute}, options);
	const tree = load(options);

	return {tree, calls};
}

describe('init() method', function() {
	it('called on all routes', function() {
		const {calls} = loadWithSpy();

		const callPaths = calls.map(call => call.path).sort();
		expect(callPaths).to.deep.equal([
			'/',
			'/edit',
			'/folder',
			'/folder/edit',
			'/folder/subfolder',
			'/folder/subfolder/edit'
		]);
	});

	it('called in parentage order', function() {
		const {calls} = loadWithSpy();

		const order = {};
		for (let i = 0; i < calls.length; i++) {
			order[calls[i].path] = i;
		}

		expect(order['/']).to.equal(0);
		expect(order['/edit']).to.be.above(order['/']);
		expect(order['/folder']).to.be.above(order['/']);
		expect(order['/folder/edit']).to.be.above(order['/folder']);
		expect(order['/folder/subfolder']).to.be.above(order['/folder']);
		expect(order['/folder/subfolder/edit']).to.be.above(order['/folder/subfolder']);
	});

	it('called with context option', function() {
		const context = {a: 1};
		const {calls} = loadWithSpy({context});

		for (let call of calls) {
			expect(call.context).to.equal(context);
		}
	});
});
