"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chains_1 = require("langchain/chains");
const utils_1 = require("../../../src/utils");
const prompts_1 = require("langchain/prompts");
const memory_1 = require("langchain/memory");
const schema_1 = require("langchain/schema");
const handler_1 = require("../../../src/handler");
const lodash_1 = require("lodash");
const document_1 = require("langchain/document");
let systemMessage = `The following is a friendly conversation between a human and an AI. The AI is talkative and provides lots of specific details from its context. If the AI does not know the answer to a question, it truthfully says it does not know.`;
class ConversationChain_Chains {
    constructor() {
        this.label = 'Conversation Chain';
        this.name = 'conversationChain';
        this.type = 'ConversationChain';
        this.icon = 'chain.svg';
        this.category = 'Chains';
        this.description = 'Chat Models specific conversational chain with memory';
        this.baseClasses = [this.type, ...(0, utils_1.getBaseClasses)(chains_1.ConversationChain)];
        this.inputs = [
            {
                label: 'Language Model',
                name: 'model',
                type: 'BaseChatModel'
            },
            {
                label: 'Memory',
                name: 'memory',
                type: 'BaseMemory'
            },
            {
                label: 'Document',
                name: 'document',
                type: 'Document',
                description: 'Include whole document into the context window',
                optional: true,
                list: true
            },
            {
                label: 'System Message',
                name: 'systemMessagePrompt',
                type: 'string',
                rows: 4,
                additionalParams: true,
                optional: true,
                placeholder: 'You are a helpful assistant that write codes'
            }
        ];
    }
    async init(nodeData) {
        const model = nodeData.inputs?.model;
        const memory = nodeData.inputs?.memory;
        const prompt = nodeData.inputs?.systemMessagePrompt;
        const docs = nodeData.inputs?.document;
        const flattenDocs = docs && docs.length ? (0, lodash_1.flatten)(docs) : [];
        const finalDocs = [];
        for (let i = 0; i < flattenDocs.length; i += 1) {
            finalDocs.push(new document_1.Document(flattenDocs[i]));
        }
        let finalText = '';
        for (let i = 0; i < finalDocs.length; i += 1) {
            finalText += finalDocs[i].pageContent;
        }
        if (finalText)
            systemMessage = `${systemMessage}\nThe AI has the following context:\n${finalText}`;
        const obj = {
            llm: model,
            memory,
            verbose: process.env.DEBUG === 'true' ? true : false
        };
        const chatPrompt = prompts_1.ChatPromptTemplate.fromPromptMessages([
            prompts_1.SystemMessagePromptTemplate.fromTemplate(prompt ? `${prompt}\n${systemMessage}` : systemMessage),
            new prompts_1.MessagesPlaceholder(memory.memoryKey ?? 'chat_history'),
            prompts_1.HumanMessagePromptTemplate.fromTemplate('{input}')
        ]);
        obj.prompt = chatPrompt;
        const chain = new chains_1.ConversationChain(obj);
        return chain;
    }
    async run(nodeData, input, options) {
        const chain = nodeData.instance;
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
            chain.memory = memory;
        }
        const loggerHandler = new handler_1.ConsoleCallbackHandler(options.logger);
        if (options.socketIO && options.socketIOClientId) {
            const handler = new handler_1.CustomChainHandler(options.socketIO, options.socketIOClientId);
            const res = await chain.call({ input }, [loggerHandler, handler]);
            return res?.response;
        }
        else {
            const res = await chain.call({ input }, [loggerHandler]);
            return res?.response;
        }
    }
}
module.exports = { nodeClass: ConversationChain_Chains };
//# sourceMappingURL=ConversationChain.js.map