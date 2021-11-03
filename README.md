

# Owatron

A alternative [Electron-based](https://www.electronjs.org/) Linux desktop app for Microsoft Outlook and Office 365

![](https://user-images.githubusercontent.com/41467575/140048290-5b33eb24-86e3-409c-8d85-860d8410ed41.png)

* Electron
* Typescript
* React
* FluentUI
* Webpack

Based on [Freelook](https://github.com/eNkru/freelook) developed by [eNkru](https://github.com/eNkru)

## Features

* Desktop notifications for mail and reminders 

    ![](https://user-images.githubusercontent.com/41467575/140047903-0d025a20-90b2-4b40-9c11-0e50b5e475e4.png)

* i18n support for desktop notifications and settings dialog based on language setting of outlook
    * en
    * de
    
    Contributions for additional languages welcome 
* Spellchecker support

    ![](https://user-images.githubusercontent.com/41467575/101616444-a7db0000-3a0f-11eb-9b03-ba9ecac85329.png)

* Context menu support
* System Tray integration

    ![grafik](https://user-images.githubusercontent.com/41467575/140047592-48e4411f-07bd-421f-a380-57f77c8d428d.png)

## Roadmap

* Integration with PGP 
    * [mailenvelope](https://github.com/mailvelope/mailvelope)
    * [Local-PGP](https://github.com/x0th/Local-PGP)
    * Custom implementation based on [openpgpjs](https://openpgpjs.org/) 
    
    Ideas and contributions welcome

## Troubleshooting

### Loading hangs on spinner

This is most of the time caused by a invalid/invalidated authentication token. Open the settings dialog and press `Reset cookies`

## Q&A

* Isn't usage of React for the settings dialog like using a sledgehammer to crack a nut ?

    Definitely. But I wanted to use the same framework that is used in OWA to adapt sooner or later L&F of OWA.



## Installation


**Important**

Since electron-builder 21 desktop integration is not a part of produced AppImage file anymore. Electron builder recommends [AppImageLauncher](https://github.com/TheAssassin/AppImageLauncher) to install AppImages and create Desktop Integration or to create the desktop files manually.

## Development
Clone the repository and run in development mode.
```
git clone https://github.com/roggenbrot/owatron.git
cd owatron
yarn
yarn dev
```

### Known Issues

Electron process will not be killed if you end dev mode by `ctrl-c`.

Please stop electron first (Tray->Quiet) and the stop dev mode.

### i18n

i18n in the project is based on i18next. To add a new language open
`i18next-parser.config.js` and add the new language to 

```
locales: ['en','de'],
```

Then run

```
yarn i18n
```

to generate the translation file in `resources/locales/....`


### Release

Build the application 
```
yarn package
```
This will build AppImage and additional Linux pecific packages in the out folder.