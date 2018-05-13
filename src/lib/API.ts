import * as rp from "request-promise";

export class API {
    private headers = {};
    private urlBase = "https://www.stream.me";
    private urlAPICommand = this.urlBase + "/api-commands/v1/room/${this.roomId}/command/"
    
    constructor(private bearer_token: string, public roomId: string) {
        this.headers = {
            "Authorization" : "Bearer " + this.bearer_token,
            "Content-Type" : "application/json" 
        };
    }

    /**
     * Send a message to the chat.
     * 
     * @param string message
     * @returns json
     */
    public say(message: string) {
        /*rp({
            method: "POST", 
            uri: this.urlAPICommand + "say"
        })*/
        console.log('Testing')
    }
}