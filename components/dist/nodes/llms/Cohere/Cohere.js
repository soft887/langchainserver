"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../../../src/utils");
const core_1 = require("./core");
class Cohere_LLMs {
    constructor() {
        this.label = 'Cohere';
        this.name = 'cohere';
        this.type = 'Cohere';
        this.icon = 'cohere.png';
        this.category = 'LLMs';
        this.description = 'Wrapper around Cohere large language models';
        this.baseClasses = [this.type, ...(0, utils_1.getBaseClasses)(core_1.Cohere)];
        this.inputs = [
            {
                label: 'Cohere Api Key',
                name: 'cohereApiKey',
                type: 'password'
            },
            {
                label: 'Model Name',
                name: 'modelName',
                type: 'options',
                options: [
                    {
                        label: 'command',
                        name: 'command'
                    },
                    {
                        label: 'command-light',
                        name: 'command-light'
                    },
                    {
                        label: 'command-nightly',
                        name: 'command-nightly'
                    },
                    {
                        label: 'command-light-nightly',
                        name: 'command-light-nightly'
                    },
                    {
                        label: 'base',
                        name: 'base'
                    },
                    {
                        label: 'base-light',
                        name: 'base-light'
                    }
                ],
                default: 'command',
                optional: true
            },
            {
                label: 'Temperature',
                name: 'temperature',
                type: 'number',
                default: 0.7,
                optional: true
            },
            {
                label: 'Max Tokens',
                name: 'maxTokens',
                type: 'number',
                optional: true
            }
        ];
    }
    async init(nodeData) {
        const temperature = nodeData.inputs?.temperature;
        const modelName = nodeData.inputs?.modelName;
        const apiKey = nodeData.inputs?.cohereApiKey;
        const maxTokens = nodeData.inputs?.maxTokens;
        const obj = {
            apiKey
        };
        if (maxTokens)
            obj.maxTokens = parseInt(maxTokens, 10);
        if (modelName)
            obj.model = modelName;
        if (temperature)
            obj.temperature = parseFloat(temperature);
        const model = new core_1.Cohere(obj);
        return model;
    }
}
module.exports = { nodeClass: Cohere_LLMs };
//# sourceMappingURL=Cohere.js.map