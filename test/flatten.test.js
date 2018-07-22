/* --------------------
 * router-tree module
 * Tests
 * ------------------*/

'use strict';

// Modules
const chai = require('chai'),
	{expect} = chai,
	{flatten} = require('../lib/');

// Init
chai.config.includeStack = true;

/* global describe, it */
/* jshint expr: true */

// Tests

// Make fake routes tree
const paths = [
	'/',
	'/login',
	'/artists',
	'/artists/new',
	'/artists/*',
	'/artists/:id',
	'/artists/:id/edit',
	'/artists/:id/delete',
	'/artists/albums',
	'/artists/albums/new',
	'/artists/albums/:id',
	'/artists/albums/:id/edit',
	'/artists/albums/:id/delete',
	'/artists/:id/albums',
	'/artists/:id/albums/new',
	'/artists/:id/albums/:id',
	'/artists/:id/albums/:id/edit',
	'/artists/:id/albums/:id/delete',
	'/*',
	'/:foo/:bar/:baz',
	'/*/baz/*'
];

const tree = {path: 'zzzzzzzzzz', children: {}};

for (let path of paths) {
	tree.children[path] = {path};
}

describe('flatten() method', function() {
	it('flattens routes tree to array', function() {
		const routes = flatten(tree);
		expect(routes).to.be.an('array');
	});

	it('orders routes by path', function() {
		const routes = flatten(tree);
		const paths = routes.map(route => route.path).filter(path => path != 'zzzzzzzzzz');

		expect(paths).to.deep.equal([
			'/',
			'/artists',
			'/artists/albums',
			'/artists/albums/new',
			'/artists/albums/:id',
			'/artists/albums/:id/delete',
			'/artists/albums/:id/edit',
			'/artists/new',
			'/artists/:id',
			'/artists/:id/albums',
			'/artists/:id/albums/new',
			'/artists/:id/albums/:id',
			'/artists/:id/albums/:id/delete',
			'/artists/:id/albums/:id/edit',
			'/artists/:id/delete',
			'/artists/:id/edit',
			'/artists/*',
			'/login',
			'/*/baz/*',
			'/:foo/:bar/:baz',
			'/*'
		]);
	});
});
