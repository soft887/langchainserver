"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../../../src/utils");
const openai_1 = require("langchain/llms/openai");
class ChatLocalAI_ChatModels {
    constructor() {
        this.label = 'ChatLocalAI';
        this.name = 'chatLocalAI';
        this.type = 'ChatLocalAI';
        this.icon = 'localai.png';
        this.category = 'Engines';
        this.description = 'Use local LLMs like llama.cpp, gpt4all using LocalAI';
        this.baseClasses = [this.type, 'BaseChatModel', ...(0, utils_1.getBaseClasses)(openai_1.OpenAIChat)];
        this.inputs = [
            {
                label: 'Base Path',
                name: 'basePath',
                type: 'string',
                placeholder: 'http://localhost:8080/v1'
            },
            {
                label: 'Model Name',
                name: 'modelName',
                type: 'string',
                placeholder: 'gpt4all-lora-quantized.bin'
            },
            {
                label: 'Temperature',
                name: 'temperature',
                type: 'number',
                default: 0.9,
                optional: true
            },
            {
                label: 'Max Tokens',
                name: 'maxTokens',
                type: 'number',
                optional: true,
                additionalParams: true
            },
            {
                label: 'Top Probability',
                name: 'topP',
                type: 'number',
                optional: true,
                additionalParams: true
            },
            {
                label: 'Timeout',
                name: 'timeout',
                type: 'number',
                optional: true,
                additionalParams: true
            }
        ];
    }
    async init(nodeData) {
        const temperature = nodeData.inputs?.temperature;
        const modelName = nodeData.inputs?.modelName;
        const maxTokens = nodeData.inputs?.maxTokens;
        const topP = nodeData.inputs?.topP;
        const timeout = nodeData.inputs?.timeout;
        const basePath = nodeData.inputs?.basePath;
        const obj = {
            temperature: parseFloat(temperature),
            modelName,
            openAIApiKey: 'sk-'
        };
        if (maxTokens)
            obj.maxTokens = parseInt(maxTokens, 10);
        if (topP)
            obj.topP = parseInt(topP, 10);
        if (timeout)
            obj.timeout = parseInt(timeout, 10);
        const model = new openai_1.OpenAIChat(obj, { basePath });
        return model;
    }
}
module.exports = { nodeClass: ChatLocalAI_ChatModels };
//# sourceMappingURL=ChatLocalAI.js.map