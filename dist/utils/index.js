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
exports.isFlowValidForStream = exports.findAvailableConfigs = exports.mapMimeTypeToInputField = exports.replaceAllAPIKeys = exports.deleteAPIKey = exports.updateAPIKey = exports.getApiKey = exports.addAPIKey = exports.getAPIKeys = exports.compareKeys = exports.generateSecretHash = exports.generateAPIKey = exports.getAPIKeyPath = exports.isSameOverrideConfig = exports.isStartNodeDependOnInput = exports.replaceInputsWithConfig = exports.resolveVariables = exports.isVectorStoreFaiss = exports.getVariableValue = exports.clearSessionMemory = exports.buildLangchain = exports.getEndingNode = exports.getStartingNodes = exports.constructGraphs = exports.getNodeModulesPackagePath = exports.getUserHome = exports.databaseEntities = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const moment_1 = __importDefault(require("moment"));
const logger_1 = __importDefault(require("./logger"));
const lodash_1 = require("lodash");
const index_1 = require("../../components/dist/src/index");
const crypto_1 = require("crypto");
const ChatFlow_1 = require("../entity/ChatFlow");
const ChatMessage_1 = require("../entity/ChatMessage");
const Tool_1 = require("../entity/Tool");
const QUESTION_VAR_PREFIX = 'question';
exports.databaseEntities = { ChatFlow: ChatFlow_1.ChatFlow, ChatMessage: ChatMessage_1.ChatMessage, Tool: Tool_1.Tool };
/**
 * Returns the home folder path of the user if
 * none can be found it falls back to the current
 * working directory
 *
 */
const getUserHome = () => {
    let variableName = 'HOME';
    if (process.platform === 'win32') {
        variableName = 'USERPROFILE';
    }
    if (process.env[variableName] === undefined) {
        // If for some reason the variable does not exist
        // fall back to current folder
        return process.cwd();
    }
    return process.env[variableName];
};
exports.getUserHome = getUserHome;
/**
 * Returns the path of node modules package
 * @param {string} packageName
 * @returns {string}
 */
const getNodeModulesPackagePath = (packageName) => {
    const checkPaths = [
        path_1.default.join(__dirname, '..', 'node_modules', packageName),
        path_1.default.join(__dirname, '..', '..', 'node_modules', packageName),
        path_1.default.join(__dirname, '..', '..', '..', 'node_modules', packageName),
        path_1.default.join(__dirname, '..', '..', '..', '..', 'node_modules', packageName),
        path_1.default.join(__dirname, '..', '..', '..', '..', '..', 'node_modules', packageName)
    ];
    for (const checkPath of checkPaths) {
        if (fs_1.default.existsSync(checkPath)) {
            return checkPath;
        }
    }
    return '';
};
exports.getNodeModulesPackagePath = getNodeModulesPackagePath;
/**
 * Construct graph and node dependencies score
 * @param {IReactFlowNode[]} reactFlowNodes
 * @param {IReactFlowEdge[]} reactFlowEdges
 * @param {boolean} isNondirected
 */
const constructGraphs = (reactFlowNodes, reactFlowEdges, isNondirected = false) => {
    const nodeDependencies = {};
    const graph = {};
    for (let i = 0; i < reactFlowNodes.length; i += 1) {
        const nodeId = reactFlowNodes[i].id;
        nodeDependencies[nodeId] = 0;
        graph[nodeId] = [];
    }
    for (let i = 0; i < reactFlowEdges.length; i += 1) {
        const source = reactFlowEdges[i].source;
        const target = reactFlowEdges[i].target;
        if (Object.prototype.hasOwnProperty.call(graph, source)) {
            graph[source].push(target);
        }
        else {
            graph[source] = [target];
        }
        if (isNondirected) {
            if (Object.prototype.hasOwnProperty.call(graph, target)) {
                graph[target].push(source);
            }
            else {
                graph[target] = [source];
            }
        }
        nodeDependencies[target] += 1;
    }
    return { graph, nodeDependencies };
};
exports.constructGraphs = constructGraphs;
/**
 * Get starting nodes and check if flow is valid
 * @param {INodeDependencies} graph
 * @param {string} endNodeId
 */
