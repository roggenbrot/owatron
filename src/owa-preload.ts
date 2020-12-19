import { ipcRenderer } from "electron";

console.log("Loading owa preload script");

/**
 * Parse a reminder callout element
 *
 * @param node 
 */
function parseReminder(node: Node) {

    /* New reminder callout
    <button type="button" data-storybook="reminder"
        class="ms-Button _3rsUP82WSAWrd2_ltrkYqu ms-Button--action ms-Button--command root-115" data-is-focusable="true"
        tabindex="-1">
        <span class="ms-Button-flexContainer _1_WrKcTbnYdDAFqzC4SSeW flexContainer-86"
            data-automationid="splitbuttonprimary">
            <div class="_1No_MTwEqWqrxpLMLyewVV" id="CharmControlID57"></div>
            <div class="_2FExrHciwQ0OfU3n4wXbm4">
                <div class="_3JvUSBrE7i4EvsSuQ4qQaX">
                    <div class="PW6IONUfEQd0sJHkwWKio">Test</div>
                    <div class="_2LTiFXMdIPUAYBsZ924g6x">Now</div>
                </div>
                <div class="_152OXH0Wv5AJy2MYNeNvBF">
                    <div class="_3lanHQZYgbRG-wj0O20psN">11:30</div>
                    <div class="Pqix-KFjAnL4CfIddz4Kw"></div>
                </div>
            </div>
        </span>
    </button>
    */
    if (node instanceof HTMLElement) {
        // Button has one child element (Wrapper)
        // Element below button has 2 child element (div and reminder data wrapper)
        // Element 1 has 2 childs (Reminder text and time)
        const reminderWrapper = node.childNodes[0]?.childNodes[1];
        const text = reminderWrapper?.childNodes[0]?.childNodes[0]?.textContent;
        const time = reminderWrapper?.childNodes[0]?.childNodes[0]?.textContent;
        if (text && time) {

            ipcRenderer.invoke("showReminderNotification", {
                text,
                time
            });
        } else {
            console.log("Could not read new reminder callout since expected hierarchy not fulfilled", node.outerHTML);
        }
    }

}

/**
 * Parse a email callout element
 *
 * @param newMail 
 */
function parseEmail(node: Node) {

    /* New mail callout:
    <button type="button" class="ms-Button ms-Button--action ms-Button--command _1bZCIOt8pNzUGc5_4EecwV root-118"
        data-storybook="newmail" data-is-focusable="true">
        <span class="ms-Button-flexContainer _2ffM28EUzuZTnw7XOLJhyM flexContainer-86"
            data-automationid="splitbuttonprimary">
            <div role="presentation"
                class="ms-Persona-coin ms-Persona--size32 _2wocbClJzEBB0NRX1fR2LX _3fxSw_KFta16t28JP70e_s coin-95">
                <div role="presentation" class="ms-Persona-imageArea imageArea-119">
                    <div class="ms-Persona-initials initials-122" aria-hidden="true">
                        <span>SD</span>
                    </div>
                </div>
            </div>
            <div class="_9Ie6sVh0VX-ro9NAPwFKb">
                <div class="_6tY-cxX-513mYdh6yJLFJ">EMAIL ADDRESS</div>
                <div class="_3D_rMrrL9OQqN4yRDBU0wB">EMAIL SUBJECT</div>
                <div class="_3EYcW96jXMSxYrgKGACvQ5">
                        EMAIL TEXT
                </div>
            </div>
        </span>
    </button>
    <button type="button" class="ms-Button ms-Button--icon _1jj-F7glQvCHYDjDwBM16j root-58" data-is-focusable="true">
        <span class="ms-Button-flexContainer flexContainer-45" data-automationid="splitbuttonprimary">
            <i data-icon-name="Cancel" aria-hidden="true" class="ms-Button-icon _2NRERAuLG4KyyZOTDhVoH0 icon-60">
            </i>
        </span>
    </button>
    */
    if (node instanceof HTMLElement) {
        // Button has one child element (Wrapper)
        // Element below button has 2 child element (Persona coin and email data wrapper)
        // Element 1 has 3 childs (Email address, email subject, email text)
        const emailWrapper = node.childNodes[0]?.childNodes[1];
        const address = emailWrapper?.childNodes[0]?.textContent;
        const subject = emailWrapper?.childNodes[1]?.textContent;
        if (address && subject) {
            ipcRenderer.invoke("showEmailNotification", {
                address,
                subject
            });
        } else {
            console.log("Could not read new mail callout since expected hierarchy not fulfilled", node.outerHTML);
        }
    }

}

/**
 * Event handler for added elements on the Fuent UI callout div
 * @param node 
 */
function onNotificationElementAdded(node: Node) {
    if (node instanceof HTMLElement) {

        console.log(node);
        const newMail = node.querySelector("button[data-storybook='newmail']");
        if (newMail) {
            console.log("Found newmail notification");
            parseEmail(newMail);
        } else {
            const reminder = node.querySelector("button[data-storybook='reminder']");
            if (reminder) {
                console.log("Found reminder notification");
                parseReminder(reminder);
            } else {
                console.log("Unknown notification", node.outerHTML);
            }
        }
    }
}

/**
 * Register the notification observer on the Fluent UI callout div 
 */
function registerNotificationObserver() {
    console.log("Trying to register callout observer");
    const layerDiv = document.querySelector(".ms-Layer-content");
    if (layerDiv) {
        const observer = new MutationObserver((mutations) => {
            try {
                mutations.forEach((mutation) =>
                    mutation.addedNodes.forEach(onNotificationElementAdded)
                );
            } catch (ex) {
                console.log(ex);
            }
        });

        console.log("Starting observer for notifications");
        observer.observe(layerDiv, { childList: true, subtree: true });

        console.log("Searching for existing reminders");
        document.querySelectorAll("button[data-storybook='reminder']").forEach(parseReminder);

    } else {
        console.log("Could not register notification observer. Notifications not supported, Retrying in 5 seconds");
        setTimeout(() => {
            registerNotificationObserver();
        }, 5000);
    }
}

function registerLanguageObserver() {
    console.log("Trying to register language observer");
    const observer = new MutationObserver((mutations) => {
        try {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === "lang") {
                    const newValue = document.getElementsByTagName("html")[0].getAttribute("lang");
                    console.log("Language changed from " + mutation.oldValue + " to " + newValue);
                    ipcRenderer.invoke("onLanguageChanged", newValue);
                }
            });
        } catch (ex) {
            console.log(ex);
        }
    });


    observer.observe(document.getElementsByTagName("html")[0], { childList: false, subtree: false, attributes: true });

}

/**
 * Handler for dom ready event
 */
ipcRenderer.on("onDomReady", async () => {
    registerLanguageObserver();
    await ipcRenderer.invoke("onLanguageChanged", document.getElementsByTagName("html")[0].getAttribute("lang"));
    setTimeout(() => {
        registerNotificationObserver();
    }, 5000);
});








