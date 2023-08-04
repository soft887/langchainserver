"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../../../src/utils");
const cohere_1 = require("langchain/embeddings/cohere");
class CohereEmbedding_Embeddings {
    constructor() {
        this.label = 'Cohere Embeddings';
        this.name = 'cohereEmbeddings';
        this.type = 'CohereEmbeddings';
        this.icon = 'cohere.png';
        this.category = 'Embeddings';
        this.description = 'Cohere API to generate embeddings for a given text';
        this.baseClasses = [this.type, ...(0, utils_1.getBaseClasses)(cohere_1.CohereEmbeddings)];
        this.inputs = [
            {
                label: 'Cohere API Key',
                name: 'cohereApiKey',
                type: 'password'
            },
            {
                label: 'Model Name',
                name: 'modelName',
                type: 'options',
                options: [
                    {
                        label: 'embed-english-v2.0',
                        name: 'embed-english-v2.0'
                    },
                    {
                        label: 'embed-english-light-v2.0',
                        name: 'embed-english-light-v2.0'
                    },
                    {
                        label: 'embed-multilingual-v2.0',
                        name: 'embed-multilingual-v2.0'
                    }
                ],
                default: 'embed-english-v2.0',
                optional: true
            }
        ];
    }
    async init(nodeData) {
        const apiKey = nodeData.inputs?.cohereApiKey;
        const modelName = nodeData.inputs?.modelName;
        const obj = {
            apiKey
        };
        if (modelName)
            obj.modelName = modelName;
        const model = new cohere_1.CohereEmbeddings(obj);
        return model;
    }
}
module.exports = { nodeClass: CohereEmbedding_Embeddings };
//# sourceMappingURL=CohereEmbedding.js.map