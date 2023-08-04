"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../../../src/utils");
const openai_1 = require("langchain/llms/openai");
class AzureOpenAI_LLMs {
    constructor() {
        this.label = 'Azure OpenAI';
        this.name = 'azureOpenAI';
        this.type = 'AzureOpenAI';
        this.icon = 'Azure.svg';
        this.category = 'LLMs';
        this.description = 'Wrapper around Azure OpenAI large language models';
        this.baseClasses = [this.type, ...(0, utils_1.getBaseClasses)(openai_1.OpenAI)];
        this.inputs = [
            {
                label: 'Azure OpenAI Api Key',
                name: 'azureOpenAIApiKey',
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
                        label: 'ada',
                        name: 'ada'
                    },
                    {
                        label: 'text-ada-001',
                        name: 'text-ada-001'
                    },
                    {
                        label: 'babbage',
                        name: 'babbage'
                    },
                    {
                        label: 'text-babbage-001',
                        name: 'text-babbage-001'
                    },
                    {
                        label: 'curie',
                        name: 'curie'
                    },
                    {
                        label: 'text-curie-001',
                        name: 'text-curie-001'
                    },
                    {
                        label: 'davinci',
                        name: 'davinci'
                    },
                    {
                        label: 'text-davinci-001',
                        name: 'text-davinci-001'
                    },
                    {
                        label: 'text-davinci-002',
                        name: 'text-davinci-002'
                    },
                    {
                        label: 'text-davinci-fine-tune-002',
                        name: 'text-davinci-fine-tune-002'
                    },
                    {
                        label: 'gpt-35-turbo',
                        name: 'gpt-35-turbo'
                    }
                ],
                default: 'text-davinci-003',
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
                label: 'Azure OpenAI Api Instance Name',
                name: 'azureOpenAIApiInstanceName',
                type: 'string',
                placeholder: 'YOUR-INSTANCE-NAME'
            },
            {
                label: 'Azure OpenAI Api Deployment Name',
                name: 'azureOpenAIApiDeploymentName',
                type: 'string',
                placeholder: 'YOUR-DEPLOYMENT-NAME'
            },
            {
                label: 'Azure OpenAI Api Version',
                name: 'azureOpenAIApiVersion',
                type: 'string',
                placeholder: '2023-06-01-preview',
                description: 'Description of Supported API Versions. Please refer <a target="_blank" href="https://learn.microsoft.com/en-us/azure/cognitive-services/openai/reference#completions">examples</a>'
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
                label: 'Timeout',
                name: 'timeout',
                type: 'number',
                optional: true,
                additionalParams: true
            }
        ];
    }
    async init(nodeData) {
        const azureOpenAIApiKey = nodeData.inputs?.azureOpenAIApiKey;
        const temperature = nodeData.inputs?.temperature;
        const modelName = nodeData.inputs?.modelName;
        const azureOpenAIApiInstanceName = nodeData.inputs?.azureOpenAIApiInstanceName;
        const azureOpenAIApiDeploymentName = nodeData.inputs?.azureOpenAIApiDeploymentName;
        const azureOpenAIApiVersion = nodeData.inputs?.azureOpenAIApiVersion;
        const maxTokens = nodeData.inputs?.maxTokens;
        const topP = nodeData.inputs?.topP;
        const frequencyPenalty = nodeData.inputs?.frequencyPenalty;
        const presencePenalty = nodeData.inputs?.presencePenalty;
        const timeout = nodeData.inputs?.timeout;
        const bestOf = nodeData.inputs?.bestOf;
        const streaming = nodeData.inputs?.streaming;
        const obj = {
            temperature: parseFloat(temperature),
            modelName,
            azureOpenAIApiKey,
            azureOpenAIApiInstanceName,
            azureOpenAIApiDeploymentName,
            azureOpenAIApiVersion,
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
        if (bestOf)
            obj.bestOf = parseInt(bestOf, 10);
        const model = new openai_1.OpenAI(obj);
        return model;
    }
}
module.exports = { nodeClass: AzureOpenAI_LLMs };
//# sourceMappingURL=AzureOpenAI.js.map