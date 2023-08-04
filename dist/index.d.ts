import express, { Request, Response } from 'express';
import { Server } from 'socket.io';
import { IncomingInput, INodeData } from './Interface';
import { NodesPool } from './NodesPool';
import { ChatFlow } from './entity/ChatFlow';
import { ChatflowPool } from './ChatflowPool';
export declare class App {
    app: express.Application;
    nodesPool: NodesPool;
    chatflowPool: ChatflowPool;
    AppDataSource: import("typeorm").DataSource;
    constructor();
    initDatabase(): Promise<void>;
    config(socketIO?: Server): Promise<void>;
    /**
     * Validate API Key
     * @param {Request} req
     * @param {Response} res
     * @param {ChatFlow} chatflow
     */
    validateKey(req: Request, res: Response, chatflow: ChatFlow): Promise<express.Response<any, Record<string, any>> | undefined>;
    /**
     * Start child process
     * @param {ChatFlow} chatflow
     * @param {IncomingInput} incomingInput
     * @param {INodeData} endingNodeData
     */
    startChildProcess(chatflow: ChatFlow, chatId: string, incomingInput: IncomingInput, endingNodeData?: INodeData): Promise<unknown>;
    /**
     * Process Prediction
     * @param {Request} req
     * @param {Response} res
     * @param {Server} socketIO
     * @param {boolean} isInternal
     */
    processPrediction(req: Request, res: Response, socketIO?: Server, isInternal?: boolean): Promise<express.Response<any, Record<string, any>>>;
    stopApp(): Promise<void>;
}
/**
 * Get first chat message id
 * @param {string} chatflowid
 * @returns {string}
 */
export declare function getChatId(chatflowid: string): Promise<string>;
export declare function start(): Promise<void>;
export declare function getInstance(): App | undefined;
