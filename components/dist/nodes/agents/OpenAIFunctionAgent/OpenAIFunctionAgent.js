"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const agents_1 = require("langchain/agents");
const utils_1 = require("../../../src/utils");
const lodash_1 = require("lodash");
const memory_1 = require("langchain/memory");
const schema_1 = require("langchain/schema");
const handler_1 = require("../../../src/handler");
class OpenAIFunctionAgent_Agents {
    constructor() {
        this.label = 'OpenAI Function Agent';
        this.name = 'openAIFunctionAgent';
        this.type = 'AgentExecutor';
        this.category = 'Agents';
        this.icon = 'openai.png';
        this.description = `An agent that uses OpenAI's Function Calling functionality to pick the tool and args to call`;
        this.baseClasses = [this.type, ...(0, utils_1.getBaseClasses)(agents_1.AgentExecutor)];
        this.inputs = [
            {
                label: 'Allowed Tools',
                name: 'tools',
                type: 'Tool',
                list: true
            },
            {
                label: 'Memory',
                name: 'memory',
                type: 'BaseChatMemory'
            },
            {
                label: 'OpenAI Chat Model',
                name: 'model',
                description: 'Only works with gpt-3.5-turbo-0613 and gpt-4-0613. Refer <a target="_blank" href="https://platform.openai.com/docs/guides/gpt/function-calling">docs</a> for more info',
                type: 'BaseChatModel'
            },
            {
                label: 'System Message',
                name: 'systemMessage',
                type: 'string',
                rows: 4,
                optional: true,
                additionalParams: true
            }
        ];
    }
    async init(nodeData) {
        const model = nodeData.inputs?.model;
        const memory = nodeData.inputs?.memory;
        const systemMessage = nodeData.inputs?.systemMessage;
        let tools = nodeData.inputs?.tools;
        tools = (0, lodash_1.flatten)(tools);
        const executor = await (0, agents_1.initializeAgentExecutorWithOptions)(tools, model, {
            agentType: 'openai-functions',
            verbose: process.env.DEBUG === 'true' ? true : false,
            agentArgs: {
                prefix: systemMessage ?? `You are a helpful AI assistant.`
            }
        });
        if (memory)
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
        const loggerHandler = new handler_1.ConsoleCallbackHandler(options.logger);
        if (options.socketIO && options.socketIOClientId) {
            const handler = new handler_1.CustomChainHandler(options.socketIO, options.socketIOClientId);
            const result = await executor.run(input, [loggerHandler, handler]);
            return result;
        }
        else {
            const result = await executor.run(input, [loggerHandler]);
            return result;
        }
    }
}
module.exports = { nodeClass: OpenAIFunctionAgent_Agents };
//# sourceMappingURL=OpenAIFunctionAgent.js.map