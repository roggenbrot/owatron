const path = require("path");
const { spawn } = require('child_process');
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const DefinePlugin = require("webpack").DefinePlugin;



// const to avoid typos 
const DEVELOPMENT = "development";
const PRODUCTION = "production";

const isDev = (process.env.NODE_ENV === DEVELOPMENT);


/**
 * Restart electron process on code cahnge (dev mode)
 */
let electronProcess = undefined;
const electronReload = function () {

    const startElectron = () => {
        const electron = require('electron');
        console.log("path: " + process.cwd() + " " + electron);
        const args = ['-r process', "./dist/main-process.js"];
        electronProcess = spawn(electron, args, { stdio: 'inherit' });
        console.log(`[${new Date().toISOString()}] [webpack-electron-reload] [server] started electron process: ${electronProcess.pid}`);
    };

    const restartElectron = () => {
        console.log(`[${new Date().toISOString()}] [webpack-electron-reload] [server] killing electron process: ${electronProcess.pid}`);
        try {
            process.kill(electronProcess.pid, 9);
        } catch (error) {
            console.error(error);
        }
        startElectron();
    };

    return {
        apply: function apply(compiler) {
            compiler.hooks.done.tap("ElectronReload", () => {
                if (!electronProcess) {
                    startElectron();
                } else {
                    restartElectron();
                }
            });
        },
    };
};


/**
 * Common webpack configuration
 */
const common = {

    context: path.join(__dirname, "src"),
    devtool: isDev ? 'inline-source-map' : false,
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

        ...isDev ? [] : [new CleanWebpackPlugin({
            cleanOnceBeforeBuildPatterns: ["main-process.*.js"]
        })],

        // inject this becaus the main process uses different logic for prod and dev.
        new DefinePlugin({
            "ENVIRONMENT": JSON.stringify(isDev ? DEVELOPMENT : PRODUCTION) // this variable name must match the one declared in the main process file.
        }),
        ...isDev ? [electronReload()] : []

    ]
};


const owaPreload = {
    target: "electron-preload",
    entry: {
        "owa-preload": "./owa-preload.ts"
    },
    plugins: [

        ...isDev ? [] : [new CleanWebpackPlugin({
            cleanOnceBeforeBuildPatterns: ["owa-preload.js"]
        })],

        new DefinePlugin({
            "ENVIRONMENT": JSON.stringify(isDev ? DEVELOPMENT : PRODUCTION)
        }),

    ]
}

const settingsPreload = {
    target: "electron-preload",
    entry: {
        "settings-preload": "./settings-preload.ts"
    },
    plugins: [

        ...isDev ? [] : [new CleanWebpackPlugin({
            cleanOnceBeforeBuildPatterns: ["settings-preload.js"]
        })],

        new DefinePlugin({
            "ENVIRONMENT": JSON.stringify(isDev ? DEVELOPMENT : PRODUCTION)
        }),

    ]
}


module.exports = [{ ...common, ...owaPreload },{ ...common, ...settingsPreload }, { ...common, ...main }];