/* --------------------
 * Paths plugin
 * ------------------*/

'use strict';

// Modules
const pathJoin = require('path').join,
	{Plugin} = require('pluggi');

// Imports
const {forIn, isString, deleteNullUndefined} = require('../utils');

// Exports
module.exports = class Paths extends Plugin {
	init(app, paths) {
		// Conform paths
		deleteNullUndefined(paths);
		forIn(paths, path => {
			if (!isString(path)) throw new Error('options.paths attributes must be strings');
		});

		// Record paths on app
		app.paths = paths;
	}

	/**
	 * Set a path on `app.paths`
	 * If path is absolute, it is added as is.
	 * If path is relative, it is added to existing path specified by `upon`
	 *
	 * @param {string} name - Path name
	 * @param {string} path - Path
	 * @param {string} [upon='root'] - Path to build path on top of
	 * @returns {Plugin} - This plugin
	 */
	setPath(name, path, upon) {
		if (typeof name != 'string') throw new Error('name must be a string');
		if (typeof path != 'string') throw new Error('path must be a string');

		if (upon == null) {
			upon = 'root';
		} else if (typeof upon != 'string') {
			throw new Error('upon must be a string');
		}

		const {paths} = this.app;
		if (path[0] != '/') path = pathJoin(paths[upon], path);

		paths[name] = path;

		return this;
	}

	/**
	 * Add a path to `app.paths` if not defined already
	 * @param {string} name - Path name
	 * @param {string} path - Path
	 * @param {string} [upon='root'] - Path to build path on top of
	 * @returns {Plugin} - This plugin
	 */
	defaultPath(name, path, upon) {
		if (this.app.paths[name] == null) this.setPath(name, path, upon);
		return this;
	}

	/**
	 * Add path method suitable for plugins
	 * Behavior required:
	 *   - If user provides `path` explicitly to plugin, want it to overwrite
	 *     existing path given to paths plugin
	 *   - If user does not provide path explicitly, only apply fallback
	 *     path if not defined already
	 *
 	 * @param {string} name - Path name
 	 * @param {string} [path] - Path
 	 * @param {string} [upon='root'] - Path to build path on top of
 	 * @param {string} defaultPath - Default path
	 * @param {string} [defaultUpon='root'] - Default `upon` option
 	 * @returns {Plugin} - This plugin
 	 */
 	setPathWithDefault(name, path, upon, defaultPath, defaultUpon) {
		if (path) return this.setPath(name, path, upon);
		return this.defaultPath(name, defaultPath, defaultUpon);
	}

	/**
	 * Get a full path from one of base paths + provided path parts
	 * @param {string} name - Base path name
	 * @param {string} [path] - Relative path (can provide multiple)
	 * @returns {string} - Absolute path
	 */
	getPath(name) {
		const path = this.app.paths[name];

		if (arguments.length == 0) return path;

		const parts = Array.prototype.slice.call(arguments);
		parts[0] = path;
		return pathJoin.apply(null, parts);
	}
};
