import { IConfig } from "config";
import { contextBridge, ipcRenderer } from "electron";
import i18next from "./i10n";


const urlParams = new URLSearchParams(window.location.search);

i18next.changeLanguage(urlParams.get("language") as string);

contextBridge.exposeInMainWorld(
    "api", {
    getConfig: (): Promise<IConfig> => ipcRenderer.invoke("getStore"),
    setConfigKey: (key: string, value: string): Promise<void> => ipcRenderer.invoke("setStoreValue", key, value),
    resetCookies: () => ipcRenderer.invoke("resetCookies"),
    i18n: (key: string): string => i18next.t(key)
}
);