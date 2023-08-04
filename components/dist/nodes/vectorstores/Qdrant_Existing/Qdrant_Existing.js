"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const js_client_rest_1 = require("@qdrant/js-client-rest");
const qdrant_1 = require("langchain/vectorstores/qdrant");
const utils_1 = require("../../../src/utils");
class Qdrant_Existing_VectorStores {
    constructor() {
        this.label = 'Qdrant Load Existing Index';
        this.name = 'qdrantExistingIndex';
        this.type = 'Qdrant';
        this.icon = 'qdrant_logo.svg';
        this.category = 'Vector Stores';
        this.description = 'Load existing index from Qdrant (i.e., documents have been upserted)';
        this.baseClasses = [this.type, 'VectorStoreRetriever', 'BaseRetriever'];
        this.inputs = [
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
                label: 'Qdrant Collection Cofiguration',
                name: 'qdrantCollectionCofiguration',
                type: 'json',
                optional: true,
                additionalParams: true
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
        let qdrantCollectionCofiguration = nodeData.inputs?.qdrantCollectionCofiguration;
        const embeddings = nodeData.inputs?.embeddings;
        const output = nodeData.outputs?.output;
        const topK = nodeData.inputs?.topK;
        const k = topK ? parseInt(topK, 10) : 4;
        // connect to Qdrant Cloud
        const client = new js_client_rest_1.QdrantClient({
            url: qdrantServerUrl,
            apiKey: qdrantApiKey
        });
        const dbConfig = {
            client,
            collectionName
        };
        if (qdrantCollectionCofiguration) {
            qdrantCollectionCofiguration =
                typeof qdrantCollectionCofiguration === 'object' ? qdrantCollectionCofiguration : JSON.parse(qdrantCollectionCofiguration);
            dbConfig.collectionConfig = qdrantCollectionCofiguration;
        }
        const vectorStore = await qdrant_1.QdrantVectorStore.fromExistingCollection(embeddings, dbConfig);
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
module.exports = { nodeClass: Qdrant_Existing_VectorStores };
//# sourceMappingURL=Qdrant_Existing.js.map