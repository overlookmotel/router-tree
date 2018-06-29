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
const path = pathJoin(__dirname, 'fixtures/companions');

function load(options) {
	return routerTree.sync(path, options);
}

describe('Companions', function() {
	beforeEach(function() {
		const root = load({
			types: {react: ['jsx']}
		});
		this.root = root;

		const routes = flatten(root);
		this.routes = routes;
		this.getRoute = makeGetRoute(routes);
	});

	describe('top level', function() {
		describe('companion same level', function() {
			beforeEach(function() {
				this.parent = this.root;
				this.route = this.getRoute('/view');
			});

			it('companion is child of parent', function() {
				const {parent, route} = this;
				expect(parent.children).to.have.any.keys('view');
				expect(parent.children).not.to.have.keys('sub');
				expect(parent.children).not.to.have.keys('view/sub');
				expect(parent.children.view).to.equal(route);
			});

			it("companion's parent is parent", function() {
				const {parent, route} = this;
				expect(route.parent).to.equal(parent);
			});
		});

		describe('companion one level up', function() {
			beforeEach(function() {
				this.parent = this.getRoute('/view');
				this.route = this.getRoute('/view/sub');
			});

			it('companion is child of parent', function() {
				const {parent, route} = this;
				expect(parent.children).to.have.keys('sub');
				expect(parent.children.sub).to.equal(route);
			});

			it("companion's parent is parent", function() {
				const {parent, route} = this;
				expect(route.parent).to.equal(parent);
			});
		});
	});

	describe('sub-folder', function() {
		describe('companion same level from index', function() {
			beforeEach(function() {
				this.parent = this.getRoute('/folder');
				this.route = this.getRoute('/folder/view');
			});

			it('companion is child of parent', function() {
				const {parent, route} = this;
				expect(parent.children).to.have.keys('view');
				expect(parent.children.view).to.equal(route);
			});

			it("companion's parent is parent", function() {
				const {parent, route} = this;
				expect(route.parent).to.equal(parent);
			});
		});

		describe('companion same level from other file', function() {
			beforeEach(function() {
				this.parent = this.getRoute('/folder2');
				this.route = this.getRoute('/folder2/peer');
			});

			it('companion is child of parent', function() {
				const {parent, route} = this;
				expect(parent.children).to.have.keys('other', 'peer');
				expect(parent.children.peer).to.equal(route);
			});

			it("companion's parent is parent", function() {
				const {parent, route} = this;
				expect(route.parent).to.equal(parent);
			});
		});

		describe('companion one level up', function() {
			beforeEach(function() {
				this.parent = this.getRoute('/folder/view');
				this.route = this.getRoute('/folder/view/sub');
			});

			it('companion is child of parent', function() {
				const {parent, route} = this;
				expect(parent.children).to.have.keys('sub');
				expect(parent.children.sub).to.equal(route);
			});

			it("companion's parent is parent", function() {
				const {parent, route} = this;
				expect(route.parent).to.equal(parent);
			});
		});
	});

	describe('files override companions', function() {
		it('from index', function() {
			const route = this.getRoute('/override/over1');
			expect(route.x).to.equal('from file 1');
		});

		it('from other file', function() {
			const route = this.getRoute('/override/over2');
			expect(route.x).to.equal('from file 2');
		});
	});

	describe('other type files added to companion routes', function() {
		it('peer', function() {
			const route = this.getRoute('/types/view');
			expect(route.files.react).to.equal('/types/view.jsx');
		});

		it('one level up', function() {
			const route = this.getRoute('/types/view/sub');
			expect(route.files.react).to.equal('/types/view/sub.jsx');
		});
	});

	describe('companion with companion', function() {
		beforeEach(function() {
			this.parent = this.getRoute('/withComp');
		});

		describe('direct companion', function() {
			beforeEach(function() {
				this.route = this.getRoute('/withComp/view');
			});

			it('companion is child of parent', function() {
				const {parent, route} = this;
				expect(parent.children).to.have.any.keys('view');
				expect(parent.children.view).to.equal(route);
			});

			it("companion's parent is parent", function() {
				const {parent, route} = this;
				expect(route.parent).to.equal(parent);
			});
		});

		describe('nested companions', function() {
			describe('peer', function() {
				beforeEach(function() {
					this.route = this.getRoute('/withComp/peer');
				});

				it('companion is child of parent', function() {
					const {parent, route} = this;
					expect(parent.children).to.have.any.keys('peer');
					expect(parent.children.peer).to.equal(route);
				});

				it("companion's parent is parent", function() {
					const {parent, route} = this;
					expect(route.parent).to.equal(parent);
				});
			});

			describe('one level up', function() {
				beforeEach(function() {
					this.parent = this.getRoute('/withComp/view');
					this.route = this.getRoute('/withComp/view/sub');
				});

				it('companion is child of parent', function() {
					const {parent, route} = this;
					expect(parent.children).to.have.keys('sub');
					expect(parent.children.sub).to.equal(route);
				});

				it("companion's parent is parent", function() {
					const {parent, route} = this;
					expect(route.parent).to.equal(parent);
				});
			});
		});

		it('parent has no other children', function() {
			const {parent} = this;
			expect(parent.children).to.have.keys('view', 'peer');
		});
	});
});
