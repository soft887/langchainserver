"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../../../src/utils");
const chains_1 = require("langchain/chains");
const handler_1 = require("../../../src/handler");
class MultiPromptChain_Chains {
    constructor() {
        this.label = 'Multi Prompt Chain';
        this.name = 'multiPromptChain';
        this.type = 'MultiPromptChain';
        this.icon = 'chain.svg';
        this.category = 'Chains';
        this.description = 'Chain automatically picks an appropriate prompt from multiple prompt templates';
        this.baseClasses = [this.type, ...(0, utils_1.getBaseClasses)(chains_1.MultiPromptChain)];
        this.inputs = [
            {
                label: 'Language Model',
                name: 'model',
                type: 'BaseLanguageModel'
            },
            {
                label: 'Prompt Retriever',
                name: 'promptRetriever',
                type: 'PromptRetriever',
                list: true
            }
        ];
    }
    async init(nodeData) {
        const model = nodeData.inputs?.model;
        const promptRetriever = nodeData.inputs?.promptRetriever;
        const promptNames = [];
        const promptDescriptions = [];
        const promptTemplates = [];
        for (const prompt of promptRetriever) {
            promptNames.push(prompt.name);
            promptDescriptions.push(prompt.description);
            promptTemplates.push(prompt.systemMessage);
        }
        const chain = chains_1.MultiPromptChain.fromLLMAndPrompts(model, {
            promptNames,
            promptDescriptions,
            promptTemplates,
            llmChainOpts: { verbose: process.env.DEBUG === 'true' ? true : false }
        });
        return chain;
    }
    async run(nodeData, input, options) {
        const chain = nodeData.instance;
        const obj = { input };
        const loggerHandler = new handler_1.ConsoleCallbackHandler(options.logger);
        if (options.socketIO && options.socketIOClientId) {
            const handler = new handler_1.CustomChainHandler(options.socketIO, options.socketIOClientId, 2);
            const res = await chain.call(obj, [loggerHandler, handler]);
            return res?.text;
        }
        else {
            const res = await chain.call(obj, [loggerHandler]);
            return res?.text;
        }
    }
}
module.exports = { nodeClass: MultiPromptChain_Chains };
//# sourceMappingURL=MultiPromptChain.js.map