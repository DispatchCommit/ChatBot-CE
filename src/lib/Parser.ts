import { Helper as BotHelper } from "./Helpers";
import { API as BotAPI } from "./API";
import { IMessage, IChatMessage, IErasedMessage } from "./interfaces/MessageInterfaces";
import { PubSub } from "./PubSub";
import * as fs from "fs";
import * as path from "path";
import * as Bunyan from "bunyan";
import { I18n } from "./I18n";

export class Parser {
    public helper: BotHelper;
    public api: BotAPI;
    public commands: any;
    public pubsub: PubSub;
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
        this.pubsub = new PubSub();

        this.log.info("Bot helpers initiated and ready to go!");

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
        
        if (data.type === "chat") {
            let chatMessage: IChatMessage = {
                type: <string> data.type,
                room: <string> data.room,
                roomId: <string> data.roomId,
                message: <string> data.data[2],
                messageId: <number> data.data[1],
                createdAt: <number> data.data[8],
                username: <string> data.data[3][1],
                userRole: <string> data.data[3][3],
                userId: <string> data.data[3][7]
            };

            this.events.onChatMessage.forEach((onChatMessage: any) => {
                onChatMessage.execute(data, chatMessage);
            });

            this.parse(chatMessage);
        } else if (data.type === "messageErased") {
            let erasedMessage: IErasedMessage = {
                type: <string> data.type,
                room: <string> data.room,
                roomId: <string> data.roomId,
                messageIds: data.messageIds,
                removedBy: {
                    username: data.removedBy.slug,
                    userId: data.removedBy.publicID
                },
            };

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
    public parse(message: IMessage): void {
        if (message.type === "chat") {
            let msg: IChatMessage = <IChatMessage> message;

            if (this.helper.isCommand(msg.message)) {
                let command = this.helper.getCommand(msg.message).toLowerCase();
                let parameters = this.helper.hasParams(msg.message) ? this.helper.getParams(msg.message) : null;
                
                if (this.commands[command]) {
                    this.commands[command].execute(command, parameters, msg);
                }
            }
        }
    }

    private loadAddons(): void {
        let addonSpinner = this.log.info("Loading bot addons.");
        let addonFolders = this.helper.getFolders(process.env.ADDON_FOLDER);

        let loadAfter: { [index: string] : Array<string> } = {};
        
        for (let index = 0; index < addonFolders.length; index++) {
            const element = addonFolders[index];

            try {
                let module = path.resolve(process.env.ADDON_FOLDER + "/" + element);
                let packageFile = JSON.parse(fs.readFileSync(path.resolve(module + "/package.json"), "utf8"));

                if (packageFile.chatbotce !== undefined && packageFile.chatbotce.loadAfter !== undefined) {
                    if (loadAfter[packageFile.name] === undefined) {
                        loadAfter[packageFile.chatbotce.loadAfter] = [element];
                    } else {
                        loadAfter[packageFile.chatbotce.loadAfter].push(element);
                    }
                } else {
                    this.loadAddon(module, packageFile);

                    if (loadAfter[packageFile.name] !== undefined && loadAfter[packageFile.name].length > 0) {
                        loadAfter[packageFile.name].forEach((addonToLoad: any) => {
                            let newModule = path.resolve(process.env.ADDON_FOLDER + "/" + addonToLoad);
                            let newPackage = JSON.parse(fs.readFileSync(path.resolve(newModule + "/package.json"), "utf8"));

                            this.loadAddon(newModule, newPackage);
                        });
                    }
                }
            } catch (error) {
                this.log.warn("Failed to load the addon '" + element + "'. " + error.toString());
                continue;
            }
        }
    }

    private loadAddon(addonPath: any, packageFile: any): void {
        let addon = require(addonPath);
        let onChatMessage = "onChatMessage";
        
        let onEraseMessage = "onEraseMessage";
        this.log.info("Successfully required addon '" + packageFile.name + "'");
                
        if ("constructor" in addon) {
            addon.constructor(this.api, this.helper, this.log.child({
                widget_type: packageFile.name,
            }), this.pubsub, new I18n(packageFile.name));
        }

        if ("commands" in addon) {
            for (let commandIndex = 0; commandIndex < addon.commands.length; commandIndex++) {
                if (addon.commands[commandIndex] in addon) {
                    this.commands[addon.commands[commandIndex]] = addon[addon.commands[commandIndex]];
                }
            }
        }

        if (onChatMessage in addon) {
            this.events.onChatMessage.push(addon[onChatMessage]);
        }

        if (onEraseMessage in addon) {
            this.events.onEraseMessage.push(addon[onEraseMessage]);
        }
    }
}