const typescript = require("@rollup/plugin-typescript");

const typescriptOptions = {
  exclude: ["tests/**/*"],
  compilerOptions: { declaration: false },
};

const data = [
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
];

module.exports = data;
