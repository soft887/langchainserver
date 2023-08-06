"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../../../src/utils");
const core_1 = require("./core");
class ChatHuggingFace_ChatModels {
    constructor() {
        this.label = 'ChatHuggingFace';
        this.name = 'chatHuggingFace';
        this.type = 'ChatHuggingFace';
        this.icon = 'huggingface.png';
        this.category = 'Engines';
        this.description = 'Wrapper around HuggingFace large language models';
        this.baseClasses = [this.type, 'BaseChatModel', ...(0, utils_1.getBaseClasses)(core_1.HuggingFaceInference)];
        this.inputs = [
            {
                label: 'Model',
                name: 'model',
                type: 'string',
                placeholder: 'gpt2'
            },
            {
                label: 'HuggingFace Api Key',
                name: 'apiKey',
                type: 'password'
            },
            {
                label: 'Temperature',
                name: 'temperature',
                type: 'number',
                description: 'Temperature parameter may not apply to certain model. Please check available model parameters',
                optional: true,
                additionalParams: true
            },
            {
                label: 'Max Tokens',
                name: 'maxTokens',
                type: 'number',
                description: 'Max Tokens parameter may not apply to certain model. Please check available model parameters',
                optional: true,
                additionalParams: true
            },
            {
                label: 'Top Probability',
                name: 'topP',
                type: 'number',
                description: 'Top Probability parameter may not apply to certain model. Please check available model parameters',
                optional: true,
                additionalParams: true
            },
            {
                label: 'Top K',
                name: 'hfTopK',
                type: 'number',
                description: 'Top K parameter may not apply to certain model. Please check available model parameters',
                optional: true,
                additionalParams: true
            },
            {
                label: 'Frequency Penalty',
                name: 'frequencyPenalty',
                type: 'number',
                description: 'Frequency Penalty parameter may not apply to certain model. Please check available model parameters',
                optional: true,
                additionalParams: true
            },
            {
                label: 'Endpoint',
                name: 'endpoint',
                type: 'string',
                placeholder: 'https://xyz.eu-west-1.aws.endpoints.huggingface.cloud/gpt2',
                description: 'Using your own inference endpoint',
                optional: true,
                additionalParams: true
            }
        ];
    }
    async init(nodeData) {
        const model = nodeData.inputs?.model;
        const apiKey = nodeData.inputs?.apiKey;
        const temperature = nodeData.inputs?.temperature;
        const maxTokens = nodeData.inputs?.maxTokens;
        const topP = nodeData.inputs?.topP;
        const hfTopK = nodeData.inputs?.hfTopK;
        const frequencyPenalty = nodeData.inputs?.frequencyPenalty;
        const endpoint = nodeData.inputs?.endpoint;
        const obj = {
            model,
            apiKey
        };
        if (temperature)
            obj.temperature = parseFloat(temperature);
        if (maxTokens)
            obj.maxTokens = parseInt(maxTokens, 10);
        if (topP)
            obj.topP = parseInt(topP, 10);
        if (hfTopK)
            obj.topK = parseInt(hfTopK, 10);
        if (frequencyPenalty)
            obj.frequencyPenalty = parseInt(frequencyPenalty, 10);
        if (endpoint)
            obj.endpoint = endpoint;
        const huggingFace = new core_1.HuggingFaceInference(obj);
        return huggingFace;
    }
}
module.exports = { nodeClass: ChatHuggingFace_ChatModels };
//# sourceMappingURL=ChatHuggingFace.js.map