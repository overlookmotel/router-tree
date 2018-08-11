# router-tree.js

# Create routes from directory structure

## Current status

[![NPM version](https://img.shields.io/npm/v/router-tree.svg)](https://www.npmjs.com/package/router-tree)
[![Build Status](https://img.shields.io/travis/overlookmotel/router-tree/master.svg)](http://travis-ci.org/overlookmotel/router-tree)
[![Dependency Status](https://img.shields.io/david/overlookmotel/router-tree.svg)](https://david-dm.org/overlookmotel/router-tree)
[![Dev dependency Status](https://img.shields.io/david/dev/overlookmotel/router-tree.svg)](https://david-dm.org/overlookmotel/router-tree)
[![Greenkeeper badge](https://badges.greenkeeper.io/overlookmotel/router-tree.svg)](https://greenkeeper.io/)
[![Coverage Status](https://img.shields.io/coveralls/overlookmotel/router-tree/master.svg)](https://coveralls.io/r/overlookmotel/router-tree)

## What's it for?

Often defining routes involves a lot of boilerplate code. This modules aims to reduce that, based on 3 simple principles:

1. Define routes structure as a tree of files and folders
2. Group together server-side controllers, views, and client-side components
3. Use classes to keep route definitions DRY

This module will load route files from a directory structure according to config you provide, and turn it into a tree of routes. You can do what you want with the tree from there e.g. feed into [Express](https://www.npmjs.com/package/express), or [React Router](https://reacttraining.com/react-router/) (or both!)

## Usage

### Loading files

#### Async (Promises)

```js
const routerTree = require('router-tree');

const tree = await routerTree('/path/to/routes', {/* options */});
```

#### Sync

```js
const tree = routerTree.sync('/path/to/routes', {/* options */});
```

### Route tree structure

#### Principles

Each route "sits on top" of another route. Each route has 1 parent and may have many children. e.g.:

```
/
/artists
/artists/:artistId
/artists/:artistId/albums
/login
```

* `/` is the root node. It has no parent.
* `/artists` sits on top of `/`
* `/artists/:artistId` sits on top of `/artists`
* `/artists/:artistId/albums` sits on top of `/artists/:artistId`
* `/login` sits on top of `/`

#### How to create this structure

With router-tree, you would create the following files:
(there are other ways too, it's very configurable - keep reading!)

```
/                          ->	/index.js
/artists                   ->	/artists/index.js
/artists/:artistId         ->	/artists/view.js
/artists/:artistId/albums  ->	/artists/albums/index.js
/login                     ->	/login.js
```

Each file can just contain this for now:

```js
module.exports = {};
```

#### Loading

When router-tree loads the routes, it converts each route file into an instance of the `routerTree.Route` class.

Each route is given an "internal path". By default, a file path ending `/index.js` creates an internal path with the `/index.js` part taken off. A file path with any other ending just chops off the `.js` file extension.

So now we have the following internal paths:

```
/
/artists
/artists/view
/artists/albums
/login
```

To turn this into a tree, each route's parent is identified, and router-tree returns an object like this:

```js
{
  internalPath: '/',
  children: {
    artists: {
      internalPath: '/artists',
      children: {
        view: { internalPath: '/artists/view' },
		albums: { internalPath: '/artists/albums' }
      }
	},
	login: { internalPath: '/login' }
  }
}
```

Each node also has a `parent` property, pointing back to that node's parent. For the root node `/`, it is `null`.

#### Setting parentage

In the example above, `/artists/albums` is in the wrong place. It should be a child of `/artists/view` not `/artists`.

We can rectify this by adding a `parentPath` property to `/artists/albums/index.js`:

```js
module.exports = { parentPath: './view' };
```

NB `parentPath` can be absolute, but here we are using a relative path.

#### Routing paths

The "internal path" is based on the file/folder structure of the files we loaded in. But we may want the actual routing paths to be different.

e.g. The routing path for `/artists/view.js` is meant to be `/artists/:artistId` not `/artists/view`.

We can achieve this by setting `pathPart` and `param` properties in `/artists/view.js`:

```js
module.exports = { pathPart: null, param: 'artistId' };
```

(`pathPart: null` removes the "view" part from the path).

Now, the route tree is as follows:

```js
{
  internalPath: '/',
  path: '/',
  children: {
    artists: {
      internalPath: '/artists',
      path: '/artists',
      children: {
        view: {
          internalPath: '/artists/view',
          path: '/artists/:artistId',
          children: {
            albums: {
              internalPath: '/artists/albums',
              path: '/artists/:artistId/albums'
            }
          }
        }
      }
	},
	login: {
      internalPath: '/login',
      path: '/login'
    }
  }
}
```

Note that the path for `/artists/albums` also includes `:artistId`. This happens automatically as each route's path builds upon its parent's.

We now have routes with the following paths:

```
/
/artists
/artists/:artistId
/artists/:artistId/albums
/login
```

#### So what do we do with the tree?

That's where router-tree hands over to you.

It would be easy, for example, to traverse the tree and register a route with [Express](https://www.npmjs.com/package/express) for each node, using a property of the route file as the handler.

In each route file create a method `getHandler()` on the exported object. And:

```js
const app = express();

const tree = routerTree.sync('/path/to/routes');

routerTree.flatten(tree).forEach(node => {
  if (node.getHandler) app.get(node.path, node.getHandler);
} );
```

(`routerTree.flatten()` is a helper method that comes with the library - see below)

But there's a lot more...

### Associated resources

The route files that we've seen so far are purely to map the routing structure. What about client-side components?

You can associate any other files you like with each route.

If you want to provide a [React](https://reactjs.org/) component for each (or some of) the routes, use the `types` option:

```js
const tree = routerTree.sync('/path/to/routes', {
  types: { react: 'jsx' }
} );
```

Now if you add a file `/index.jsx`, the resulting route tree looks like:

```js
{
  internalPath: '/',
  path: '/',
  files: { react: '/index.jsx' },
  children: {/* ... */}
}
```

The `.jsx` file has not been loaded, but it's been associated with the route. You could now traverse the route tree, in the same way as the Express example above, to build a [React Router](https://reacttraining.com/react-router/).

### Route classes

Every route file loaded is converted to an instance of `routerTree.Route` class.

#### Using the `Route` class directly

You can define routes using this class directly:

```js
new Route( { /* props */ } )
new Route( { parentPath: '../' } )
```

#### Subclassing `Route`

Creating custom subclasses of `Route` can abstract common properties/behaviours shared by multiple routes.

For example, the features of the `/artists/view` route we saw earlier can be abstracted so they can be reused on other similar routes:

```js
const {Route} = require('router-tree');
const {singularize} = require('inflection');

class ViewRoute extends Route {
  init() {
    super.init();
    this.pathPart = null;
    this.param = `${singularize(this.name)}Id`;
  }
}
```

NB The `init()` method is called on every node before the `path`s are built.

Now `/artists/view.js` can simply contain:

```js
module.exports = new ViewRoute();
```

If you want to add another route `/artists/:artistId/albums/:albumId`, just use the `ViewRoute` class again. See, no boilerplate!

#### More

You can also use Route classes to achieve much more powerful effects if a lot of your routes are similar e.g. CRUD (see section on "Companions" below).

### Anatomy of a Route

Each route object has the following properties:

Defined by router-tree:

* `name` - Name of the route (from the filename) e.g. `'view'`
* `internalPath` - Internal path e.g. `'/artists/view'`
* `sourcePath` - Path to the source file e.g. `'/artists/view.js'`
* `parent` - Reference to the parent route
* `children` - Object containing references to all child routes, keyed by each child's `name`
* `files` - Object containing paths to any files attached to this route e.g. `{ react: '/artists/view.jsx' }`

User-definable:

* `path` - External path for the route e.g. `'/artists/:artistId'` (if not defined, router-tree will build)
* `parentPath` - Relative or absolute path to parent route e.g. `'/artists'`, `'./view'`, `'../'` (default `'./'`)
* `pathPart` - Text to add to the `path` for this route e.g. `'display'` or `null` for nothing (defaults to `route.name`)
* `param` - Name of param to add to the `path` e.g. `'artistId'` (default `null`)
* `endSlash` - If `true`, adds a final `/` to end of the path (default `false`)
* `companions` - (see below)

Methods:

* `initProps()` - Called within class constructor, before properties supplied to constructor are applied to Route instance
* `init()` - Called after parentage is deduced, but before `path` is built (default is no-op)
* `initPath()` - Builds route `path`. By default, uses `pathPart`, `param` and `endSlash` (as shown above), but can be overriden

### Lifecycle

Loading occurs in the following order:

1. Directory scanned for files
2. Route files loaded using Node's `require()`
3. Internal paths calculated from file paths
4. Route files exporting plain objects (or `null`) converted to instances of `Route`
5. `.initProps()` method called on each node
6. Companions (see below) added to routes
7. Associated files added to `files` object on routes
8. Parentage of all nodes determined by reference to `parentPath` property
9. Route tree built - all properties noted above are set
10. `.init()` method called on each node, starting at root and working up the tree
11. `.initPath()` method called on each node
12. Tree returned

Therefore:

* Properties which affect parentage must be set as initial properties or in a `Route` subclass constructor or `.initProps()` method.
* Properties which affect the `path` must be set in `.init()` method at latest.

### Loading options

#### Filters

Files/folders can be skipped by using filter options.

* `options.filterFiles` filters out files
* `options.filterFolders` filters out folders and all the files they contain

Each option can be either:

1. `RegExp` - which matches filenames to include
2. `Function` - which receives filename and returns `true` to include them

```js
const tree = routerTree.sync('/path/to/routes', {
  // Skip test files
  filterFiles: filename => filename.slice(-8) == '.test.js',
  // Skip folders starting with '_'
  filterFolders: /^[^_]/
} );
```

NB Files are also filtered by file extension according to the `types` option (see below), in addition to filtering by `options.filterFiles`.

#### Filesystem concurrency

Maximum number of concurrent filesystem operations can be set with `maxConcurrent` option. Default is `5`.

Does not apply to `routerTree.sync()`.

### Defining parentage

Parentage (i.e. which route is a child of which) is resolved according to the `parentPath` attribute of each route. You can create the route tree in any shape you want by setting `parentPath` accordingly.

Resolution of relative paths is similar to Node's `require()`. i.e. relative to the *folder* that the file is in.

Absolute paths start with `/`. They are absolute relative to the root *of the directory routes are loaded from*, not filesystem root.

Each route's `internalPath` is the file path minus the extension. Files named `index` are referenced by the path of the folder they are in.

A route's parent is:

> the route with an `internalPath` which equals the path you get by resolving the child's `parentPath` relative to its own `internalPath`.

| Source path              | `internalPath`  | `parentPath` | Parent resolves to |
|--------------------------|-----------------|--------------|--------------------|
| /index.js                | /               | null         | null               |
| /artists/index.js        | /artists        | ./           | /                  |
| /artists/view.js         | /artists/view   | ./           | /artists           |
| /artists/edit.js         | /artists/edit   | ./view       | /artists/view      |
| /artists/albums/index.js | /artists/albums | ./view       | /artists/view      |
| /artists/new.js          | /artists/new    | /artists     | /artists           |

Default for `parentPath` if not defined is `'./'`, except for the root node which is `null`.

As a shortcut, relative paths can be defined without a prepended `./` i.e. `'view'` is the same as `'./view'`. router-tree will add the `./` automatically.

### Associated files

You can associate additional files with routes by using the `types` option.

Files are identified by file extension.

```js
const tree = routerTree.sync('/path/to/routes', {
  types: {
    route: 'js',
    react: 'jsx',
    controller: 'cont.js',
    ignore: 'test.js'
  }
} );
```

If you have the following files:

```
/index.js
/index.jsx
/index.cont.js
/index.test.js
```

the result returned is:

```js
{
  path: '/',
  ...
  files: {
    route: '/index.js',
    react: '/index.jsx',
    controller: '/index.cont.js'
  }
}
```

#### `route` type

The `route` type is the files which are actually loaded as route nodes. This defaults to `'js'`.

* To define your routes as JSON files, use `types: { route: 'json' }`
* To only load route files with extension `.route.js`, use `types: { route: 'route.js' }`

#### `ignore` type

Defining an `ignore` type tells router-tree to ignore files with this extension.

#### Implicit routes

You don't need to provide a route file to create a route. Just the presence of an associated file defined in `types` will implicitly create a route with default options.

e.g. Adding a file `/view.jsx` creates a route `/view` with the following properties:

```js
{
  path: '/view',
  name: 'view',
  internalPath: '/view',
  sourcePath: null, // Because no route file
  parentPath: './', // The default
  files: { react: '/view.jsx' },
  parent: ..., // Reference to '/' route
  children: { ... }
}
```

#### Notes

router-tree attempts to match with the longest extension first. Hence why `/index.cont.js` gets identified as a controller (`.cont.js`), not a route (`.js`).

Types can also be defined as an array of extensions e.g. `types: { react: [ 'jsx', 'react.js' ] }`.

### Class options

Any route files that exports a plain object (or `null`, or indeed anything else which isn't an instance of `routerTree.Route` class) is converted to an instance of `Route`.

If a route is created implicitly by the presence of an associated file (due to `types` option), that route is also a new instance of `Route` class.

`defaultRouteClass` option sets the default class to create routes from. It **must** be a subclass of `Route` itself.

```js
const routerTree = require('routerTree');

class MyRouteClass extends routerTree.Route { ... }

const tree = routerTree.sync('/path/to/routes', {
  defaultRouteClass: MyRouteClass
} );

assert( tree instanceof MyRouteClass );

```

### Context injection

You can inject arbitrary external data into the route bootstrapping process with the `context` option.

This can be useful for e.g. passing in models which routes can bind to them.

The `context` object provided is passed to the `.init()` method of each route.

```js
// Route loader
const tree = routerTree.sync('/path/to/routes', {
  context: {
    msg: 'Hello!',
    models: databaseModels
  }
} );
```

```js
// '/artists' route definition
const {Route} = require('routerTree');

module.exports = class extends Route {
  init(context) {
    super.init(context);
    console.log(context.msg); // Logs 'Hello!'
    this.model = context.models.Artist;
  }
}
```

### Overriding path construction

The `path` for each route is constructed by the `.initPath()` method on each route object.

It can be overriden in a `Route` subclass.

```js
const {Route} = require('routerTree');

class MyRoute extends Route {
  initPath() {
    const path = super.initPath();
    // Modify path in some way
    return path;
  }
}
```

### Companions

To reduce boilerplate, you can define a set of several routes in one file. The additional routes are "companions" of the route they are defined in.

For example, to create a `Route` subclass that provides routes for all the classic CRUD actions:

```js
const {Route} = require('routerTree');

class CrudRoute extends Route {
  constructor(props) {
    super(props);

    Object.assign(this.companions, {
      view: { pathPart: null, param: 'id' },
      edit: { parentPath: './view' },
      delete: { parentPath: './view' },
      new: {}
    } );
  }
}
```

Creating a route file in `/artists/index.js` with `module.exports = new CrudRoute()` will create routes with the following paths:

```
/artists
/artists/:id
/artists/:id/edit
/artists/:id/delete
/artists/new
```

Companion routes are added before `.init()` is called, so must be added in the class constructor.

#### Paths

Why call them "companions" rather than just "children"? Well, they may *not be* children. In the example above `/artists/view` is a child of `/artists` but `/artists/edit` and `/artists/delete` are not - their parent is `/artists/view`.

Adding companions is like adding a folder of route files next to the route file which defines them (or files in the *same* folder if the main route file is `index.js`). The companion routes end up in the route tree the same as routes defined in their own files would.

Where they end up in the route tree depends on:

1. attribute name they are defined with (relative path)
2. `parentPath` defined in each

i.e. `this.companions.view = ...` creates a route with relative path of `'./view'`. The `internalPath` of the companion is the `internalPath` of the main route + the relative path.

Same as with `parentPath`, the prepended `./` in relative paths can be left off - `'view'` is the same as `'./view'`.

Unlike `parentPath`, the relative path is relative to the route *file*, not its containing folder.

You can define companions with any relative or absolute path. e.g.:

```js
this.companions['../view'] = ...
this.companions['./folder/subfolder'] = ...
this.companions['/absolute'] = ...
```

#### Real files take precedence

If there is a real file in the directory structure `/artists/view.js` this takes precedence over the `view` companion which is competing for the same place.

#### Associated files

Any associated files found according to the `types` option will be attached to the companion route, same as they would to a "real" route.

### Utilities

#### `routerTree.traverse( tree, fn )`

Helper method to traverse every node of `tree`, starting at the root node and working up the tree. `fn()` is called with each node in turn.

e.g. to log all routes' paths:

```js
routerTree.traverse( tree, node => console.log(node.path) );
```

#### `routerTree.traverseAsync( tree, fn [, options] )`

Helper method to traverse every node of `tree` asynchronously, starting at the root node and working up the tree. `fn()` is called with each node in turn.

If `fn` returns a promise, the promise is awaited before calling `fn` on the route's children.

Concurrency (i.e. max number of routes `fn` is being run on simultaneously) can be set with `options.concurrency`. Default is no concurrency limit.

e.g.:

```js
await routerTree.traverseAsync(
  tree,
  async function(node) { /* do something async */ },
  { concurrency: 5 }
);
```

#### `routerTree.flatten( tree )`

Helper method to flatten route tree into an array of routes.

The routes are sorted by `path` (using [sort-route-paths](https://www.npmjs.com/package/sort-route-paths)).

```js
const routes = routerTree.flatten( tree );
```

## Tests

Use `npm test` to run the tests. Use `npm run cover` to check coverage.

## Changelog

See [changelog.md](https://github.com/overlookmotel/router-tree/blob/master/changelog.md)

## Issues

If you discover a bug, please raise an issue on Github. https://github.com/overlookmotel/router-tree/issues

## Contribution

Pull requests are very welcome. Please:

* ensure all tests pass before submitting PR
* add an entry to changelog
* add tests for new features
* document new functionality/API additions in README
