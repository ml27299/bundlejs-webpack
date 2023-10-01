var glob = require("glob");
var path = require("path");
const { getOptions } = require("loader-utils");

module.exports = function (source) {
	const options = getOptions(this);
	const { appBundleName, exclude } = options;
	return `
export const routes = require.context(
	"./",
	true,
	/.*\\/@module($|\\/routes\\.(js))/
);
export const meta = require.context("./", true, /.*\\/@meta($|\\/.*\\.(js))/);
export const loadable = require.context("./", true, /\\.(loadable)\\.(js)$/);

${
	!exclude
		? `
export const serverModels = require.context(
	"./",
	true,
	/.*\\/@module($|\\/model\\.(js))/
);
export const serverConstants = require.context("./", true, /\\.(json)$/);
export const serverStyles = require.context("./", true, /\\.(styles)\\.(js)$/);
export const serverStores = require.context("./", true, /\\.(store)\\.(js)$/);

export const serverExtensions = require.context(
	"./",
	true,
	/@\\.(extension)\\.(js)$/
);
export const serverControllers = require.context(
	"./",
	true,
	/.*\\/@module($|\\/controller\\.(js))/
);
export const serverLibs = require.context(
	"./",
	true,
	/.*\\/@libs($|\\/.*\\.(js))/
);
`
		: ""
}
${source}
    `;
};
