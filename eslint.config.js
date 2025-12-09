// eslint.config.js
import ts from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import prettier from "eslint-config-prettier";

export default [
	{
		files: ["src/**/*.ts"],
		languageOptions: {
			parser: tsParser,
			parserOptions: {
				project: "./tsconfig.json",
			},
		},
		plugins: {
			"@typescript-eslint": ts,
		},
		rules: {
			"no-unused-vars": "off",
			"@typescript-eslint/no-unused-vars": [
				"error",
				{ argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
			],
			"@typescript-eslint/no-explicit-any": "off",
			"@typescript-eslint/no-unnecessary-type-assertion": "error",
			"no-useless-return": "error",
			"quotes": ["error", "double", { avoidEscape: true, allowTemplateLiterals: true }],
			"semi": ["error", "always"],
			"linebreak-style": ["error", "unix"],
			"indent": "off",
			"@typescript-eslint/indent": "off",

			"@typescript-eslint/strict-boolean-expressions": "off",
			"@typescript-eslint/no-unnecessary-condition": "error",
			"no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
			"eqeqeq": ["error", "smart"],
		},
	},
	prettier,
];
