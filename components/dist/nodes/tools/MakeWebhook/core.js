"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MakeWebhookTool = void 0;
const axios_1 = __importDefault(require("axios"));
const tools_1 = require("langchain/tools");
class MakeWebhookTool extends tools_1.Tool {
    constructor(url, description, method = 'POST', headers = {}) {
        super();
        this.url = url;
        this.name = 'make_webhook';
        this.description = description ?? `useful for when you need to execute tasks on Make`;
        this.method = method;
        this.headers = headers;
    }
    async _call() {
        try {
            const axiosConfig = {
                method: this.method,
                url: this.url,
                headers: {
                    ...this.headers,
                    'Content-Type': 'application/json'
                }
            };
            const response = await (0, axios_1.default)(axiosConfig);
            return typeof response.data === 'object' ? JSON.stringify(response.data) : response.data;
        }
        catch (error) {
            throw new Error(`HTTP error ${error}`);
        }
    }
}
exports.MakeWebhookTool = MakeWebhookTool;
//# sourceMappingURL=core.js.map