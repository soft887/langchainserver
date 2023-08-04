"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const agents_1 = require("langchain/agents");
const memory_1 = require("langchain/memory");
const utils_1 = require("../../../src/utils");
const schema_1 = require("langchain/schema");
const lodash_1 = require("lodash");
class ConversationalAgent_Agents {
    constructor() {
        this.label = 'Conversational Agent';
        this.name = 'conversationalAgent';
        this.type = 'AgentExecutor';
        this.category = 'Agents';
        this.icon = 'agent.svg';
        this.description = 'Conversational agent for a chat model. It will utilize chat specific prompts';
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
            },
            {
                label: 'Memory',
                name: 'memory',
                type: 'BaseChatMemory'
            },
            {
                label: 'System Message',
                name: 'systemMessage',
                type: 'string',
                rows: 4,
                optional: true,
                additionalParams: true
            },
            {
                label: 'Human Message',
                name: 'humanMessage',
                type: 'string',
                rows: 4,
                optional: true,
                additionalParams: true
            }
        ];
    }
    async init(nodeData) {
        const model = nodeData.inputs?.model;
        let tools = nodeData.inputs?.tools;
        tools = (0, lodash_1.flatten)(tools);
        const memory = nodeData.inputs?.memory;
        const humanMessage = nodeData.inputs?.humanMessage;
        const systemMessage = nodeData.inputs?.systemMessage;
        const obj = {
            agentType: 'chat-conversational-react-description',
            verbose: process.env.DEBUG === 'true' ? true : false
        };
        const agentArgs = {};
        if (humanMessage) {
            agentArgs.humanMessage = humanMessage;
        }
        if (systemMessage) {
            agentArgs.systemMessage = systemMessage;
        }
        if (Object.keys(agentArgs).length)
            obj.agentArgs = agentArgs;
        const executor = await (0, agents_1.initializeAgentExecutorWithOptions)(tools, model, obj);
        executor.memory = memory;
        return executor;
    }
    async run(nodeData, input, options) {
        const executor = nodeData.instance;
        const memory = nodeData.inputs?.memory;
        if (options && options.chatHistory) {
            const chatHistory = [];
            const histories = options.chatHistory;
            for (const message of histories) {
                if (message.type === 'apiMessage') {
                    chatHistory.push(new schema_1.AIMessage(message.message));
                }
                else if (message.type === 'userMessage') {
                    chatHistory.push(new schema_1.HumanMessage(message.message));
                }
            }
            memory.chatHistory = new memory_1.ChatMessageHistory(chatHistory);
            executor.memory = memory;
        }
        const result = await executor.call({ input });
        return result?.output;
    }
}
module.exports = { nodeClass: ConversationalAgent_Agents };
//# sourceMappingURL=ConversationalAgent.js.map