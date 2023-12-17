const path = require("path");
const fs = require("fs");
const FileWatcherPlugin = require("./libs/plugins/FileWatcherPlugin");
const getServerEntries = require("./getServerEntries");

class Queue {
	constructor() {
		this.queue = [];
		this.running = false;
	}
	add(fn, fnParams) {
		this.queue.push({ fn, fnParams });
		if (this.queue.length === 1) this.run();
	}
	run() {
		if (this.running || this.queue.length === 0) return;
		this.running = true;
		const { fn, fnParams } = this.queue[this.queue.length - 1];
		this.queue = [];
		fn(fnParams);
		if (this.queue.length) {
			this.running = false;
			this.run();
		} else {
			this.running = false;
		}
	}
}

const queue = new Queue();
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
			queue.add(refreshBundles, filePath);
		},
		onAddCallback: (filePath) => {
			queue.add(refreshBundles, filePath);
		},
		onUnlinkCallback: (filePath) => {
			queue.add(refreshBundles, filePath);
		},
		ignoreInitial: true,
		usePolling: false,
		ignored: "/node_modules/",
	});
}

module.exports = ({ appBundleName, rootComponentPath }) =>
	run({ appBundleName, rootComponentPath });
