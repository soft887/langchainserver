"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const autogpt_1 = require("langchain/experimental/autogpt");
const lodash_1 = require("lodash");
class AutoGPT_Agents {
    constructor() {
        this.label = 'AutoGPT';
        this.name = 'autoGPT';
        this.type = 'AutoGPT';
        this.category = 'Agents';
        this.icon = 'autogpt.png';
        this.description = 'Autonomous agent with chain of thoughts for self-guided task completion';
        this.baseClasses = ['AutoGPT'];
        this.inputs = [
            {
                label: 'Allowed Tools',
                name: 'tools',
                type: 'Tool',
                list: true
            },
            {
                label: 'Chat Model',
                name: 'model',
                type: 'BaseChatModel'
            },
            {
                label: 'Vector Store Retriever',
                name: 'vectorStoreRetriever',
                type: 'BaseRetriever'
            },
            {
                label: 'AutoGPT Name',
                name: 'aiName',
                type: 'string',
                placeholder: 'Tom',
                optional: true
            },
            {
                label: 'AutoGPT Role',
                name: 'aiRole',
                type: 'string',
                placeholder: 'Assistant',
                optional: true
            },
            {
                label: 'Maximum Loop',
                name: 'maxLoop',
                type: 'number',
                default: 5,
                optional: true
            }
        ];
    }
    async init(nodeData) {
        const model = nodeData.inputs?.model;
        const vectorStoreRetriever = nodeData.inputs?.vectorStoreRetriever;
        let tools = nodeData.inputs?.tools;
        tools = (0, lodash_1.flatten)(tools);
        const aiName = nodeData.inputs?.aiName || 'AutoGPT';
        const aiRole = nodeData.inputs?.aiRole || 'Assistant';
        const maxLoop = nodeData.inputs?.maxLoop;
        const autogpt = autogpt_1.AutoGPT.fromLLMAndTools(model, tools, {
            memory: vectorStoreRetriever,
            aiName,
            aiRole
        });
        autogpt.maxIterations = parseInt(maxLoop, 10);
        return autogpt;
    }
    async run(nodeData, input) {
        const executor = nodeData.instance;
        try {
            const res = await executor.run([input]);
            return res || 'I have completed all my tasks.';
        }
        catch (e) {
            throw new Error(e);
        }
    }
}
module.exports = { nodeClass: AutoGPT_Agents };
//# sourceMappingURL=AutoGPT.js.map