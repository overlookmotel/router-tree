'use strict';

const Route = require('../../../lib/route');

class Sub extends Route {
	isSubClass() {
		return true;
	}
}

const route = new Sub({a: 3});
route.b = 4;

module.exports = route;
