const path = require("path");

module.exports = ({ rootComponentPath, appBundleName, serverEntries }) => {
	const Routes = require("../routes")({ rootComponentPath, appBundleName });
	return {
		serverEntries,
		nonSsrBundlePaths: [
			...new Set(
				Routes.groups()
					.filter((routes) => !routes.find((route) => !!route.ssr))
					.flat()
					.map((route) => route.bundlePaths)
					.flat()
			),
		],
		ssrBundlePaths: [
			...new Set(
				Routes.groups()
					.filter((routes) => !!routes.find((route) => !!route.ssr))
					.flat()
					.map((route) => route.bundlePaths)
					.flat()
			),
		],
		bundlePaths: [
			...new Set(
				Routes.groups()
					.flat()
					.map((route) => route.bundlePaths)
					.flat()
			),
		],
		nonSsrComponentPaths: [
			...new Set(
				Routes.groups()
					.filter((routes) => !routes.find((route) => !!route.ssr))
					.flat()
					.map((route) =>
						route.bundlePaths.map(
							(bundlePath) =>
								`${path.dirname(bundlePath)}/${route.componentPath}/${
									route.component
								}.component.js`
						)
					)
					.flat()
			),
		],
	};
};
