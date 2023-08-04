"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const memory_1 = require("langchain/vectorstores/memory");
const document_1 = require("langchain/document");
const utils_1 = require("../../../src/utils");
const lodash_1 = require("lodash");
class InMemoryVectorStore_VectorStores {
    constructor() {
        this.label = 'In-Memory Vector Store';
        this.name = 'memoryVectorStore';
        this.type = 'Memory';
        this.icon = 'memory.svg';
        this.category = 'Vector Stores';
        this.description = 'In-memory vectorstore that stores embeddings and does an exact, linear search for the most similar embeddings.';
        this.baseClasses = [this.type, 'VectorStoreRetriever', 'BaseRetriever'];
        this.inputs = [
            {
                label: 'Document',
                name: 'document',
                type: 'Document',
                list: true
            },
            {
                label: 'Embeddings',
                name: 'embeddings',
                type: 'Embeddings'
            },
            {
                label: 'Top K',
                name: 'topK',
                description: 'Number of top results to fetch. Default to 4',
                placeholder: '4',
                type: 'number',
                optional: true
            }
        ];
        this.outputs = [
            {
                label: 'Memory Retriever',
                name: 'retriever',
                baseClasses: this.baseClasses
            },
            {
                label: 'Memory Vector Store',
                name: 'vectorStore',
                baseClasses: [this.type, ...(0, utils_1.getBaseClasses)(memory_1.MemoryVectorStore)]
            }
        ];
    }
    async init(nodeData) {
        const docs = nodeData.inputs?.document;
        const embeddings = nodeData.inputs?.embeddings;
        const output = nodeData.outputs?.output;
        const topK = nodeData.inputs?.topK;
        const k = topK ? parseInt(topK, 10) : 4;
        const flattenDocs = docs && docs.length ? (0, lodash_1.flatten)(docs) : [];
        const finalDocs = [];
        for (let i = 0; i < flattenDocs.length; i += 1) {
            finalDocs.push(new document_1.Document(flattenDocs[i]));
        }
        const vectorStore = await memory_1.MemoryVectorStore.fromDocuments(finalDocs, embeddings);
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
module.exports = { nodeClass: InMemoryVectorStore_VectorStores };
//# sourceMappingURL=InMemoryVectorStore.js.map