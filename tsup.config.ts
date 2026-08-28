import { defineConfig } from "tsup";

export default defineConfig({
	entry: {
		index: "src/index.ts",
		http: "src/http.ts",
		langchain: "src/langchain.ts",
		legacy: "src/legacy.ts",
		testing: "src/testing.ts",
	},
	format: ["esm", "cjs"],
	dts: true,
	sourcemap: true,
	clean: true,
	target: "es2022",
});
