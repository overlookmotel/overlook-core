/* --------------------
 * Route-loading plugin
 * ------------------*/

'use strict';

// Modules
const routerTree = require('router-tree');

// Imports
const {mapValuesInPlace, isString, isArray, isObject} = require('./utils');

// Exports
module.exports = function loadRoutes(app, options) {
	// Conform options
	let {types} = options;
	if (types == null) {
		types = options.types = {};
	} else if (isObject(types)) {
		mapValuesInPlace(types, type => {
			if (isString(type)) return [type];
			if (type == null || isArray(type)) return type;
			throw new Error('options.types attributes must be strings or arrays');
		});
	} else {
		throw new Error('options.types must be an object if defined');
	}

	// Default for route type is 'js'
	if (types.route == null) types.route = [];
	if (types.route.length == 0) types.route[0] = 'js';

	// Save options to app
	app.options.loadRoutes = options;

	// Set route loading methods on app
	app.loadRoutes = () => loadRoutesAsync(app);
	app.loadRoutes.sync = () => loadRoutesSync(app);

	// Return plugin definition
	return {
		Route: routerTree.Route,
		loadAsync: () => loadRoutesAsync,
		loadSync: () => loadRoutesSync
	};
};

function loadRoutesAsync(app) {
	return routerTree(app.paths.routes, getOptions(app)).then(root => {
		return processLoad(app, root);
	});
}

function loadRoutesSync(app) {
	const root = routerTree.sync(app.paths.routes, getOptions(app));
	return processLoad(app, root);
}

function getOptions(app) {
	return Object.assign({
		defaultRouteClass: app.Route,
		context: app
	}, app.options.loadRoutes);
}

function processLoad(app, root) {
	app.root = root;
	app.routes = app.plugins.routes.flatten(root);
	return app;
}
