import * as rp from "request-promise";

export class API {
    private headers = {};
    private urlBase = "https://www.stream.me";
    private urlAPICommand = this.urlBase + "/api-commands/v1/room/" + this.roomId + "/command/"
    
    /**
     * A constructor for the bot API.
     * 
     * @constructor
     * @param {string} bearer_token The access beaerer token gotten from bot authorization route from StreamMe.
     * @param {string} roomId The user's room id to send data too.
     */
    constructor(private bearer_token: string, public roomId: string) {
        this.headers = {
            "Authorization" : "Bearer " + this.bearer_token,
            "Content-Type" : "application/json" 
        };
    }

    /**
     * Send a message to the chat.
     * 
     * @param {string} message The message you want to send to the chat.
     * @returns {Promise}
     */
    public say(message: string): Promise<any> {
        return this.makeRequest({
            method: "POST",
            uri: this.urlAPICommand + "say",
            body: {
                message: message,
            },
            headers: this.headers,
            json: true,
        });
    }

    public roster(): Promise<any> {
        return this.makeRequest({
            method: "GET",
            uri: this.urlBase + "/api-chat/v2/rooms/" + this.roomId + "/roster",
            headers: this.headers,
            json: true,
        });
    }

    /**
     * A generic method to return a new Promise request.
     * 
     * @param {any} options A JSON object to pass through to request.
     */
    private makeRequest(options: any): Promise<any> {
        return new Promise((resolve, reject) => {
            rp(options).then((response: any) => {
                resolve(response);
            }).catch((error: any) => {
                reject(error);
            });
        });
    }
}