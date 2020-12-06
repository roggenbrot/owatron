import { ipcMain } from "electron";
import fs from "fs";
import i18next, { BackendModule } from "i18next";
import { updateTray, mainWindow } from "../main-process";


declare const ENVIRONMENT: string;
const IS_DEV = ENVIRONMENT == "development";

const supportedLanguages = ["de", "en"];

/**
 * Get a translation file by language
 * 
 * @param language 
 * @param namespace
 */
function getTranslationFile(language: string, namespace: string = "translation") {

    let path = "resources/locales";
    if (!IS_DEV) {
        path = __dirname + "/" + path;
    }
    if (fs.existsSync(path + "/" + language + "/" + namespace + ".json")) {
        return fs.readFileSync(path + "/" + language + "/" + namespace + ".json", "utf-8");
    }
    return fs.readFileSync(path + "/en/" + namespace + ".json", "utf-8");

}

const backend: BackendModule = {
    type: 'backend',
    init: (services, backendOptions, i18nextOptions) => {

    },
    read: (language, namespace, callback) => {
        callback(null, JSON.parse(getTranslationFile(language, namespace)));
    },

    // only used in backends acting as cache layer
    save: (language, namespace, data) => {
        // store the translations
    },

    create: (languages, namespace, key, fallbackValue) => {
        /* save the missing translation */
    }
}

/**
 * Get the current language settings of the outlook app
 */
const getLanguage = (): Promise<string> => {
    return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
            ipcMain.removeHandler("getLanguage-Reply");
            reject("No answer of getLanguage")
        }, 500);
        ipcMain.once("getLanguage-Reply", (event, args) => {
            clearTimeout(timeout);
            resolve(args);
        })
        mainWindow?.webContents.send("getLanguage");
    });
}

/**
 * Set the current language based on outlook app setting
 */
export const setLanguage = () => {
    getLanguage()
        .then((language) => {
            i18next.changeLanguage(language);
        }).catch((error) => {
            console.log("Error while trying to set language");
        });
};

/**
 * Handler for change language event
 */
ipcMain.on("onLanguageChanged", (event, language) => {
    i18next.changeLanguage(language);
    updateTray();
});


if (!i18next.isInitialized) {
    i18next
        .use(backend)
        .init({
            backend: {
                // path where resources get loaded from
                loadPath: './locales/{{lng}}/{{ns}}.json'
            },
            // debug: true,
            fallbackLng: "en",
            interpolation: {
                escapeValue: false, // not needed for react as it escapes by default
            },
        });

    i18next.languages = ["de", "en"];
}

export default i18next;