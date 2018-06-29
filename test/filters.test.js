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
	{flatten, routesToSourcePaths} = require('./utils');

// Init
chai.config.includeStack = true;

/* global describe, it */
/* jshint expr: true */

// Tests
const path = pathJoin(__dirname, 'fixtures/filters');

function load(options) {
	return routerTree.sync(path, options);
}

function loadPaths(options) {
	const tree = load(options);
	return routesToSourcePaths(flatten(tree));
}

describe('Filters', function() {
	describe('default options', function() {
		it('loads all `.js` files', function() {
			const paths = loadPaths();

			expect(paths).to.deep.equal([
				'/_file.js',
				'/_folder/_file.js',
				'/_folder/file.js',
				'/_folder/index.js',
				'/file.ext.js',
				'/file.js',
				'/folder/_file.js',
				'/folder/_folder/index.js',
				'/folder/file.ext.js',
				'/folder/file.js',
				'/folder/index.js',
				'/index.js'
			]);
		});

		it('filters with types', function() {
			const paths = loadPaths({
				types: {test: ['ext.js']}
			});

			expect(paths).to.deep.equal([
				'/_file.js',
				'/_folder/_file.js',
				'/_folder/file.js',
				'/_folder/index.js',
				'/file.js',
				'/folder/_file.js',
				'/folder/_folder/index.js',
				'/folder/file.js',
				'/folder/index.js',
				'/index.js'
			]);
		});
	});

	describe('filterFolders option', function() {
		describe('with RegExp', function() {
			it('filters folders', function() {
				const paths = loadPaths({
					filterFolders: /^[^_]/
				});

				expect(paths).to.deep.equal([
					'/_file.js',
					'/file.ext.js',
					'/file.js',
					'/folder/_file.js',
					'/folder/file.ext.js',
					'/folder/file.js',
					'/folder/index.js',
					'/index.js'
				]);
			});
		});

		describe('with function', function() {
			it('filters folders', function() {
				const paths = loadPaths({
					filterFolders: name => name.slice(0, 1) != '_'
				});

				expect(paths).to.deep.equal([
					'/_file.js',
					'/file.ext.js',
					'/file.js',
					'/folder/_file.js',
					'/folder/file.ext.js',
					'/folder/file.js',
					'/folder/index.js',
					'/index.js'
				]);
			});
		});
	});

	describe('filterFiles option', function() {
		describe('with RegExp', function() {
			it('filters files', function() {
				const paths = loadPaths({
					filterFiles: /^[^_]/
				});

				expect(paths).to.deep.equal([
					'/_folder/file.js',
					'/_folder/index.js',
					'/file.ext.js',
					'/file.js',
					'/folder/_folder/index.js',
					'/folder/file.ext.js',
					'/folder/file.js',
					'/folder/index.js',
					'/index.js'
				]);
			});

			it('combines with types filter', function() {
				const paths = loadPaths({
					filterFiles: /^[^_]/,
					types: {test: ['ext.js']}
				});

				expect(paths).to.deep.equal([
					'/_folder/file.js',
					'/_folder/index.js',
					'/file.js',
					'/folder/_folder/index.js',
					'/folder/file.js',
					'/folder/index.js',
					'/index.js'
				]);
			});
		});

		describe('with function', function() {
			it('filters files', function() {
				const paths = loadPaths({
					filterFiles: name => name.slice(0, 1) != '_'
				});

				expect(paths).to.deep.equal([
					'/_folder/file.js',
					'/_folder/index.js',
					'/file.ext.js',
					'/file.js',
					'/folder/_folder/index.js',
					'/folder/file.ext.js',
					'/folder/file.js',
					'/folder/index.js',
					'/index.js'
				]);
			});

			it('combines with types filter', function() {
				const paths = loadPaths({
					filterFiles: name => name.slice(0, 1) != '_',
					types: {test: ['ext.js']}
				});

				expect(paths).to.deep.equal([
					'/_folder/file.js',
					'/_folder/index.js',
					'/file.js',
					'/folder/_folder/index.js',
					'/folder/file.js',
					'/folder/index.js',
					'/index.js'
				]);
			});
		});
	});
});
