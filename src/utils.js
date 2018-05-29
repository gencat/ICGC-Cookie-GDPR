// @flow
"use strict";

class Utils {

	static escapeRegExp(str: String) {

		return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");

	}

	static hasClass(element: Object, selector: String) {

		const s = " ";
		const classFound = (s + element.className + s).replace(/[\n\t]/g, s).indexOf(s + selector + s) >= 0;
		// eslint-disable-next-line no-undef
		return element.nodeType === Node.ELEMENT_NODE && classFound;

	}

	static addClass(element: Object, className: String) {

		element.className += ` ${className}`;

	}

	static removeClass(element: Object, className: String) {

		const regex = new RegExp(`\\b${Utils.escapeRegExp(className)}\\b`);
		element.className = element.className.replace(regex, "");

	}

	static interpolateString(str: String, callback: Function) {

		const marker = /{{([a-z][a-z0-9\-_]*)}}/ig;
		return str.replace(marker, function() {

			return callback(arguments[1]) || "";

		});

	}

	// only used for hashing json objects (used for hash mapping palette objects, used when custom colours are passed through JavaScript)
	static hash(str: String) {

		let hash = 0,
			i, chr, len;
		if (str.length === 0) {

			return hash;

		}
		for (i = 0, len = str.length; i < len; ++i) {

			chr = str.charCodeAt(i);
			hash = ((hash << 5) - hash) + chr;
			hash |= 0;

		}
		return hash;

	}

	static normaliseHex(hex: String) {

		if (hex[0] === "#") {

			hex = hex.substr(1);

		}
		if (hex.length === 3) {

			hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];

		}
		return hex;

	}

	// used to get text colors if not set
	static getContrast(hex: String) {

		hex = Utils.normaliseHex(hex);
		const r = parseInt(hex.substr(0, 2), 16);
		const g = parseInt(hex.substr(2, 2), 16);
		const b = parseInt(hex.substr(4, 2), 16);
		const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
		return (yiq >= 128) ? "#000" : "#fff";

	}

	// used to change color on highlight
	static getLuminance(hex: String) {

		const num = parseInt(Utils.normaliseHex(hex), 16),
			amt = 38,
			R = (num >> 16) + amt,
			B = (num >> 8 & 0x00FF) + amt,
			G = (num & 0x0000FF) + amt;
		const newColour = (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 + (B < 255 ? B < 1 ? 0 : B : 255) * 0x100 + (G < 255 ? G < 1 ? 0 : G : 255)).toString(16).slice(1);
		return `#${newColour}`;

	}

	static getHoverColour(hex: String) {

		hex = Utils.normaliseHex(hex);
		// for black buttons
		if (hex === "000000") {

			return "#222";

		}
		return Utils.getLuminance(hex);

	}

	static isMobile(userAgent: String) {

		return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);

	}

	static isPlainObject(obj: Object) {

		// The code "typeof obj === 'object' && obj !== null" allows Array objects
		return typeof obj === "object" && obj !== null && obj.constructor === Object;

	}

	static arrayContainsMatches(array: Array, search: String) {

		for (let i = 0, l = array.length; i < l; ++i) {

			const str = array[i];
			// if regex matches or string is equal, return true
			if ((str instanceof RegExp && str.test(search)) ||
			(typeof str == "string" && str.length && str === search)) {

				return true;

			}

		}
		return false;

	}

	/**
	 * Merges all the enumerable properties of source objects into the target
	 * object. Subobjects are also merged
	 *
	 * @param {Object} target The target object
	 * @param {Object} sources A list of source objects
	 * @returns {Object} The target object
	 */
	// eslint-disable-next-line no-unused-vars
	static deepMerge(target: Object, ...sources: Object) {

		let newObj = target;
		// arguments is not an Array, it's Array-like!
		const newSources = Array.prototype.slice.call(arguments, 1);

		newSources.forEach((source) => {

			newObj = Utils.singleDeepMerge(newObj, source);

		});

		return newObj;

	}

	/**
	 * Merges all the enumerable properties of a source objects into the target
	 * object. Subobjects are also merged
	 *
	 * @param {Object} target The target object
	 * @param {Object} source The source object to merge
	 * @returns {Object} The target object
	 */
	static singleDeepMerge(target: Object, source: Object) {

		for (const prop in source) {

			// Check if it's an enumerable property so we don't
			// overwrite properties like length or functions
			if (source.propertyIsEnumerable(prop)) {

				let sourceValue = source[prop];
				let targetValue = target[prop];

				if (!targetValue) {

					targetValue = {};

				}

				if (Array.isArray(sourceValue)) {

					sourceValue = sourceValue.slice(0);

				} else if (typeof sourceValue === "object" && !Array.isArray(targetValue)) {

					sourceValue = Utils.singleDeepMerge(targetValue, sourceValue);

				} else if (typeof sourceValue === "object" && Array.isArray(targetValue)) {

					sourceValue = Utils.singleDeepMerge({}, sourceValue);

				}

				target[prop] = sourceValue;

			}

		}
		return target;

	}

}

module.exports = Utils;
