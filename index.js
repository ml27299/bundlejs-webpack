const BundleJSWebPackPlugin = require("./BundleJSWebPackPlugin");
const WatchForNewFilesPlugin = require("./WatchForNewFilesPlugin");
const RouteMapPlugin = require("./RouteMapPlugin");

const getReactEntries = require("./getReactEntries");
const getServerEntries = require("./getServerEntries");

module.exports = {
	BundleJSWebPackPlugin,
	WatchForNewFilesPlugin,
	RouteMapPlugin,
	getReactEntries,
	getServerEntries,
};
