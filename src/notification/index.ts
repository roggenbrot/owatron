import { Notification } from "electron";
import { config } from "../config";
import i18next from "../i10n";
import { mainWindow } from "../main-process";

declare const ENVIRONMENT: string;

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
export function reset(): void {
    reminder = []
    reminderNotificationHandle?.close();
    emailNotificationHandle?.close();
}

/**
 * Show reminder notification for all current reminder
 *
 * @param notification 
 */
export function showReminderNotification(notification: IReminderNotification): void {

    if (notification) {

        // Check if same notificaton already exist
        if (!reminder.find((r => r.text === notification.text && r.time === notification.time))) {
            reminder.push(notification);
        }

        const body = reminder.map((r) => {
            return (r.text + " (" + r.time + ")").padEnd(50);
        }).join("\n");

        const title = i18next.t("new reminder", { count: reminder.length });

        if (!reminderNotificationHandle) {
            reminderNotificationHandle = new Notification({
                title,
                body,
                timeoutType: config.get("reminderNotificationTimeout", "default"),
                icon: getIcon("32x32.png"),
                urgency: "normal",
            });
        } else {
            reminderNotificationHandle.title = title;
            reminderNotificationHandle.body = body;
            reminderNotificationHandle.timeoutType = config.get("reminderNotificationTimeout", "default");
        }



        reminderNotificationHandle.on("click", () => {
            reminder = [];
            mainWindow?.show();
            mainWindow?.focus();
            reminderNotificationHandle?.close();
        });

        reminderNotificationHandle.on("close", () => {
            reminder = [];
        });

        reminderNotificationHandle.show();
    }

}

export interface IEmailNotification {

    address: string;
    subject: string;

}

let email: IEmailNotification[] = [];

let emailNotificationHandle: Notification;

export function showEmailNotification(notification: IEmailNotification): void {

    if (notification) {

        // Check if same notificaton already exist
        if (!email.find((r => r.address === notification.address && r.subject === notification.subject))) {
            email.push(notification);
        }


        const body = email.map((r) => {
            return (r.address + ": " + r.subject).padEnd(50);
        }).join("\n");

        const title = i18next.t("new email", { count: email.length });

        if (!emailNotificationHandle) {
            emailNotificationHandle = new Notification({
                title,
                body,
                timeoutType: config.get("emailNotificationTimeout", "default"),
                icon: getIcon("32x32.png"),
                urgency: "normal",
            });
        } else {
            emailNotificationHandle.title = title;
            emailNotificationHandle.body = body;
            emailNotificationHandle.timeoutType = config.get("emailNotificationTimeout", "default");
        }

        emailNotificationHandle.on("close", () => {
            email = [];
        });

        emailNotificationHandle.on("click", () => {
            email = [];
            mainWindow?.show();
            mainWindow?.focus();
            emailNotificationHandle?.close();
        });


        console.log("Show email notification");
        emailNotificationHandle.show();
    }

}