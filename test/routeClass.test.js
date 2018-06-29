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

/* global describe, it, beforeEach */
/* jshint expr: true */

// Tests
const path = pathJoin(__dirname, 'fixtures/routeClass');

function _load(options) {
	return routerTree.sync(path, options);
}

describe('Route classes', function() {
	describe('without `defaultRouteClass` option', function() {
		function load(options) {
			return _load(options);
		}

		describe('routes defined as Route instance', function() {
			beforeEach(function() {
				this.route = load().children.route;
			});

			it('left unchanged', function() {
				expect(this.route).to.be.instanceof(Route);
				expect(this.route.constructor).to.equal(Route);
			});

			it('maintain set attributes', function() {
				expect(this.route.b).to.equal(2);
			});

			it('maintain passed attributes', function() {
				expect(this.route.a).to.equal(1);
			});
		});

		describe('routes defined as Route subclass instance', function() {
			beforeEach(function() {
				this.route = load().children.subclass;
			});

			it('left unchanged', function() {
				expect(this.route).to.be.instanceof(Route);
				expect(this.route.constructor).not.to.equal(Route);
				expect(this.route.isSubClass).to.be.a('function');
				expect(this.route.isSubClass()).to.equal(true);
			});

			it('maintain set attributes', function() {
				expect(this.route.b).to.equal(4);
			});

			it('maintain passed attributes', function() {
				expect(this.route.a).to.equal(3);
			});
		});

		describe('routes defined as object', function() {
			beforeEach(function() {
				this.route = load().children.object;
			});

			it('converted to Route instance', function() {
				expect(this.route).to.be.instanceof(Route);
				expect(this.route.constructor).to.equal(Route);
			});

			it('maintain set attributes', function() {
				expect(this.route.a).to.equal(5);
			});
		});

		describe('routes defined as null', function() {
			beforeEach(function() {
				this.route = load().children.null;
			});

			it('converted to Route instance', function() {
				expect(this.route).to.be.instanceof(Route);
				expect(this.route.constructor).to.equal(Route);
			});
		});

		describe('routes defined by presence of other file', function() {
			beforeEach(function() {
				const root = load({types: {txt: 'txt'}});
				this.route = root.children.empty;
			});

			it('create Route instance', function() {
				expect(this.route).to.be.instanceof(Route);
				expect(this.route.constructor).to.equal(Route);
			});
		});
	});

	describe('with `defaultRouteClass` option', function() {
		class Sub extends Route {}

		function load(options) {
			options = Object.assign({defaultRouteClass: Sub}, options);
			return _load(options);
		}

		it('throws if option not subclass of Route', function() {
			expect(() => {
				load({defaultRouteClass: class Foo {}});
			}).to.throw(Error, /^defaultRouteClass option must be a subclass of routerTree\.Route$/);
		});

		describe('routes defined as Route instance', function() {
			beforeEach(function() {
				this.route = load().children.route;
			});

			it('left unchanged', function() {
				expect(this.route).to.be.instanceof(Route);
				expect(this.route.constructor).to.equal(Route);
				expect(this.route).not.to.be.instanceof(Sub);
			});

			it('maintain set attributes', function() {
				expect(this.route.b).to.equal(2);
			});

			it('maintain passed attributes', function() {
				expect(this.route.a).to.equal(1);
			});
		});

		describe('routes defined as Route subclass instance', function() {
			beforeEach(function() {
				this.route = load().children.subclass;
			});

			it('left unchanged', function() {
				expect(this.route).to.be.instanceof(Route);
				expect(this.route.constructor).not.to.equal(Route);
				expect(this.route).not.to.be.instanceof(Sub);
				expect(this.route.isSubClass).to.be.a('function');
				expect(this.route.isSubClass()).to.equal(true);
			});

			it('maintain set attributes', function() {
				expect(this.route.b).to.equal(4);
			});

			it('maintain passed attributes', function() {
				expect(this.route.a).to.equal(3);
			});
		});

		describe('routes defined as object', function() {
			beforeEach(function() {
				this.route = load().children.object;
			});

			it('converted to specified class instance', function() {
				expect(this.route).to.be.instanceof(Sub);
				expect(this.route.constructor).to.equal(Sub);
			});

			it('maintain set attributes', function() {
				expect(this.route.a).to.equal(5);
			});
		});

		describe('routes defined as null', function() {
			beforeEach(function() {
				this.route = load().children.null;
			});

			it('converted to specified class instance', function() {
				expect(this.route).to.be.instanceof(Sub);
				expect(this.route.constructor).to.equal(Sub);
			});
		});

		describe('routes defined by presence of other file', function() {
			beforeEach(function() {
				const root = load({types: {txt: 'txt'}});
				this.route = root.children.empty;
			});

			it('create specified class instance', function() {
				expect(this.route).to.be.instanceof(Sub);
				expect(this.route.constructor).to.equal(Sub);
			});
		});
	});
});
