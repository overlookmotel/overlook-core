/* --------------------
 * Routes plugin
 * ------------------*/

'use strict';

// Modules
const routerTree = require('router-tree'),
	{Plugin} = require('pluggi');

// Exports
module.exports = class Routes extends Plugin {
	init(app) {
		// Save Route class on app.
		// Subclass so it's specific to this app, in case user mutates it
		// instead of subclassing.
		app.Route = class Route extends routerTree.Route {};

		// Save routerTree to `app.plugins.routes.routerTree`
		this.routerTree = routerTree;
	}

	traverse(fn) {
		return routerTree.traverse(this.app.root, fn);
	}

	flatten() {
		return routerTree.flatten(this.app.root);
	}
};
