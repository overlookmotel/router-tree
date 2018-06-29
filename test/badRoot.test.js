/* --------------------
 * router-tree module
 * Tests
 * ------------------*/

'use strict';

// Modules
const chai = require('chai'),
	{expect} = chai,
	pathJoin = require('path').join,
	routerTree = require('../lib/');

// Init
chai.config.includeStack = true;

/* global describe, it */
/* jshint expr: true */

// Tests
const path = pathJoin(__dirname, 'fixtures/badRoot');

function load(subPath) {
	return routerTree.sync(pathJoin(path, subPath));
}

describe('Bad root', function() {
	it('throws if no route files', function() {
		expect(() => {
			load('empty');
		}).to.throw(Error, /^No root route found$/);
	});

	it('throws if no valid root route', function() {
		expect(() => {
			load('noIndex');
		}).to.throw(Error, /^No root route found$/);
	});

	it('throws if more than one root route', function() {
		expect(() => {
			load('twoRoot');
		}).to.throw(Error, /^2 root routes found:/);
	});
});
