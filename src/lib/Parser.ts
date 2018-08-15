import { Helper as BotHelper } from "./Helpers";
import { API as BotAPI } from "./API";
import { IMessage, IChatMessage, IErasedMessage } from "./interfaces/MessageInterfaces";
import * as Ora from "ora";
import * as fs from "fs";
import * as path from "path";
import chalk from "chalk";
import * as Bunyan from "bunyan";

export class Parser {
    public helper: BotHelper;
    public api: BotAPI;
    public commands: any;
    public events: any = {
        onChatMessage: [],
        onEraseMessage: [],
    };

    /**
     * The constructor for the bot parser.
     * 
     * @constructor
     * @param {BotAPI} botAPI An instance of the bot API.
     */
    constructor(botAPI: BotAPI, public log: Bunyan) {
        this.helper = new BotHelper(process.env.COMMAND_PREFIX);
        this.api = botAPI;
        this.commands = {};

        new Ora("Bot helpers initiated and ready to go!").succeed();

        this.loadAddons();
    }

    /**
     * Function to take the raw UTF8 data from the message event and parse it into the Message
     * interface.
     * 
     * @param {any} data Raw UTF8 data to parse.
     */
    public parseUTF8(data: any): void {
        data = JSON.parse(data);
        
        if(data.type == "chat") {
            let chatMessage: IChatMessage = {
                type: <string> data.type,
                room: <string> data.room,
                roomId: <string> data.roomId,
                message: <string> data.data[2],
                messageId: <number> data.data[1],
                createdAt: <number> data.data[8],
                username: <string> data.data[3][1],
                userId: <string> data.data[3][7]
            }

            this.events.onChatMessage.forEach((onChatMessage: any) => {
                onChatMessage.execute(data, chatMessage);
            });

            this.parse(chatMessage);
        } else if(data.type == "messageErased") {
            let erasedMessage: IErasedMessage = {
                type: <string> data.type,
                room: <string> data.room,
                roomId: <string> data.roomId,
                messageIds: data.messageIds,
                removedBy: {
                    username: data.removedBy.slug,
                    userId: data.removedBy.publicID
                },
            }

            this.events.onEraseMessage.forEach((onEraseMessage: any) => {
                onEraseMessage.execute(data, erasedMessage);
            });
        }
    }

    /**
     * Takes an instance of an interface that extends the base Message interface and figures 
     * out how to properly handle that message.
     * 
     * @param {IMessage} message The message to parse.
     */
    public parse(IMessage: IMessage): void {
        if(IMessage.type === "chat") {
            let message: IChatMessage = <IChatMessage> IMessage;

            if(this.helper.isCommand(message.message)) {
                let command = this.helper.getCommand(message.message).toLowerCase();
                let parameters = this.helper.hasParams(message.message) ? this.helper.getParams(message.message) : null;
                
                if(this.commands[command]) {
                    this.commands[command].execute(command, parameters, message);
                }
            }
        }
    }

    private loadAddons(): void {
        let addonSpinner = new Ora("Loading bot addons.");
        let addonFolders = this.getFolders(process.env.ADDON_FOLDER);
        
        for (let index = 0; index < addonFolders.length; index++) {
            const element = addonFolders[index];
            let addon;
            let packageFile;

            try {
                let module = path.resolve(process.env.ADDON_FOLDER + "/" + element)
                addon = require(module);
                packageFile = JSON.parse(fs.readFileSync(path.resolve(module + "/package.json"), "utf8"));

                new Ora("Successfully required addon '" + element + "'").succeed();
                
                if("constructor" in addon) {
                    addon.constructor(this.api, this.helper, this.log.child({
                        widget_type: packageFile.name,
                    }));
                }

                if("commands" in addon) {
                    for(let commandIndex = 0; commandIndex < addon.commands.length; commandIndex++) {
                        if(addon.commands[commandIndex] in addon) {
                            this.commands[addon.commands[commandIndex]] = addon[addon.commands[commandIndex]];
                        }
                    }
                }

                if("onChatMessage" in addon) {
                    this.events.onChatMessage.push(addon["onChatMessage"]);
                }

                if("onEraseMessage" in addon) {
                    this.events.onEraseMessage.push(addon["onEraseMessage"]);
                }
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