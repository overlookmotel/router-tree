'use strict';

const Route = require('../../../lib/route');

const route = new Route({a: 1});
route.b = 2;

module.exports = route;
