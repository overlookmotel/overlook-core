/* --------------------
 * Routes plugin
 * ------------------*/

'use strict';

// Modules
const routerTree = require('router-tree');

// Exports
module.exports = function routes(app) {
	// Save Route class on app.
	// Subclass so it's specific to this app, in case user mutates it
	// instead of subclassing.
	app.Route = class Route extends routerTree.Route {};

	// Return plugin definition
	return {
		traverse: fn => routerTree.traverse(app.root, fn),
		flatten: () => routerTree.flatten(app.root)
	};
};
