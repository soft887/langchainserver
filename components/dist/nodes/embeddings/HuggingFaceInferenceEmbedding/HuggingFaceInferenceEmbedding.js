"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../../../src/utils");
const core_1 = require("./core");
class HuggingFaceInferenceEmbedding_Embeddings {
    constructor() {
        this.label = 'HuggingFace Inference Embeddings';
        this.name = 'huggingFaceInferenceEmbeddings';
        this.type = 'HuggingFaceInferenceEmbeddings';
        this.icon = 'huggingface.png';
        this.category = 'Embeddings';
        this.description = 'HuggingFace Inference API to generate embeddings for a given text';
        this.baseClasses = [this.type, ...(0, utils_1.getBaseClasses)(core_1.HuggingFaceInferenceEmbeddings)];
        this.inputs = [
            {
                label: 'HuggingFace Api Key',
                name: 'apiKey',
                type: 'password'
            },
            {
                label: 'Model',
                name: 'modelName',
                type: 'string',
                optional: true
            },
            {
                label: 'Endpoint',
                name: 'endpoint',
                type: 'string',
                placeholder: 'https://xyz.eu-west-1.aws.endpoints.huggingface.cloud/sentence-transformers/all-MiniLM-L6-v2',
                description: 'Using your own inference endpoint',
                optional: true
            }
        ];
    }
    async init(nodeData) {
        const apiKey = nodeData.inputs?.apiKey;
        const modelName = nodeData.inputs?.modelName;
        const endpoint = nodeData.inputs?.endpoint;
        const obj = {
            apiKey
        };
        if (modelName)
            obj.model = modelName;
        if (endpoint)
            obj.endpoint = endpoint;
        const model = new core_1.HuggingFaceInferenceEmbeddings(obj);
        return model;
    }
}
module.exports = { nodeClass: HuggingFaceInferenceEmbedding_Embeddings };
//# sourceMappingURL=HuggingFaceInferenceEmbedding.js.map