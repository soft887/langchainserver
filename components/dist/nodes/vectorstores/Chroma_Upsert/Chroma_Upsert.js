"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chroma_1 = require("langchain/vectorstores/chroma");
const document_1 = require("langchain/document");
const utils_1 = require("../../../src/utils");
const lodash_1 = require("lodash");
class ChromaUpsert_VectorStores {
    constructor() {
        this.label = 'Chroma Upsert Document';
        this.name = 'chromaUpsert';
        this.type = 'Chroma';
        this.icon = 'chroma.svg';
        this.category = 'Vector Stores';
        this.description = 'Upsert documents to Chroma';
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
                label: 'Collection Name',
                name: 'collectionName',
                type: 'string'
            },
            {
                label: 'Chroma URL',
                name: 'chromaURL',
                type: 'string',
                optional: true
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
                label: 'Chroma Retriever',
                name: 'retriever',
                baseClasses: this.baseClasses
            },
            {
                label: 'Chroma Vector Store',
                name: 'vectorStore',
                baseClasses: [this.type, ...(0, utils_1.getBaseClasses)(chroma_1.Chroma)]
            }
        ];
    }
    async init(nodeData) {
        const collectionName = nodeData.inputs?.collectionName;
        const docs = nodeData.inputs?.document;
        const embeddings = nodeData.inputs?.embeddings;
        const chromaURL = nodeData.inputs?.chromaURL;
        const output = nodeData.outputs?.output;
        const topK = nodeData.inputs?.topK;
        const k = topK ? parseInt(topK, 10) : 4;
        const flattenDocs = docs && docs.length ? (0, lodash_1.flatten)(docs) : [];
        const finalDocs = [];
        for (let i = 0; i < flattenDocs.length; i += 1) {
            finalDocs.push(new document_1.Document(flattenDocs[i]));
        }
        const obj = { collectionName };
        if (chromaURL)
            obj.url = chromaURL;
        const vectorStore = await chroma_1.Chroma.fromDocuments(finalDocs, embeddings, obj);
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
module.exports = { nodeClass: ChromaUpsert_VectorStores };
//# sourceMappingURL=Chroma_Upsert.js.map