import { defineConfig } from "tsup";

const features = ["internals", "di", "logs", "errors", "skeleton"];
export default defineConfig({
  entry: {
    index: "src/index.ts",
    ...Object.fromEntries(
      features.map((f) => [f + "/index", `src/features/${f}/index.ts`]),
    ),
  },
  format: ["cjs", "esm"],
  tsconfig: "./tsconfig.lib.json",
  dts: {
    compilerOptions: {
      composite: false,
      incremental: false,
      tsBuildInfoFile: null,
    },
  },
  minify: true,
  sourcemap: true,
  splitting: true,
  treeshake: true,
  clean: true,
  external: ["vitest"],
  outExtension({ format }) {
    return {
      js: format === "cjs" ? ".cjs" : ".js",
    };
  },
});
