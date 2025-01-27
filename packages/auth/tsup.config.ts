import { defineConfig } from "tsup";

const features = ["oauth"];

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
  minify: false,
  sourcemap: true,
  splitting: false,
  treeshake: true,
  clean: true,
  external: ["@tigerstack/*"],
  outExtension({ format }) {
    return {
      js: format === "cjs" ? ".cjs" : ".js",
    };
  },
});
