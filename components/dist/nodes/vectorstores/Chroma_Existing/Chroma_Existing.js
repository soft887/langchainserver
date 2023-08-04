"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chroma_1 = require("langchain/vectorstores/chroma");
const utils_1 = require("../../../src/utils");
class Chroma_Existing_VectorStores {
    constructor() {
        this.label = 'Chroma Load Existing Index';
        this.name = 'chromaExistingIndex';
        this.type = 'Chroma';
        this.icon = 'chroma.svg';
        this.category = 'Vector Stores';
        this.description = 'Load existing index from Chroma (i.e: Document has been upserted)';
        this.baseClasses = [this.type, 'VectorStoreRetriever', 'BaseRetriever'];
        this.inputs = [
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
        const embeddings = nodeData.inputs?.embeddings;
        const chromaURL = nodeData.inputs?.chromaURL;
        const output = nodeData.outputs?.output;
        const topK = nodeData.inputs?.topK;
        const k = topK ? parseInt(topK, 10) : 4;
        const obj = { collectionName };
        if (chromaURL)
            obj.url = chromaURL;
        const vectorStore = await chroma_1.Chroma.fromExistingCollection(embeddings, obj);
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
module.exports = { nodeClass: Chroma_Existing_VectorStores };
//# sourceMappingURL=Chroma_Existing.js.map