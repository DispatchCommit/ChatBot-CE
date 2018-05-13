// Imports
require("dotenv").config();
import * as WebSocket from "websocket";
import * as Ora from "ora";
import { API as BotAPI} from "./lib/API";

// Variables
const log = require('logger').createLogger('./logs/latest.log')
let websocketClient = new WebSocket.client();
let spinner = new Ora("Connecting to StreamMe socket server.");

spinner.start();
websocketClient.connect("wss://www.stream.me/api-rooms/v3/ws");

websocketClient.addListener("connect", (connection) => {
    spinner.succeed("Connected to StreamMe socket server.");

    const botAPI = new BotAPI("testing", "testing");
    botAPI.say("Hello");
});

websocketClient.addListener("connectFailed", (error) => {
    spinner.fail("Failed to connect to StreamMe socket server.");
    log.error(error.message);
});