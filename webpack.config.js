const webpack = require("@nativescript/webpack");

module.exports = (env) => {
	webpack.init(env);

	const apiBaseUrl = process.env.API_BASE_URL || env.API_BASE_URL || "";

	webpack.chainWebpack((config) => {
		config.plugin("DefinePlugin").tap((args) => {
			args[0] = {
				...args[0],
				__API_BASE_URL__: JSON.stringify(apiBaseUrl),
			};
			return args;
		});
	});

	// Learn how to customize:
	// https://docs.nativescript.org/webpack

	return webpack.resolveConfig();
};