const getStartingNodes = (graph, endNodeId) => {
    const visited = new Set();
    const queue = [[endNodeId, 0]];
    const depthQueue = {
        [endNodeId]: 0
    };
    let maxDepth = 0;
    let startingNodeIds = [];
    while (queue.length > 0) {
        const [currentNode, depth] = queue.shift();
        if (visited.has(currentNode)) {
            continue;
        }
        visited.add(currentNode);
        if (depth > maxDepth) {
            maxDepth = depth;
            startingNodeIds = [currentNode];
        }
        else if (depth === maxDepth) {
            startingNodeIds.push(currentNode);
        }
        for (const neighbor of graph[currentNode]) {
            if (!visited.has(neighbor)) {
                queue.push([neighbor, depth + 1]);
                depthQueue[neighbor] = depth + 1;
            }
        }
    }
    const depthQueueReversed = {};
    for (const nodeId in depthQueue) {
        if (Object.prototype.hasOwnProperty.call(depthQueue, nodeId)) {
            depthQueueReversed[nodeId] = Math.abs(depthQueue[nodeId] - maxDepth);
        }
    }
    return { startingNodeIds, depthQueue: depthQueueReversed };
};
exports.getStartingNodes = getStartingNodes;
/**
 * Get ending node and check if flow is valid
 * @param {INodeDependencies} nodeDependencies
 * @param {INodeDirectedGraph} graph
 */
const getEndingNode = (nodeDependencies, graph) => {
    let endingNodeId = '';
    Object.keys(graph).forEach((nodeId) => {
        if (Object.keys(nodeDependencies).length === 1) {
            endingNodeId = nodeId;
        }
        else if (!graph[nodeId].length && nodeDependencies[nodeId] > 0) {
            endingNodeId = nodeId;
        }
    });
    return endingNodeId;
};
exports.getEndingNode = getEndingNode;
/**
 * Build langchain from start to end
 * @param {string} startingNodeId
 * @param {IReactFlowNode[]} reactFlowNodes
 * @param {INodeDirectedGraph} graph
 * @param {IDepthQueue} depthQueue
 * @param {IComponentNodes} componentNodes
 * @param {string} question
 * @param {string} chatId
 * @param {DataSource} appDataSource
 * @param {ICommonObject} overrideConfig
 */
