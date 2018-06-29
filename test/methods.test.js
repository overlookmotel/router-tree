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
	Route = require('../lib/route');

// Init
chai.config.includeStack = true;

/* global describe, it */
/* jshint expr: true */

// Tests
const path = pathJoin(__dirname, 'fixtures/single');

describe('Methods', () => {
	describe('main method', () => {
		it('returns Promise', () => {
			const p = routerTree(path);
			expect(p).to.be.instanceof(Promise);
			return p;
		});

		it('promise resolves to Route instance', () => {
			const p = routerTree(path);
			return p.then(route => {
				expect(route).to.be.instanceof(Route);
			});
		});
	});

	describe('sync method', () => {
		it('returns Route instance', () => {
			const route = routerTree.sync(path);
			expect(route).to.be.instanceof(Route);
		});
	});
});
