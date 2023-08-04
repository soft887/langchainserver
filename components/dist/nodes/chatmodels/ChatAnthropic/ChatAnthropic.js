"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../../../src/utils");
const anthropic_1 = require("langchain/chat_models/anthropic");
class ChatAnthropic_ChatModels {
    constructor() {
        this.label = 'ChatAnthropic';
        this.name = 'chatAnthropic';
        this.type = 'ChatAnthropic';
        this.icon = 'chatAnthropic.png';
        this.category = 'Chat Models';
        this.description = 'Wrapper around ChatAnthropic large language models that use the Chat endpoint';
        this.baseClasses = [this.type, ...(0, utils_1.getBaseClasses)(anthropic_1.ChatAnthropic)];
        this.inputs = [
            {
                label: 'ChatAnthropic Api Key',
                name: 'anthropicApiKey',
                type: 'password'
            },
            {
                label: 'Model Name',
                name: 'modelName',
                type: 'options',
                options: [
                    {
                        label: 'claude-2',
                        name: 'claude-2',
                        description: 'Claude 2 latest major version, automatically get updates to the model as they are released'
                    },
                    {
                        label: 'claude-instant-1',
                        name: 'claude-instant-1',
                        description: 'Claude Instant latest major version, automatically get updates to the model as they are released'
                    },
                    {
                        label: 'claude-v1',
                        name: 'claude-v1'
                    },
                    {
                        label: 'claude-v1-100k',
                        name: 'claude-v1-100k'
                    },
                    {
                        label: 'claude-v1.0',
                        name: 'claude-v1.0'
                    },
                    {
                        label: 'claude-v1.2',
                        name: 'claude-v1.2'
                    },
                    {
                        label: 'claude-v1.3',
                        name: 'claude-v1.3'
                    },
                    {
                        label: 'claude-v1.3-100k',
                        name: 'claude-v1.3-100k'
                    },
                    {
                        label: 'claude-instant-v1',
                        name: 'claude-instant-v1'
                    },
                    {
                        label: 'claude-instant-v1-100k',
                        name: 'claude-instant-v1-100k'
                    },
                    {
                        label: 'claude-instant-v1.0',
                        name: 'claude-instant-v1.0'
                    },
                    {
                        label: 'claude-instant-v1.1',
                        name: 'claude-instant-v1.1'
                    },
                    {
                        label: 'claude-instant-v1.1-100k',
                        name: 'claude-instant-v1.1-100k'
                    }
                ],
                default: 'claude-v1',
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
                name: 'maxTokensToSample',
                type: 'number',
                optional: true,
                additionalParams: true
            },
            {
                label: 'Top P',
                name: 'topP',
                type: 'number',
                optional: true,
                additionalParams: true
            },
            {
                label: 'Top K',
                name: 'topK',
                type: 'number',
                optional: true,
                additionalParams: true
            }
        ];
    }
    async init(nodeData) {
        const temperature = nodeData.inputs?.temperature;
        const modelName = nodeData.inputs?.modelName;
        const anthropicApiKey = nodeData.inputs?.anthropicApiKey;
        const maxTokensToSample = nodeData.inputs?.maxTokensToSample;
        const topP = nodeData.inputs?.topP;
        const topK = nodeData.inputs?.topK;
        const streaming = nodeData.inputs?.streaming;
        const obj = {
            temperature: parseFloat(temperature),
            modelName,
            anthropicApiKey,
            streaming: streaming ?? true
        };
        if (maxTokensToSample)
            obj.maxTokensToSample = parseInt(maxTokensToSample, 10);
        if (topP)
            obj.topP = parseInt(topP, 10);
        if (topK)
            obj.topK = parseInt(topK, 10);
        const model = new anthropic_1.ChatAnthropic(obj);
        return model;
    }
}
module.exports = { nodeClass: ChatAnthropic_ChatModels };
//# sourceMappingURL=ChatAnthropic.js.map