const path = require("path");
const resolve = require("rollup-plugin-node-resolve");

module.exports = {
  input: path.resolve(__dirname, "index.js"),
  output: {
    file: path.resolve(__dirname, "..", "build", "frontend", "shaded.js"),
    name: "shaded",
    format: "iife"
  },
  plugins: [resolve()]
};
