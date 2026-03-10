import eslint from "@eslint/js";
import prettier from "eslint-config-prettier";
import importPlugin from "eslint-plugin-import";
import prettierPlugin from "eslint-plugin-prettier";
import tseslint from "typescript-eslint";

export default tseslint.config(
	{
		ignores: ["dist/**", "node_modules/**", "*.min.js", "*.d.ts", "coverage/**"],
	},

	eslint.configs.recommended,
	...tseslint.configs.recommended,

	prettier,
	{
		plugins: {
			prettier: prettierPlugin,
			import: importPlugin,
		},

		rules: {
			"prettier/prettier": "error",

			"quotes": "off",
			"semi": "off",
			"indent": "off",
			"@typescript-eslint/indent": "off",

			"no-unused-vars": "off",
			"@typescript-eslint/no-unused-vars": [
				"error",
				{ argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
			],

			"@typescript-eslint/no-explicit-any": "off",
			"@typescript-eslint/no-unnecessary-type-assertion": "error",

			"no-useless-return": "error",

			"no-console": process.env.NODE_ENV === "production" ? "warn" : "off",

			"import/no-restricted-paths": [
				"error",
				{
					zones: [
						{
							target: "./src",
							from: "./src/shared/typings",
							except: ["./src/shared/typings/index.ts"],
						},
					],
				},
			],
			"import/order": ["warn", { "newlines-between": "always-and-inside-groups" }],
			"import/no-duplicates": "error",
			"import/first": "error",
			"import/newline-after-import": "error",
		},
	},

	{
		files: ["src/**/*.ts", "src/**/*.tsx"],
		languageOptions: {
			parserOptions: {
				project: "./tsconfig.json",
				tsconfigRootDir: import.meta.dirname,
			},
		},
	}
);
