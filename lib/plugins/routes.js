/* --------------------
 * Routes plugin
 * ------------------*/

'use strict';

// Modules
const routerTree = require('router-tree'),
	{Plugin} = require('pluggi'),
	coClass = require('co-class');

// Imports
const {
	mapValuesFilter, copyProps, pushArrayDedup, cloneArray,
	isString, isArray, isObject
} = require('../utils');

// Exports
module.exports = coClass(class Routes extends Plugin {
	/**
	 * Init plugin
	 * `exts` option takes precedence over `types` option
	 *
	 * @param {Overlook} app
	 * @param {Object} options
	 * @param {string} [options.path] - Routes directory
	 * @param {string} [options.upon] - Routes directory relative to path
	 * @param {Object} [options.types] - Types object
	 * @param {string|Array[string]} [options.exts] - Exts for route files
	 * @param {Function|RegExp} [options.filterFiles]
	 * @param {Function|RegExp} [options.filterFolders]
	 * @param {integer} [options.maxConcurrent]
	 * @returns {undefined}
	 */
	init(app, options) {
		// Process `path` option
		app.plugins.paths.setPathWithDefault('routes', options.path, options.upon, 'routes');

		// Conform `types` option
		let {types} = options;
		if (types == null) {
			types = {};
		} else if (isObject(types)) {
			types = mapValuesFilter(types, exts => {
				// Conform exts to array
				if (exts == null) return undefined; // Remove null/undefined props
				exts = this.conformExts(exts);
				if (!exts) throw new Error('options.types attributes must be strings or arrays of strings');
				return exts;
			});
		} else {
			throw new Error('options.types must be an object if defined');
		}

		this.types = types;

		// Conform `exts` option
		// Default for route type is 'js'
		this.exts = this.setExtsWithDefault('route', options.exts, 'js');

		// Save other options to plugin
		copyProps(options, this, ['filterFiles', 'filterFolders', 'maxConcurrent']);

		// Save Route class on app.
		// Subclass so it's specific to this app, in case user mutates it
		// instead of subclassing.
		app.Route = class Route extends routerTree.Route {};

		// Save routerTree to `app.plugins.routes.routerTree`
		this.routerTree = routerTree;
	}

	/*
	 * Load routes from path `app.paths.routes` using `router-tree` module
	 */
	*load() {
		const {app} = this;
		const options = {
			defaultRouteClass: app.Route,
			context: app
		};
		copyProps(this, options, ['types', 'filterFiles', 'filterFolders', 'maxConcurrent']);

		const root = yield routerTree(app.paths.routes, options);
		app.root = root;
		app.routes = this.flatten(root);

		return this;
	}

	/*
	 * Exts methods
	 */

	/**
	 * Set exts for type.
	 * @param {string} type - Type name
	 * @param {string|Array} exts - File extensions for type
	 * @returns {Array} - Extensions array
	 */
	setExts(type, exts) {
		if (!isString(type)) throw new Error('type must be a string');

		// Conform exts to array
		exts = this.conformExts(exts);
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
		exts = this.conformExts(exts);
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
		exts = this.conformExts(exts);
		if (!exts) throw new Error('exts must be a string or array of strings');

		// Save to types
		const {types} = this;
		if (!types[type]) {
			types[type] = exts;
		} else {
			pushArrayDedup(types[type], exts);
		}

		// Return exts
		return exts;
	}

	/**
	 * Conform `exts` to array of strings
	 * If `exts` is an array, it is cloned.
	 * If cannot conform, returns null.
	 *
	 * @param {*} exts - Input
	 * @returns {Array[string]|null} - Array of strings or null if could not be conformed
	 */
	conformExts(exts) {
		if (isString(exts)) return [exts];
		if (!isArray(exts)) return null;
		if (exts.length == 0) return [];
		if (exts.some(ext => !isString(ext))) return null;
		return cloneArray(exts);
	}

	/*
	 * Route tree manipulation utility methods
	 */
	traverse(fn) {
		return routerTree.traverse(this.app.root, fn);
	}

	flatten() {
		return routerTree.flatten(this.app.root);
	}
});