const buildLangchain = async (startingNodeIds, reactFlowNodes, graph, depthQueue, componentNodes, question, chatId, appDataSource, overrideConfig) => {
    var _a;
    const flowNodes = (0, lodash_1.cloneDeep)(reactFlowNodes);
    // Create a Queue and add our initial node in it
    const nodeQueue = [];
    const exploredNode = {};
    // In the case of infinite loop, only max 3 loops will be executed
    const maxLoop = 3;
    for (let i = 0; i < startingNodeIds.length; i += 1) {
        nodeQueue.push({ nodeId: startingNodeIds[i], depth: 0 });
        exploredNode[startingNodeIds[i]] = { remainingLoop: maxLoop, lastSeenDepth: 0 };
    }
    while (nodeQueue.length) {
        const { nodeId, depth } = nodeQueue.shift();
        const reactFlowNode = flowNodes.find((nd) => nd.id === nodeId);
        const nodeIndex = flowNodes.findIndex((nd) => nd.id === nodeId);
        if (!reactFlowNode || reactFlowNode === undefined || nodeIndex < 0)
            continue;
        try {
            const nodeInstanceFilePath = componentNodes[reactFlowNode.data.name].filePath;
            const nodeModule = await (_a = nodeInstanceFilePath, Promise.resolve().then(() => __importStar(require(_a))));
            const newNodeInstance = new nodeModule.nodeClass();
            let flowNodeData = (0, lodash_1.cloneDeep)(reactFlowNode.data);
            if (overrideConfig)
                flowNodeData = (0, exports.replaceInputsWithConfig)(flowNodeData, overrideConfig);
            const reactFlowNodeData = (0, exports.resolveVariables)(flowNodeData, flowNodes, question);
            logger_1.default.debug(`[server]: Initializing ${reactFlowNode.data.label} (${reactFlowNode.data.id})`);
            flowNodes[nodeIndex].data.instance = await newNodeInstance.init(reactFlowNodeData, question, {
                chatId,
                appDataSource,
                databaseEntities: exports.databaseEntities,
                logger: logger_1.default
            });
            logger_1.default.debug(`[server]: Finished initializing ${reactFlowNode.data.label} (${reactFlowNode.data.id})`);
        }
        catch (e) {
            logger_1.default.error(e);
            throw new Error(e);
        }
        const neighbourNodeIds = graph[nodeId];
        const nextDepth = depth + 1;
        // Find other nodes that are on the same depth level
        const sameDepthNodeIds = Object.keys(depthQueue).filter((key) => depthQueue[key] === nextDepth);
        for (const id of sameDepthNodeIds) {
            if (neighbourNodeIds.includes(id))
                continue;
            neighbourNodeIds.push(id);
        }
        for (let i = 0; i < neighbourNodeIds.length; i += 1) {
            const neighNodeId = neighbourNodeIds[i];
            // If nodeId has been seen, cycle detected
            if (Object.prototype.hasOwnProperty.call(exploredNode, neighNodeId)) {
                const { remainingLoop, lastSeenDepth } = exploredNode[neighNodeId];
                if (lastSeenDepth === nextDepth)
                    continue;
                if (remainingLoop === 0) {
                    break;
                }
                const remainingLoopMinusOne = remainingLoop - 1;
                exploredNode[neighNodeId] = { remainingLoop: remainingLoopMinusOne, lastSeenDepth: nextDepth };
                nodeQueue.push({ nodeId: neighNodeId, depth: nextDepth });
            }
            else {
                exploredNode[neighNodeId] = { remainingLoop: maxLoop, lastSeenDepth: nextDepth };
                nodeQueue.push({ nodeId: neighNodeId, depth: nextDepth });
            }
        }
    }
    return flowNodes;
};
exports.buildLangchain = buildLangchain;
/**
 * Clear memory
 * @param {IReactFlowNode[]} reactFlowNodes
 * @param {IComponentNodes} componentNodes
 * @param {string} chatId
 * @param {string} sessionId
 */
const clearSessionMemory = async (reactFlowNodes, componentNodes, chatId, sessionId) => {
    var _a;
    for (const node of reactFlowNodes) {
        if (node.data.category !== 'Memory')
            continue;
        const nodeInstanceFilePath = componentNodes[node.data.name].filePath;
        const nodeModule = await (_a = nodeInstanceFilePath, Promise.resolve().then(() => __importStar(require(_a))));
        const newNodeInstance = new nodeModule.nodeClass();
        if (sessionId && node.data.inputs)
            node.data.inputs.sessionId = sessionId;
        if (newNodeInstance.clearSessionMemory)
            await (newNodeInstance === null || newNodeInstance === void 0 ? void 0 : newNodeInstance.clearSessionMemory(node.data, { chatId }));
    }
};
exports.clearSessionMemory = clearSessionMemory;
/**
 * Get variable value from outputResponses.output
 * @param {string} paramValue
 * @param {IReactFlowNode[]} reactFlowNodes
 * @param {string} question
 * @param {boolean} isAcceptVariable
 * @returns {string}
 */
