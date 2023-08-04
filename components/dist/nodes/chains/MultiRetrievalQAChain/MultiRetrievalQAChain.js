"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../../../src/utils");
const chains_1 = require("langchain/chains");
const handler_1 = require("../../../src/handler");
class MultiRetrievalQAChain_Chains {
    constructor() {
        this.label = 'Multi Retrieval QA Chain';
        this.name = 'multiRetrievalQAChain';
        this.type = 'MultiRetrievalQAChain';
        this.icon = 'chain.svg';
        this.category = 'Chains';
        this.description = 'QA Chain that automatically picks an appropriate vector store from multiple retrievers';
        this.baseClasses = [this.type, ...(0, utils_1.getBaseClasses)(chains_1.MultiRetrievalQAChain)];
        this.inputs = [
            {
                label: 'Language Model',
                name: 'model',
                type: 'BaseLanguageModel'
            },
            {
                label: 'Vector Store Retriever',
                name: 'vectorStoreRetriever',
                type: 'VectorStoreRetriever',
                list: true
            },
            {
                label: 'Return Source Documents',
                name: 'returnSourceDocuments',
                type: 'boolean',
                optional: true
            }
        ];
    }
    async init(nodeData) {
        const model = nodeData.inputs?.model;
        const vectorStoreRetriever = nodeData.inputs?.vectorStoreRetriever;
        const returnSourceDocuments = nodeData.inputs?.returnSourceDocuments;
        const retrieverNames = [];
        const retrieverDescriptions = [];
        const retrievers = [];
        for (const vs of vectorStoreRetriever) {
            retrieverNames.push(vs.name);
            retrieverDescriptions.push(vs.description);
            retrievers.push(vs.vectorStore.asRetriever(vs.vectorStore.k ?? 4));
        }
        const chain = chains_1.MultiRetrievalQAChain.fromLLMAndRetrievers(model, {
            retrieverNames,
            retrieverDescriptions,
            retrievers,
            retrievalQAChainOpts: { verbose: process.env.DEBUG === 'true' ? true : false, returnSourceDocuments }
        });
        return chain;
    }
    async run(nodeData, input, options) {
        const chain = nodeData.instance;
        const returnSourceDocuments = nodeData.inputs?.returnSourceDocuments;
        const obj = { input };
        const loggerHandler = new handler_1.ConsoleCallbackHandler(options.logger);
        if (options.socketIO && options.socketIOClientId) {
            const handler = new handler_1.CustomChainHandler(options.socketIO, options.socketIOClientId, 2, returnSourceDocuments);
            const res = await chain.call(obj, [loggerHandler, handler]);
            if (res.text && res.sourceDocuments)
                return res;
            return res?.text;
        }
        else {
            const res = await chain.call(obj, [loggerHandler]);
            if (res.text && res.sourceDocuments)
                return res;
            return res?.text;
        }
    }
}
module.exports = { nodeClass: MultiRetrievalQAChain_Chains };
//# sourceMappingURL=MultiRetrievalQAChain.js.map