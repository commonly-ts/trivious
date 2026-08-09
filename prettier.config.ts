import type { Config } from "prettier";

const config: Config = {
	semi: true,
	singleQuote: false,
	quoteProps: "consistent",
	trailingComma: "es5",
	printWidth: 100,
	tabWidth: 2,
	useTabs: true,
	endOfLine: "lf",
	arrowParens: "always",
};

export default config;
