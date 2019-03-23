const path = require('path')
const resolve = require('rollup-plugin-node-resolve')

module.exports = {
  input: path.resolve(__dirname, 'shader', 'init.js'),
  output: {
    file: path.resolve(__dirname, '..', 'build', 'shader.js'),
    name: 'shader',
    format: 'iife'
  },
  plugins: [
      resolve(),
  ],
}
