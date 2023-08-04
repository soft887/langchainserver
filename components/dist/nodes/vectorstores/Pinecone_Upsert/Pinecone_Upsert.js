"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pinecone_1 = require("@pinecone-database/pinecone");
const pinecone_2 = require("langchain/vectorstores/pinecone");
const document_1 = require("langchain/document");
const utils_1 = require("../../../src/utils");
const lodash_1 = require("lodash");
class PineconeUpsert_VectorStores {
    constructor() {
        this.label = 'Pinecone Upsert Document';
        this.name = 'pineconeUpsert';
        this.type = 'Pinecone';
        this.icon = 'pinecone.png';
        this.category = 'Vector Stores';
        this.description = 'Upsert documents to Pinecone';
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
                label: 'Pinecone Api Key',
                name: 'pineconeApiKey',
                type: 'password'
            },
            {
                label: 'Pinecone Environment',
                name: 'pineconeEnv',
                type: 'string'
            },
            {
                label: 'Pinecone Index',
                name: 'pineconeIndex',
                type: 'string'
            },
            {
                label: 'Pinecone Namespace',
                name: 'pineconeNamespace',
                type: 'string',
                placeholder: 'my-first-namespace',
                additionalParams: true,
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
                label: 'Pinecone Retriever',
                name: 'retriever',
                baseClasses: this.baseClasses
            },
            {
                label: 'Pinecone Vector Store',
                name: 'vectorStore',
                baseClasses: [this.type, ...(0, utils_1.getBaseClasses)(pinecone_2.PineconeStore)]
            }
        ];
    }
    async init(nodeData) {
        const pineconeApiKey = nodeData.inputs?.pineconeApiKey;
        const pineconeEnv = nodeData.inputs?.pineconeEnv;
        const index = nodeData.inputs?.pineconeIndex;
        const pineconeNamespace = nodeData.inputs?.pineconeNamespace;
        const docs = nodeData.inputs?.document;
        const embeddings = nodeData.inputs?.embeddings;
        const output = nodeData.outputs?.output;
        const topK = nodeData.inputs?.topK;
        const k = topK ? parseInt(topK, 10) : 4;
        const client = new pinecone_1.PineconeClient();
        await client.init({
            apiKey: pineconeApiKey,
            environment: pineconeEnv
        });
        const pineconeIndex = client.Index(index);
        const flattenDocs = docs && docs.length ? (0, lodash_1.flatten)(docs) : [];
        const finalDocs = [];
        for (let i = 0; i < flattenDocs.length; i += 1) {
            finalDocs.push(new document_1.Document(flattenDocs[i]));
        }
        const obj = {
            pineconeIndex
        };
        if (pineconeNamespace)
            obj.namespace = pineconeNamespace;
        const vectorStore = await pinecone_2.PineconeStore.fromDocuments(finalDocs, embeddings, obj);
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
module.exports = { nodeClass: PineconeUpsert_VectorStores };
//# sourceMappingURL=Pinecone_Upsert.js.map