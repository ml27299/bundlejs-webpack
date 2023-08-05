var glob = require("glob");
var path = require("path");

module.exports = function (source) {
	this.cacheable();
	var regex = /[@]?import\(?.((\w+) +from )?([\'\"])(.*)\3\)?/gm;
	var importModules = /import +(\w+) +from +([\'\"])(.*?)\2/gm;
	var importDynamicModules = /import(\()+.*/gm;
	var importFiles = /import +([\'\"])(.*?)\1/gm;
	var importSass = /@import +([\'\"])(.*?)\1/gm;
	var resourceDir = path.dirname(this.resourcePath);
	const replacer = (...args) => {
		const [match, leftSide, obj, quote, filename] = args;
		var modules = [];
		var withModules = false;
		if (!glob.hasMagic(filename)) return match;
		const files = glob.sync(filename, {
			cwd: resourceDir,
		});
		var result = files
			.map(function (file, index) {
				var fileName = quote + file + quote;
				if (match.match(importSass)) {
					return "@import " + fileName;
				} else if (match.match(importModules)) {
					var moduleName = obj + index;
					modules.push(moduleName);
					withModules = true;
					return "import * as " + moduleName + " from " + fileName;
				} else if (match.match(importFiles)) {
					return "import " + fileName;
				}
			})
			.join("; ");

		const dynamicResult = files
			.map((file) => {
				var fileName = quote + file + quote;
				if (match.match(importDynamicModules)) {
					return `{value: () => import(/* webpackPreload: true */ ${fileName}), path: ${fileName}}`;
				}
			})
			.join(", ");

		if (!!dynamicResult) {
			return `[${dynamicResult}]`;
		}
		if (result && withModules) {
			result += "; let " + obj + " = [" + modules.join(", ") + "]";
			return result;
		}

		return match.match(importDynamicModules) ? "[]" : result;
	};
	var res = source.replace(regex, replacer);
	return res;
};
