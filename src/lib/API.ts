import * as rp from "request-promise";
import { IRosterList, IRosterMember } from "./interfaces/RosterInterface";

export class API {
    private headers = {};
    private urlBase = "https://www.stream.me";
    private urlAPICommandBase = this.urlBase + "/api-commands/v1/"
    private urlAPICommand = this.urlAPICommandBase + "room/" + this.roomId + "/command/"
    private queueSay: Array<any>
    
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

    public whisper(message: string, userId: string): Promise<any> {
        return this.makeRequest({
            method: "POST",
            uri: this.urlAPICommandBase + "command/whisper/user/" + userId,
            body: {
                message: message
            },
            headers: this.headers,
            json: true,
        });
    }

    /**
     * Erase a set of messaages from the chat.
     * 
     * @param {string[]} messageIds The ids of the messages to erase from the chat.
     * @return {Promise}
     */
    public erase(messageIds: number[]): Promise<any> {
        return this.makeRequest({
            method: "POST",
            uri: this.urlAPICommand + "erase",
            body: {
                messageIds: messageIds,
            },
            headers: this.headers,
            json: true,
        });
    }

    /**
     * Gets the current chat roster.
     * 
     * @returns {Promise}
     */
    public roster(): Promise<any> {
        return new Promise((resolve, reject) => {
            this.makeRequest({
                method: "GET",
                uri: this.urlBase + "/api-chat/v2/rooms/" + this.roomId + "/roster",
                headers: this.headers,
                json: true,
            }).then(response => {
                let roster = <IRosterList> {
                    retrieved_at: Date.now(),
                    members: [],
                };
    
                response._embedded.roster.forEach((el: any) => {
                    let member: IRosterMember = {
                        userId: el.publicId,
                        username: el.username,
                        chatroomId: "user:" + el.publicId + ":web",
                        slug: el.slug,
                        role: el.role,
                        previousRole: el.previousRole,
                        subscriber: el.subscriber,
                        supporter: el.supporter,
                        avatar: el.avatar.href
                    };

                    roster.members.push(member);
                });
    
                resolve(roster);
            }).catch(error => {
                reject(error);
            });
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