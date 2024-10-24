import typescript from "@rollup/plugin-typescript";
import pkg from "./package.json" assert { type: "json" };
import { dts } from "rollup-plugin-dts";

/** @type {import('rollup').RollupOptions[]} */
export default [
  {
    input: "src/index.ts",
    output: [
      {
        file: pkg.module,
        format: "esm",
        sourcemap: true,
      },
      {
        file: pkg.main,
        format: "cjs",
        sourcemap: true,
      },
    ],
    plugins: [
      typescript(),
    ],
  },
  {
    input: "src/index.ts",
    output: [
      {
        dir: "esm",
        format: "esm",
      },
      {
        dir: "dist",
        format: "esm",
      },
    ],
    plugins: [dts()],
  },
];
