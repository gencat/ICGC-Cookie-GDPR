// @flow
"use strict";

const version: string = require("../package.json").version;
const LatLon = require("./geo/latlon");
const LatLonBounds = require("./geo/latlonBounds");

module.exports = {
	version,
	LatLon,
	LatLonBounds
};

/**
 * The version of the project in use as specified in `package.json`,
 * `CHANGELOG.md`, and the GitHub release.
 *
 * @var {string} version
 */
