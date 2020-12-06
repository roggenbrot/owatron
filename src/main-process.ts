import { app, BrowserWindow, ipcMain, Menu, Tray } from "electron";
import contextMenu from "electron-context-menu";
import path from "path";
import { config } from "./config";
import i18next, { setLanguage } from "./i10n";
import { showEmailNotification, showReminderNotification } from "./notification";

declare const ENVIRONMENT: String;

const IS_DEV = ENVIRONMENT == "development";
const DEV_SERVER_URL = "http://localhost:9000";
const HTML_FILE_PATH = "settings.html";



export let mainWindow: BrowserWindow | undefined;
let settingsWindow: BrowserWindow | undefined;
let tray: Tray | undefined;
const disposeContextMenu = contextMenu();


/**
 * Get a icon by name
 * 
 * @param icon 
 */
function getIcon(icon: string) {

    if (IS_DEV) {
        return __dirname + "/../resources/icons/" + icon;
    } else {
        return __dirname + "/icons/" + icon;
    }

}


/**
 * Create a new window with OWA url loaded 
 */
function createMainWindow() {

    if (!mainWindow) {
        mainWindow = new BrowserWindow({
            width: 1024,
            height: 768,
            autoHideMenuBar: true,
            icon: getIcon("32x32.png"),
            webPreferences: {
                spellcheck: true,
                contextIsolation: true,
                // nodeIntegration: true,
                preload: path.join(__dirname, "preload.js")
            }
        });

        // mainWindow.webContents.openDevTools();

        /**
         * Set user agent so that all features are available inside OWA
         */
        mainWindow.webContents.setUserAgent("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3831.6 Safari/537.36");

        /**
         * Register handler for dom ready event
         */
        mainWindow.webContents.on("dom-ready", (event) => {
            mainWindow?.webContents.send("registerObserver");
            setLanguage();
        });

        /**
         * Register handler for window close event
         */
        mainWindow.on("close", (event) => {
            if (mainWindow?.isVisible()) {
                event.preventDefault();
                mainWindow.hide()
            }
        });

        /**
         * Register handler for window closed event
         */
        mainWindow.on("closed", () => {
            mainWindow = undefined;
        });

        /**
         * Initialize tray
         */
        tray = new Tray(getIcon("32x32.png"));
        updateTray();

    }


    /**
     * Load OWA URL
     */
    mainWindow.loadURL(config.get("app.url", "https://outlook.office.com/mail"));

}


function createSettingsWindow() {

    if (!settingsWindow) {

        settingsWindow = new BrowserWindow({
            width: 400,
            height: 600,
            autoHideMenuBar: true,
            icon: getIcon("32x32.png"),
            parent: mainWindow,
            modal: true,
            webPreferences: {
                spellcheck: true,
                contextIsolation: true,
                // nodeIntegration: true,
            }
        });

        /**
         * Register handler for window closed event
         */
        settingsWindow.on("closed", () => {
            settingsWindow = undefined;
        });


    }

    settingsWindow.loadURL(IS_DEV ? "http://localhost:9000/settings.html" : `file://${path.join(__dirname, 'settings.html')}`);

}

/**
 * Create tray icon
 */
export function updateTray() {

    if (tray) {

        const context = Menu.buildFromTemplate([
            {
                label: i18next.t("Open"), click: () => {
                    mainWindow?.show();
                    mainWindow?.focus();
                }
            },
            { label: "Separator", type: "separator" },
            {
                label: i18next.t("Settings"), click: () => {
                    createSettingsWindow();

                }
            },
            {
                label: i18next.t("Quit"), click: () => {
                    app.exit(0);
                }
            }
        ]);

        tray.setContextMenu(context);
    }

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
    createMainWindow();
});


/**
 * Register handler responsible to release all resources before exit
 */
app.on("before-quit", (evt) => {
    tray?.destroy();
    tray = undefined;
    disposeContextMenu();
});

app.on("window-all-closed", () => app.exit(0));
