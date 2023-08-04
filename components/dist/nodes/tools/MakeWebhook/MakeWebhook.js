"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../../../src/utils");
const core_1 = require("./core");
class MakeWebhook_Tools {
    constructor() {
        this.label = 'Make.com Webhook';
        this.name = 'makeWebhook';
        this.type = 'MakeWebhook';
        this.icon = 'make.png';
        this.category = 'Tools';
        this.description = 'Execute webhook calls on Make.com';
        this.inputs = [
            {
                label: 'Webhook Url',
                name: 'url',
                type: 'string',
                placeholder: 'https://hook.eu1.make.com/abcdefg'
            },
            {
                label: 'Tool Description',
                name: 'desc',
                type: 'string',
                rows: 4,
                placeholder: 'Useful when need to send message to Discord'
            }
        ];
        this.baseClasses = [this.type, ...(0, utils_1.getBaseClasses)(core_1.MakeWebhookTool)];
    }
    async init(nodeData) {
        const url = nodeData.inputs?.url;
        const desc = nodeData.inputs?.desc;
        return new core_1.MakeWebhookTool(url, desc, 'GET');
    }
}
module.exports = { nodeClass: MakeWebhook_Tools };
//# sourceMappingURL=MakeWebhook.js.map