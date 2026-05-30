import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		globals: true,
		environment: "node",
		coverage: {
			provider: "v8",
			reporter: ["text", "json", "html"],
			include: ["**/*.{test,spec}.ts"],
			exclude: ["**/*.d.ts", "**/node_modules/**", "dist/**"],
		},
	},
	resolve: { tsconfigPaths: true },
});
