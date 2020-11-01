
import Store from "electron-store";

export interface IConfig {

    url: string;
    reminderNotificationTimeout: "never"|"default";
    emailNotificationTimeout: "never"|"default";

}

export const config = new Store<IConfig>();

