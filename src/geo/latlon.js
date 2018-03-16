// @flow
"use strict";

/**
 * A `LatLon` object represents a given latitude and longitude coordinates.
 *
 * @param {number} lat Latitude, measured in degrees.
 * @param {number} lon Longitude, measured in degrees.
 * @example
 * var ll = new LatLon(42.10376, 1.84584);
 */
class LatLon {

	lat: number;
	lon: number;

	constructor(lat: number, lon: number) {

		const areNumbers = !(isNaN(lat) || isNaN(lon));
		if (areNumbers) {

			this.lat = +lat;
			this.lon = +lon;

			const validRange = this.lat > -90 && this.lat < 90 &&
				this.lon > -180 && this.lon < 180;

			if (!validRange) {

				throw new Error("Invalid LatLon value: Latitude must be between -90 and 90 and Longitude must be between -180 and 180");

			}

		} else {

			throw new Error(`Invalid LatLon object: (${lat}, ${lon})`);

		}

	}

	/**
	 * Set the latitude
	 *
	 * @param {number} lat
	 * @returns {LatLon} `this`
	 */
	setLatitude(lat: number) {

		this.lat = lat;
		return this;

	}

	/**
	 * Set the longitude
	 *
	 * @param {number} lon
	 * @returns {LatLon} `this`
	 */
	setLongitude(lon: number) {

		this.lon = lon;
		return this;

	}

	/**
	 * Returns the LatLon object as a string.
	 *
	 * @returns {string} The coordinates as a string in the format `'LatLon(lat, lng)'`.
	 * @example
	 * var ll = new LatLon(42.10376, 1.84584);
	 * ll.toString(); //"LatLon(42.10376, 1.84584)"
	 */
	toString() {

		return `LatLon(${this.lat}, ${this.lon})`;

	}

}

module.exports = LatLon;
