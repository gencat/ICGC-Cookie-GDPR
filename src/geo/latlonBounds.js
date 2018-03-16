// @flow
"use strict";

const LatLon = require("./latlon");

/**
 * A `LatLonBounds` represents a geographical bounding box,
 * defined by its SW and NE points in latitude and longitude.
 *
 * @param {LatLon} sw The SW corner of the bounding box.
 * @param {LatLon} ne The NE corner of the bounding box.
 * @example
 * var sw = new LatLon(40.513799, 0.159352);
 * var ne = new LatLon(42.90816, 3.317178);
 * var llb = new LatLonBounds(sw, ne);
 */
class LatLonBounds {

	ne: LatLon;
	sw: LatLon;

	constructor(sw: LatLon, ne: LatLon) {

		this.setNorthEastCorner(ne);
		this.setSouthWestCorner(sw);

	}

	/**
	 * Set the northeast corner of the bounding box
	 *
	 * @param {LatLon} ne
	 * @returns {LatLonBounds} `this`
	 */
	setNorthEastCorner(ne: LatLon) {

		this.ne = ne;
		return this;

	}

	/**
	 * Set the southwest corner of the bounding box
	 *
	 * @param {LatLon} sw
	 * @returns {LatLonBounds} `this`
	 */
	setSouthWestCorner(sw: LatLon) {

		this.sw = sw;
		return this;

	}

	/**
	 * Returns the center of the bounding box defined by these bounds
	 *
	 * @returns {LatLon} The bounding box's center.
	 * @example
	 * var llb = new LatLonBounds([-73.9876, 40.7661], [-73.9397, 40.8002]);
	 * llb.getCenter(); //LatLon {lat: 40.78315, lon: -73.96365 }
	 */
	getCenter(): LatLon {

		return new LatLon((this.sw.lat + this.ne.lat) / 2, (this.sw.lon + this.ne.lon) / 2);

	}

	/**
	 * Returns the southwest corner
	 *
	 * @returns {LatLon} The southwest corner of the bounding box.
	 */
	getSouthWest(): LatLon {

		return this.sw;

	}

	/**
	* Returns the northeast corner
	*
	* @returns {LatLon} The northeast corner of the bounding box.
	 */
	getNorthEast(): LatLon {

		return this.ne;

	}

}

module.exports = LatLonBounds;
