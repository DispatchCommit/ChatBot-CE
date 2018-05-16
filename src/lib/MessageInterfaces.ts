export interface Message {
    type: string;
    room: string;
    roomId: string;
}

export interface ChatMessage extends Message {
    message: string;
    messageId: number;
    user?: any[];
    username: string;
    userId: string;
    createdAt: number;
}

export interface EraseMessage extends Message {
    messageIds: number[];
    removedBy: {
        username: string;
        userId: string;
    };
}