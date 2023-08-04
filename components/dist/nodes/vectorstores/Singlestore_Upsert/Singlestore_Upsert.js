"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const document_1 = require("langchain/document");
const utils_1 = require("../../../src/utils");
const singlestore_1 = require("langchain/vectorstores/singlestore");
const lodash_1 = require("lodash");
class SingleStoreUpsert_VectorStores {
    constructor() {
        this.label = 'SingleStore Upsert Document';
        this.name = 'singlestoreUpsert';
        this.type = 'SingleStore';
        this.icon = 'singlestore.svg';
        this.category = 'Vector Stores';
        this.description = 'Upsert documents to SingleStore';
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
                label: 'Host',
                name: 'host',
                type: 'string'
            },
            {
                label: 'User',
                name: 'user',
                type: 'string'
            },
            {
                label: 'Password',
                name: 'password',
                type: 'password'
            },
            {
                label: 'Database',
                name: 'database',
                type: 'string'
            },
            {
                label: 'Table Name',
                name: 'tableName',
                type: 'string',
                placeholder: 'embeddings',
                additionalParams: true,
                optional: true
            },
            {
                label: 'Content Column Name',
                name: 'contentColumnName',
                type: 'string',
                placeholder: 'content',
                additionalParams: true,
                optional: true
            },
            {
                label: 'Vector Column Name',
                name: 'vectorColumnName',
                type: 'string',
                placeholder: 'vector',
                additionalParams: true,
                optional: true
            },
            {
                label: 'Metadata Column Name',
                name: 'metadataColumnName',
                type: 'string',
                placeholder: 'metadata',
                additionalParams: true,
                optional: true
            },
            {
                label: 'Top K',
                name: 'topK',
                placeholder: '4',
                type: 'number',
                additionalParams: true,
                optional: true
            }
        ];
        this.outputs = [
            {
                label: 'SingleStore Retriever',
                name: 'retriever',
                baseClasses: this.baseClasses
            },
            {
                label: 'SingleStore Vector Store',
                name: 'vectorStore',
                baseClasses: [this.type, ...(0, utils_1.getBaseClasses)(singlestore_1.SingleStoreVectorStore)]
            }
        ];
    }
    async init(nodeData) {
        const singleStoreConnectionConfig = {
            connectionOptions: {
                host: nodeData.inputs?.host,
                port: 3306,
                user: nodeData.inputs?.user,
                password: nodeData.inputs?.password,
                database: nodeData.inputs?.database
            },
            ...(nodeData.inputs?.tableName ? { tableName: nodeData.inputs.tableName } : {}),
            ...(nodeData.inputs?.contentColumnName ? { contentColumnName: nodeData.inputs.contentColumnName } : {}),
            ...(nodeData.inputs?.vectorColumnName ? { vectorColumnName: nodeData.inputs.vectorColumnName } : {}),
            ...(nodeData.inputs?.metadataColumnName ? { metadataColumnName: nodeData.inputs.metadataColumnName } : {})
        };
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
        let vectorStore;
        vectorStore = new singlestore_1.SingleStoreVectorStore(embeddings, singleStoreConnectionConfig);
        vectorStore.addDocuments.bind(vectorStore)(finalDocs);
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
module.exports = { nodeClass: SingleStoreUpsert_VectorStores };
//# sourceMappingURL=Singlestore_Upsert.js.map