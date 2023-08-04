import { BaseTracer, Run, BaseCallbackHandler } from 'langchain/callbacks';
import { ChainValues } from 'langchain/schema';
import { Logger } from 'winston';
import { Server } from 'socket.io';
export declare class ConsoleCallbackHandler extends BaseTracer {
    name: "console_callback_handler";
    logger: Logger;
    protected persistRun(_run: Run): Promise<void>;
    constructor(logger: Logger);
    getParents(run: Run): Run[];
    getBreadcrumbs(run: Run): string;
    onChainStart(run: Run): void;
    onChainEnd(run: Run): void;
    onChainError(run: Run): void;
    onLLMStart(run: Run): void;
    onLLMEnd(run: Run): void;
    onLLMError(run: Run): void;
    onToolStart(run: Run): void;
    onToolEnd(run: Run): void;
    onToolError(run: Run): void;
    onAgentAction(run: Run): void;
}
/**
 * Custom chain handler class
 */
export declare class CustomChainHandler extends BaseCallbackHandler {
    name: string;
    isLLMStarted: boolean;
    socketIO: Server;
    socketIOClientId: string;
    skipK: number;
    returnSourceDocuments: boolean;
    constructor(socketIO: Server, socketIOClientId: string, skipK?: number, returnSourceDocuments?: boolean);
    handleLLMStart(): void;
    handleLLMNewToken(token: string): void;
    handleLLMEnd(): void;
    handleChainEnd(outputs: ChainValues): void | Promise<void>;
}
