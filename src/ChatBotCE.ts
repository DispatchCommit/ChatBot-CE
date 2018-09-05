import * as WebSocket from "websocket";
import * as rp from "request-promise";
import * as mkdirp from "mkdirp";
import * as path from "path";
import { API as BotAPI } from "./lib/API";
import { Parser as BotParser } from "./lib/Parser";
import * as Bunyan from "bunyan";
let fs = require("fs");
let bunyanFormat = require("bunyan-format");
let bFormatOut = bunyanFormat({ outputMode: "short" });
let websocketClient = new WebSocket.client();
let botAPI: BotAPI;
let botParser: BotParser;
let alreadyConnected: boolean = false;

if (!fs.existsSync("./.env")) {
    let envStubData = fs.readFileSync(path.join("./stubs/env.stub"));

    fs.writeFileSync("./.env", envStubData);
}

require("dotenv").config();

mkdirp(path.dirname("./logs/ChatBotCE.log"), (error) => {
    if (error) {
        console.log(error);
        process.exit();
    }
});

let log = Bunyan.createLogger({
    name: "ChatBotCE",
    streams: [
        {
            stream: bFormatOut
        },
        {
            type: "rotating-file",
            path: path.join("./logs/ChatBotCE.log"),
            level: "trace"
        }
    ]
});

mkdirp(process.env.ADDON_FOLDER, (error) => {
    if (error) {
        log.error(error);

        process.exit();
    }
});


websocketClient.connect("wss://www.stream.me/api-rooms/v3/ws");

websocketClient.addListener("connect", (connection) => {
    log.info("Connected to StreamMe websocket server.");
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
        log.info("Bot authorized and access token has been obtained.");
        
        if (!alreadyConnected) {
            botAPI = new BotAPI(response.access_token, process.env.USER_ID, log);
            log.info("Bot API initiated and ready to go!");

            botParser = new BotParser(botAPI, log);
            log.info("Bot parser initiated and ready to go!");

            alreadyConnected = true;
        }

        connection.addListener("message", (message) => {
            if (message.type.toLowerCase() === "utf8") {
                if (message.utf8Data.startsWith("chat message")) {
                    botParser.parseUTF8(message.utf8Data.split("chat message ")[1]);
                }
            }
        });
    
        connection.addListener("close", (code, description) => {
            log.warn("WebSocket connection closed with code " + code + ". Description \"" + description + "\"");
            
            setTimeout(() => {
                log.info("Reconnecting to StreamMe.");
                websocketClient.connect("wss://www.stream.me/api-rooms/v3/ws");
            }, 1250);
        });
    
        connection.send("chat " + JSON.stringify({ action: "join", room: "user:" + process.env.USER_ID + ":web" }));
    }).catch((error) => {
        log.fatal("Failed to obtain access token from StreamMe");
        log.fatal(error.message);
        process.exit(1);
    });
});

websocketClient.addListener("connectFailed", (error) => {
    log.fatal("Failed to connect to StreamMe socket server.");
    log.fatal(error.message);
    
    setTimeout(() => {
        log.info("Reconnecting to StreamMe.");
        websocketClient.connect("wss://www.stream.me/api-rooms/v3/ws");
    }, 1250);
});