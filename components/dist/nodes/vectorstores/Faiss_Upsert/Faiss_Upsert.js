"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const document_1 = require("langchain/document");
const utils_1 = require("../../../src/utils");
const faiss_1 = require("langchain/vectorstores/faiss");
const lodash_1 = require("lodash");
class FaissUpsert_VectorStores {
    constructor() {
        this.label = 'Faiss Upsert Document';
        this.name = 'faissUpsert';
        this.type = 'Faiss';
        this.icon = 'faiss.svg';
        this.category = 'Vector Stores';
        this.description = 'Upsert documents to Faiss';
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
                label: 'Base Path to store',
                name: 'basePath',
                description: 'Path to store faiss.index file',
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
        const docs = nodeData.inputs?.document;
        const embeddings = nodeData.inputs?.embeddings;
        const output = nodeData.outputs?.output;
        const basePath = nodeData.inputs?.basePath;
        const topK = nodeData.inputs?.topK;
        const k = topK ? parseInt(topK, 10) : 4;
        const flattenDocs = docs && docs.length ? (0, lodash_1.flatten)(docs) : [];
        const finalDocs = [];
        for (let i = 0; i < flattenDocs.length; i += 1) {
            finalDocs.push(new document_1.Document(flattenDocs[i]));
        }
        const vectorStore = await faiss_1.FaissStore.fromDocuments(finalDocs, embeddings);
        await vectorStore.save(basePath);
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
module.exports = { nodeClass: FaissUpsert_VectorStores };
//# sourceMappingURL=Faiss_Upsert.js.map