const getVariableValue = (paramValue, reactFlowNodes, question, isAcceptVariable = false) => {
    let returnVal = paramValue;
    const variableStack = [];
    const variableDict = {};
    let startIdx = 0;
    const endIdx = returnVal.length - 1;
    while (startIdx < endIdx) {
        const substr = returnVal.substring(startIdx, startIdx + 2);
        // Store the opening double curly bracket
        if (substr === '{{') {
            variableStack.push({ substr, startIdx: startIdx + 2 });
        }
        // Found the complete variable
        if (substr === '}}' && variableStack.length > 0 && variableStack[variableStack.length - 1].substr === '{{') {
            const variableStartIdx = variableStack[variableStack.length - 1].startIdx;
            const variableEndIdx = startIdx;
            const variableFullPath = returnVal.substring(variableStartIdx, variableEndIdx);
            /**
             * Apply string transformation to convert special chars:
             * FROM: hello i am ben\n\n\thow are you?
             * TO: hello i am benFLOWISE_NEWLINEFLOWISE_NEWLINEFLOWISE_TABhow are you?
             */
            if (isAcceptVariable && variableFullPath === QUESTION_VAR_PREFIX) {
                variableDict[`{{${variableFullPath}}}`] = (0, index_1.handleEscapeCharacters)(question, false);
            }
            // Split by first occurrence of '.' to get just nodeId
            const [variableNodeId, _] = variableFullPath.split('.');
            const executedNode = reactFlowNodes.find((nd) => nd.id === variableNodeId);
            if (executedNode) {
                const variableValue = (0, lodash_1.get)(executedNode.data, 'instance');
                if (isAcceptVariable) {
                    variableDict[`{{${variableFullPath}}}`] = variableValue;
                }
                else {
                    returnVal = variableValue;
                }
            }
            variableStack.pop();
        }
        startIdx += 1;
    }
    if (isAcceptVariable) {
        const variablePaths = Object.keys(variableDict);
        variablePaths.sort(); // Sort by length of variable path because longer path could possibly contains nested variable
        variablePaths.forEach((path) => {
            const variableValue = variableDict[path];
            // Replace all occurrence
            returnVal = returnVal.split(path).join(variableValue);
        });
        return returnVal;
    }
    return returnVal;
};
exports.getVariableValue = getVariableValue;
/**
 * Temporarily disable streaming if vectorStore is Faiss
 * @param {INodeData} flowNodeData
 * @returns {boolean}
 */
const isVectorStoreFaiss = (flowNodeData) => {
    if (flowNodeData.inputs && flowNodeData.inputs.vectorStoreRetriever) {
        const vectorStoreRetriever = flowNodeData.inputs.vectorStoreRetriever;
        if (typeof vectorStoreRetriever === 'string' && vectorStoreRetriever.includes('faiss'))
            return true;
        if (typeof vectorStoreRetriever === 'object' &&
            vectorStoreRetriever.vectorStore &&
            vectorStoreRetriever.vectorStore.constructor.name === 'FaissStore')
            return true;
    }
    return false;
};
exports.isVectorStoreFaiss = isVectorStoreFaiss;
/**
 * Loop through each inputs and resolve variable if neccessary
 * @param {INodeData} reactFlowNodeData
 * @param {IReactFlowNode[]} reactFlowNodes
 * @param {string} question
 * @returns {INodeData}
 */
const resolveVariables = (reactFlowNodeData, reactFlowNodes, question) => {
    var _a;
    let flowNodeData = (0, lodash_1.cloneDeep)(reactFlowNodeData);
    if (reactFlowNodeData.instance && (0, exports.isVectorStoreFaiss)(reactFlowNodeData)) {
        // omit and merge because cloneDeep of instance gives "Illegal invocation" Exception
        const flowNodeDataWithoutInstance = (0, lodash_1.cloneDeep)((0, lodash_1.omit)(reactFlowNodeData, ['instance']));
        flowNodeData = (0, lodash_1.merge)(flowNodeDataWithoutInstance, { instance: reactFlowNodeData.instance });
    }
    const types = 'inputs';
    const getParamValues = (paramsObj) => {
        var _a, _b;
        for (const key in paramsObj) {
            const paramValue = paramsObj[key];
            if (Array.isArray(paramValue)) {
                const resolvedInstances = [];
                for (const param of paramValue) {
                    const resolvedInstance = (0, exports.getVariableValue)(param, reactFlowNodes, question);
                    resolvedInstances.push(resolvedInstance);
                }
                paramsObj[key] = resolvedInstances;
            }
            else {
                const isAcceptVariable = (_b = (_a = reactFlowNodeData.inputParams.find((param) => param.name === key)) === null || _a === void 0 ? void 0 : _a.acceptVariable) !== null && _b !== void 0 ? _b : false;
                const resolvedInstance = (0, exports.getVariableValue)(paramValue, reactFlowNodes, question, isAcceptVariable);
                paramsObj[key] = resolvedInstance;
            }
        }
    };
    const paramsObj = (_a = flowNodeData[types]) !== null && _a !== void 0 ? _a : {};
    getParamValues(paramsObj);
    return flowNodeData;
};
exports.resolveVariables = resolveVariables;
/**
 * Loop through each inputs and replace their value with override config values
 * @param {INodeData} flowNodeData
 * @param {ICommonObject} overrideConfig
 * @returns {INodeData}
 */
