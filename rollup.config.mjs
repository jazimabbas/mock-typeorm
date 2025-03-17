import typescript from "@rollup/plugin-typescript";
import { defineConfig } from "rollup";
import dts from "rollup-plugin-dts";

/** @type {import('@rollup/plugin-typescript').RollupTypescriptOptions} */
const typescriptOptions = {
  exclude: ["tests/**/*"],
  compilerOptions: {
    declaration: false,
    declarationDir: undefined,
    outDir: undefined,
  },
};

export default defineConfig([
  {
    external: ["typeorm", "sinon"],
    input: "src/index.ts",
    output: { file: "dist/esm/index.js", format: "esm" },
    plugins: [typescript(typescriptOptions)],
  },
  {
    external: ["typeorm", "sinon"],
    input: "src/index.ts",
    output: { file: "dist/cjs/index.js", format: "cjs" },
    plugins: [typescript(typescriptOptions)],
  },
  {
    input: "dist/types/index.d.ts",
    output: {
      file: "dist/index.d.ts",
      format: "es",
    },
    plugins: [dts()],
  },
]);
