"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../../../src/utils");
const openai_1 = require("langchain/embeddings/openai");
class AzureOpenAIEmbedding_Embeddings {
    constructor() {
        this.label = 'Azure OpenAI Embeddings';
        this.name = 'azureOpenAIEmbeddings';
        this.type = 'AzureOpenAIEmbeddings';
        this.icon = 'Azure.svg';
        this.category = 'Embeddings';
        this.description = 'Azure OpenAI API to generate embeddings for a given text';
        this.baseClasses = [this.type, ...(0, utils_1.getBaseClasses)(openai_1.OpenAIEmbeddings)];
        this.inputs = [
            {
                label: 'Azure OpenAI Api Key',
                name: 'azureOpenAIApiKey',
                type: 'password'
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
                placeholder: '2023-03-15-preview',
                description: 'Description of Supported API Versions. Please refer <a target="_blank" href="https://learn.microsoft.com/en-us/azure/cognitive-services/openai/reference#embeddings">examples</a>'
            },
            {
                label: 'Batch Size',
                name: 'batchSize',
                type: 'number',
                default: '1',
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
        const azureOpenAIApiInstanceName = nodeData.inputs?.azureOpenAIApiInstanceName;
        const azureOpenAIApiDeploymentName = nodeData.inputs?.azureOpenAIApiDeploymentName;
        const azureOpenAIApiVersion = nodeData.inputs?.azureOpenAIApiVersion;
        const batchSize = nodeData.inputs?.batchSize;
        const timeout = nodeData.inputs?.timeout;
        const obj = {
            azureOpenAIApiKey,
            azureOpenAIApiInstanceName,
            azureOpenAIApiDeploymentName,
            azureOpenAIApiVersion
        };
        if (batchSize)
            obj.batchSize = parseInt(batchSize, 10);
        if (timeout)
            obj.timeout = parseInt(timeout, 10);
        const model = new openai_1.OpenAIEmbeddings(obj);
        return model;
    }
}
module.exports = { nodeClass: AzureOpenAIEmbedding_Embeddings };
//# sourceMappingURL=AzureOpenAIEmbedding.js.map