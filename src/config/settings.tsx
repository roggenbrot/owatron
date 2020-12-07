import { Dropdown, IDropdownOption, Pivot, PivotItem } from "@fluentui/react";
import { ThemeProvider } from "@fluentui/react-theme-provider";
import { useBoolean } from "@uifabric/react-hooks";
import { IConfig } from "config";
import React, { useCallback, useMemo } from "react";
import { hot } from "react-hot-loader/root";
import { useAsync } from "react-use";



declare const api: {
    getConfig: () => Promise<IConfig>,
    setConfigKey: (key: string, value: any) => void,
    i18n: (key: string) => string
};

const urls: IDropdownOption[] = [

    { key: "https://outlook.live.com/mail", text: "https://outlook.live.com/mail" },
    { key: "https://outlook.office.com/mail", text: "https://outlook.office.com/mail" }

];



const Settings = () => {

    const [v, { toggle }] = useBoolean(false);

    const onUrlChange = useCallback((_, option) => {
        api.setConfigKey("url", option.key);
        toggle();
    }, [toggle]);


    const onEmailTimeoutChange = useCallback((_, option) => {
        api.setConfigKey("emailNotificationTimeout", option.key);
        toggle();
    }, [toggle]);


    const onReminderTimeoutChange = useCallback((_, option) => {
        api.setConfigKey("reminderNotificationTimeout", option.key);
        toggle();
    }, [toggle]);



    const config = useAsync(() => {
        return api.getConfig();
    }, [v]);


    const timeouts = useMemo(() => {
        return [

            { key: "default", text: api.i18n("Default") },
            { key: "never", text: api.i18n("Never") }

        ];
    }, [api]);


    return <ThemeProvider >

        <Pivot>
            <PivotItem
                // t("General")
                headerText={api.i18n("General")}
            >
                <Dropdown
                    // t("URL")
                    label={api.i18n("URL")}
                    options={urls}
                    selectedKey={config.value?.url ?? "https://outlook.office.com/mail"}
                    onChange={onUrlChange}
                />
            </PivotItem>

            <PivotItem
                // t("Notifications")
                headerText={api.i18n("Notifications")}
            >
                <Dropdown
                    // t("Email Notification Timeout")
                    label={api.i18n("Email Notification Timeout")}
                    options={timeouts}
                    selectedKey={config.value?.emailNotificationTimeout ?? "default"}
                    onChange={onEmailTimeoutChange}
                />

                <Dropdown
                    // t("Reminder Notification Timeout")
                    label={api.i18n("Reminder Notification Timeout")}
                    options={timeouts}
                    selectedKey={config.value?.reminderNotificationTimeout ?? "default"}
                    onChange={onReminderTimeoutChange}
                />
            </PivotItem>

        </Pivot>
    </ThemeProvider>;


};

export default hot(Settings);