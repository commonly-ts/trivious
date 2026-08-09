import js from "@eslint/js";
import { defineConfig } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig([
	{
		files: ["**/*.{mjs,cjs,ts,mts,cts}"],
		ignores: ["lib/**", "node_modules/**", "dist/**", ".d.ts", "old/**/*"],
		plugins: { js },
		extends: ["js/recommended"],
		languageOptions: { globals: globals.browser },
	},
	tseslint.configs.recommended,
	tseslint.configs.strict,
	tseslint.configs.stylistic,
]);
