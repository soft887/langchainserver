"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../../../src/utils");
const tools_1 = require("langchain/tools");
class Serper_Tools {
    constructor() {
        this.label = 'Serper';
        this.name = 'serper';
        this.type = 'Serper';
        this.icon = 'serper.png';
        this.category = 'Tools';
        this.description = 'Wrapper around Serper.dev - Google Search API';
        this.inputs = [
            {
                label: 'Serper Api Key',
                name: 'apiKey',
                type: 'password'
            }
        ];
        this.baseClasses = [this.type, ...(0, utils_1.getBaseClasses)(tools_1.Serper)];
    }
    async init(nodeData) {
        const apiKey = nodeData.inputs?.apiKey;
        return new tools_1.Serper(apiKey);
    }
}
module.exports = { nodeClass: Serper_Tools };
//# sourceMappingURL=Serper.js.map