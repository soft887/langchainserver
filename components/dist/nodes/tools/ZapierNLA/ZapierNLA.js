"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tools_1 = require("langchain/tools");
const agents_1 = require("langchain/agents");
class ZapierNLA_Tools {
    constructor() {
        this.label = 'Zapier NLA';
        this.name = 'zapierNLA';
        this.type = 'ZapierNLA';
        this.icon = 'zapier.png';
        this.category = 'Tools';
        this.description = "Access to apps and actions on Zapier's platform through a natural language API interface";
        this.inputs = [
            {
                label: 'Zapier NLA Api Key',
                name: 'apiKey',
                type: 'password'
            }
        ];
        this.baseClasses = [this.type, 'Tool'];
    }
    async init(nodeData) {
        const apiKey = nodeData.inputs?.apiKey;
        const obj = {
            apiKey
        };
        const zapier = new tools_1.ZapierNLAWrapper(obj);
        const toolkit = await agents_1.ZapierToolKit.fromZapierNLAWrapper(zapier);
        return toolkit.tools;
    }
}
module.exports = { nodeClass: ZapierNLA_Tools };
//# sourceMappingURL=ZapierNLA.js.map