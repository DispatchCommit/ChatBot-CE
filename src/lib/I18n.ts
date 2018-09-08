let fs = require("fs");
let path = require("path");

export class I18n {
    private i18nJson: { [index: string] : string} = null;

    constructor(addonName: string) {
        if (fs.existsSync(path.join(`./i18n/${addonName}/${process.env.I18N_LANGUAGE}.json`))) {
            this.i18nJson = JSON.parse(fs.readFileSync(`./i18n/${addonName}/${process.env.I18N_LANGUAGE}.json`));
        }
    }

    public _(identifier: string, defaultString?: string): string {
        return this.get(identifier, defaultString);
    }

    public get(identifier: string, defaultString: string = null, replacements: Object = null): string {
        if (this.i18nJson !== null && this.i18nJson.hasOwnProperty(identifier)) {
            defaultString = this.i18nJson[identifier];
        }

        if (replacements !== null) {
            defaultString = this.replace(defaultString, replacements);
        }

        return defaultString;
    }

    public replace(replacementString: string, replacements: Object): string {
        for (let [key, value] of Object.entries(replacements)) {
            replacementString = replacementString.replace(`&${key}`, value);
        }

        return replacementString;
    }
}