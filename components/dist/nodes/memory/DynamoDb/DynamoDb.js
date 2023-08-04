"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const src_1 = require("../../../src");
const dynamodb_1 = require("langchain/stores/message/dynamodb");
const memory_1 = require("langchain/memory");
class DynamoDb_Memory {
    constructor() {
        this.label = 'DynamoDB Chat Memory';
        this.name = 'DynamoDBChatMemory';
        this.type = 'DynamoDBChatMemory';
        this.icon = 'dynamodb.svg';
        this.category = 'Memory';
        this.description = 'Stores the conversation in dynamo db table';
        this.baseClasses = [this.type, ...(0, src_1.getBaseClasses)(memory_1.BufferMemory)];
        this.inputs = [
            {
                label: 'Table Name',
                name: 'tableName',
                type: 'string'
            },
            {
                label: 'Partition Key',
                name: 'partitionKey',
                type: 'string'
            },
            {
                label: 'Session ID',
                name: 'sessionId',
                type: 'string',
                description: 'if empty, chatId will be used automatically',
                default: '',
                additionalParams: true,
                optional: true
            },
            {
                label: 'Region',
                name: 'region',
                type: 'string',
                description: 'The aws region in which table is located',
                placeholder: 'us-east-1'
            },
            {
                label: 'Access Key',
                name: 'accessKey',
                type: 'password'
            },
            {
                label: 'Secret Access Key',
                name: 'secretAccessKey',
                type: 'password'
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
        return initalizeDynamoDB(nodeData, options);
    }
    async clearSessionMemory(nodeData, options) {
        const dynamodbMemory = initalizeDynamoDB(nodeData, options);
        dynamodbMemory.clear();
    }
}
const initalizeDynamoDB = (nodeData, options) => {
    const tableName = nodeData.inputs?.tableName;
    const partitionKey = nodeData.inputs?.partitionKey;
    const sessionId = nodeData.inputs?.sessionId;
    const region = nodeData.inputs?.region;
    const accessKey = nodeData.inputs?.accessKey;
    const secretAccessKey = nodeData.inputs?.secretAccessKey;
    const memoryKey = nodeData.inputs?.memoryKey;
    const chatId = options.chatId;
    const dynamoDb = new dynamodb_1.DynamoDBChatMessageHistory({
        tableName,
        partitionKey,
        sessionId: sessionId ? sessionId : chatId,
        config: {
            region,
            credentials: {
                accessKeyId: accessKey,
                secretAccessKey
            }
        }
    });
    const memory = new memory_1.BufferMemory({
        memoryKey,
        chatHistory: dynamoDb,
        returnMessages: true
    });
    return memory;
};
module.exports = { nodeClass: DynamoDb_Memory };
//# sourceMappingURL=DynamoDb.js.map