const path = require("path");
const glob = require("glob");

function run({ rootComponentPath, appBundleName }) {
	const Routes = require("../routes")({ rootComponentPath, appBundleName });

	const bundleFiles = glob
		.sync(path.resolve(`**/${appBundleName}`))
		.map((filePath) => path.parse(filePath))
		.map(({ dir, ext, name }) => ({ path: dir, name: `${name}${ext}` }));

	const bundles = bundleFiles.map((file) => ({
		bundle_path: file.path.replace(path.resolve(), "").replace("/", ""),
		entry_name: file.path
			.replace(path.resolve(rootComponentPath), "")
			.replace("/", ""),
		entry_path: `${file.path}/${file.name}`,
	}));

	const childBundlePaths = [];
	const reactEntries = bundles.reduce((result, { entry_name, entry_path }) => {
		let hasParentBundle = false;
		let p = entry_name || ".";

		while (p !== ".") {
			p = path.dirname(p);
			hasParentBundle = !!bundles.find(
				({ entry_name: bp }) => (bp || ".") === p
			);
			if (hasParentBundle) {
				childBundlePaths.push(entry_path);
				break;
			}
		}

		if (!hasParentBundle) result[entry_name || "ROOT_BUNDLE"] = entry_path;
		return result;
	}, {});

	const overrideReactEntries = Routes.groups().reduce((result, routes) => {
		routes.forEach((route) => {
			if (!reactEntries[route.componentPath]) return;
			result[route.componentPath] = Array.from(
				new Set([
					...routes
						.map((route) => reactEntries[route.componentPath])
						.filter(Boolean)
						.sort(
							(a, b) =>
								~a.indexOf(route.componentPath) -
								~b.indexOf(route.componentPath)
						),
				])
			);
		});
		return result;
	}, {});

	Object.assign(reactEntries, overrideReactEntries);

	return {
		reactEntries,
		childBundlePaths,
		bundlePaths: bundles.map(({ bundle_path }) => bundle_path),
	};
}

module.exports = ({ appBundleName, rootComponentPath }) =>
	run({ appBundleName, rootComponentPath });
