"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChildProcess = void 0;
const path_1 = __importDefault(require("path"));
const utils_1 = require("./utils");
const typeorm_1 = require("typeorm");
const ChatFlow_1 = require("./entity/ChatFlow");
const ChatMessage_1 = require("./entity/ChatMessage");
const Tool_1 = require("./entity/Tool");
const logger_1 = __importDefault(require("./utils/logger"));
class ChildProcess {
    /**
     * Stop child process when app is killed
     */
    static async stopChildProcess() {
        setTimeout(() => {
            process.exit(0);
        }, 50000);
    }
    /**
     * Process prediction
     * @param {IRunChatflowMessageValue} messageValue
     * @return {Promise<void>}
     */
    async runChildProcess(messageValue) {
        var _a;
        var _b;
        process.on('SIGTERM', ChildProcess.stopChildProcess);
        process.on('SIGINT', ChildProcess.stopChildProcess);
        await sendToParentProcess('start', '_');
        try {
            const childAppDataSource = await initDB();
            // Create a Queue and add our initial node in it
            const { endingNodeData, chatflow, chatId, incomingInput, componentNodes } = messageValue;
            let nodeToExecuteData;
            let addToChatFlowPool = {};
            /* Don't rebuild the flow (to avoid duplicated upsert, recomputation) when all these conditions met:
             * - Node Data already exists in pool
             * - Still in sync (i.e the flow has not been modified since)
             * - Existing overrideConfig and new overrideConfig are the same
             * - Flow doesn't start with nodes that depend on incomingInput.question
             ***/
            if (endingNodeData) {
                nodeToExecuteData = endingNodeData;
            }
            else {
                /*** Get chatflows and prepare data  ***/
                const flowData = chatflow.flowData;
                const parsedFlowData = JSON.parse(flowData);
                const nodes = parsedFlowData.nodes;
                const edges = parsedFlowData.edges;
                /*** Get Ending Node with Directed Graph  ***/
                const { graph, nodeDependencies } = (0, utils_1.constructGraphs)(nodes, edges);
                const directedGraph = graph;
                const endingNodeId = (0, utils_1.getEndingNode)(nodeDependencies, directedGraph);
                if (!endingNodeId) {
                    await sendToParentProcess('error', `Ending node ${endingNodeId} not found`);
                    return;
                }
                const endingNodeData = (_b = nodes.find((nd) => nd.id === endingNodeId)) === null || _b === void 0 ? void 0 : _b.data;
                if (!endingNodeData) {
                    await sendToParentProcess('error', `Ending node ${endingNodeId} data not found`);
                    return;
                }
                if (endingNodeData && endingNodeData.category !== 'Chains' && endingNodeData.category !== 'Agents') {
                    await sendToParentProcess('error', `Ending node must be either a Chain or Agent`);
                    return;
                }
                if (endingNodeData.outputs &&
                    Object.keys(endingNodeData.outputs).length &&
                    !Object.values(endingNodeData.outputs).includes(endingNodeData.name)) {
                    await sendToParentProcess('error', `Output of ${endingNodeData.label} (${endingNodeData.id}) must be ${endingNodeData.label}, can't be an Output Prediction`);
                    return;
                }
                /*** Get Starting Nodes with Non-Directed Graph ***/
                const constructedObj = (0, utils_1.constructGraphs)(nodes, edges, true);
                const nonDirectedGraph = constructedObj.graph;
                const { startingNodeIds, depthQueue } = (0, utils_1.getStartingNodes)(nonDirectedGraph, endingNodeId);
                logger_1.default.debug(`[server] [mode:child]: Start building chatflow ${chatflow.id}`);
                /*** BFS to traverse from Starting Nodes to Ending Node ***/
                const reactFlowNodes = await (0, utils_1.buildLangchain)(startingNodeIds, nodes, graph, depthQueue, componentNodes, incomingInput.question, chatId, childAppDataSource, incomingInput === null || incomingInput === void 0 ? void 0 : incomingInput.overrideConfig);
                const nodeToExecute = reactFlowNodes.find((node) => node.id === endingNodeId);
                if (!nodeToExecute) {
                    await sendToParentProcess('error', `Node ${endingNodeId} not found`);
                    return;
                }
                if (incomingInput.overrideConfig)
                    nodeToExecute.data = (0, utils_1.replaceInputsWithConfig)(nodeToExecute.data, incomingInput.overrideConfig);
                const reactFlowNodeData = (0, utils_1.resolveVariables)(nodeToExecute.data, reactFlowNodes, incomingInput.question);
                nodeToExecuteData = reactFlowNodeData;
                const startingNodes = nodes.filter((nd) => startingNodeIds.includes(nd.id));
                addToChatFlowPool = {
                    chatflowid: chatflow.id,
                    nodeToExecuteData,
                    startingNodes,
                    overrideConfig: incomingInput === null || incomingInput === void 0 ? void 0 : incomingInput.overrideConfig
                };
            }
            const nodeInstanceFilePath = componentNodes[nodeToExecuteData.name].filePath;
            const nodeModule = await (_a = nodeInstanceFilePath, Promise.resolve().then(() => __importStar(require(_a))));
            const nodeInstance = new nodeModule.nodeClass();
            logger_1.default.debug(`[server] [mode:child]: Running ${nodeToExecuteData.label} (${nodeToExecuteData.id})`);
            const result = await nodeInstance.run(nodeToExecuteData, incomingInput.question, { chatHistory: incomingInput.history });
            logger_1.default.debug(`[server] [mode:child]: Finished running ${nodeToExecuteData.label} (${nodeToExecuteData.id})`);
            await sendToParentProcess('finish', { result, addToChatFlowPool });
        }
        catch (e) {
            await sendToParentProcess('error', e.message);
            logger_1.default.error('[server] [mode:child]: Error:', e);
        }
    }
}
exports.ChildProcess = ChildProcess;
/**
 * Initalize DB in child process
 * @returns {DataSource}
 */
