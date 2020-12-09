import { Notification } from "electron";
import { config } from "../config";
import i18next from "../i10n";
import { mainWindow } from "../main-process";

declare const ENVIRONMENT: String;

const IS_DEV = ENVIRONMENT == "development";

export interface IReminderNotification {

    time: string;
    text: string;

}



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

let reminder: IReminderNotification[] = [];

let reminderNotificationHandle: Notification | undefined;


/**
 * Reset current email an reminder notifications
 */
export function reset() {
    reminder = []
    email = [];
    if (reminderNotificationHandle) {
        reminderNotificationHandle.close();
        reminderNotificationHandle = undefined;
    }
    if (emailNotificationHandle) {
        emailNotificationHandle.close();
        emailNotificationHandle = undefined;
    }

}

/**
 * Show reminder notification for all current reminder
 *
 * @param notification 
 */
export function showReminderNotification(notification: IReminderNotification) {

    if (notification) {



        reminder.push(notification);

        if (reminderNotificationHandle) {
            reminderNotificationHandle.close();
        }

        const body = reminder.map((r) => {
            return (r.text + " (" + r.time + ")").padEnd(50);;
        }).join("\n");

        const title = i18next.t("new reminder", { count: reminder.length });

        reminderNotificationHandle = new Notification({
            title,
            body,
            timeoutType: config.get("reminderNotificationTimeout", "default"),
            icon: getIcon("32x32.png"),
            urgency: "normal",
        });

        reminderNotificationHandle.once("click", () => {
            reminder = [];
            mainWindow?.show();
            mainWindow?.focus();
            reminderNotificationHandle?.close();
            reminderNotificationHandle = undefined;
        });

        reminderNotificationHandle.once("close", () => {
            reminder = [];
            reminderNotificationHandle = undefined;
        });


        reminderNotificationHandle.show();
    }

}

export interface IEmailNotification {

    address: string;
    subject: string;

}

let email: IEmailNotification[] = [];

let emailNotificationHandle: Notification | undefined;

export function showEmailNotification(notification: IEmailNotification) {

    if (notification) {

        email.push(notification);

        if (emailNotificationHandle) {
            console.log("Close email notification");
            emailNotificationHandle.close();
        }


        const body = email.map((r) => {
            return (r.address + ": " + r.subject).padEnd(50);
        }).join("\n");

        const title = i18next.t("new email", { count: email.length });

        emailNotificationHandle = new Notification({
            title,
            body,
            timeoutType: config.get("emailNotificationTimeout", "default"),
            icon: getIcon("32x32.png"),
            urgency: "normal",
        });

        emailNotificationHandle.once("close", () => {
            email = [];
            emailNotificationHandle = undefined;
        });

        emailNotificationHandle.once("click", () => {
            email = [];
            mainWindow?.show();
            mainWindow?.focus();
            emailNotificationHandle?.close();
            emailNotificationHandle = undefined;
        });

        console.log("Show email notification");
        emailNotificationHandle.show();
    }

}