import { Notification } from "electron";
import { config } from "../config";
import i18next from "../i10n";


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
            return (r.text + " (" + r.time + ")").padEnd(50);;
        }).join("\n");
        
        const title = i18next.t("new reminder", { count: reminder.length });

        reminderNotificationHandle = new Notification({
            title,
            body,
            timeoutType: config.get("reminderNotificationTimeout", "default"),
            icon: "resources/icons/32x32.png",
            urgency: "normal",
        });


        reminderNotificationHandle.show();
    }

}

export interface IEmailNotification {

    address: string;
    subject: string;

}

const email: IEmailNotification[] = [];

let emailNotificationHandle: Notification;

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
            icon: "resources/icons/32x32.png",
            urgency: "normal",
        });

        console.log("Show email notification");
        emailNotificationHandle.show();
    }

}