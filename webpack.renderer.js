
const path = require("path");
const HtmlPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");


// const to avoid typos 
const DEVELOPMENT = "development";
const PRODUCTION = "production";

const isDev = process.env.NODE_ENV == DEVELOPMENT;

module.exports = {

  context: path.join(__dirname, "src"),

  target: "electron-renderer",

  resolve: {
    extensions: [".js", ".jsx", ".ts", ".tsx", ".json", ".css", ".scss"]
  },

  mode: isDev ? DEVELOPMENT : PRODUCTION,

  devtool: isDev ? "source-map" : undefined,

  entry: {
    "polyfill": "@babel/polyfill",
    "render-process": "./render-process.tsx"
  },

  output: {
    filename: isDev ? "[name].js" : "[name].[contenthash].js",
    path: path.join(__dirname, "dist")
  },

  externals: {
    "react": "React",
    "react-dom": "ReactDOM",
    "react-router-dom": "ReactRouterDOM",
    "fs": "require('fs')" 
  },

  module: {
    rules: [

      {
        test: /\.scss$/,
        use: [
          "style-loader",
          "css-loader",
          "sass-loader"
        ]
      },

      {
        // transforms font files in base64 data. That's the only way I could import fonts in .scss files.
        test: /\.(jpg|jpeg|png|gif|woff|woff2|eot|ttf|svg)$/,
        use: [{ loader: 'url-loader?limit=100000' }]
      },

      {
        test: /\.(js|jsx|ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [
              "@babel/preset-typescript",
              "@babel/preset-react",
              "@babel/preset-env"
            ],
            plugins: [
              "@babel/plugin-proposal-class-properties",
              "@babel/plugin-transform-runtime"
            ]
          }
        }
      },

    ]
  },

  plugins: [

    new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns: ["**/*", "!main-process.*.js"] // config for electron-main deletes this file
    }),

    new HtmlPlugin({
      filename: "index.html",
      template: "index.html",
      cache: true,
    }),

  ],

  devServer: isDev ? {
    contentBase: path.join(__dirname, "dist"),
    compress: true,
    hot: true,
    port: 9000
  } : undefined
};

