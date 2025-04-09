const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
  mode: "development",
  entry: "./src/main.js",
  output: {
    path: path.resolve(__dirname, "dist"), // Ensure this is where you want to output your bundle
    filename: "bundle.js", // This will be the output file name
    clean: true,
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./index.html",
    }),
    new webpack.ProvidePlugin({
      $: "jquery",
      jQuery: "jquery",
    }),
    new MiniCssExtractPlugin({
      filename: "[name].css",
    }), // ✅ Add CSS support
  ],
  devServer: {
    static: path.join(__dirname, "assets"), // ✅ Serve static files
    open: true, // Opens browser automatically
  },
  resolve: {
    alias: {
      threegltf: path.resolve(
        __dirname,
        "node_modules/three/examples/jsm/loaders/GLTFLoader"
      ),
    },
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, "css-loader"],
      },
      // {
      //   test: /\.(png|gltf)$/,
      //   type: "asset/resource",
      // },
    ],
  },
};