const replaceInputsWithConfig = (flowNodeData, overrideConfig) => {
    var _a;
    const types = 'inputs';
    const getParamValues = (paramsObj) => {
        var _a;
        for (const config in overrideConfig) {
            let paramValue = (_a = overrideConfig[config]) !== null && _a !== void 0 ? _a : paramsObj[config];
            // Check if boolean
            if (paramValue === 'true')
                paramValue = true;
            else if (paramValue === 'false')
                paramValue = false;
            paramsObj[config] = paramValue;
        }
    };
    const paramsObj = (_a = flowNodeData[types]) !== null && _a !== void 0 ? _a : {};
    getParamValues(paramsObj);
    return flowNodeData;
};
exports.replaceInputsWithConfig = replaceInputsWithConfig;
/**
 * Rebuild flow if LLMChain has dependency on other chains
 * User Question => Prompt_0 => LLMChain_0 => Prompt-1 => LLMChain_1
 * @param {IReactFlowNode[]} startingNodes
 * @returns {boolean}
 */
const isStartNodeDependOnInput = (startingNodes) => {
    for (const node of startingNodes) {
        for (const inputName in node.data.inputs) {
            const inputVariables = (0, index_1.getInputVariables)(node.data.inputs[inputName]);
            if (inputVariables.length > 0)
                return true;
        }
    }
    return false;
};
exports.isStartNodeDependOnInput = isStartNodeDependOnInput;
/**
 * Rebuild flow if new override config is provided
 * @param {boolean} isInternal
 * @param {ICommonObject} existingOverrideConfig
 * @param {ICommonObject} newOverrideConfig
 * @returns {boolean}
 */
const isSameOverrideConfig = (isInternal, existingOverrideConfig, newOverrideConfig) => {
    if (isInternal) {
        if (existingOverrideConfig && Object.keys(existingOverrideConfig).length)
            return false;
        return true;
    }
    // If existing and new overrideconfig are the same
    if (existingOverrideConfig &&
        Object.keys(existingOverrideConfig).length &&
        newOverrideConfig &&
        Object.keys(newOverrideConfig).length &&
        JSON.stringify(existingOverrideConfig) === JSON.stringify(newOverrideConfig)) {
        return true;
    }
    // If there is no existing and new overrideconfig
    if (!existingOverrideConfig && !newOverrideConfig)
        return true;
    return false;
};
exports.isSameOverrideConfig = isSameOverrideConfig;
/**
 * Returns the api key path
 * @returns {string}
 */
const getAPIKeyPath = () => {
    return process.env.APIKEY_PATH ? path_1.default.join(process.env.APIKEY_PATH, 'api.json') : path_1.default.join(__dirname, '..', '..', 'api.json');
};
exports.getAPIKeyPath = getAPIKeyPath;
/**
 * Generate the api key
 * @returns {string}
 */
const generateAPIKey = () => {
    const buffer = (0, crypto_1.randomBytes)(32);
    return buffer.toString('base64');
};
exports.generateAPIKey = generateAPIKey;
/**
 * Generate the secret key
 * @param {string} apiKey
 * @returns {string}
 */
const generateSecretHash = (apiKey) => {
    const salt = (0, crypto_1.randomBytes)(8).toString('hex');
    const buffer = (0, crypto_1.scryptSync)(apiKey, salt, 64);
    return `${buffer.toString('hex')}.${salt}`;
};
exports.generateSecretHash = generateSecretHash;
/**
 * Verify valid keys
 * @param {string} storedKey
 * @param {string} suppliedKey
 * @returns {boolean}
 */
