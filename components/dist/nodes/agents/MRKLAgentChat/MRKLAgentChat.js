"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const agents_1 = require("langchain/agents");
const utils_1 = require("../../../src/utils");
const lodash_1 = require("lodash");
class MRKLAgentChat_Agents {
    constructor() {
        this.label = 'MRKL Agent for Chat Models';
        this.name = 'mrklAgentChat';
        this.type = 'AgentExecutor';
        this.category = 'Agents';
        this.icon = 'agent.svg';
        this.description = 'Agent that uses the ReAct Framework to decide what action to take, optimized to be used with Chat Models';
        this.baseClasses = [this.type, ...(0, utils_1.getBaseClasses)(agents_1.AgentExecutor)];
        this.inputs = [
            {
                label: 'Allowed Tools',
                name: 'tools',
                type: 'Tool',
                list: true
            },
            {
                label: 'Language Model',
                name: 'model',
                type: 'BaseLanguageModel'
            }
        ];
    }
    async init(nodeData) {
        const model = nodeData.inputs?.model;
        let tools = nodeData.inputs?.tools;
        tools = (0, lodash_1.flatten)(tools);
        const executor = await (0, agents_1.initializeAgentExecutorWithOptions)(tools, model, {
            agentType: 'chat-zero-shot-react-description',
            verbose: process.env.DEBUG === 'true' ? true : false
        });
        return executor;
    }
    async run(nodeData, input) {
        const executor = nodeData.instance;
        const result = await executor.call({ input });
        return result?.output;
    }
}
module.exports = { nodeClass: MRKLAgentChat_Agents };
//# sourceMappingURL=MRKLAgentChat.js.map