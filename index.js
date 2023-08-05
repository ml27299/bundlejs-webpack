// const { reactEntries, childBundlePaths } = require("./libs/entries/react");
// const {
// 	serverEntries,
// 	nonSsrBundlePaths,
// 	nonSsrComponentPaths,
// } = require("./libs/entries/server");

const BundleJSWebPackPlugin = require("./BundleJSWebPackPlugin");
const RouteMapPlugin = require("./RouteMapPlugin");

const getReactEntries = require("./getReactEntries");
const getServerEntries = require("./getServerEntries");

// const { PAGE_BUNDLE_PATH } = process.env;

// if (PAGE_BUNDLE_PATH) {
// 	const groups = route
// 		.groups()
// 		.filter((routes) =>
// 			routes.find((route) =>
// 				PAGE_BUNDLE_PATH.split(",").includes(route.componentPath)
// 			)
// 		);
// 	const componentPaths = Array.from(
// 		new Set(
// 			groups.map((routes) => routes.map((route) => route.componentPath)).flat()
// 		)
// 	);
// 	if (componentPaths.length > 0)
// 		entries = componentPaths.reduce(
// 			(result, componentPath) =>
// 				Object.assign(result, {
// 					[componentPath]:
// 						reactEntries[componentPath] ||
// 						childBundlePaths.find((p) => ~p.indexOf(`/${componentPath}/`)),
// 				}),
// 			{}
// 		);
// } else {
// 	entries = reactEntries;
// }

module.exports = {
	BundleJSWebPackPlugin,
	RouteMapPlugin,
	getReactEntries,
	getServerEntries,
};
