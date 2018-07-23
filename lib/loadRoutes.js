/* --------------------
 * Route-loading plugin
 * ------------------*/

'use strict';

// Modules
const routerTree = require('router-tree'),
	{Plugin} = require('pluggi');

// Imports
const {mapValuesInPlace, isString, isArray, isObject, copyProps} = require('./utils');

// Exports
module.exports = class LoadRoutes extends Plugin {
	init(app, options) {
		// Conform options
		let {types} = options;
		if (types == null) {
			types = {};
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

		// Save options to plugin
		this.types = types;
		copyProps(options, this, ['filterFiles', 'filterFolders', 'maxConcurrent']);

		// Set route loading methods on app
		app.loadRoutes = () => {
			return this.loadAsync().then(() => app);
		};
		app.loadRoutes.sync = () => {
			this.loadSync();
			return app;
		};
	}

	loadAsync() {
		return this._load(routerTree).then(root => {
			return this._processLoad(root);
		});
	}

	loadSync() {
		const root = this._load(routerTree.sync);
		return this._processLoad(root);
	}

	_load(loadFn) {
		// Get options
		const options = {
			defaultRouteClass: this.app.Route,
			context: this.app
		};
		copyProps(this, options, ['types', 'filterFiles', 'filterFolders', 'maxConcurrent']);

		// Load
		return loadFn(this.app.paths.routes, options);
	}

	_processLoad(root) {
		const {app} = this;
		app.root = root;
		app.routes = app.plugins.routes.flatten(root);
		return this;
	}
};
