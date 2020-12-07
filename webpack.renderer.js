
const path = require("path");
const HtmlPlugin = require("html-webpack-plugin");
const HtmlWebpackHarddiskPlugin = require("html-webpack-harddisk-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const webpack = require("webpack");


// const to avoid typos 
const DEVELOPMENT = "development";
const PRODUCTION = "production";

const isDev = (process.env.NODE_ENV === DEVELOPMENT);

module.exports = {

  context: path.join(__dirname, "src"),

  // target: "electron-renderer",
  target: "web",

  resolve: {
    extensions: [".js", ".jsx", ".ts", ".tsx", ".json", ".css", ".scss"],
    alias: {
      "react-dom": "@hot-loader/react-dom",
    },
  },

  mode: isDev ? DEVELOPMENT : PRODUCTION,

  devtool: isDev ? "source-map" : undefined,

  entry: {
    "settings-render-process": [
      "react-hot-loader/patch", // activate HMR for React
      "webpack-dev-server/client?http://localhost:9001",// bundle the client for webpack-dev-server and connect to the provided endpoint
      "webpack/hot/only-dev-server", // bundle the client for hot reloading, only- means to only hot reload for successful updates
      "./settings-render-process.tsx"
    ]
  },

  output: {
    filename: "[name].js",
    path: path.join(__dirname, "dist")
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
        }
      },

    ]
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        vendors: {
          test: /node_modules/,
          name: "vendor",
          chunks: "all",
        },
      },
    },
  },
  plugins: [

    ...isDev ? [] : [new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns: ["**/*", "!main-process.*.js", "!preload.*.js"]
    })],
    new webpack.HotModuleReplacementPlugin(),
    new HtmlPlugin({
      filename: "settings.html",
      template: "settings.html",
      scriptLoading: "blocking",
      cache: true,
      // alwaysWriteToDisk: true,
      inject: 'body',
      publicPath: isDev ? "http://localhost:9000" : auto
    }),
    new HtmlWebpackHarddiskPlugin(),

  ],

  devServer: isDev ? {
    contentBase: path.join(__dirname, "dist"),
    // compress: true,
    hot: true,
    port: 9000
  } : undefined
};

