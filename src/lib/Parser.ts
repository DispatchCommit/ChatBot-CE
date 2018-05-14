import { Helper as BotHelper } from "./Helpers";
import * as Ora from "ora";
import * as fs from "fs";
import * as path from "path";
import chalk from "chalk";

export class Parser {
    public helper: BotHelper;
    public commands = {};

    constructor() {
        this.helper = new BotHelper(process.env.COMMAND_PREFIX);
        new Ora("Bot helpers initiated and ready to go!").succeed();

        this.loadAddons();
    }

    public parse(message: Message) {
        
    }

    private loadAddons(): void {
        //let addonSpinner = new Ora("Loading bot addons.").start();
        let addonFolders = this.getFolders(process.env.ADDON_FOLDER);
        console.log(process.env.ADDON_FOLDER);
        console.log(addonFolders);
    }

    private getFolders(folderPath: string) {
        return fs.readdirSync(folderPath).filter((file) => {
            return fs.statSync(path.join(folderPath, file)).isDirectory();
        });
    }
}

interface Message {

}