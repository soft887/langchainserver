"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../../../src/utils");
const openai_1 = require("langchain/chat_models/openai");
class ChatOpenAI_ChatModels {
    constructor() {
        this.label = 'ChatOpenAI';
        this.name = 'chatOpenAI';
        this.type = 'ChatOpenAI';
        this.icon = 'openai.png';
        this.category = 'Chat Models';
        this.description = 'Wrapper around OpenAI large language models that use the Chat endpoint';
        this.baseClasses = [this.type, ...(0, utils_1.getBaseClasses)(openai_1.ChatOpenAI)];
        this.inputs = [
            {
                label: 'OpenAI Api Key',
                name: 'openAIApiKey',
                type: 'password'
            },
            {
                label: 'Model Name',
                name: 'modelName',
                type: 'options',
                options: [
                    {
                        label: 'gpt-4',
                        name: 'gpt-4'
                    },
                    {
                        label: 'gpt-4-0613',
                        name: 'gpt-4-0613'
                    },
                    {
                        label: 'gpt-4-32k',
                        name: 'gpt-4-32k'
                    },
                    {
                        label: 'gpt-4-32k-0613',
                        name: 'gpt-4-32k-0613'
                    },
                    {
                        label: 'gpt-3.5-turbo',
                        name: 'gpt-3.5-turbo'
                    },
                    {
                        label: 'gpt-3.5-turbo-0613',
                        name: 'gpt-3.5-turbo-0613'
                    },
                    {
                        label: 'gpt-3.5-turbo-16k',
                        name: 'gpt-3.5-turbo-16k'
                    },
                    {
                        label: 'gpt-3.5-turbo-16k-0613',
                        name: 'gpt-3.5-turbo-16k-0613'
                    }
                ],
                default: 'gpt-3.5-turbo',
                optional: true
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
                label: 'Frequency Penalty',
                name: 'frequencyPenalty',
                type: 'number',
                optional: true,
                additionalParams: true
            },
            {
                label: 'Presence Penalty',
                name: 'presencePenalty',
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
            },
            {
                label: 'BasePath',
                name: 'basepath',
                type: 'string',
                optional: true,
                additionalParams: true
            }
        ];
    }
    async init(nodeData) {
        const temperature = nodeData.inputs?.temperature;
        const modelName = nodeData.inputs?.modelName;
        const openAIApiKey = nodeData.inputs?.openAIApiKey;
        const maxTokens = nodeData.inputs?.maxTokens;
        const topP = nodeData.inputs?.topP;
        const frequencyPenalty = nodeData.inputs?.frequencyPenalty;
        const presencePenalty = nodeData.inputs?.presencePenalty;
        const timeout = nodeData.inputs?.timeout;
        const streaming = nodeData.inputs?.streaming;
        const basePath = nodeData.inputs?.basepath;
        const obj = {
            temperature: parseFloat(temperature),
            modelName,
            openAIApiKey,
            streaming: streaming ?? true
        };
        if (maxTokens)
            obj.maxTokens = parseInt(maxTokens, 10);
        if (topP)
            obj.topP = parseInt(topP, 10);
        if (frequencyPenalty)
            obj.frequencyPenalty = parseInt(frequencyPenalty, 10);
        if (presencePenalty)
            obj.presencePenalty = parseInt(presencePenalty, 10);
        if (timeout)
            obj.timeout = parseInt(timeout, 10);
        const model = new openai_1.ChatOpenAI(obj, {
            basePath
        });
        return model;
    }
}
module.exports = { nodeClass: ChatOpenAI_ChatModels };
//# sourceMappingURL=ChatOpenAI.js.map