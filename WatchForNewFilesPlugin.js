const path = require("path");
const fs = require("fs");
const FileWatcherPlugin = require("filewatcher-webpack-plugin");
const getServerEntries = require("./getServerEntries");

function run({ appBundleName, rootComponentPath }) {
	let { bundlePaths, ssrBundlePaths } = getServerEntries({
		appBundleName,
		rootComponentPath,
	});

	bundlePaths = bundlePaths
		.map((bundlePath) => path.dirname(bundlePath))
		.map((bundlePath) => bundlePath.replace(path.resolve() + "/", ""));
	ssrBundlePaths = ssrBundlePaths
		.map((bundlePath) => path.dirname(bundlePath))
		.map((bundlePath) => bundlePath.replace(path.resolve() + "/", ""));

	const refreshBundles = (filePath) => {
		const belongsTo = bundlePaths.filter(
			(bundlePath) => filePath.indexOf(bundlePath) === 0
		);
		for (const bundlePath of belongsTo) {
			const content = fs.readFileSync(
				`${path.resolve(bundlePath)}/${appBundleName}`,
				"utf8"
			);
			fs.writeFileSync(`${path.resolve(bundlePath)}/${appBundleName}`, content);
		}
	};

	return new FileWatcherPlugin({
		watchFileRegex: [path.resolve(`${rootComponentPath}/**`)],
		onChangeCallback: (filePath) => {
			if (filePath.indexOf("routes.js") === -1) return;
			refreshBundles(filePath);
		},
		onAddCallback: (filePath) => {
			refreshBundles(filePath);
		},
		onUnlinkCallback: (filePath) => {
			refreshBundles(filePath);
		},
		ignoreInitial: true,
		usePolling: false,
		ignored: "/node_modules/",
	});
}

module.exports = ({ appBundleName, rootComponentPath }) =>
	run({ appBundleName, rootComponentPath });
