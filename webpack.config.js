const path = require('path');

module.exports = {
  entry: './index.js',  // Your main entry point
  output: {
    filename: 'bundle.js',  // The bundled output file
    path: path.resolve(__dirname, 'dist'),  // Output directory
  },
  module: {
    rules: [
      // No Babel loader since you're not transpiling ES6+
    ],
  },
  resolve: {
    alias: {
      'three/addons/': 'three/examples/jsm/',  // Map `three/addons/` to examples folder
    },
  },
  mode: 'production',  // Use 'development' mode if you want non-minified code for debugging
  devtool: 'source-map',  // Optional, for debugging with source maps
};
