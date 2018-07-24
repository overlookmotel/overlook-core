/* --------------------
 * Utility functions
 * ------------------*/

'use strict';

// Modules
const _ = require('lodash');

// Exports
const utils = module.exports = {
	// Object methods
	forIn: (obj, fn) => _.forIn(obj, fn),

	mapValuesInPlace: (obj, fn) => {
		utils.forIn(obj, (value, name) => {
			obj[name] = fn(value, name, obj);
		});
		return obj;
	},

	copyProps: (from, to, props) => {
		props.forEach(prop => to[prop] = from[prop]);
	},

	deleteNullUndefined: (obj) => {
		utils.forIn(obj, (value, key) => {
			if (value == null) delete obj[key];
		});
	},

	// Array methods
	pushArray: (arr, values) => {
		arr.push.apply(arr, values);
		return arr;
	},

	// Is type methods
	isArray: (arr) => Array.isArray(arr),
	isString: (str) => typeof str == 'string',
	isObject: (obj) => obj != null && typeof obj == 'object'
};
