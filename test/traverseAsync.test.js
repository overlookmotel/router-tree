/* --------------------
 * router-tree module
 * Tests
 * ------------------*/

'use strict';

// Modules
const chai = require('chai'),
	{expect} = chai,
	pathJoin = require('path').join,
	{defer, promiseWait} = require('promise-methods'),
	routerTree = require('../lib/'),
	{Route, traverseAsync} = routerTree;

// Init
chai.config.includeStack = true;

/* global describe, it */
/* jshint expr: true */

// Tests
const DELAY_MS = 50;

const path = pathJoin(__dirname, 'fixtures/init');

const paths = [
	'/',
	'/edit',
	'/folder',
	'/folder/edit',
	'/folder/subfolder',
	'/folder/subfolder/edit'
];

function load(options) {
	return routerTree.sync(path, options);
}

function loadWithSpy() {
	const calls = [],
		deferreds = {};
	class SpyRoute extends Route {
		init(context) {
			super.init(context);
			deferreds[this.internalPath] = defer();
		}

		spy() {
			calls.push(this.internalPath);
			return deferreds[this.internalPath].promise;
		}
	}

	const tree = load({defaultRouteClass: SpyRoute});

	return {tree, calls, deferreds};
}

function traverse() {
	const {tree, calls, deferreds} = loadWithSpy();

	const p = traverseAsync(tree, route => route.spy());

	let resolved = false;
	const p2 = p.then(() => resolved = true);
	const isResolved = () => resolved;

	const resolve = path => deferreds[path].resolve();
	const resolveAll = () => Object.keys(deferreds).forEach(path => resolve(path));

	const finish = () => {
		resolveAll();
		return p2;
	};

	return {calls, p, isResolved, resolve, resolveAll, finish};
}

describe('traverseAsync() method', function() {
	it('returns a promise', function*() {
		const {p, finish} = traverse();

		expect(p).to.be.instanceof(Promise);

		yield finish();
	});

	it('calls function on all routes', function*() {
		const {calls, p, resolveAll, finish} = traverse();

		resolveAll();
		yield p;
		expect(calls).to.deep.equal(paths);

		yield finish();
	});

	it('calls function on root route sync', function*() {
		const {calls, finish} = traverse();

		expect(calls).to.deep.equal(['/']);

		yield finish();
	});

	describe('awaits parent promise resolution before calling fn on children', function() {
		it('root level', function*() {
			const {calls, finish} = traverse();

			yield delay();
			expect(calls).to.deep.equal(['/']);

			yield finish();
		});

		it('1st level', function*() {
			const {calls, resolve, finish} = traverse();

			resolve('/');
			yield delay();
			expect(calls).to.deep.equal(['/', '/edit', '/folder']);

			yield finish();
		});

		it('2nd level', function*() {
			const {calls, resolve, finish} = traverse();

			resolve('/');
			resolve('/folder');
			yield delay();
			expect(calls).to.deep.equal([
				'/', '/edit', '/folder', '/folder/edit', '/folder/subfolder'
			]);

			yield finish();
		});

		it('3rd level', function*() {
			const {calls, resolve, finish} = traverse();

			resolve('/');
			resolve('/folder');
			resolve('/folder/subfolder');
			yield delay();
			expect(calls).to.deep.equal(paths);

			yield finish();
		});
	});

	it('awaits resolution of all promises before resolving', function*() {
		const {isResolved, resolve, finish} = traverse();

		['/', '/folder', '/folder/edit', '/folder/subfolder', '/folder/subfolder/edit'].forEach(resolve);
		yield delay();
		expect(isResolved()).to.be.false;

		resolve('/edit');
		yield delay();
		expect(isResolved()).to.be.true;

		yield finish();
	});
});

function delay() {
	return promiseWait(DELAY_MS);
}
