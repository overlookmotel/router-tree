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

/* global describe, it, beforeEach */
/* jshint expr: true */
/* jshint quotmark: false */

// Tests
const path = pathJoin(__dirname, 'fixtures/internalPath');

function load(options) {
	return routerTree.sync(path, options);
}

describe('Internal paths', function() {
	beforeEach(function() {
		this.route = load({types: {react: ['jsx']}});
	});

	describe('Top level folder', function() {
		it("index file has internalPath '/'", function() {
			const {route} = this;
			expect(route.internalPath).to.equal('/');
			expect(route.sourcePath).to.equal('/index.js');
		});

		describe("other files have internalPath '/<file name>'", function() {
			it('route file', function() {
				const route = this.route.children.view;
				expect(route.internalPath).to.equal('/view');
				expect(route.sourcePath).to.equal('/view.js');
			});

			it('additional file', function() {
				const route = this.route.children.edit;
				expect(route.internalPath).to.equal('/edit');
				expect(route.sourcePath).to.be.null;
				expect(route.files).to.deep.equal({react: '/edit.jsx'});
			});
		});
	});

	describe('Sub-folder', function() {
		describe("index file has internalPath '/<folder name>'", function() {
			it('route file', function() {
				const route = this.route.children.folder;
				expect(route.internalPath).to.equal('/folder');
				expect(route.sourcePath).to.equal('/folder/index.js');
			});

			it('additional file', function() {
				const route = this.route.children.folder2;
				expect(route.internalPath).to.equal('/folder2');
				expect(route.sourcePath).to.be.null;
				expect(route.files).to.deep.equal({react: '/folder2/index.jsx'});
			});
		});

		describe("other files have internalPath '/<folder name>/<file name>'", function() {
			it('route file', function() {
				const route = this.route.children.folder.children.view;
				expect(route.internalPath).to.equal('/folder/view');
				expect(route.sourcePath).to.equal('/folder/view.js');
			});

			it('additional file', function() {
				const route = this.route.children.folder.children.edit;
				expect(route.internalPath).to.equal('/folder/edit');
				expect(route.sourcePath).to.be.null;
				expect(route.files).to.deep.equal({react: '/folder/edit.jsx'});
			});
		});
	});

	describe('Sub-sub-folder', function() {
		describe("index file has internalPath '/<folder name>/<sub-folder name>'", function() {
			it('route file', function() {
				const route = this.route.children.folder.children.subfolder;
				expect(route.internalPath).to.equal('/folder/subfolder');
				expect(route.sourcePath).to.equal('/folder/subfolder/index.js');
			});

			it('additional file', function() {
				const route = this.route.children.folder.children.subfolder2;
				expect(route.internalPath).to.equal('/folder/subfolder2');
				expect(route.sourcePath).to.be.null;
				expect(route.files).to.deep.equal({react: '/folder/subfolder2/index.jsx'});
			});
		});

		describe("other files have internalPath '/<folder name>/<sub-folder name>/<file name>'", function() {
			it('route file', function() {
				const route = this.route.children.folder.children.subfolder.children.view;
				expect(route.internalPath).to.equal('/folder/subfolder/view');
				expect(route.sourcePath).to.equal('/folder/subfolder/view.js');
			});

			it('additional file', function() {
				const route = this.route.children.folder.children.subfolder.children.edit;
				expect(route.internalPath).to.equal('/folder/subfolder/edit');
				expect(route.sourcePath).to.be.null;
				expect(route.files).to.deep.equal({react: '/folder/subfolder/edit.jsx'});
			});
		});
	});
});
