// Imports
require("dotenv").config();
import * as WebSocket from "websocket";
import * as Ora from "ora";
import chalk from "chalk";
import { API as BotAPI } from "./lib/API";
import * as rp from "request-promise";

// Variables
const log = require('logger').createLogger('./logs/latest.log')
let websocketClient = new WebSocket.client();
let spinner = new Ora("Connecting to StreamMe socket server.");
let botAPI: BotAPI;

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
        botAPI = new BotAPI(response.access_token, "user:" + process.env.USER_ID + ":web");
        authorizeSpinner.succeed("Bot authorized and access token has been obtained.");

        connection.addListener("message", (message) => {
            //
        });
    
        connection.addListener("close", (code, description) => {
            console.log(chalk.red("WebSocket connection closed."));
            console.log(chalk.red("Code: " + code));
            console.log(chalk.red("Description: " + description));
            process.exit(0);
        });
    
        connection.send('chat ' + JSON.stringify({ action: "join", room: "user:" + process.env.USER_ID + ":web" }));
    }).catch((error) => {
        authorizeSpinner.fail("Failed to obtain access token from StreamMe");
        log.error(error.message);
        process.exit(1);
    });
});

websocketClient.addListener("connectFailed", (error) => {
    spinner.fail("Failed to connect to StreamMe socket server.");
    log.error(error.message);
});