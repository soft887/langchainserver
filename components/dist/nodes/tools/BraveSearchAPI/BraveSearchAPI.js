"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../../../src/utils");
const tools_1 = require("langchain/tools");
class BraveSearchAPI_Tools {
    constructor() {
        this.label = 'BraveSearch API';
        this.name = 'braveSearchAPI';
        this.type = 'BraveSearchAPI';
        this.icon = 'brave.svg';
        this.category = 'Tools';
        this.description = 'Wrapper around BraveSearch API - a real-time API to access Brave search results';
        this.inputs = [
            {
                label: 'BraveSearch API Key',
                name: 'apiKey',
                type: 'password'
            }
        ];
        this.baseClasses = [this.type, ...(0, utils_1.getBaseClasses)(tools_1.BraveSearch)];
    }
    async init(nodeData) {
        const apiKey = nodeData.inputs?.apiKey;
        return new tools_1.BraveSearch({ apiKey });
    }
}
module.exports = { nodeClass: BraveSearchAPI_Tools };
//# sourceMappingURL=BraveSearchAPI.js.map