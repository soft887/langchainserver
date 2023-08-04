"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../../../src/utils");
const memory_1 = require("langchain/memory");
class MotorMemory_Memory {
    constructor() {
        this.label = 'Motorhead Memory';
        this.name = 'motorheadMemory';
        this.type = 'MotorheadMemory';
        this.icon = 'motorhead.png';
        this.category = 'Memory';
        this.description = 'Remembers previous conversational back and forths directly';
        this.baseClasses = [this.type, ...(0, utils_1.getBaseClasses)(memory_1.MotorheadMemory)];
        this.inputs = [
            {
                label: 'Base URL',
                name: 'baseURL',
                type: 'string',
                optional: true,
                description: 'To use the online version, leave the URL blank. More details at https://getmetal.io.'
            },
            {
                label: 'Memory Key',
                name: 'memoryKey',
                type: 'string',
                default: 'chat_history'
            },
            {
                label: 'Session Id',
                name: 'sessionId',
                type: 'string',
                description: 'if empty, chatId will be used automatically',
                default: '',
                additionalParams: true,
                optional: true
            },
            {
                label: 'API Key',
                name: 'apiKey',
                type: 'password',
                description: 'Only needed when using hosted solution - https://getmetal.io',
                additionalParams: true,
                optional: true
            },
            {
                label: 'Client ID',
                name: 'clientId',
                type: 'string',
                description: 'Only needed when using hosted solution - https://getmetal.io',
                additionalParams: true,
                optional: true
            }
        ];
    }
    async init(nodeData, _, options) {
        return initalizeMotorhead(nodeData, options);
    }
    async clearSessionMemory(nodeData, options) {
        const motorhead = initalizeMotorhead(nodeData, options);
        motorhead.clear();
    }
}
const initalizeMotorhead = (nodeData, options) => {
    const memoryKey = nodeData.inputs?.memoryKey;
    const baseURL = nodeData.inputs?.baseURL;
    const sessionId = nodeData.inputs?.sessionId;
    const apiKey = nodeData.inputs?.apiKey;
    const clientId = nodeData.inputs?.clientId;
    const chatId = options?.chatId;
    let obj = {
        returnMessages: true,
        sessionId: sessionId ? sessionId : chatId,
        memoryKey
    };
    if (baseURL) {
        obj = {
            ...obj,
            url: baseURL
        };
    }
    else {
        obj = {
            ...obj,
            apiKey,
            clientId
        };
    }
    return new memory_1.MotorheadMemory(obj);
};
module.exports = { nodeClass: MotorMemory_Memory };
//# sourceMappingURL=MotorheadMemory.js.map