const compareKeys = (storedKey, suppliedKey) => {
    const [hashedPassword, salt] = storedKey.split('.');
    const buffer = (0, crypto_1.scryptSync)(suppliedKey, salt, 64);
    return (0, crypto_1.timingSafeEqual)(Buffer.from(hashedPassword, 'hex'), buffer);
};
exports.compareKeys = compareKeys;
/**
 * Get API keys
 * @returns {Promise<ICommonObject[]>}
 */
const getAPIKeys = async () => {
    try {
        const content = await fs_1.default.promises.readFile((0, exports.getAPIKeyPath)(), 'utf8');
        return JSON.parse(content);
    }
    catch (error) {
        const keyName = 'DefaultKey';
        const apiKey = (0, exports.generateAPIKey)();
        const apiSecret = (0, exports.generateSecretHash)(apiKey);
        const content = [
            {
                keyName,
                apiKey,
                apiSecret,
                createdAt: (0, moment_1.default)().format('DD-MMM-YY'),
                id: (0, crypto_1.randomBytes)(16).toString('hex')
            }
        ];
        await fs_1.default.promises.writeFile((0, exports.getAPIKeyPath)(), JSON.stringify(content), 'utf8');
        return content;
    }
};
exports.getAPIKeys = getAPIKeys;
/**
 * Add new API key
 * @param {string} keyName
 * @returns {Promise<ICommonObject[]>}
 */
const addAPIKey = async (keyName) => {
    const existingAPIKeys = await (0, exports.getAPIKeys)();
    const apiKey = (0, exports.generateAPIKey)();
    const apiSecret = (0, exports.generateSecretHash)(apiKey);
    const content = [
        ...existingAPIKeys,
        {
            keyName,
            apiKey,
            apiSecret,
            createdAt: (0, moment_1.default)().format('DD-MMM-YY'),
            id: (0, crypto_1.randomBytes)(16).toString('hex')
        }
    ];
    await fs_1.default.promises.writeFile((0, exports.getAPIKeyPath)(), JSON.stringify(content), 'utf8');
    return content;
};
exports.addAPIKey = addAPIKey;
/**
 * Get API Key details
 * @param {string} apiKey
 * @returns {Promise<ICommonObject[]>}
 */
const getApiKey = async (apiKey) => {
    const existingAPIKeys = await (0, exports.getAPIKeys)();
    const keyIndex = existingAPIKeys.findIndex((key) => key.apiKey === apiKey);
    if (keyIndex < 0)
        return undefined;
    return existingAPIKeys[keyIndex];
};
exports.getApiKey = getApiKey;
/**
 * Update existing API key
 * @param {string} keyIdToUpdate
 * @param {string} newKeyName
 * @returns {Promise<ICommonObject[]>}
 */
const updateAPIKey = async (keyIdToUpdate, newKeyName) => {
    const existingAPIKeys = await (0, exports.getAPIKeys)();
    const keyIndex = existingAPIKeys.findIndex((key) => key.id === keyIdToUpdate);
    if (keyIndex < 0)
        return [];
    existingAPIKeys[keyIndex].keyName = newKeyName;
    await fs_1.default.promises.writeFile((0, exports.getAPIKeyPath)(), JSON.stringify(existingAPIKeys), 'utf8');
    return existingAPIKeys;
};
exports.updateAPIKey = updateAPIKey;
/**
 * Delete API key
 * @param {string} keyIdToDelete
 * @returns {Promise<ICommonObject[]>}
 */
const deleteAPIKey = async (keyIdToDelete) => {
    const existingAPIKeys = await (0, exports.getAPIKeys)();
    const result = existingAPIKeys.filter((key) => key.id !== keyIdToDelete);
    await fs_1.default.promises.writeFile((0, exports.getAPIKeyPath)(), JSON.stringify(result), 'utf8');
    return result;
};
exports.deleteAPIKey = deleteAPIKey;
/**
 * Replace all api keys
 * @param {ICommonObject[]} content
 * @returns {Promise<void>}
 */
