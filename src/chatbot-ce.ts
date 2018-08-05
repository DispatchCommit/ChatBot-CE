// Imports
require("dotenv").config();
import * as WebSocket from "websocket";
import * as Ora from "ora";
import chalk from "chalk";
import * as rp from "request-promise";
import { fs } from "mz";
import * as mkdirp from "mkdirp";
import * as path from "path";
import { API as BotAPI } from "./lib/API";
import { Parser as BotParser } from "./lib/Parser";


// Variables
let websocketClient = new WebSocket.client();
let spinner = new Ora("Connecting to StreamMe socket server.");
let botAPI: BotAPI;
let botParser: BotParser;
let alreadyConnected: boolean = false;

// Logger
mkdirp(path.dirname("./logs/latest.log"), (error) => {
    if(error) {
        console.log(error);
        process.exit();
    }

    fs.writeFile("./logs/latest.log", "");
});

const log = require('logger-alt').createLogger('./logs/latest.log')

spinner.start();
websocketClient.connect("wss://www.stream.me/api-rooms/v3/ws");

websocketClient.addListener("connect", (connection) => {
    spinner.succeed("Connected to StreamMe socket server.");
    let authorizeSpinner = new Ora("Authorizing bot and obtaining access token.").start();
    rp({
        method: "POST",
        uri: "https://www.stream.me/api-auth/v1/login-bot",
        body: {
            key: process.env.BOT_KEY,
            secret: process.env.BOT_SECRET
        },
        headers: {
            "Content-Type": "application/json"
        },
        json: true
    }).then((response) => {
        authorizeSpinner.succeed("Bot authorized and access token has been obtained.");

        if (!alreadyConnected) {
            botAPI = new BotAPI(response.access_token, "user:" + process.env.USER_ID + ":web");
            new Ora("Bot API initiated and ready to go!").succeed();

            botParser = new BotParser(botAPI);
            new Ora("Bot parser initiated and ready to go!").succeed();

            alreadyConnected = true;
        }

        connection.addListener("message", (message) => {
            if(message.type.toLowerCase() == "utf8") {
                if(message.utf8Data.startsWith("chat message")) {
                    botParser.parseUTF8(message.utf8Data.split("chat message ")[1]);
                }
            }
        });
    
        connection.addListener("close", (code, description) => {
            console.log(chalk.red("WebSocket connection closed."));
            console.log(chalk.red("Code: " + code));
            console.log(chalk.red("Description: " + description));
            log.error("WebSocket connection closed with code " + code + ". Description \"" + description + "\"");
            
            setTimeout(() => {
                console.log("Reconnecting to StreamMe.");
                websocketClient.connect("wss://www.stream.me/api-rooms/v3/ws");
            }, 1250);
        });
    
        connection.send('chat ' + JSON.stringify({ action: "join", room: "user:" + process.env.USER_ID + ":web" }));
    }).catch((error) => {
        authorizeSpinner.fail("Failed to obtain access token from StreamMe");
        
        if(process.env.CHATBOT_DEBUG) {
            console.log(error);
        }

        log.error(error.message);
        process.exit(1);
    });
});

websocketClient.addListener("connectFailed", (error) => {
    spinner.fail("Failed to connect to StreamMe socket server.");
    log.error(error.message);
});