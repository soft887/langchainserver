import { IChatFlow } from '../Interface';
export declare class ChatFlow implements IChatFlow {
    id: string;
    name: string;
    flowData: string;
    deployed?: boolean;
    isPublic?: boolean;
    apikeyid?: string;
    chatbotConfig?: string;
    createdDate: Date;
    updatedDate: Date;
}
