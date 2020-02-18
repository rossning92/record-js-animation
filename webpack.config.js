const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require("path");
const fs = require("fs");

// Automatically list all modules under `./src/pages` folder and added as
// webpack entries.
const entries = {};

const plugins = [
  new MiniCssExtractPlugin({
    filename: "style.css"
  })
];

fs.readdirSync(__dirname + "/src/pages").forEach(file => {
  const file_path = __dirname + "/src/pages/" + file;
  const name = path.basename(file, ".js");
  entries[name] = file_path;

  plugins.push(
    new HtmlWebpackPlugin({
      filename: name + ".html",
      template: "index.html",
      chunks: [name]
    })
  );
});

module.exports = {
  entry: entries,
  output: {
    path: __dirname + "/dist",
    filename: "index_bundle.js"
  },
  plugins: plugins,
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [MiniCssExtractPlugin.loader, "css-loader"]
      }
    ]
  },
  mode: "development"
};
