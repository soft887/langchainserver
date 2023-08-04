import { Tool } from 'langchain/tools';
import { ICommonObject } from '../../../src/Interface';
export declare class MakeWebhookTool extends Tool {
    private url;
    name: string;
    description: string;
    method: string;
    headers: ICommonObject;
    constructor(url: string, description: string, method?: string, headers?: ICommonObject);
    _call(): Promise<string>;
}