const replaceAllAPIKeys = async (content) => {
    try {
        await fs_1.default.promises.writeFile((0, exports.getAPIKeyPath)(), JSON.stringify(content), 'utf8');
    }
    catch (error) {
        logger_1.default.error(error);
    }
};
exports.replaceAllAPIKeys = replaceAllAPIKeys;
/**
 * Map MimeType to InputField
 * @param {string} mimeType
 * @returns {Promise<string>}
 */
const mapMimeTypeToInputField = (mimeType) => {
    switch (mimeType) {
        case 'text/plain':
            return 'txtFile';
        case 'application/pdf':
            return 'pdfFile';
        case 'application/json':
            return 'jsonFile';
        case 'text/csv':
            return 'csvFile';
        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
            return 'docxFile';
        default:
            return '';
    }
};
exports.mapMimeTypeToInputField = mapMimeTypeToInputField;
/**
 * Find all available inpur params config
 * @param {IReactFlowNode[]} reactFlowNodes
 * @returns {Promise<IOverrideConfig[]>}
 */
const findAvailableConfigs = (reactFlowNodes) => {
    var _a, _b;
    const configs = [];
    for (const flowNode of reactFlowNodes) {
        for (const inputParam of flowNode.data.inputParams) {
            let obj;
            if (inputParam.type === 'file') {
                obj = {
                    node: flowNode.data.label,
                    label: inputParam.label,
                    name: 'files',
                    type: (_a = inputParam.fileType) !== null && _a !== void 0 ? _a : inputParam.type
                };
            }
            else if (inputParam.type === 'options') {
                obj = {
                    node: flowNode.data.label,
                    label: inputParam.label,
                    name: inputParam.name,
                    type: inputParam.options
                        ? (_b = inputParam.options) === null || _b === void 0 ? void 0 : _b.map((option) => {
                            return option.name;
                        }).join(', ')
                        : 'string'
                };
            }
            else {
                obj = {
                    node: flowNode.data.label,
                    label: inputParam.label,
                    name: inputParam.name,
                    type: inputParam.type === 'password' ? 'string' : inputParam.type
                };
            }
            if (!configs.some((config) => JSON.stringify(config) === JSON.stringify(obj))) {
                configs.push(obj);
            }
        }
    }
    return configs;
};
exports.findAvailableConfigs = findAvailableConfigs;
/**
 * Check to see if flow valid for stream
 * @param {IReactFlowNode[]} reactFlowNodes
 * @param {INodeData} endingNodeData
 * @returns {boolean}
 */
const isFlowValidForStream = (reactFlowNodes, endingNodeData) => {
    const streamAvailableLLMs = {
        'Chat Models': ['azureChatOpenAI', 'chatOpenAI', 'chatAnthropic'],
        LLMs: ['azureOpenAI', 'openAI']
    };
    let isChatOrLLMsExist = false;
    for (const flowNode of reactFlowNodes) {
        const data = flowNode.data;
        if (data.category === 'Chat Models' || data.category === 'LLMs') {
            isChatOrLLMsExist = true;
            const validLLMs = streamAvailableLLMs[data.category];
            if (!validLLMs.includes(data.name))
                return false;
        }
    }
    let isValidChainOrAgent = false;
    if (endingNodeData.category === 'Chains') {
        // Chains that are not available to stream
        const blacklistChains = ['openApiChain'];
        isValidChainOrAgent = !blacklistChains.includes(endingNodeData.name);
    }
    else if (endingNodeData.category === 'Agents') {
        // Agent that are available to stream
        const whitelistAgents = ['openAIFunctionAgent', 'csvAgent', 'airtableAgent'];
        isValidChainOrAgent = whitelistAgents.includes(endingNodeData.name);
    }
    return isChatOrLLMsExist && isValidChainOrAgent && !(0, exports.isVectorStoreFaiss)(endingNodeData) && process.env.EXECUTION_MODE !== 'child';
};
exports.isFlowValidForStream = isFlowValidForStream;
//# sourceMappingURL=index.js.map