import { IUser } from "./UserInterface";

export interface IRosterList {
    members: Array<IRosterMember>;
    retrieved_at: number;
}

export interface IRosterMember extends IUser {
    avatar: string;
    role: string;
    previousRole: string;
    subscriber: boolean;
    supporter: boolean;
}