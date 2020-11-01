import { ContextMenuParams, Menu, MenuItem, WebContents } from "electron";




export function showContextMenu(contents: WebContents|undefined, params: ContextMenuParams) {

    if (contents && params && params.dictionarySuggestions) {
        let show = false;
        const menu = new Menu()
        // Add each spelling suggestion (if available)
        for (const suggestion of params.dictionarySuggestions) {
            menu.append(new MenuItem({
                label: suggestion,
                click: () => contents.replaceMisspelling(suggestion)
            }));
            show = true;
        }

        // Allow users to add the misspelled word to the dictionary
        if (params.misspelledWord) {
            menu.append(
                new MenuItem({
                    label: "Add to dictionary",
                    click: () => contents.session.addWordToSpellCheckerDictionary(params.misspelledWord)
                })
            );
            show = true;
        }

        // Show the context menu if there a spelling suggestion or a misspelled word exist
        if (show) {
            menu.popup();
        }
    }

}