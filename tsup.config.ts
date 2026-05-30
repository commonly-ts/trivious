import { defineConfig } from "tsup";

export default defineConfig({
	entry: ["src/**/*.ts"],
	format: ["esm"],
	bundle: false,
	dts: true,
	splitting: false,
	sourcemap: true,
	clean: true,
	minify: false,
	treeshake: false,
});
