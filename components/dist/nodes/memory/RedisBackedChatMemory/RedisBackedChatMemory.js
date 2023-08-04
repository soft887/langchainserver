"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../../../src/utils");
const memory_1 = require("langchain/memory");
const redis_1 = require("langchain/stores/message/redis");
const redis_2 = require("redis");
class RedisBackedChatMemory_Memory {
    constructor() {
        this.label = 'Redis-Backed Chat Memory';
        this.name = 'RedisBackedChatMemory';
        this.type = 'RedisBackedChatMemory';
        this.icon = 'redis.svg';
        this.category = 'Memory';
        this.description = 'Summarizes the conversation and stores the memory in Redis server';
        this.baseClasses = [this.type, ...(0, utils_1.getBaseClasses)(memory_1.BufferMemory)];
        this.inputs = [
            {
                label: 'Base URL',
                name: 'baseURL',
                type: 'string',
                default: 'redis://localhost:6379'
            },
            {
                label: 'Session Id',
                name: 'sessionId',
                type: 'string',
                description: 'if empty, chatId will be used automatically',
                default: '',
                additionalParams: true,
                optional: true
            },
            {
                label: 'Session Timeouts',
                name: 'sessionTTL',
                type: 'number',
                description: 'Omit this parameter to make sessions never expire',
                optional: true
            },
            {
                label: 'Memory Key',
                name: 'memoryKey',
                type: 'string',
                default: 'chat_history'
            }
        ];
    }
    async init(nodeData, _, options) {
        return initalizeRedis(nodeData, options);
    }
    async clearSessionMemory(nodeData, options) {
        const redis = initalizeRedis(nodeData, options);
        redis.clear();
    }
}
const initalizeRedis = (nodeData, options) => {
    const baseURL = nodeData.inputs?.baseURL;
    const sessionId = nodeData.inputs?.sessionId;
    const sessionTTL = nodeData.inputs?.sessionTTL;
    const memoryKey = nodeData.inputs?.memoryKey;
    const chatId = options?.chatId;
    const redisClient = (0, redis_2.createClient)({ url: baseURL });
    let obj = {
        sessionId: sessionId ? sessionId : chatId,
        client: redisClient
    };
    if (sessionTTL) {
        obj = {
            ...obj,
            sessionTTL
        };
    }
    let redisChatMessageHistory = new redis_1.RedisChatMessageHistory(obj);
    let redis = new memory_1.BufferMemory({ memoryKey, chatHistory: redisChatMessageHistory, returnMessages: true });
    return redis;
};
module.exports = { nodeClass: RedisBackedChatMemory_Memory };
//# sourceMappingURL=RedisBackedChatMemory.js.map