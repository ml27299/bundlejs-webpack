const path = require("path");
const getServerEntries = require("./getServerEntries");
const getReactEntries = require("./getReactEntries");

escapeStringRegExp.matchOperatorsRe = /[|\\{}()[\]^$+*?.]/g;
function escapeStringRegExp(str) {
	return str.replace(escapeStringRegExp.matchOperatorsRe, "\\$&");
}

class BundleJSWebPackPlugin {
	constructor(options = {}) {
		this.options = options;
		const { reactEntries } = getReactEntries(this.options);
		this.reactEntries = reactEntries;
	}

	apply(compiler) {
		compiler.hooks.compilation.tap("BundleJSWebPackPlugin", (compilation) => {
			const { nonSsrBundlePaths } = getServerEntries(this.options);
			compilation.hooks.normalModuleLoader.tap(
				"BundleJSWebPackPlugin",
				(loaderContext, module) => {
					const { appBundleName } = this.options;
					if (
						new RegExp(escapeStringRegExp(appBundleName)).test(module.resource)
					) {
						module.loaders = [
							{
								loader: path.resolve(
									__dirname,
									"./loaders/glob-dynamic-import.js"
								),
								options: {},
							},
							this.options.server
								? {
										loader: path.resolve(
											__dirname,
											"./loaders/bundlejs-loader-server.js"
										),
										options: {
											...this.options,
											v: Object.values(this.reactEntries)
												.flat()
												.concat(nonSsrBundlePaths),
											r: module.resource,
											exclude: Object.values(this.reactEntries)
												.flat()
												.concat(nonSsrBundlePaths)
												.includes(module.resource),
										},
								  }
								: {
										loader: path.resolve(
											__dirname,
											"./loaders/bundlejs-loader-client.js"
										),
										options: {
											...this.options,
											isRoot: Object.values(this.reactEntries)
												.flat()
												.includes(module.resource),
										},
								  },
							...module.loaders,
						];
					}
				}
			);
		});
	}
}

module.exports = BundleJSWebPackPlugin;
