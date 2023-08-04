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
exports.getInstance = exports.start = exports.getChatId = exports.App = void 0;
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const cors_1 = __importDefault(require("cors"));
const http_1 = __importDefault(require("http"));
const fs = __importStar(require("fs"));
const express_basic_auth_1 = __importDefault(require("express-basic-auth"));
const socket_io_1 = require("socket.io");
const logger_1 = __importDefault(require("./utils/logger"));
const logger_2 = require("./utils/logger");
const utils_1 = require("./utils");
const lodash_1 = require("lodash");
const DataSource_1 = require("./DataSource");
const NodesPool_1 = require("./NodesPool");
const ChatFlow_1 = require("./entity/ChatFlow");
const ChatMessage_1 = require("./entity/ChatMessage");
const ChatflowPool_1 = require("./ChatflowPool");
const child_process_1 = require("child_process");
const Tool_1 = require("./entity/Tool");
class App {
    constructor() {
        this.AppDataSource = (0, DataSource_1.getDataSource)();
        this.app = (0, express_1.default)();
    }
    async initDatabase() {
        // Initialize database
        this.AppDataSource.initialize()
            .then(async () => {
            logger_1.default.info('📦 [server]: Data Source has been initialized!');
            // Initialize pools
            this.nodesPool = new NodesPool_1.NodesPool();
            await this.nodesPool.initialize();
            this.chatflowPool = new ChatflowPool_1.ChatflowPool();
            // Initialize API keys
            await (0, utils_1.getAPIKeys)();
        })
            .catch((err) => {
            logger_1.default.error('❌ [server]: Error during Data Source initialization:', err);
        });
    }
    async config(socketIO) {
        // Limit is needed to allow sending/receiving base64 encoded string
        this.app.use(express_1.default.json({ limit: '50mb' }));
        this.app.use(express_1.default.urlencoded({ limit: '50mb', extended: true }));
        // Allow access from *
        this.app.use((0, cors_1.default)());
        // Add the expressRequestLogger middleware to log all requests
        this.app.use(logger_2.expressRequestLogger);
        if (process.env.FLOWISE_USERNAME && process.env.FLOWISE_PASSWORD) {
            const username = process.env.FLOWISE_USERNAME;
            const password = process.env.FLOWISE_PASSWORD;
            const basicAuthMiddleware = (0, express_basic_auth_1.default)({
                users: { [username]: password }
            });
            const whitelistURLs = [
                '/api/v1/verify/apikey/',
                '/api/v1/chatflows/apikey/',
                '/api/v1/public-chatflows',
                '/api/v1/prediction/',
                '/api/v1/node-icon/',
                '/api/v1/chatflows-streaming'
            ];
            this.app.use((req, res, next) => {
                if (req.url.includes('/api/v1/')) {
                    whitelistURLs.some((url) => req.url.includes(url)) ? next() : basicAuthMiddleware(req, res, next);
                }
                else
                    next();
            });
        }
        const upload = (0, multer_1.default)({ dest: `${path_1.default.join(__dirname, '..', 'uploads')}/` });
        // ----------------------------------------
        // Nodes
        // ----------------------------------------
        // Get all component nodes
        this.app.get('/api/v1/nodes', (req, res) => {
            const returnData = [];
            for (const nodeName in this.nodesPool.componentNodes) {
                const clonedNode = (0, lodash_1.cloneDeep)(this.nodesPool.componentNodes[nodeName]);
                returnData.push(clonedNode);
            }
            return res.json(returnData);
        });
        // Get specific component node via name
        this.app.get('/api/v1/nodes/:name', (req, res) => {
            if (Object.prototype.hasOwnProperty.call(this.nodesPool.componentNodes, req.params.name)) {
                return res.json(this.nodesPool.componentNodes[req.params.name]);
            }
            else {
                throw new Error(`Node ${req.params.name} not found`);
            }
        });
        // Returns specific component node icon via name
        this.app.get('/api/v1/node-icon/:name', (req, res) => {
            if (Object.prototype.hasOwnProperty.call(this.nodesPool.componentNodes, req.params.name)) {
                const nodeInstance = this.nodesPool.componentNodes[req.params.name];
                if (nodeInstance.icon === undefined) {
                    throw new Error(`Node ${req.params.name} icon not found`);
                }
                if (nodeInstance.icon.endsWith('.svg') || nodeInstance.icon.endsWith('.png') || nodeInstance.icon.endsWith('.jpg')) {
                    const filepath = nodeInstance.icon;
                    res.sendFile(filepath);
                }
                else {
                    throw new Error(`Node ${req.params.name} icon is missing icon`);
                }
            }
            else {
                throw new Error(`Node ${req.params.name} not found`);
            }
        });
        // load async options
        this.app.post('/api/v1/node-load-method/:name', async (req, res) => {
            const nodeData = req.body;
            if (Object.prototype.hasOwnProperty.call(this.nodesPool.componentNodes, req.params.name)) {
                try {
                    const nodeInstance = this.nodesPool.componentNodes[req.params.name];
                    const methodName = nodeData.loadMethod || '';
                    const returnOptions = await nodeInstance.loadMethods[methodName].call(nodeInstance, nodeData, {
                        appDataSource: this.AppDataSource,
                        databaseEntities: utils_1.databaseEntities
                    });
                    return res.json(returnOptions);
                }
                catch (error) {
                    return res.json([]);
                }
            }
            else {
                res.status(404).send(`Node ${req.params.name} not found`);
                return;
            }
        });
        // ----------------------------------------
        // Chatflows
        // ----------------------------------------
        // Get all chatflows
        this.app.get('/api/v1/chatflows', async (req, res) => {
            const chatflows = await this.AppDataSource.getRepository(ChatFlow_1.ChatFlow).find();
            return res.json(chatflows);
        });
        // Get specific chatflow via api key
        this.app.get('/api/v1/chatflows/apikey/:apiKey', async (req, res) => {
            try {
                const apiKey = await (0, utils_1.getApiKey)(req.params.apiKey);
                if (!apiKey)
                    return res.status(401).send('Unauthorized');
                const chatflows = await this.AppDataSource.getRepository(ChatFlow_1.ChatFlow)
                    .createQueryBuilder('cf')
                    .where('cf.apikeyid = :apikeyid', { apikeyid: apiKey.id })
                    .orWhere('cf.apikeyid IS NULL')
                    .orWhere('cf.apikeyid = ""')
                    .orderBy('cf.name', 'ASC')
                    .getMany();
                if (chatflows.length >= 1)
                    return res.status(200).send(chatflows);
                return res.status(404).send('Chatflow not found');
            }
            catch (err) {
                return res.status(500).send(err === null || err === void 0 ? void 0 : err.message);
            }
        });
        // Get specific chatflow via id
        this.app.get('/api/v1/chatflows/:id', async (req, res) => {
            const chatflow = await this.AppDataSource.getRepository(ChatFlow_1.ChatFlow).findOneBy({
                id: req.params.id
            });
            if (chatflow)
                return res.json(chatflow);
            return res.status(404).send(`Chatflow ${req.params.id} not found`);
        });
        // Get specific chatflow via id (PUBLIC endpoint, used when sharing chatbot link)
        this.app.get('/api/v1/public-chatflows/:id', async (req, res) => {
            const chatflow = await this.AppDataSource.getRepository(ChatFlow_1.ChatFlow).findOneBy({
                id: req.params.id
            });
            if (chatflow && chatflow.isPublic)
                return res.json(chatflow);
            else if (chatflow && !chatflow.isPublic)
                return res.status(401).send(`Unauthorized`);
            return res.status(404).send(`Chatflow ${req.params.id} not found`);
        });
        // Save chatflow
        this.app.post('/api/v1/chatflows', async (req, res) => {
            const body = req.body;
            const newChatFlow = new ChatFlow_1.ChatFlow();
            Object.assign(newChatFlow, body);
            const chatflow = this.AppDataSource.getRepository(ChatFlow_1.ChatFlow).create(newChatFlow);
            const results = await this.AppDataSource.getRepository(ChatFlow_1.ChatFlow).save(chatflow);
            return res.json(results);
        });
        // Update chatflow
        this.app.put('/api/v1/chatflows/:id', async (req, res) => {
            const chatflow = await this.AppDataSource.getRepository(ChatFlow_1.ChatFlow).findOneBy({
                id: req.params.id
            });
            if (!chatflow) {
                res.status(404).send(`Chatflow ${req.params.id} not found`);
                return;
            }
            const body = req.body;
            const updateChatFlow = new ChatFlow_1.ChatFlow();
            Object.assign(updateChatFlow, body);
            this.AppDataSource.getRepository(ChatFlow_1.ChatFlow).merge(chatflow, updateChatFlow);
            const result = await this.AppDataSource.getRepository(ChatFlow_1.ChatFlow).save(chatflow);
            // Update chatflowpool inSync to false, to build Langchain again because data has been changed
            this.chatflowPool.updateInSync(chatflow.id, false);
            return res.json(result);
        });
        // Delete chatflow via id
        this.app.delete('/api/v1/chatflows/:id', async (req, res) => {
            const results = await this.AppDataSource.getRepository(ChatFlow_1.ChatFlow).delete({ id: req.params.id });
            return res.json(results);
        });
        // Check if chatflow valid for streaming
        this.app.get('/api/v1/chatflows-streaming/:id', async (req, res) => {
            var _a;
            const chatflow = await this.AppDataSource.getRepository(ChatFlow_1.ChatFlow).findOneBy({
                id: req.params.id
            });
            if (!chatflow)
                return res.status(404).send(`Chatflow ${req.params.id} not found`);
            /*** Get Ending Node with Directed Graph  ***/
            const flowData = chatflow.flowData;
            const parsedFlowData = JSON.parse(flowData);
            const nodes = parsedFlowData.nodes;
            const edges = parsedFlowData.edges;
            const { graph, nodeDependencies } = (0, utils_1.constructGraphs)(nodes, edges);
            const endingNodeId = (0, utils_1.getEndingNode)(nodeDependencies, graph);
            if (!endingNodeId)
                return res.status(500).send(`Ending node ${endingNodeId} not found`);
            const endingNodeData = (_a = nodes.find((nd) => nd.id === endingNodeId)) === null || _a === void 0 ? void 0 : _a.data;
            if (!endingNodeData)
                return res.status(500).send(`Ending node ${endingNodeId} data not found`);
            if (endingNodeData && endingNodeData.category !== 'Chains' && endingNodeData.category !== 'Agents') {
                return res.status(500).send(`Ending node must be either a Chain or Agent`);
            }
            const obj = {
                isStreaming: (0, utils_1.isFlowValidForStream)(nodes, endingNodeData)
            };
            return res.json(obj);
        });
        // ----------------------------------------
        // ChatMessage
        // ----------------------------------------
        // Get all chatmessages from chatflowid
        this.app.get('/api/v1/chatmessage/:id', async (req, res) => {
            const chatmessages = await this.AppDataSource.getRepository(ChatMessage_1.ChatMessage).find({
                where: {
                    chatflowid: req.params.id
                },
                order: {
                    createdDate: 'ASC'
                }
            });
            return res.json(chatmessages);
        });
        // Add chatmessages for chatflowid
        this.app.post('/api/v1/chatmessage/:id', async (req, res) => {
            const body = req.body;
            const newChatMessage = new ChatMessage_1.ChatMessage();
            Object.assign(newChatMessage, body);
            const chatmessage = this.AppDataSource.getRepository(ChatMessage_1.ChatMessage).create(newChatMessage);
            const results = await this.AppDataSource.getRepository(ChatMessage_1.ChatMessage).save(chatmessage);
            return res.json(results);
        });
        // Delete all chatmessages from chatflowid
        this.app.delete('/api/v1/chatmessage/:id', async (req, res) => {
            const chatflow = await this.AppDataSource.getRepository(ChatFlow_1.ChatFlow).findOneBy({
                id: req.params.id
            });
            if (!chatflow) {
                res.status(404).send(`Chatflow ${req.params.id} not found`);
                return;
            }
            const flowData = chatflow.flowData;
            const parsedFlowData = JSON.parse(flowData);
            const nodes = parsedFlowData.nodes;
            let chatId = await getChatId(chatflow.id);
            if (!chatId)
                chatId = chatflow.id;
            (0, utils_1.clearSessionMemory)(nodes, this.nodesPool.componentNodes, chatId, req.query.sessionId);
            const results = await this.AppDataSource.getRepository(ChatMessage_1.ChatMessage).delete({ chatflowid: req.params.id });
            return res.json(results);
        });
        // ----------------------------------------
        // Tools
        // ----------------------------------------
        // Get all tools
        this.app.get('/api/v1/tools', async (req, res) => {
            const tools = await this.AppDataSource.getRepository(Tool_1.Tool).find();
            return res.json(tools);
        });
        // Get specific tool
        this.app.get('/api/v1/tools/:id', async (req, res) => {
            const tool = await this.AppDataSource.getRepository(Tool_1.Tool).findOneBy({
                id: req.params.id
            });
            return res.json(tool);
        });
        // Add tool
        this.app.post('/api/v1/tools', async (req, res) => {
            const body = req.body;
            const newTool = new Tool_1.Tool();
            Object.assign(newTool, body);
            const tool = this.AppDataSource.getRepository(Tool_1.Tool).create(newTool);
            const results = await this.AppDataSource.getRepository(Tool_1.Tool).save(tool);
            return res.json(results);
        });
        // Update tool
        this.app.put('/api/v1/tools/:id', async (req, res) => {
            const tool = await this.AppDataSource.getRepository(Tool_1.Tool).findOneBy({
                id: req.params.id
            });
            if (!tool) {
                res.status(404).send(`Tool ${req.params.id} not found`);
                return;
            }
            const body = req.body;
            const updateTool = new Tool_1.Tool();
            Object.assign(updateTool, body);
            this.AppDataSource.getRepository(Tool_1.Tool).merge(tool, updateTool);
            const result = await this.AppDataSource.getRepository(Tool_1.Tool).save(tool);
            return res.json(result);
        });
        // Delete tool
        this.app.delete('/api/v1/tools/:id', async (req, res) => {
            const results = await this.AppDataSource.getRepository(Tool_1.Tool).delete({ id: req.params.id });
            return res.json(results);
        });
        // ----------------------------------------
        // Configuration
        // ----------------------------------------
        this.app.get('/api/v1/flow-config/:id', async (req, res) => {
            const chatflow = await this.AppDataSource.getRepository(ChatFlow_1.ChatFlow).findOneBy({
                id: req.params.id
            });
            if (!chatflow)
                return res.status(404).send(`Chatflow ${req.params.id} not found`);
            const flowData = chatflow.flowData;
            const parsedFlowData = JSON.parse(flowData);
            const nodes = parsedFlowData.nodes;
            const availableConfigs = (0, utils_1.findAvailableConfigs)(nodes);
            return res.json(availableConfigs);
        });
        // ----------------------------------------
        // Export Load Chatflow & ChatMessage & Apikeys
        // ----------------------------------------
        this.app.get('/api/v1/database/export', async (req, res) => {
            const chatmessages = await this.AppDataSource.getRepository(ChatMessage_1.ChatMessage).find();
            const chatflows = await this.AppDataSource.getRepository(ChatFlow_1.ChatFlow).find();
            const apikeys = await (0, utils_1.getAPIKeys)();
            const result = {
                chatmessages,
                chatflows,
                apikeys
            };
            return res.json(result);
        });
        this.app.post('/api/v1/database/load', async (req, res) => {
            var _a;
            const databaseItems = req.body;
            await this.AppDataSource.getRepository(ChatFlow_1.ChatFlow).delete({});
            await this.AppDataSource.getRepository(ChatMessage_1.ChatMessage).delete({});
            let error = '';
            // Get a new query runner instance
            const queryRunner = this.AppDataSource.createQueryRunner();
            // Start a new transaction
            await queryRunner.startTransaction();
            try {
                const chatflows = databaseItems.chatflows;
                const chatmessages = databaseItems.chatmessages;
                await queryRunner.manager.insert(ChatFlow_1.ChatFlow, chatflows);
                await queryRunner.manager.insert(ChatMessage_1.ChatMessage, chatmessages);
                await queryRunner.commitTransaction();
            }
            catch (err) {
                error = (_a = err === null || err === void 0 ? void 0 : err.message) !== null && _a !== void 0 ? _a : 'Error loading database';
                await queryRunner.rollbackTransaction();
            }
            finally {
                await queryRunner.release();
            }
            await (0, utils_1.replaceAllAPIKeys)(databaseItems.apikeys);
            if (error)
                return res.status(500).send(error);
            return res.status(201).send('OK');
        });
        // ----------------------------------------
        // Prediction
        // ----------------------------------------
        // Send input message and get prediction result (External)
        this.app.post('/api/v1/prediction/:id', upload.array('files'), async (req, res) => {
            await this.processPrediction(req, res, socketIO);
        });
        // Send input message and get prediction result (Internal)
        this.app.post('/api/v1/internal-prediction/:id', async (req, res) => {
            await this.processPrediction(req, res, socketIO, true);
        });
        // ----------------------------------------
        // Marketplaces
        // ----------------------------------------
        // Get all chatflows for marketplaces
        this.app.get('/api/v1/marketplaces/chatflows', async (req, res) => {
            const marketplaceDir = path_1.default.join(__dirname, '..', 'marketplaces', 'chatflows');
            const jsonsInDir = fs.readdirSync(marketplaceDir).filter((file) => path_1.default.extname(file) === '.json');
            const templates = [];
            jsonsInDir.forEach((file, index) => {
                const filePath = path_1.default.join(__dirname, '..', 'marketplaces', 'chatflows', file);
                const fileData = fs.readFileSync(filePath);
                const fileDataObj = JSON.parse(fileData.toString());
                const template = {
                    id: index,
                    name: file.split('.json')[0],
                    flowData: fileData.toString(),
                    description: (fileDataObj === null || fileDataObj === void 0 ? void 0 : fileDataObj.description) || ''
                };
                templates.push(template);
            });
            return res.json(templates);
        });
        // Get all tools for marketplaces
        this.app.get('/api/v1/marketplaces/tools', async (req, res) => {
            const marketplaceDir = path_1.default.join(__dirname, '..', 'marketplaces', 'tools');
            const jsonsInDir = fs.readdirSync(marketplaceDir).filter((file) => path_1.default.extname(file) === '.json');
            const templates = [];
            jsonsInDir.forEach((file, index) => {
                const filePath = path_1.default.join(__dirname, '..', 'marketplaces', 'tools', file);
                const fileData = fs.readFileSync(filePath);
                const fileDataObj = JSON.parse(fileData.toString());
                const template = Object.assign(Object.assign({}, fileDataObj), { id: index, templateName: file.split('.json')[0] });
                templates.push(template);
            });
            return res.json(templates);
        });
        // ----------------------------------------
        // API Keys
        // ----------------------------------------
        // Get api keys
        this.app.get('/api/v1/apikey', async (req, res) => {
            const keys = await (0, utils_1.getAPIKeys)();
            return res.json(keys);
        });
        // Add new api key
        this.app.post('/api/v1/apikey', async (req, res) => {
            const keys = await (0, utils_1.addAPIKey)(req.body.keyName);
            return res.json(keys);
        });
        // Update api key
        this.app.put('/api/v1/apikey/:id', async (req, res) => {
            const keys = await (0, utils_1.updateAPIKey)(req.params.id, req.body.keyName);
            return res.json(keys);
        });
        // Delete new api key
        this.app.delete('/api/v1/apikey/:id', async (req, res) => {
            const keys = await (0, utils_1.deleteAPIKey)(req.params.id);
            return res.json(keys);
        });
        // Verify api key
        this.app.get('/api/v1/verify/apikey/:apiKey', async (req, res) => {
            try {
                const apiKey = await (0, utils_1.getApiKey)(req.params.apiKey);
                if (!apiKey)
                    return res.status(401).send('Unauthorized');
                return res.status(200).send('OK');
            }
            catch (err) {
                return res.status(500).send(err === null || err === void 0 ? void 0 : err.message);
            }
        });
        // ----------------------------------------
        // Serve UI static
        // ----------------------------------------
        const packagePath = (0, utils_1.getNodeModulesPackagePath)('flowise-ui');
        const uiBuildPath = path_1.default.join(packagePath, 'build');
        const uiHtmlPath = path_1.default.join(packagePath, 'build', 'index.html');
        this.app.use('/', express_1.default.static(uiBuildPath));
        // All other requests not handled will return React app
        this.app.use((req, res) => {
            res.sendFile(uiHtmlPath);
        });
    }
    /**
     * Validate API Key
     * @param {Request} req
     * @param {Response} res
     * @param {ChatFlow} chatflow
     */
    async validateKey(req, res, chatflow) {
        var _a, _b, _c;
        const chatFlowApiKeyId = chatflow.apikeyid;
        const authorizationHeader = (_b = (_a = req.headers['Authorization']) !== null && _a !== void 0 ? _a : req.headers['authorization']) !== null && _b !== void 0 ? _b : '';
        if (chatFlowApiKeyId && !authorizationHeader)
            return res.status(401).send(`Unauthorized`);
        const suppliedKey = authorizationHeader.split(`Bearer `).pop();
        if (chatFlowApiKeyId && suppliedKey) {
            const keys = await (0, utils_1.getAPIKeys)();
            const apiSecret = (_c = keys.find((key) => key.id === chatFlowApiKeyId)) === null || _c === void 0 ? void 0 : _c.apiSecret;
            if (!(0, utils_1.compareKeys)(apiSecret, suppliedKey))
                return res.status(401).send(`Unauthorized`);
        }
    }
    /**
     * Start child process
     * @param {ChatFlow} chatflow
     * @param {IncomingInput} incomingInput
     * @param {INodeData} endingNodeData
     */
    async startChildProcess(chatflow, chatId, incomingInput, endingNodeData) {
        try {
            const controller = new AbortController();
            const { signal } = controller;
            let childpath = path_1.default.join(__dirname, '..', 'dist', 'ChildProcess.js');
            if (!fs.existsSync(childpath))
                childpath = 'ChildProcess.ts';
            const childProcess = (0, child_process_1.fork)(childpath, [], { signal });
            const value = {
                chatflow,
                chatId,
                incomingInput,
                componentNodes: (0, lodash_1.cloneDeep)(this.nodesPool.componentNodes),
                endingNodeData
            };
            childProcess.send({ key: 'start', value });
            let childProcessTimeout;
            return new Promise((resolve, reject) => {
                childProcess.on('message', async (message) => {
                    if (message.key === 'finish') {
                        const { result, addToChatFlowPool } = message.value;
                        if (childProcessTimeout) {
                            clearTimeout(childProcessTimeout);
                        }
                        if (Object.keys(addToChatFlowPool).length) {
                            const { chatflowid, nodeToExecuteData, startingNodes, overrideConfig } = addToChatFlowPool;
                            this.chatflowPool.add(chatflowid, nodeToExecuteData, startingNodes, overrideConfig);
                        }
                        resolve(result);
                    }
                    if (message.key === 'start') {
                        if (process.env.EXECUTION_TIMEOUT) {
                            childProcessTimeout = setTimeout(async () => {
                                childProcess.kill();
                                resolve(undefined);
                            }, parseInt(process.env.EXECUTION_TIMEOUT, 10));
                        }
                    }
                    if (message.key === 'error') {
                        let errMessage = message.value;
                        if (childProcessTimeout) {
                            clearTimeout(childProcessTimeout);
                        }
                        reject(errMessage);
                    }
                });
            });
        }
        catch (err) {
            logger_1.default.error('[server] [mode:child]: Error:', err);
        }
    }
    /**
     * Process Prediction
     * @param {Request} req
     * @param {Response} res
     * @param {Server} socketIO
     * @param {boolean} isInternal
     */
    async processPrediction(req, res, socketIO, isInternal = false) {
        var _a;
        var _b, _c;
        try {
            const chatflowid = req.params.id;
            let incomingInput = req.body;
            let nodeToExecuteData;
            const chatflow = await this.AppDataSource.getRepository(ChatFlow_1.ChatFlow).findOneBy({
                id: chatflowid
            });
            if (!chatflow)
                return res.status(404).send(`Chatflow ${chatflowid} not found`);
            let chatId = await getChatId(chatflow.id);
            if (!chatId)
                chatId = chatflowid;
            if (!isInternal) {
                await this.validateKey(req, res, chatflow);
            }
            let isStreamValid = false;
            const files = req.files || [];
            if (files.length) {
                const overrideConfig = Object.assign({}, req.body);
                for (const file of files) {
                    const fileData = fs.readFileSync(file.path, { encoding: 'base64' });
                    const dataBase64String = `data:${file.mimetype};base64,${fileData},filename:${file.filename}`;
                    const fileInputField = (0, utils_1.mapMimeTypeToInputField)(file.mimetype);
                    if (overrideConfig[fileInputField]) {
                        overrideConfig[fileInputField] = JSON.stringify([...JSON.parse(overrideConfig[fileInputField]), dataBase64String]);
                    }
                    else {
                        overrideConfig[fileInputField] = JSON.stringify([dataBase64String]);
                    }
                }
                incomingInput = {
                    question: (_b = req.body.question) !== null && _b !== void 0 ? _b : 'hello',
                    overrideConfig,
                    history: []
                };
            }
            /*   Reuse the flow without having to rebuild (to avoid duplicated upsert, recomputation) when all these conditions met:
             * - Node Data already exists in pool
             * - Still in sync (i.e the flow has not been modified since)
             * - Existing overrideConfig and new overrideConfig are the same
             * - Flow doesn't start with nodes that depend on incomingInput.question
             ***/
            const isFlowReusable = () => {
                return (Object.prototype.hasOwnProperty.call(this.chatflowPool.activeChatflows, chatflowid) &&
                    this.chatflowPool.activeChatflows[chatflowid].inSync &&
                    (0, utils_1.isSameOverrideConfig)(isInternal, this.chatflowPool.activeChatflows[chatflowid].overrideConfig, incomingInput.overrideConfig) &&
                    !(0, utils_1.isStartNodeDependOnInput)(this.chatflowPool.activeChatflows[chatflowid].startingNodes));
            };
            if (process.env.EXECUTION_MODE === 'child') {
                if (isFlowReusable()) {
                    nodeToExecuteData = this.chatflowPool.activeChatflows[chatflowid].endingNodeData;
                    logger_1.default.debug(`[server] [mode:child]: Reuse existing chatflow ${chatflowid} with ending node ${nodeToExecuteData.label} (${nodeToExecuteData.id})`);
                    try {
                        const result = await this.startChildProcess(chatflow, chatId, incomingInput, nodeToExecuteData);
                        return res.json(result);
                    }
                    catch (error) {
                        return res.status(500).send(error);
                    }
                }
                else {
                    try {
                        const result = await this.startChildProcess(chatflow, chatId, incomingInput);
                        return res.json(result);
                    }
                    catch (error) {
                        return res.status(500).send(error);
                    }
                }
            }
            else {
                /*** Get chatflows and prepare data  ***/
                const flowData = chatflow.flowData;
                const parsedFlowData = JSON.parse(flowData);
                const nodes = parsedFlowData.nodes;
                const edges = parsedFlowData.edges;
                if (isFlowReusable()) {
                    nodeToExecuteData = this.chatflowPool.activeChatflows[chatflowid].endingNodeData;
                    isStreamValid = (0, utils_1.isFlowValidForStream)(nodes, nodeToExecuteData);
                    logger_1.default.debug(`[server]: Reuse existing chatflow ${chatflowid} with ending node ${nodeToExecuteData.label} (${nodeToExecuteData.id})`);
                }
                else {
                    /*** Get Ending Node with Directed Graph  ***/
                    const { graph, nodeDependencies } = (0, utils_1.constructGraphs)(nodes, edges);
                    const directedGraph = graph;
                    const endingNodeId = (0, utils_1.getEndingNode)(nodeDependencies, directedGraph);
                    if (!endingNodeId)
                        return res.status(500).send(`Ending node ${endingNodeId} not found`);
                    const endingNodeData = (_c = nodes.find((nd) => nd.id === endingNodeId)) === null || _c === void 0 ? void 0 : _c.data;
                    if (!endingNodeData)
                        return res.status(500).send(`Ending node ${endingNodeId} data not found`);
                    if (endingNodeData && endingNodeData.category !== 'Chains' && endingNodeData.category !== 'Agents') {
                        return res.status(500).send(`Ending node must be either a Chain or Agent`);
                    }
                    if (endingNodeData.outputs &&
                        Object.keys(endingNodeData.outputs).length &&
                        !Object.values(endingNodeData.outputs).includes(endingNodeData.name)) {
                        return res
                            .status(500)
                            .send(`Output of ${endingNodeData.label} (${endingNodeData.id}) must be ${endingNodeData.label}, can't be an Output Prediction`);
                    }
                    isStreamValid = (0, utils_1.isFlowValidForStream)(nodes, endingNodeData);
                    /*** Get Starting Nodes with Non-Directed Graph ***/
                    const constructedObj = (0, utils_1.constructGraphs)(nodes, edges, true);
                    const nonDirectedGraph = constructedObj.graph;
                    const { startingNodeIds, depthQueue } = (0, utils_1.getStartingNodes)(nonDirectedGraph, endingNodeId);
                    logger_1.default.debug(`[server]: Start building chatflow ${chatflowid}`);
                    /*** BFS to traverse from Starting Nodes to Ending Node ***/
                    const reactFlowNodes = await (0, utils_1.buildLangchain)(startingNodeIds, nodes, graph, depthQueue, this.nodesPool.componentNodes, incomingInput.question, chatId, this.AppDataSource, incomingInput === null || incomingInput === void 0 ? void 0 : incomingInput.overrideConfig);
                    const nodeToExecute = reactFlowNodes.find((node) => node.id === endingNodeId);
                    if (!nodeToExecute)
                        return res.status(404).send(`Node ${endingNodeId} not found`);
                    if (incomingInput.overrideConfig)
                        nodeToExecute.data = (0, utils_1.replaceInputsWithConfig)(nodeToExecute.data, incomingInput.overrideConfig);
                    const reactFlowNodeData = (0, utils_1.resolveVariables)(nodeToExecute.data, reactFlowNodes, incomingInput.question);
                    nodeToExecuteData = reactFlowNodeData;
                    const startingNodes = nodes.filter((nd) => startingNodeIds.includes(nd.id));
                    this.chatflowPool.add(chatflowid, nodeToExecuteData, startingNodes, incomingInput === null || incomingInput === void 0 ? void 0 : incomingInput.overrideConfig);
                }
                const nodeInstanceFilePath = this.nodesPool.componentNodes[nodeToExecuteData.name].filePath;
                const nodeModule = await (_a = nodeInstanceFilePath, Promise.resolve().then(() => __importStar(require(_a))));
                const nodeInstance = new nodeModule.nodeClass();
                isStreamValid = isStreamValid && !(0, utils_1.isVectorStoreFaiss)(nodeToExecuteData);
                logger_1.default.debug(`[server]: Running ${nodeToExecuteData.label} (${nodeToExecuteData.id})`);
                const result = isStreamValid
                    ? await nodeInstance.run(nodeToExecuteData, incomingInput.question, {
                        chatHistory: incomingInput.history,
                        socketIO,
                        socketIOClientId: incomingInput.socketIOClientId,
                        logger: logger_1.default
                    })
                    : await nodeInstance.run(nodeToExecuteData, incomingInput.question, { chatHistory: incomingInput.history, logger: logger_1.default });
                logger_1.default.debug(`[server]: Finished running ${nodeToExecuteData.label} (${nodeToExecuteData.id})`);
                return res.json(result);
            }
        }
        catch (e) {
            logger_1.default.error('[server]: Error:', e);
            return res.status(500).send(e.message);
        }
    }
    async stopApp() {
        try {
            const removePromises = [];
            await Promise.all(removePromises);
        }
        catch (e) {
            logger_1.default.error(`❌[server]: Flowise Server shut down error: ${e}`);
        }
    }
}
exports.App = App;
/**
 * Get first chat message id
 * @param {string} chatflowid
 * @returns {string}
 */
async function getChatId(chatflowid) {
    // first chatmessage id as the unique chat id
    const firstChatMessage = await (0, DataSource_1.getDataSource)()
        .getRepository(ChatMessage_1.ChatMessage)
        .createQueryBuilder('cm')
        .select('cm.id')
        .where('chatflowid = :chatflowid', { chatflowid })
        .orderBy('cm.createdDate', 'ASC')
        .getOne();
    return firstChatMessage ? firstChatMessage.id : '';
}
exports.getChatId = getChatId;
let serverApp;
async function start() {
    serverApp = new App();
    const port = parseInt(process.env.PORT || '', 10) || 3010;
    const server = http_1.default.createServer(serverApp.app);
    const io = new socket_io_1.Server(server, {
        cors: {
            origin: '*'
        }
    });
    await serverApp.initDatabase();
    await serverApp.config(io);
    server.listen(port, () => {
        logger_1.default.info(`⚡️ [server]: Flowise Server is listening at ${port}`);
    });
}
exports.start = start;
function getInstance() {
    return serverApp;
}
exports.getInstance = getInstance;
//# sourceMappingURL=index.js.map