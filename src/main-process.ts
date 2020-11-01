import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import { config } from "./config";
import { showContextMenu } from "./contextmenu";
import { showEmailNotification, showReminderNotification } from "./notification";

declare const ENVIRONMENT: String;

const IS_DEV = ENVIRONMENT == "development";
const DEV_SERVER_URL = "http://localhost:9000";
const HTML_FILE_PATH = "index.html";

let win: BrowserWindow | null = null;


/**
 * Create a new window with OWA url loaded 
 */
function createWindow() {


    // console.log(__dirname);

    win = new BrowserWindow({
        width: 1024,
        height: 768,
        autoHideMenuBar: true,
        webPreferences: {
            spellcheck: true,
            nodeIntegration: true,
            preload: path.join(__dirname, "preload.js")
        }
    });

    win.webContents.openDevTools();

    /**
     * Set user agent so that all features are available inside OWA
     */
    // win.webContents.setUserAgent("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3831.6 Safari/537.36");

    /**
     * Register handler for dom ready event
     */
    win.webContents.on("dom-ready", (event) => {
        win?.webContents.send("registerNotificationObserver");
    });

    /**
     * Register handler for window closed event
     */
    win.on("closed", () => {
        win = null;
    });

    /**
     * Register handler for context menu event
     */
    win.webContents.on("context-menu", (event, params) => {
        event.preventDefault();
        showContextMenu(win?.webContents, params);
    });

    /**
     * Load OWA URL
     */
    win.loadURL(config.get("app.url", "https://outlook.office.com/mail"));

}

/**
 * Register handler for show reminder notification event
 */
ipcMain.on("showReminderNotification", (event, data) => {
    showReminderNotification(data);
});

/**
 * Register handler for show email notification event
 */
ipcMain.on("showEmailNotification", (event, data) => {
    showEmailNotification(data);
});

/**
 * Register ready handler for the app
 */
app.on("ready", () => {
    createWindow();
});

/**
 * Register closed handler for the app
 */
app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit()
    }
})

/**
 * Register activate handler for the app
 */
app.on("activate", () => {
    if (win === null) {
        createWindow()
    }
})