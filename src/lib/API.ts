import * as rp from "request-promise";
import { IRosterList, IRosterMember } from "./interfaces/RosterInterface";
import * as Bunyan from "bunyan";
import { IMultistream } from "./interfaces/MultistreamInterface";

export class API {
    private headers = {};
    private roomId: string;
    private urlBase = "https://www.stream.me";
    private urlAPICommandBase = this.urlBase + "/api-commands/v1/";
    private urlAPICommand: string;
    private queueSay: Array<any> = [];
    private multistreamsArray: Array<IMultistream> = [];
    
    /**
     * A constructor for the bot API.
     * 
     * @constructor
     * @param {string} bearerToken The access beaerer token gotten from bot authorization route from StreamMe.
     * @param {string} userId The user's room id to send data too.
     */
    constructor(private bearerToken: string, private userId: string, public log: Bunyan) {
        this.headers = {
            "Authorization" : "Bearer " + this.bearerToken,
            "Content-Type" : "application/json" 
        };

        this.roomId = `user:${this.userId}:web`;
        this.urlAPICommand = this.urlAPICommandBase + "room/" + this.roomId + "/command/";

        this.makeRequest({
            method: "GET",
            uri: `${this.urlBase}/api-multistream/v1/users/${this.userId}`,
            headers: this.headers,
            json: true,
        }).then(response => {
            response._embedded.multistreams.forEach((stream: any) => {
                if (stream.ended) {
                    return;
                }

                let multistream: IMultistream = {
                    publicId: stream.publicId,
                    chatroomId: stream.chatroomId,
                    title: stream.title,
                    slug: stream.slug,
                    description: stream.description,
                    liveStreamCount: stream.liveStreamCount
                };

                this.multistreamsArray.push(multistream);
            });
        }).catch(error => {
            this.log.error(error);
        });

        setInterval(() => {
            if (this.queueSay.length > 0) {
                let item = this.queueSay.shift();
                this.makeRequest(item).catch(error => {
                    this.log.error(error);
                });
            }
        }, 600);
    }

    /**
     * Send a message to the chat.
     * 
     * @param {string} message The message you want to send to the chat.
     * @returns {Promise}
     */
    public say(message: string): Promise<any> {
        return new Promise((resolve, reject) => {
            this.queueSay.push({
                method: "POST",
                uri: this.urlAPICommand + "say",
                body: {
                    message: message,
                },
                headers: this.headers,
                json: true,
            });

            resolve();
        });
    }

    /**
     * Send a whisper.
     * 
     * @param message 
     * @param userId 
     * @returns {Promise}
     */
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
     * @param chatroomId 
     * @returns {Promise}
     */
    public roster(chatroomId?: string): Promise<any> {
        return new Promise((resolve, reject) => {
            this.makeRequest({
                method: "GET",
                uri: this.urlBase + "/api-chat/v2/rooms/" + (chatroomId ? chatroomId : this.roomId) + "/roster",
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
     * Get all the multistreams the user is a part of.
     * 
     * @param removeEnded 
     * @returns {Array<IMultistream>}
     */
    public multistreams(removeEnded: boolean = true): Array<IMultistream> {
        return this.multistreamsArray;
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