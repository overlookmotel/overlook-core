/* --------------------
 * Route-loading plugin
 * ------------------*/

'use strict';

// Modules
const routerTree = require('router-tree'),
	{Plugin} = require('pluggi');

// Imports
const {
	mapValuesInPlace, copyProps, deleteNullUndefined, pushArray,
	isString, isArray, isObject
} = require('../utils');

// Exports
module.exports = class LoadRoutes extends Plugin {
	init(app, options) {
		// Conform options
		let {types} = options;
		if (types == null) {
			types = {};
		} else if (isObject(types)) {
			deleteNullUndefined(types);

			mapValuesInPlace(types, exts => {
				// Conform exts to array
				exts = conformExts(exts);
				if (!exts) throw new Error('options.types attributes must be strings or arrays of strings');
				return exts;
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

	/*
	 * Load routes from path `app.paths.routes` using `router-tree` module
	 */
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

	/**
	 * Set exts for type.
	 * @param {string} type - Type name
	 * @param {string|Array} exts - File extensions for type
	 * @returns {Array} - Extensions array
	 */
	setExts(type, exts) {
		if (!isString(type)) throw new Error('type must be a string');

		// Conform exts to array
		exts = conformExts(exts);
		if (!exts) throw new Error('exts must be a string or array of strings');

		// Save to types
		this._setExts(type, exts);

		// Return exts
		return exts;
	}

	_setExts(type, exts) {
		this.types[type] = exts;
		return exts;
	}

	/**
	 * Set exts for type if not already defined.
	 * @param {string} type - Type name
	 * @param {string|Array} exts - File extensions for type
	 * @returns {Array} - Extensions array
	 */
	defaultExts(type, exts) {
		if (!isString(type)) throw new Error('type must be a string');

		// Conform exts to array
		exts = conformExts(exts);
		if (!exts) throw new Error('exts must be a string or array of strings');

		// Save to types unless already defined
		const currentExts = this.types[type];
		if (!currentExts) return this._setExts(type, exts);
		return currentExts;
	}

	/**
	 * Set exts for type if not already defined with default.
	 * Exts is set from one of following sources, in priority order:
	 *   1. `exts`
	 *   2. Existing exts defined in `.types` option
	 *   3. `defaultExts`
	 *
	 * @param {string} type - Type name
	 * @param {string|Array} [exts] - File extensions for type
	 * @param {string|Array} defaultExts - Default file extensions for type
	 * @returns {Array} - Extensions array
	 */
	setExtsWithDefault(type, exts, defaultExts) {
		if (exts != null) return this.setExts(type, exts);
		return this.defaultExts(type, defaultExts);
	}

	/**
	 * Add exts for type.
	 * @param {string} type - Type name
	 * @param {string|Array} exts - File extensions for type
	 * @returns {Array} - Extensions array
	 */
	addExts(type, exts) {
		if (!isString(type)) throw new Error('type must be a string');

		// Conform exts to array
		exts = conformExts(exts);
		if (!exts) throw new Error('exts must be a string or array of strings');

		// Save to types
		const {types} = this;
		if (!types[type]) {
			types[type] = exts;
		} else {
			pushArray(types[type], exts);
		}

		// Return exts
		return exts;
	}
};

/**
 * Conform `exts` to array of strings
 * If cannot conform, returns null.
 *
 * @param {*} exts - Input
 * @returns {Array[string]|null} - Array of strings or null if could not be conformed
 */
function conformExts(exts) {
	if (isString(exts)) return [exts];
	if (!isArray(exts)) return null;
	if (exts.length == 0) return exts;
	if (exts.some(ext => !isString(ext))) return null;
	return exts;
}