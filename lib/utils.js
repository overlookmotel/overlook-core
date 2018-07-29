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

	cloneObj: obj => Object.assign({}, obj),

	mapValuesFilter: (obj, fn) => {
		const out = {};
		utils.forIn(obj, (value, key) => {
			value = fn(value, key, obj);
			if (value !== undefined) out[key] = value;
		});
		return out;
	},

	copyProps: (from, to, props) => {
		props.forEach(prop => to[prop] = from[prop]);
	},

	deleteNullUndefined: obj => {
		utils.forIn(obj, (value, key) => {
			if (value == null) delete obj[key];
		});
	},

	// Array methods
	pushArray: (arr, values) => {
		arr.push.apply(arr, values);
		return arr;
	},

	pushDedup: (arr, value) => {
		if (!arr.includes(value)) arr.push(value);
		return arr;
	},

	pushArrayDedup: (arr, values) => {
		for (let value of values) {
			utils.pushDedup(arr, value);
		}
		return arr;
	},

	cloneArray: arr => arr.concat(),

	// Is type methods
	isArray: arr => Array.isArray(arr),
	isString: str => typeof str == 'string',
	isObject: obj => obj != null && typeof obj == 'object'
};
