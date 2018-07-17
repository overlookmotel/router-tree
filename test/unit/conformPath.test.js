/* --------------------
 * router-tree module
 * Tests
 * ------------------*/

'use strict';

// Modules
const chai = require('chai'),
	{expect} = chai,
	{conformPath} = require('../../lib/paths');

// Init
chai.config.includeStack = true;

/* global describe, it */
/* jshint expr: true */

// Tests
describe('`conformPath()` transforms', function() {
	const tests = [
		[null, './'],
		[undefined, './'],
		['', './'],
		['.', './'],
		['..', '../'],
		['./..', '../'],
		['../.', '../'],
		['../..', '../../'],
		['/', '/'],
		['./', './'],
		['../', '../'],
		['./../', '../'],
		['.././', '../'],
		['../../', '../../'],
		['index', './'],
		['./index', './'],
		['../index', '../'],
		['/index', '/'],
		['/1', '/1'],
		['/1/2', '/1/2'],
		['/1/2/3', '/1/2/3'],
		['/1/index', '/1'],
		['/1/2/index', '/1/2'],
		['/1/2/3/index', '/1/2/3'],
		['/1/index/', '/1'],
		['/1/2/index/', '/1/2'],
		['/1/2/3/index/', '/1/2/3'],
		['/1/', '/1'],
		['/1/2/', '/1/2'],
		['/1/2/3/', '/1/2/3'],
		['./1/', './1'],
		['./1/2/', './1/2'],
		['./1/2/3/', './1/2/3'],
		['../1/', '../1'],
		['../1/2/', '../1/2'],
		['../1/2/3/', '../1/2/3'],
		['../../1', '../../1'],
		['../../1/2', '../../1/2'],
		['../../1/2/3', '../../1/2/3'],
		['x/../1', './1'],
		['x/../1/2', './1/2'],
		['x/../1/2/3', './1/2/3'],
		['../x/../1', '../1'],
		['../x/../1/2', '../1/2'],
		['../x/../1/2/3', '../1/2/3'],
		['1', './1'],
		['1/2', './1/2'],
		['1/2/3', './1/2/3'],
		['1/', './1'],
		['1/2/', './1/2'],
		['1/2/3/', './1/2/3'],
		['1/.', './1'],
		['1/./2', './1/2'],
		['1/././2/./3/././4', './1/2/3/4'],
		['1/x/../2', './1/2'],
		['1/x/y/../..', './1'],
		['1/x/y/../../2', './1/2'],
		['1//2/3', './1/2/3'],
		['//1', '/1'],
		['//1////2/3//', '/1/2/3'],
		['/..', false],
		['/../', false],
		['/../1', false],
		['/../1/2', false],
		['/x/..', '/'],
		['/x/../1', '/1'],
		['/x/../..', false],
		['/x/../../1', false]
	];

	for (let [input, output] of tests) {
		/* jshint loopfunc: true */
		it(`${JSON.stringify(input)} to ${JSON.stringify(output)}`, function() {
			expect(conformPath(input)).to.equal(output);
		});
	}
});