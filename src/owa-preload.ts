import { ipcRenderer } from 'electron';

console.log('Loading owa preload script');

/**
 * Parse a reminder callout element
 *
 * @param node
 */
function parseReminder(node: Node): boolean {
  /* New reminder callout */
  if (node instanceof HTMLElement) {
    if (node.querySelector('.ms-Button span div:nth-child(2) div:nth-child(2)')) {
      /*
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
      // Button has one child element (Wrapper)
      // Element below button has 2 child element (div and reminder data wrapper)
      // Element 1 has 2 childs (Reminder text and time)
      const callout = node.querySelector('.ms-Button div:nth-child(2)');
      const text = callout?.childNodes[0]?.childNodes[0]?.textContent;
      const time = callout?.childNodes[0]?.childNodes[0]?.textContent;
      if (text && time) {
        ipcRenderer.invoke('showReminderNotification', {
          text,
          time,
        });
        return true;
      } else {
        console.log('Could not read new reminder callout since expected hierarchy not fulfilled', node.outerHTML);
      }
    } else {
      const notifications = node.querySelectorAll('.o365cs-notifications-reminders-row');
      if (notifications && notifications.length > 0) {
        console.log('O365 onPremise notifications');
        notifications.forEach((notification) => {
          const text = notification.querySelector('.o365cs-notifications-reminders-title')?.textContent;
          const duration = notification.querySelector('.o365cs-notifications-reminders-timeDuration')?.textContent;
          if (text) {
            ipcRenderer.invoke('showReminderNotification', {
              text,
              duration,
            });
            return true;
          } else {
            console.log('No text for reminder available');
          }
        });
      } else {
        console.log(
          'Could not read new notification callout since expected hierarchy not fulfilled - ' + notifications.length,
          node.outerHTML,
        );
      }
    }
  }
  return false;
}

/**
 * Parse a email callout element
 *
 * @param newMail
 */
function parseEmail(node: Node): boolean {
  if (node instanceof HTMLElement) {
    if (node.querySelector('.ms-Button span div:nth-child(2) div:nth-child(3)')) {
      console.log('O365 notification');
      /* New mail callout:
            <div class="_3NNi1ydLOoxEtpNiPDN8Yu css-203">
                <button type="button" class="ms-Button ms-Button--action ms-Button--command _1bZCIOt8pNzUGc5_4EecwV root-119" data-is-focusable="true">
                    <span class="ms-Button-flexContainer _2ffM28EUzuZTnw7XOLJhyM flexContainer-94" data-automationid="splitbuttonprimary">
                        <div role="presentation" class="ms-Persona-coin ms-Persona--size32 _2wocbClJzEBB0NRX1fR2LX _3fxSw_KFta16t28JP70e_s coin-105">
                            <div role="presentation" class="ms-Persona-imageArea imageArea-205">
                                <div class="ms-Persona-initials initials-208" aria-hidden="true">
                                    <span>DJ</span></div>
                                </div>
                            </div>
                        <div class="_9Ie6sVh0VX-ro9NAPwFKb">
                            <div class="_6tY-cxX-513mYdh6yJLFJ">EMAIL ADDRESS</div>
                            <div class="_3D_rMrrL9OQqN4yRDBU0wB">EMAIL SUBJECT</div>
                            <div class="_3EYcW96jXMSxYrgKGACvQ5">EMAIL_TEXT‌</div>
                        </div>
                    </span>
                </button>
                <button type="button" class="ms-Button ms-Button--icon _1jj-F7glQvCHYDjDwBM16j root-58" data-is-focusable="true">
                    <span class="ms-Button-flexContainer flexContainer-44" data-automationid="splitbuttonprimary">
                        <i data-icon-name="Cancel" aria-hidden="true" class="ms-Button-icon _2NRERAuLG4KyyZOTDhVoH0 icon-60"></i>
                    </span>
                </button>
            </div>
            */
      // Button has one child element (Wrapper)
      // Element below button has 2 child element (Persona coin and email data wrapper)
      // Element 1 has 3 childs (Email address, email subject, email text)
      const callout = node.querySelector('.ms-Button span div:nth-child(2)');
      const address = callout?.childNodes[0]?.textContent;
      const subject = callout?.childNodes[1]?.textContent;
      console.log(address, subject);
      if (address && subject) {
        ipcRenderer.invoke('showEmailNotification', {
          address,
          subject,
        });
        return true;
      } else {
        console.log('Could not read new mail callout since expected hierarchy not fulfilled', node.outerHTML);
      }
    } else {
      const onPremise = node.querySelector('.o365cs-notifications-newMailPopupButtonContent');
      if (onPremise) {
        console.log('O365 onPremise notification');
        /*
                <div class="o365cs-notifications-newMailPopupButtonCell">
                    <div class="o365cs-notifications-newMailPopupButtonContent"> 
                        <span autoid="__Microsoft_O365_ShellG2_Owa_templates_cs_Z" class="wf-size-x14 o365cs-notifications-text ms-fcl-nd" style="display: none;">
                            Sie haben 1 neue Nachrichten.
                        </span>
                        <div>
                            <div class="o365cs-notifications-newMailPersonaImage"style="display: none; background-color: rgb(107, 165, 231); outline-color: rgb(107, 165, 231);">
                                SL
                            </div>
                            <img src="service.svc/s/GetPersonaPhoto?email=my@email.net&amp;UA=0&amp;size=HR64x64&amp;sc=1613032704723"class="o365cs-notifications-newMailPersonaImageDontDisplay">
                            <span autoid="__Microsoft_O365_ShellG2_Owa_templates_cs_01" class="wf-size-x14 o365cs-notifications-text o365cs-segoeRegular">
                                FirstName LastName
                            </span>
                            <span autoid="__Microsoft_O365_ShellG2_Owa_templates_cs_11" class="wf-size-x12 o365cs-notifications-text o365cs-segoeSemiBold ms-fcl-tp">
                                test
                            </span>
                            <span autoid="__Microsoft_O365_ShellG2_Owa_templates_cs_21" class="wf-size-x12 o365cs-notifications-text o365cs-notifications-bodypreviewtext o365cs-segoeSemiLight ms-fcl-ns">
                            test
                            </span>
                        </div> 
                        <button type="button" class="o365cs-notifications-closeButton ms-fcl-np ms-bgc-w-h o365button"aria-label="Schließen">
                            <span
                                class="o365cs-notifications-closeIcon owaimg ms-Icon--x ms-icon-font-size-16">
                            </span>
                        </button>
                    </div>
                </div>
                */

        const text = onPremise.querySelectorAll('span');
        if (text && text.length === 5) {
          const address = text.item(1)?.textContent;
          const subject = text.item(2)?.textContent;
          if (address && subject) {
            ipcRenderer.invoke('showEmailNotification', {
              address,
              subject,
            });
            return true;
          } else {
            console.log(
              'Could not read new mail callout since expected hierarchy not fulfilled - no address/subject',
              node.outerHTML,
            );
          }
        } else {
          console.log(
            'Could not read new mail callout since expected hierarchy not fulfilled - ' + text.length,
            node.outerHTML,
          );
        }
      }
    }
  }
  return false;
}

/**
 * Event handler for added elements on the Fluent UI callout div
 * @param node
 */
function onNotificationElementAdded(node: Node) {
  if (node instanceof HTMLElement) {
    if (!parseEmail(node)) {
      if (!parseReminder(node)) {
        console.log('Unknown notification', node.outerHTML);
      }
    }
  }
}

/**
 * Register the notification observer on the Fluent UI callout div
 */
function registerNotificationObserver() {
  console.log('Trying to register callout observer');
  const layerDiv = ['.ms-Layer-content', '.o365cs-notifications-notificationPopupArea']
    .map((s) => document.querySelector(s))
    .find((d) => !!d);
  if (layerDiv) {
    const observer = new MutationObserver((mutations) => {
      try {
        mutations.forEach((mutation) => mutation.addedNodes.forEach(onNotificationElementAdded));
      } catch (ex) {
        console.log(ex);
      }
    });

    console.log('Starting observer for notifications');
    observer.observe(layerDiv, { childList: true, subtree: true });

    console.log('Searching for existing reminders');
    document.querySelectorAll("button[data-storybook='reminder']").forEach(parseReminder);
  } else {
    console.log('Could not register notification observer. Notifications not supported, Retrying in 5 seconds');
    setTimeout(() => {
      registerNotificationObserver();
    }, 5000);
  }
}

function registerLanguageObserver() {
  console.log('Trying to register language observer');
  const observer = new MutationObserver((mutations) => {
    try {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'lang') {
          const newValue = document.getElementsByTagName('html')[0].getAttribute('lang');
          console.log('Language changed from ' + mutation.oldValue + ' to ' + newValue);
          ipcRenderer.invoke('onLanguageChanged', newValue);
        }
      });
    } catch (ex) {
      console.log(ex);
    }
  });

  observer.observe(document.getElementsByTagName('html')[0], { childList: false, subtree: false, attributes: true });
}

function registerHeadingObserver() {
  setTimeout(() => {
    const title = document.querySelector("div[role='heading'][title]");
    if (title) {
      console.log('Found title');
      document.title = title.getAttribute('title') as string;
    } else {
      console.log('No title available');
    }
  }, 1000);
}

let storageReseted = false;

async function init(i = 1) {
  if (document.getElementById('loadingScreen')) {
    // If the loading screen does not disappear, we have to reset cache
    if (!storageReseted && i > 30) {
      await ipcRenderer.invoke('resetStorage');
      storageReseted = true;
    }
    setTimeout(() => {
      init(i++);
    }, 1000);
  } else {
    registerHeadingObserver();
    registerLanguageObserver();
    await ipcRenderer.invoke('onLanguageChanged', document.getElementsByTagName('html')[0].getAttribute('lang'));
    registerNotificationObserver();
  }
}

setTimeout(() => {
  init();
}, 1000);
