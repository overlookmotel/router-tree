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
	{flatten} = require('./utils');

// Init
chai.config.includeStack = true;

/* global describe, it, beforeEach */
/* jshint expr: true */
/* jshint quotmark: false */

// Tests
const path = pathJoin(__dirname, 'fixtures/path');

function load(options) {
	return routerTree.sync(path, options);
}

describe('Name', function() {
	beforeEach(function() {
		this.root = load();
		this.routes = flatten(this.root);
	});

	it("is 'root' for root", function() {
		expect(this.root.name).to.equal('root');
	});

	it('is <folder name> for index files', function() {
		for (let route of this.routes) {
			const {sourcePath} = route;
			if (sourcePath == '/index.js') continue;
			const filename = sourcePath.slice(sourcePath.lastIndexOf('/') + 1);
			if (filename != 'index.js') continue;

			const path = sourcePath.slice(0, -filename.length - 1);
			const name = path.slice(path.lastIndexOf('/') + 1);
			expect(route.name).to.equal(name);
		}
	});

	it('is <file name> for all other files', function() {
		for (let route of this.routes) {
			const {sourcePath} = route;
			const filename = sourcePath.slice(sourcePath.lastIndexOf('/') + 1);
			if (filename == 'index.js') continue;

			const name = filename.slice(0, -3);
			expect(route.name).to.equal(name);
		}
	});
});