async function initDB() {
    var _a, _b;
    let childAppDataSource;
    let homePath;
    const synchronize = process.env.OVERRIDE_DATABASE === 'false' ? false : true;
    switch (process.env.DATABASE_TYPE) {
        case 'sqlite':
            homePath = (_a = process.env.DATABASE_PATH) !== null && _a !== void 0 ? _a : path_1.default.join((0, utils_1.getUserHome)(), '.flowise');
            childAppDataSource = new typeorm_1.DataSource({
                type: 'sqlite',
                database: path_1.default.resolve(homePath, 'database.sqlite'),
                synchronize,
                entities: [ChatFlow_1.ChatFlow, ChatMessage_1.ChatMessage, Tool_1.Tool],
                migrations: []
            });
            break;
        case 'mysql':
            childAppDataSource = new typeorm_1.DataSource({
                type: 'mysql',
                host: process.env.DATABASE_HOST,
                port: parseInt(process.env.DATABASE_PORT || '3306'),
                username: process.env.DATABASE_USER,
                password: process.env.DATABASE_PASSWORD,
                database: process.env.DATABASE_NAME,
                charset: 'utf8mb4',
                synchronize,
                entities: [ChatFlow_1.ChatFlow, ChatMessage_1.ChatMessage, Tool_1.Tool],
                migrations: []
            });
            break;
        case 'postgres':
            childAppDataSource = new typeorm_1.DataSource({
                type: 'postgres',
                host: process.env.DATABASE_HOST,
                port: parseInt(process.env.DATABASE_PORT || '5432'),
                username: process.env.DATABASE_USER,
                password: process.env.DATABASE_PASSWORD,
                database: process.env.DATABASE_NAME,
                synchronize,
                entities: [ChatFlow_1.ChatFlow, ChatMessage_1.ChatMessage, Tool_1.Tool],
                migrations: []
            });
            break;
        default:
            homePath = (_b = process.env.DATABASE_PATH) !== null && _b !== void 0 ? _b : path_1.default.join((0, utils_1.getUserHome)(), '.flowise');
            childAppDataSource = new typeorm_1.DataSource({
                type: 'sqlite',
                database: path_1.default.resolve(homePath, 'database.sqlite'),
                synchronize,
                entities: [ChatFlow_1.ChatFlow, ChatMessage_1.ChatMessage, Tool_1.Tool],
                migrations: []
            });
            break;
    }
    return await childAppDataSource.initialize();
}
/**
 * Send data back to parent process
 * @param {string} key Key of message
 * @param {*} value Value of message
 * @returns {Promise<void>}
 */
async function sendToParentProcess(key, value) {
    // tslint:disable-line:no-any
    return new Promise((resolve, reject) => {
        process.send({
            key,
            value
        }, (error) => {
            if (error) {
                return reject(error);
            }
            resolve();
        });
    });
}
const childProcess = new ChildProcess();
process.on('message', async (message) => {
    if (message.key === 'start') {
        await childProcess.runChildProcess(message.value);
        process.exit();
    }
});
//# sourceMappingURL=ChildProcess.js.map