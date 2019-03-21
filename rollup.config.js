const resolve = require('rollup-plugin-node-resolve')

module.exports = {
  input: 'frontend/index.js',
  output: {
    file: 'build/frontend.js',
    name: 'shade',
    format: 'iife'
  },
  plugins: [
      resolve(),
  ],
}
