import { IChatMessage, MessageType } from '../Interface';
export declare class ChatMessage implements IChatMessage {
    id: string;
    role: MessageType;
    chatflowid: string;
    content: string;
    sourceDocuments?: string;
    createdDate: Date;
}
