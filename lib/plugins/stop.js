/* --------------------
 * Stop plugin
 * Creates `.stop()` method
 * ------------------*/

'use strict';

// Modules
const {Plugin} = require('pluggi'),
	tapable = require('tapable'),
	coClass = require('co-class');

// Exports
module.exports = coClass(class Stop extends Plugin {
	init(app) {
		// Define `app.stop()`
		app.stop = () => this.stop();

		// Define hooks
		this.hooks = {
			before: new tapable.AsyncSeriesHook()
		};
	}

	*stop() {
		// `before` hook
		const {hooks} = this;
		yield hooks.before.promise();
	}
});
