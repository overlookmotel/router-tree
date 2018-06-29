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
	{flatten, makeGetRoute} = require('./utils');

// Init
chai.config.includeStack = true;

/* global describe, it, beforeEach */
/* jshint expr: true */
/* jshint quotmark: false */

// Tests
const path = pathJoin(__dirname, 'fixtures/parentage');

function load(options) {
	return routerTree.sync(path, options);
}

describe('Parentage', function() {
	beforeEach(function() {
		const root = load();
		this.root = root;

		const routes = flatten(root);
		this.routes = routes;
		this.getRoute = makeGetRoute(routes);
	});

	describe('parentPath', function() {
		describe('default for', function() {
			describe('top-level folder', function() {
				it('index file = `null`', function() {
					const route = this.getRoute('/');
					expect(route.parentPath).to.be.null;
				});

				it("other file = 'index'", function() {
					const route = this.getRoute('/view');
					expect(route.parentPath).to.equal('./');
				});
			});

			describe('sub-folder', function() {
				it("index file = 'index'", function() {
					const route = this.getRoute('/folder');
					expect(route.parentPath).to.equal('./');
				});

				it("other file = 'index'", function() {
					const route = this.getRoute('/folder/view');
					expect(route.parentPath).to.equal('./');
				});
			});

			describe('sub-sub-folder', function() {
				it("index file = 'index'", function() {
					const route = this.getRoute('/folder/subfolder');
					expect(route.parentPath).to.equal('./');
				});

				it("other file = 'index'", function() {
					const route = this.getRoute('/folder/subfolder/view');
					expect(route.parentPath).to.equal('./');
				});
			});
		});

		describe('can be defined manually', function() {
			it("as 'index'", function() {
				const route = this.getRoute('/indexChild1');
				expect(route.parentPath).to.equal('./');
			});

			it("as './index'", function() {
				const route = this.getRoute('/indexChild2');
				expect(route.parentPath).to.equal('./');
			});

			it('as other file', function() {
				const route = this.getRoute('/viewChild1');
				expect(route.parentPath).to.equal('./view');
			});

			it('as other file from sub-folder index', function() {
				const route = this.getRoute('/viewChildFolder');
				expect(route.parentPath).to.equal('./view');
			});

			it("as '../' from sub-sub-folder index", function() {
				const route = this.getRoute('/folder/parentChildFolder');
				expect(route.parentPath).to.equal('../');
			});
		});
	});

	describe('parent', function() {
		it('for root = `null`', function() {
			const route = this.getRoute('/');
			expect(route.parent).to.be.null;
		});

		describe('correct for files in root folder pointing to index', function() {
			it('default parentPath', function() {
				const route = this.getRoute('/view');
				expect(route.parent).to.equal(this.root);
			});

			it("parentPath = 'index'", function() {
				const route = this.getRoute('/indexChild1');
				expect(route.parent).to.equal(this.root);
			});

			it("parentPath = './index'", function() {
				const route = this.getRoute('/indexChild2');
				expect(route.parent).to.equal(this.root);
			});
		});

		describe('correct for files in root folder pointing to other file', function() {
			beforeEach(function() {
				this.parent = this.getRoute('/view');
			});

			it("parentPath = '<file name>'", function() {
				const route = this.getRoute('/viewChild1');
				expect(route.parent).to.equal(this.parent);
			});

			it("parentPath = './<file name>'", function() {
				const route = this.getRoute('/viewChild2');
				expect(route.parent).to.equal(this.parent);
			});
		});

		describe('correct for files in sub-folder pointing to parent index', function() {
			it('index file with default parentPath', function() {
				const route = this.getRoute('/folder');
				expect(route.parent).to.equal(this.root);
			});

			it("other file with parentPath = '../'", function() {
				const route = this.getRoute('/folder/parentIndex');
				expect(route.parent).to.equal(this.root);
			});
		});

		describe('correct for other files in sub-folder pointing to peer index', function() {
			beforeEach(function() {
				this.parent = this.getRoute('/folder');
			});

			it('default parentPath', function() {
				const route = this.getRoute('/folder/view');
				expect(route.parent).to.equal(this.parent);
			});

			it("parentPath = 'index'", function() {
				const route = this.getRoute('/folder/view2');
				expect(route.parent).to.equal(this.parent);
			});
		});

		describe('correct for files in sub-folder pointing to parent other file', function() {
			beforeEach(function() {
				this.parent = this.getRoute('/view');
			});

			it("index with parentPath = '<file name>'", function() {
				const route = this.getRoute('/viewChildFolder');
				expect(route.parent).to.equal(this.parent);
			});

			it("other file with parentPath = '../<file name>'", function() {
				const route = this.getRoute('/folder/parentView');
				expect(route.parent).to.equal(this.parent);
			});
		});

		describe('correct for files in sub-sub-folder pointing to parent index', function() {
			beforeEach(function() {
				this.parent = this.getRoute('/folder');
			});

			it('index with default parentPath', function() {
				const route = this.getRoute('/folder/subfolder');
				expect(route.parent).to.equal(this.parent);
			});

			it("other file with parentPath = '../'", function() {
				const route = this.getRoute('/folder/subfolder/parentIndex');
				expect(route.parent).to.equal(this.parent);
			});
		});

		describe('correct for other files in sub-sub-folder pointing to peer index', function() {
			beforeEach(function() {
				this.parent = this.getRoute('/folder/subfolder');
			});

			it('default parentPath', function() {
				const route = this.getRoute('/folder/subfolder/view');
				expect(route.parent).to.equal(this.parent);
			});

			it("parentPath = 'index'", function() {
				const route = this.getRoute('/folder/subfolder/view2');
				expect(route.parent).to.equal(this.parent);
			});
		});

		describe('correct for files in sub-sub-folder pointing to parent index', function() {
			it("index file with parentPath = '../'", function() {
				const route = this.getRoute('/folder/parentChildFolder');
				expect(route.parent).to.equal(this.root);
			});

			it("other file with parentPath = '../../'", function() {
				const route = this.getRoute('/folder/parentChildFolder/parentParentIndex');
				expect(route.parent).to.equal(this.root);
			});
		});
	});

	describe('children', function() {
		it('always reflects parent', function() {
			expect(this.root.parent).to.be.null;

			for (let route of this.routes) {
				for (let childName in route.children) {
					const child = route.children[childName];
					expect(child.parent).to.equal(route);
				}
			}
		});
	});
});
