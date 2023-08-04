"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../../../src/utils");
const tools_1 = require("langchain/tools");
class SerpAPI_Tools {
    constructor() {
        this.label = 'Serp API';
        this.name = 'serpAPI';
        this.type = 'SerpAPI';
        this.icon = 'serp.png';
        this.category = 'Tools';
        this.description = 'Wrapper around SerpAPI - a real-time API to access Google search results';
        this.inputs = [
            {
                label: 'Serp Api Key',
                name: 'apiKey',
                type: 'password'
            }
        ];
        this.baseClasses = [this.type, ...(0, utils_1.getBaseClasses)(tools_1.SerpAPI)];
    }
    async init(nodeData) {
        const apiKey = nodeData.inputs?.apiKey;
        return new tools_1.SerpAPI(apiKey);
    }
}
module.exports = { nodeClass: SerpAPI_Tools };
//# sourceMappingURL=SerpAPI.js.map