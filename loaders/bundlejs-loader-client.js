var glob = require("glob");
var path = require("path");
const { getOptions } = require("loader-utils");

module.exports = function (source) {
	const options = getOptions(this);
	const { appBundleName, isRoot } = options;

	return `
import BundleJs from "@bundlejs/core";
export const routes = require.context(
	"./",
	true,
	/.*\\/@module($|\\/routes\\.(js))/
);
export const controllers = import("./**/@module/controller.js");
export const models = import("./**/@module/model.js");
export const libs = import("./**/@libs/*.js");
export const styles = import("./**/*.styles.js");
export const constants = import("./**/@constants/**/*.json");
export const loadable = require.context("./", true, /\\.(loadable)\\.(js)$/);
export const stores = import("./**/*.store.js");
export const extensions = import("./**/@.extension.js");
export const background = require.context("./", true, /\\.(background)\\.(js)$/);

${
	isRoot
		? `export default new BundleJs(require.context("./", true, /\.bundle\.(js)$/), ${JSON.stringify(
				options
		  )});`
		: ""
}
	
${source}
    `;
};
