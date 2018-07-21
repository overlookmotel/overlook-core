/* --------------------
 * Paths plugin
 * ------------------*/

'use strict';

// Modules
const pathJoin = require('path').join,
	{Plugin} = require('pluggi');

// Imports
const {forIn, isString} = require('./utils');

// Exports
module.exports = class Paths extends Plugin {
	init(app, paths) {
		// Conform paths
		forIn(paths, path => {
			if (path != null && !isString(path)) throw new Error('options.paths attributes must be strings');
		});

		// Record paths on app
		app.paths = paths;

		// Init default paths
		if (paths.root == null) paths.root = process.cwd();
		this.defaultPath('routes', 'routes');
	}

	/**
	 * Set a path on `app.paths`
	 * If path is absolute, it is added as is.
	 * If path is relative, it is added to existing path specified by `upon`
	 *
	 * @param {string} name - Path name
	 * @param {string} path - Path
	 * @param {string} [upon='root'] - Path to build path on top of
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
	 */
	defaultPath(name, path, upon) {
		if (this.app.paths[name] == null) this.setPath(name, path, upon);
		return this;
	}
};
