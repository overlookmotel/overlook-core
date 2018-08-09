/* --------------------
 * Start plugin
 * Creates `.start()` method
 * ------------------*/

'use strict';

// Modules
const {Plugin} = require('pluggi'),
	tapable = require('tapable'),
	coClass = require('co-class');

// Exports
module.exports = coClass(class Start extends Plugin {
	init(app) {
		// Define `app.start()`
		app.start = () => this.start();

		// Define hooks
		this.hooks = {
			before: new tapable.AsyncSeriesHook(),
			after: new tapable.AsyncSeriesHook()
		};
	}

	*start() {
		// `before` hook
		const {hooks} = this;
		yield hooks.before.promise();

		// Load routes
		yield this.app.plugins.routes.load();

		// `after` hook
		yield hooks.after.promise();
	}
});
