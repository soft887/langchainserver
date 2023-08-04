"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../../../src/utils");
const openai_1 = require("langchain/llms/openai");
class OpenAI_LLMs {
    constructor() {
        this.label = 'OpenAI';
        this.name = 'openAI';
        this.type = 'OpenAI';
        this.icon = 'openai.png';
        this.category = 'LLMs';
        this.description = 'Wrapper around OpenAI large language models';
        this.baseClasses = [this.type, ...(0, utils_1.getBaseClasses)(openai_1.OpenAI)];
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
                        label: 'text-davinci-003',
                        name: 'text-davinci-003'
                    },
                    {
                        label: 'text-davinci-002',
                        name: 'text-davinci-002'
                    },
                    {
                        label: 'text-curie-001',
                        name: 'text-curie-001'
                    },
                    {
                        label: 'text-babbage-001',
                        name: 'text-babbage-001'
                    }
                ],
                default: 'text-davinci-003',
                optional: true
            },
            {
                label: 'Temperature',
                name: 'temperature',
                type: 'number',
                default: 0.7,
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
                label: 'Best Of',
                name: 'bestOf',
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
                label: 'Batch Size',
                name: 'batchSize',
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
        const batchSize = nodeData.inputs?.batchSize;
        const bestOf = nodeData.inputs?.bestOf;
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
        if (batchSize)
            obj.batchSize = parseInt(batchSize, 10);
        if (bestOf)
            obj.bestOf = parseInt(bestOf, 10);
        const model = new openai_1.OpenAI(obj, {
            basePath
        });
        return model;
    }
}
module.exports = { nodeClass: OpenAI_LLMs };
//# sourceMappingURL=OpenAI.js.map