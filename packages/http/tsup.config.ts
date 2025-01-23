import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    "adapters/koa": "src/adapters/koa/index.ts",
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
  external: ["koa", "koa-bodyparser", "@tigerstack/*"],
  outExtension({ format }) {
    return {
      js: format === "cjs" ? ".cjs" : ".js",
    };
  },
});
