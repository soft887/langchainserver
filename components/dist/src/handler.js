"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomChainHandler = exports.ConsoleCallbackHandler = void 0;
const callbacks_1 = require("langchain/callbacks");
function tryJsonStringify(obj, fallback) {
    try {
        return JSON.stringify(obj, null, 2);
    }
    catch (err) {
        return fallback;
    }
}
function elapsed(run) {
    if (!run.end_time)
        return '';
    const elapsed = run.end_time - run.start_time;
    if (elapsed < 1000) {
        return `${elapsed}ms`;
    }
    return `${(elapsed / 1000).toFixed(2)}s`;
}
class ConsoleCallbackHandler extends callbacks_1.BaseTracer {
    persistRun(_run) {
        return Promise.resolve();
    }
    constructor(logger) {
        super();
        this.name = 'console_callback_handler';
        this.logger = logger;
    }
    // utility methods
    getParents(run) {
        const parents = [];
        let currentRun = run;
        while (currentRun.parent_run_id) {
            const parent = this.runMap.get(currentRun.parent_run_id);
            if (parent) {
                parents.push(parent);
                currentRun = parent;
            }
            else {
                break;
            }
        }
        return parents;
    }
    getBreadcrumbs(run) {
        const parents = this.getParents(run).reverse();
        const string = [...parents, run]
            .map((parent) => {
            const name = `${parent.execution_order}:${parent.run_type}:${parent.name}`;
            return name;
        })
            .join(' > ');
        return string;
    }
    // logging methods
    onChainStart(run) {
        const crumbs = this.getBreadcrumbs(run);
        this.logger.verbose(`[chain/start] [${crumbs}] Entering Chain run with input: ${tryJsonStringify(run.inputs, '[inputs]')}`);
    }
    onChainEnd(run) {
        const crumbs = this.getBreadcrumbs(run);
        this.logger.verbose(`[chain/end] [${crumbs}] [${elapsed(run)}] Exiting Chain run with output: ${tryJsonStringify(run.outputs, '[outputs]')}`);
    }
    onChainError(run) {
        const crumbs = this.getBreadcrumbs(run);
        this.logger.verbose(`[chain/error] [${crumbs}] [${elapsed(run)}] Chain run errored with error: ${tryJsonStringify(run.error, '[error]')}`);
    }
    onLLMStart(run) {
        const crumbs = this.getBreadcrumbs(run);
        const inputs = 'prompts' in run.inputs ? { prompts: run.inputs.prompts.map((p) => p.trim()) } : run.inputs;
        this.logger.verbose(`[llm/start] [${crumbs}] Entering LLM run with input: ${tryJsonStringify(inputs, '[inputs]')}`);
    }
    onLLMEnd(run) {
        const crumbs = this.getBreadcrumbs(run);
        this.logger.verbose(`[llm/end] [${crumbs}] [${elapsed(run)}] Exiting LLM run with output: ${tryJsonStringify(run.outputs, '[response]')}`);
    }
    onLLMError(run) {
        const crumbs = this.getBreadcrumbs(run);
        this.logger.verbose(`[llm/error] [${crumbs}] [${elapsed(run)}] LLM run errored with error: ${tryJsonStringify(run.error, '[error]')}`);
    }
    onToolStart(run) {
        const crumbs = this.getBreadcrumbs(run);
        this.logger.verbose(`[tool/start] [${crumbs}] Entering Tool run with input: "${run.inputs.input?.trim()}"`);
    }
    onToolEnd(run) {
        const crumbs = this.getBreadcrumbs(run);
        this.logger.verbose(`[tool/end] [${crumbs}] [${elapsed(run)}] Exiting Tool run with output: "${run.outputs?.output?.trim()}"`);
    }
    onToolError(run) {
        const crumbs = this.getBreadcrumbs(run);
        this.logger.verbose(`[tool/error] [${crumbs}] [${elapsed(run)}] Tool run errored with error: ${tryJsonStringify(run.error, '[error]')}`);
    }
    onAgentAction(run) {
        const agentRun = run;
        const crumbs = this.getBreadcrumbs(run);
        this.logger.verbose(`[agent/action] [${crumbs}] Agent selected action: ${tryJsonStringify(agentRun.actions[agentRun.actions.length - 1], '[action]')}`);
    }
}
exports.ConsoleCallbackHandler = ConsoleCallbackHandler;
/**
 * Custom chain handler class
 */
class CustomChainHandler extends callbacks_1.BaseCallbackHandler {
    constructor(socketIO, socketIOClientId, skipK, returnSourceDocuments) {
        super();
        this.name = 'custom_chain_handler';
        this.isLLMStarted = false;
        this.socketIOClientId = '';
        this.skipK = 0; // Skip streaming for first K numbers of handleLLMStart
        this.returnSourceDocuments = false;
        this.socketIO = socketIO;
        this.socketIOClientId = socketIOClientId;
        this.skipK = skipK ?? this.skipK;
        this.returnSourceDocuments = returnSourceDocuments ?? this.returnSourceDocuments;
    }
    handleLLMStart() {
        if (this.skipK > 0)
            this.skipK -= 1;
    }
    handleLLMNewToken(token) {
        if (this.skipK === 0) {
            if (!this.isLLMStarted) {
                this.isLLMStarted = true;
                this.socketIO.to(this.socketIOClientId).emit('start', token);
            }
            this.socketIO.to(this.socketIOClientId).emit('token', token);
        }
    }
    handleLLMEnd() {
        this.socketIO.to(this.socketIOClientId).emit('end');
    }
    handleChainEnd(outputs) {
        if (this.returnSourceDocuments) {
            this.socketIO.to(this.socketIOClientId).emit('sourceDocuments', outputs?.sourceDocuments);
        }
    }
}
exports.CustomChainHandler = CustomChainHandler;
//# sourceMappingURL=handler.js.map