const resolve = require('rollup-plugin-node-resolve')

module.exports = {
  input: 'src/index.js',
  output: {
    file: 'build/bundle.js',
    name: 'shade',
    format: 'iife'
  },
  plugins: [
      resolve(),
  ],
}
