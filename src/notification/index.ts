import { Notification } from "electron";
import {config} from "../config";

export interface IReminderNotification {

    time: string;
    text: string;

}


const reminder: IReminderNotification[] = [];

let reminderNotificationHandle: Notification;

export function showReminderNotification(notification: IReminderNotification) {

    if (notification) {

        reminder.push(notification);

        if (reminderNotificationHandle) {
            reminderNotificationHandle.close();
        }

        const body = reminder.map((r) => {
            return r.text + " (" + r.time + ")";
        }).join("\n");

        const title = reminder.length + " reminder";

        reminderNotificationHandle = new Notification({
            title,
            body,
            timeoutType: config.get("reminderNotificationTimeout", "default"),
            icon: "resources/icons/32x32.png",
            urgency: "normal",
        });
    }

}

export interface IEmailNotification {

    time: string;
    text: string;

}

const email: IEmailNotification[] = [];

let emailNotificationHandle: Notification;

export function showEmailNotification(notification: IEmailNotification) {

    if (emailNotificationHandle) {

        email.push(notification);

        if (reminderNotificationHandle) {
            reminderNotificationHandle.close();
        }

        const body = email.map((r) => {
            return r.text + " (" + r.time + ")";
        }).join("\n");

        const title = email.length + " new email(s)";

        reminderNotificationHandle = new Notification({
            title,
            body,
            timeoutType: config.get("emailNotificationTimeout", "default"),
            icon: "resources/icons/32x32.png",
            urgency: "normal",
        });
    }

}