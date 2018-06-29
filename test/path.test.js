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
const path = pathJoin(__dirname, 'fixtures/path');

function load(options) {
	return routerTree.sync(path, options);
}

describe('Path', function() {
	beforeEach(function() {
		const root = load();
		this.root = root;

		const routes = flatten(root);
		this.getRoute = makeGetRoute(routes);
	});

	describe('defaults', function() {
		describe('top level', function() {
			it("index path = '/'", function() {
				expect(this.root.path).to.equal('/');
			});

			it("other file path = '/<file name>'", function() {
				const route = this.getRoute('/view');
				expect(route.path).to.equal('/view');
			});
		});

		describe('sub-folder', function() {
			it("index path = '/<folder name>'", function() {
				const route = this.getRoute('/folder');
				expect(route.path).to.equal('/folder');
			});

			it("other file path = '/<folder name>/<file name>'", function() {
				const route = this.getRoute('/folder/view');
				expect(route.path).to.equal('/folder/view');
			});
		});

		describe('sub-sub-folder', function() {
			it("index path = '/<folder name>/<sub-folder name>'", function() {
				const route = this.getRoute('/folder/subfolder');
				expect(route.path).to.equal('/folder/subfolder');
			});

			it("other file path = '/<folder name>/<sub-folder name>/<file name>'", function() {
				const route = this.getRoute('/folder/subfolder/view');
				expect(route.path).to.equal('/folder/subfolder/view');
			});
		});
	});

	describe('manually defined path', function() {
		it('over-rides default', function() {
			const route = this.getRoute('/manualPath');
			expect(route.path).to.equal('/anotherPath');
		});

		it('inherited by children', function() {
			const route = this.getRoute('/manualPath/view');
			expect(route.path).to.equal('/anotherPath/view');
		});
	});

	describe('pathPart', function() {
		describe('defined', function() {
			it('over-rides default', function() {
				const route = this.getRoute('/pathPart');
				expect(route.path).to.equal('/altPath');
			});

			it('inherited by children', function() {
				const route = this.getRoute('/pathPart/view');
				expect(route.path).to.equal('/altPath/view');
			});
		});

		describe('null', function() {
			describe('top level', function() {
				it('over-rides default', function() {
					const route = this.getRoute('/pathPartNull');
					expect(route.path).to.equal('/');
				});

				it('inherited by children', function() {
					const route = this.getRoute('/pathPartNull/view');
					expect(route.path).to.equal('/view');
				});
			});

			describe('nested', function() {
				it('over-rides default', function() {
					const route = this.getRoute('/pathPartNullNested/subfolder');
					expect(route.path).to.equal('/pathPartNullNested');
				});

				it('inherited by children', function() {
					const route = this.getRoute('/pathPartNullNested/subfolder/view');
					expect(route.path).to.equal('/pathPartNullNested/view');
				});
			});
		});
	});

	describe('endSlash', function() {
		describe('in top-level file', function() {
			it('adds slash to end of path', function() {
				const route = this.getRoute('/endSlash');
				expect(route.path).to.equal('/endSlash/');
			});

			it('does not apply to children', function() {
				const route = this.getRoute('/endSlashChild');
				expect(route.path).to.equal('/endSlash/endSlashChild');
			});
		});

		describe('in folder index', function() {
			it('adds slash to end of path', function() {
				const route = this.getRoute('/endSlashFolder');
				expect(route.path).to.equal('/endSlashFolder/');
			});

			it('does not apply to children', function() {
				const route = this.getRoute('/endSlashFolder/view');
				expect(route.path).to.equal('/endSlashFolder/view');
			});
		});

		describe('in folder other file', function() {
			it('adds slash to end of path', function() {
				const route = this.getRoute('/endSlashFolder/endSlash');
				expect(route.path).to.equal('/endSlashFolder/endSlash/');
			});

			it('does not apply to children', function() {
				const route = this.getRoute('/endSlashFolder/endSlashChild');
				expect(route.path).to.equal('/endSlashFolder/endSlash/endSlashChild');
			});
		});
	});

	describe('param', function() {
		describe('top level', function() {
			describe('default pathPart', function() {
				it("':<param>' added to path", function() {
					const route = this.getRoute('/param');
					expect(route.path).to.equal('/param/:myId');
				});

				it('inherited by children', function() {
					const route = this.getRoute('/paramChild');
					expect(route.path).to.equal('/param/:myId/paramChild');
				});
			});

			describe('pathPart `null`', function() {
				it("':<param>' added to path in place of route name", function() {
					const route = this.getRoute('/paramOnly');
					expect(route.path).to.equal('/:myId');
				});

				it('inherited by children', function() {
					const route = this.getRoute('/paramOnlyChild');
					expect(route.path).to.equal('/:myId/paramOnlyChild');
				});
			});
		});

		describe('nested', function() {
			describe('default pathPart', function() {
				it("':<param>' added to path", function() {
					const route = this.getRoute('/paramFolder');
					expect(route.path).to.equal('/paramFolder/:altId');
				});

				it('inherited by children', function() {
					const route = this.getRoute('/paramFolder/view');
					expect(route.path).to.equal('/paramFolder/:altId/view');
				});
			});

			describe('pathPart `null`', function() {
				it("':<param>' added to path in place of route name", function() {
					const route = this.getRoute('/paramOnlyFolder');
					expect(route.path).to.equal('/:altId');
				});

				it('inherited by children', function() {
					const route = this.getRoute('/paramOnlyFolder/view');
					expect(route.path).to.equal('/:altId/view');
				});
			});
		});
	});
});
