/* --------------------
 * Paths plugin
 * ------------------*/

'use strict';

// Modules
const pathJoin = require('path').join;

// Imports
const {forIn, isString} = require('./utils');

// Exports
module.exports = function paths(app, paths) {
	// Conform paths option
	forIn(paths, path => {
		if (path != null && !isString(path)) throw new Error('options.paths attributes must be strings');
	});

	// Init default paths
	if (paths.root == null) paths.root = process.cwd();
	if (paths.routes == null) paths.routes = pathJoin(paths.root, 'routes');

	// Record paths on app
	app.paths = paths;
	app.options.paths = paths;

	// Return `addPath()` method
	return {
		addPath: addPath.bind(null, app)
	};
};

/**
 * Add a path to `app.paths`
 * If path is absolute, it is added as is.
 * If path is relative, it is added to existing path specified by `upon`
 *
 * @param {Overlook} app
 * @param {string} name - Path name
 * @param {string} path - Path
 * @param {string} [upon='root'] - Path to build path on top of
 */
function addPath(app, name, path, upon) {
	if (typeof name != 'string') throw new Error('name must be a string');
	if (typeof path != 'string') throw new Error('path must be a string');

	if (upon == null) {
		upon = 'root';
	} else if (typeof upon != 'string') {
		throw new Error('upon must be a string');
	}

	const {paths} = app;
	if (path[0] != '/') path = pathJoin(paths[upon], path);

	paths[name] = path;
}
