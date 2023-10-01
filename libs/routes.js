const path = require("path");
const glob = require("glob");

require = require("esm")(module);

function run({ appBundleName, rootComponentPath }) {
	const files = glob
		.sync(path.resolve(`${rootComponentPath}/**/*`))
		.map((filePath) => path.parse(filePath));

	function findRootPath(filePath) {
		return filePath
			.replace(`${path.resolve(rootComponentPath)}/`, "")
			.replace("/@module", "");
	}

	function findBundlePaths(filePath) {
		const exact = files
			.filter(({ name }) => name === path.parse(appBundleName).name)
			.find(({ dir }) => filePath === `${dir}/@module`);
		return [
			exact && exact.dir + `/${appBundleName}`,
			(
				files
					.filter(({ dir }) => filePath.indexOf(`${dir}/`) === 0)
					.filter(({ name }) => name === path.parse(appBundleName).name)
					.sort((a, b) => a.dir.split("/").length - b.dir.split("/").length)
					.shift() || {}
			).dir + `/${appBundleName}`,
		].filter(Boolean);
	}

	const routeFiles = files
		.filter(({ name }) => name === "routes")
		.map(({ dir, ext, name }) => ({ path: dir, name: `${name}${ext}` }));

	const routeGroups = routeFiles
		.map((file) =>
			require(`${file.path}/${file.name}`)
				.default?.map((route) => Object.assign(route, { file }))
				.map((route) => {
					return Object.assign(route, {
						componentPath: route.componentPath || findRootPath(file.path),
						ssr: route.ssr || route.seo,
						bundlePaths: findBundlePaths(file.path),
					});
				})
		)
		.filter(Boolean);

	return {
		reset(filePath) {
			delete require.cache[require.resolve(filePath)];
			return require(filePath).default;
		},
		groups() {
			return routeGroups;
		},
	};
}

module.exports = ({ appBundleName, rootComponentPath }) =>
	run({ appBundleName, rootComponentPath });
