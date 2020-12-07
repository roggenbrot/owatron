// import { ipcMain } from "electron";
import fs from "fs";
import i18next, { BackendModule } from "i18next";

declare const ENVIRONMENT: string;
const IS_DEV = ENVIRONMENT == "development";


/**
 * Get a translation file by language
 * 
 * @param language 
 * @param namespace
 */
function getTranslationFile(language: string, namespace: string = "translation") {

    let path;
    if (!IS_DEV) {
        path = __dirname + "/locales" ;
    }else{
        path = __dirname + "/resources/locales" ;
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