'use strict'

const path = require('path');
const ClosureCompilerPlugin = require('webpack-closure-compiler');
module.exports = require('./scalajs.webpack.config');

module.exports.resolve = {
  alias: {
    zlib: 'browserify-zlib-next'
  }
};

//Fix npm link
module.exports.resolve = { fallback: path.join(__dirname, "node_modules") };
module.exports.resolveLoader = { fallback: path.join(__dirname, "node_modules") };

/*module.exports.plugins = [
 new ClosureCompilerPlugin({
   compiler: {
     language_in: 'ECMASCRIPT6',
     language_out: 'ECMASCRIPT5',
     compilation_level: 'SIMPLE'
   },
   concurrency: 16,
 })
];*/

//module.exports.module.preLoaders.push({ test: /\.json$/, loader: 'json-loader' });
