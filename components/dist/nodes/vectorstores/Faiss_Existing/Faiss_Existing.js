"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const faiss_1 = require("langchain/vectorstores/faiss");
const utils_1 = require("../../../src/utils");
class Faiss_Existing_VectorStores {
    constructor() {
        this.label = 'Faiss Load Existing Index';
        this.name = 'faissExistingIndex';
        this.type = 'Faiss';
        this.icon = 'faiss.svg';
        this.category = 'Vector Stores';
        this.description = 'Load existing index from Faiss (i.e: Document has been upserted)';
        this.baseClasses = [this.type, 'VectorStoreRetriever', 'BaseRetriever'];
        this.inputs = [
            {
                label: 'Embeddings',
                name: 'embeddings',
                type: 'Embeddings'
            },
            {
                label: 'Base Path to load',
                name: 'basePath',
                description: 'Path to load faiss.index file',
                placeholder: `C:\\Users\\User\\Desktop`,
                type: 'string'
            },
            {
                label: 'Top K',
                name: 'topK',
                description: 'Number of top results to fetch. Default to 4',
                placeholder: '4',
                type: 'number',
                additionalParams: true,
                optional: true
            }
        ];
        this.outputs = [
            {
                label: 'Faiss Retriever',
                name: 'retriever',
                baseClasses: this.baseClasses
            },
            {
                label: 'Faiss Vector Store',
                name: 'vectorStore',
                baseClasses: [this.type, ...(0, utils_1.getBaseClasses)(faiss_1.FaissStore)]
            }
        ];
    }
    async init(nodeData) {
        const embeddings = nodeData.inputs?.embeddings;
        const basePath = nodeData.inputs?.basePath;
        const output = nodeData.outputs?.output;
        const topK = nodeData.inputs?.topK;
        const k = topK ? parseInt(topK, 10) : 4;
        const vectorStore = await faiss_1.FaissStore.load(basePath, embeddings);
        if (output === 'retriever') {
            const retriever = vectorStore.asRetriever(k);
            return retriever;
        }
        else if (output === 'vectorStore') {
            ;
            vectorStore.k = k;
            return vectorStore;
        }
        return vectorStore;
    }
}
module.exports = { nodeClass: Faiss_Existing_VectorStores };
//# sourceMappingURL=Faiss_Existing.js.map