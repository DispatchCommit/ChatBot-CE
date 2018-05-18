import { Helper as BotHelper } from "./Helpers";
import { Message, ChatMessage } from "./MessageInterfaces";
import { API as BotAPI } from "./API";
import * as Ora from "ora";
import * as fs from "fs";
import * as path from "path";
import chalk from "chalk";

export class Parser {
    public helper: BotHelper;
    public api: BotAPI;
    public commands = {};

    /**
     * Represents a parser.
     * 
     * @constructor
     */
    constructor(botAPI: BotAPI) {
        this.helper = new BotHelper(process.env.COMMAND_PREFIX);
        this.api = botAPI;

        new Ora("Bot helpers initiated and ready to go!").succeed();

        //this.loadAddons();
    }

    /**
     * Function to take the raw UTF8 data from the message event and parse it into the Message
     * interface.
     * 
     * @param {any} data 
     */
    public parseUTF8(data: any) {
        data = JSON.parse(data);
        
        if(data.type == "chat") {
            let chatMessage: ChatMessage = {
                type: <string> data.type,
                room: <string> data.room,
                roomId: <string> data.roomId,
                message: <string> data.data[2],
                messageId: <number> data.data[1],
                createdAt: <number> data.data[8],
                username: <string> data.data[3][1],
                userId: <string> data.data[3][7]
            }

            this.parse(chatMessage);
        }
    }

    /**
     * Takes an instance of an interface that extends the base Message interface and figures 
     * out how to properly handle that message.
     * 
     * @param {Message} message
     */
    public parse(message: Message) {
        
    }

    private loadAddons(): void {
        let addonSpinner = new Ora("Loading bot addons.").start();
        let addonFolders = this.getFolders(process.env.ADDON_FOLDER);
        
        for (let index = 0; index < addonFolders.length; index++) {
            const element = addonFolders[index];
            let addon;

            try {
                let module = process.env.ADDON_FOLDER + "/" + element;
                addon = require(module);
                new Ora("Successfully required '" + element + "'").succeed();
            } catch (error) {
                new Ora("Failed to load the addon '" + element + "'. Message '" + error.message + "'.").fail();
                continue;
            }
        }

        addonSpinner.succeed("Addons loaded.");
    }

    private getFolders(folderPath: string) {
        return fs.readdirSync(folderPath).filter((file) => {
            return fs.statSync(path.join(folderPath, file)).isDirectory();
        });
    }
}