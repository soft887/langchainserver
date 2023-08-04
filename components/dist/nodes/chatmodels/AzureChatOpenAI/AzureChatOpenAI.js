"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../../../src/utils");
const openai_1 = require("langchain/chat_models/openai");
class AzureChatOpenAI_ChatModels {
    constructor() {
        this.label = 'Azure ChatOpenAI';
        this.name = 'azureChatOpenAI';
        this.type = 'AzureChatOpenAI';
        this.icon = 'Azure.svg';
        this.category = 'Chat Modelsqqqq';
        this.description = 'Wrapper around Azure OpenAI large language models that use the Chat endpoint';
        this.baseClasses = [this.type, ...(0, utils_1.getBaseClasses)(openai_1.ChatOpenAI)];
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
                        label: 'gpt-4',
                        name: 'gpt-4'
                    },
                    {
                        label: 'gpt-4-32k',
                        name: 'gpt-4-32k'
                    },
                    {
                        label: 'gpt-35-turbo',
                        name: 'gpt-35-turbo'
                    },
                    {
                        label: 'gpt-35-turbo-16k',
                        name: 'gpt-35-turbo-16k'
                    }
                ],
                default: 'gpt-35-turbo',
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
                description: 'Description of Supported API Versions. Please refer <a target="_blank" href="https://learn.microsoft.com/en-us/azure/cognitive-services/openai/reference#chat-completions">examples</a>'
            },
            {
                label: 'Max Tokens',
                name: 'maxTokens',
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
        const modelName = nodeData.inputs?.modelName;
        const temperature = nodeData.inputs?.temperature;
        const azureOpenAIApiInstanceName = nodeData.inputs?.azureOpenAIApiInstanceName;
        const azureOpenAIApiDeploymentName = nodeData.inputs?.azureOpenAIApiDeploymentName;
        const azureOpenAIApiVersion = nodeData.inputs?.azureOpenAIApiVersion;
        const maxTokens = nodeData.inputs?.maxTokens;
        const frequencyPenalty = nodeData.inputs?.frequencyPenalty;
        const presencePenalty = nodeData.inputs?.presencePenalty;
        const timeout = nodeData.inputs?.timeout;
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
        if (frequencyPenalty)
            obj.frequencyPenalty = parseInt(frequencyPenalty, 10);
        if (presencePenalty)
            obj.presencePenalty = parseInt(presencePenalty, 10);
        if (timeout)
            obj.timeout = parseInt(timeout, 10);
        const model = new openai_1.ChatOpenAI(obj);
        return model;
    }
}
module.exports = { nodeClass: AzureChatOpenAI_ChatModels };
//# sourceMappingURL=AzureChatOpenAI.js.map