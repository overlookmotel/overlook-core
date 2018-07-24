/* --------------------
 * overlook-core module
 * ------------------*/

'use strict';

// Modules
const Pluggi = require('pluggi');

// Imports
const pathsPlugin = require('./plugins/paths'),
	rootPlugin = require('./plugins/root'),
	routesPlugin = require('./plugins/routes'),
	loadRoutesPlugin = require('./plugins/loadRoutes'),
	{isString, isObject} = require('./utils');

// Exports
class Overlook extends Pluggi {
	/**
	 * Constructor
	 * @param {Object|string} - Options object or path string
	 * @throws {Error} - If options not valid
	 */
	constructor(options) {
		// Conform options
		if (options == null) {
			options = {};
		} else if (isString(options)) {
			options = {paths: options};
		} else if (!isObject(options)) {
			throw new Error('options must be an object or path string');
		}

		// Conform paths option
		let {paths} = options;
		if (paths == null) {
			paths = options.paths = {};
		} else if (isString(paths)) {
			paths = options.paths = {root: paths};
		} else if (!isObject(paths)) {
			throw new Error('options.paths must be an object or path string');
		}

		// Call Pluggi constructor
		super(options);

		// Set plugin prefix
		this.plugins.plugins.addPrefix('overlook');
		this.plugins.plugins.prefixedOnly = true;

		// Attach core plugins
		this.plugin(pathsPlugin);
		this.plugin(rootPlugin);
		this.plugin(routesPlugin);
		this.plugin(loadRoutesPlugin);
	}
}

// Export Plugin class as static prop of Overlook
Overlook.Plugin = Pluggi.Plugin;

module.exports = Overlook;
