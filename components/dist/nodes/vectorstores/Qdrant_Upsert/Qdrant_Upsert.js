"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const js_client_rest_1 = require("@qdrant/js-client-rest");
const qdrant_1 = require("langchain/vectorstores/qdrant");
const document_1 = require("langchain/document");
const utils_1 = require("../../../src/utils");
const lodash_1 = require("lodash");
class QdrantUpsert_VectorStores {
    constructor() {
        this.label = 'Qdrant Upsert Document';
        this.name = 'qdrantUpsert';
        this.type = 'Qdrant';
        this.icon = 'qdrant_logo.svg';
        this.category = 'Vector Stores';
        this.description = 'Upsert documents to Qdrant';
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
                label: 'Qdrant Server URL',
                name: 'qdrantServerUrl',
                type: 'string',
                placeholder: 'http://localhost:6333'
            },
            {
                label: 'Qdrant Collection Name',
                name: 'qdrantCollection',
                type: 'string'
            },
            {
                label: 'Qdrant API Key',
                name: 'qdrantApiKey',
                type: 'password',
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
                label: 'Qdrant Retriever',
                name: 'retriever',
                baseClasses: this.baseClasses
            },
            {
                label: 'Qdrant Vector Store',
                name: 'vectorStore',
                baseClasses: [this.type, ...(0, utils_1.getBaseClasses)(qdrant_1.QdrantVectorStore)]
            }
        ];
    }
    async init(nodeData) {
        const qdrantServerUrl = nodeData.inputs?.qdrantServerUrl;
        const collectionName = nodeData.inputs?.qdrantCollection;
        const qdrantApiKey = nodeData.inputs?.qdrantApiKey;
        const docs = nodeData.inputs?.document;
        const embeddings = nodeData.inputs?.embeddings;
        const output = nodeData.outputs?.output;
        const topK = nodeData.inputs?.topK;
        const k = topK ? parseInt(topK, 10) : 4;
        // connect to Qdrant Cloud
        const client = new js_client_rest_1.QdrantClient({
            url: qdrantServerUrl,
            apiKey: qdrantApiKey
        });
        const flattenDocs = docs && docs.length ? (0, lodash_1.flatten)(docs) : [];
        const finalDocs = [];
        for (let i = 0; i < flattenDocs.length; i += 1) {
            finalDocs.push(new document_1.Document(flattenDocs[i]));
        }
        const dbConfig = {
            client,
            url: qdrantServerUrl,
            collectionName
        };
        const vectorStore = await qdrant_1.QdrantVectorStore.fromDocuments(finalDocs, embeddings, dbConfig);
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
module.exports = { nodeClass: QdrantUpsert_VectorStores };
//# sourceMappingURL=Qdrant_Upsert.js.map