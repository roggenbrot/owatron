const path = require("path");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const DefinePlugin = require("webpack").DefinePlugin;

// const to avoid typos 
const DEVELOPMENT = "development";
const PRODUCTION = "production";

const isDev = process.env.NODE_ENV == DEVELOPMENT;


const common = {

    context: path.join(__dirname, "src"),
    mode: isDev ? DEVELOPMENT : PRODUCTION,
    output: {
        filename: "[name].js",
        path: path.join(__dirname, "dist")
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js']
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: [
                            "@babel/preset-typescript",
                            "@babel/preset-env",
                        ],
                    }
                }
            }
        ]
    },
};


const main = {

    target: "electron-main",
    entry: {
        "main-process": "./main-process.ts"
    },
    plugins: [

        new CleanWebpackPlugin({
            cleanOnceBeforeBuildPatterns: ["main-process.*.js"]
        }),

        // inject this becaus the main process uses different logic for prod and dev.
        new DefinePlugin({
            "ENVIRONMENT": JSON.stringify(isDev ? DEVELOPMENT : PRODUCTION) // this variable name must match the one declared in the main process file.
        }),

    ]
};


const preload = {
    target: "electron-preload",
    entry: {
        "preload": "./preload.ts"
    },
    plugins: [

        new CleanWebpackPlugin({
            cleanOnceBeforeBuildPatterns: ["preload.*.js"]
        }),

        // inject this becaus the main process uses different logic for prod and dev.
        new DefinePlugin({
            "ENVIRONMENT": JSON.stringify(isDev ? DEVELOPMENT : PRODUCTION) // this variable name must match the one declared in the main process file.
        }),

    ]
}


module.exports = [{...common,...main},{...common,...preload}];