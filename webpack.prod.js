const { merge } = require("webpack-merge");
const common = require("./webpack.common.js");
const CompressionPlugin = require("compression-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin")
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = merge(common, {
   mode: "production",
   plugins: [new CompressionPlugin({
      exclude: /index\.ejs/
   })],
   devtool: "source-map",
});
