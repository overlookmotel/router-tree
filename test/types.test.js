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
	{flatten, routesToInternalPaths} = require('./utils');

// Init
chai.config.includeStack = true;

/* global describe, it */
/* jshint expr: true */

// Tests
const path = pathJoin(__dirname, 'fixtures/types');

function _load(options) {
	return routerTree.sync(path, options);
}

describe('Types', function() {
	describe('default', function() {
		function load() {
			return _load();
		}

		it('loads only `.js` files', function() {
			const root = load();

			const routes = flatten(root);
			const paths = routesToInternalPaths(routes);
			expect(paths).to.deep.equal([
				'/',
				'/jsExtension.ext',
				'/multipleTypes',
				'/reactWithRouteFolder',
				'/routeOnly',
				'/routeWithReact',
				'/routeWithReactFolder'
			]);

			for (let route of routes) {
				expect(route.files).to.deep.equal({route: route.sourcePath});
			}
		});
	});

	describe('route type', function() {
		function load() {
			return _load({types: {route: ['json']}});
		}

		it('overrides `.js`', function() {
			const root = load();

			const routes = flatten(root);
			const paths = routesToInternalPaths(routes);
			expect(paths).to.deep.equal([
				'/',
				'/multipleTypes'
			]);

			for (let route of routes) {
				expect(route.files).to.deep.equal({route: route.sourcePath});
			}
		});
	});

	describe('additional types', function() {
		function load() {
			return _load({types: {
				react: ['jsx'],
				json: ['json'],
				jsExt: ['ext.js']
			}});
		}

		it('leaves solo route files unaffected', function() {
			const route = load().children.routeOnly;
			expect(route.internalPath).to.equal('/routeOnly');
			expect(route.files).to.deep.equal({route: '/routeOnly.js'});
		});

		it('creates route for additional type', function() {
			const route = load().children.reactOnly;
			expect(route.internalPath).to.equal('/reactOnly');
			expect(route.files).to.deep.equal({react: '/reactOnly.jsx'});
		});

		describe('combines route file and additional type', function() {
			it('when both in same folder', function() {
				const route = load().children.routeWithReact;
				expect(route.internalPath).to.equal('/routeWithReact');
				expect(route.files).to.deep.equal({
					route: '/routeWithReact.js',
					react: '/routeWithReact.jsx'
				});
			});

			it('when route file in folder', function() {
				const route = load().children.reactWithRouteFolder;
				expect(route.internalPath).to.equal('/reactWithRouteFolder');
				expect(route.files).to.deep.equal({
					route: '/reactWithRouteFolder/index.js',
					react: '/reactWithRouteFolder.jsx'
				});
			});

			it('when additional type in folder', function() {
				const route = load().children.routeWithReactFolder;
				expect(route.internalPath).to.equal('/routeWithReactFolder');
				expect(route.files).to.deep.equal({
					route: '/routeWithReactFolder.js',
					react: '/routeWithReactFolder/index.jsx'
				});
			});
		});

		describe('combines route file and multiple additional types', function() {
			it('when all in same folder', function() {
				const route = load().children.multipleTypes;
				expect(route.internalPath).to.equal('/multipleTypes');
				expect(route.files).to.deep.equal({
					route: '/multipleTypes/index.js',
					react: '/multipleTypes/index.jsx',
					json: '/multipleTypes/index.json'
				});
			});
		});

		it('sub-extension recognised as additional type', function() {
			const root = load();

			const route = root.children.jsExtension;
			expect(route).to.be.ok;
			expect(route.internalPath).to.equal('/jsExtension');
			expect(route.files).to.deep.equal({jsExt: '/jsExtension.ext.js'});

			const paths = routesToInternalPaths(flatten(root));
			expect(paths).not.to.include('/jsExtension.ext');
		});
	});
});
