const path = require("path");
const fs = require("fs");
const Routes = require("./libs/routes");

const WebpackBeforeBuildPlugin = require("before-build-webpack");

class RouteMapPlugin extends WebpackBeforeBuildPlugin {
	constructor({ rootComponentPath, appBundleName }) {
		super(function (stats, callback) {
			const Routes = require("./libs/routes")({
				rootComponentPath,
				appBundleName,
			});
			const map = Routes.groups()
				.flat()
				.reduce((result, route) => {
					Routes.reset(`${route.file.path}/${route.file.name}`);

					if (!result[route.path]) result[route.path] = {};
					const filePath = route.file.path
						.replace(path.resolve(), "")
						.split("/");
					filePath.pop();

					result[route.path].location = filePath.join("/");
					result[route.path].component = route.component;
					result[route.path].middleware = route.middleware;

					if (result[route.path].ssr !== "isomorphic") {
						if (result[route.path].ssr === undefined) {
							result[route.path].ssr = route.ssr === true;
						} else if (result[route.path].ssr !== (route.ssr === true)) {
							result[route.path].ssr = "isomorphic";
						}
					}

					return result;
				}, {});

			fs.writeFileSync("./routes.json", JSON.stringify(map, null, 4));
			callback();
		});
	}

	// apply(compiler) {
	//     compiler.hooks.watchRun.tap('WatchRun', (comp) => {
	//         if (comp.modifiedFiles) {
	//             const changedFiles = Array.from(comp.modifiedFiles, (file) => `\n  ${file}`).join('');
	//             console.log('===============================');
	//             console.log('FILES CHANGED:', changedFiles);
	//             console.log('===============================');
	//         }
	//     });
	// }
}

module.exports = RouteMapPlugin;
