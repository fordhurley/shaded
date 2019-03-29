const path = require("path");
const resolve = require("rollup-plugin-node-resolve");
const typescript = require("rollup-plugin-typescript");

module.exports = {
  input: path.resolve(__dirname, "index.ts"),
  output: {
    file: path.resolve(__dirname, "..", "..", "build", "frontend", "shaded.js"),
    name: "shaded",
    format: "iife"
  },
  plugins: [resolve(), typescript()]
};
