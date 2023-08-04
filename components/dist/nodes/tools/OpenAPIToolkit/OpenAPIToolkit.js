"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const agents_1 = require("langchain/agents");
const tools_1 = require("langchain/tools");
const js_yaml_1 = require("js-yaml");
class OpenAPIToolkit_Tools {
    constructor() {
        this.label = 'OpenAPI Toolkit';
        this.name = 'openAPIToolkit';
        this.type = 'OpenAPIToolkit';
        this.icon = 'openapi.png';
        this.category = 'Tools';
        this.description = 'Load OpenAPI specification';
        this.inputs = [
            {
                label: 'OpenAI API Key',
                name: 'openAIApiKey',
                type: 'password'
            },
            {
                label: 'Language Model',
                name: 'model',
                type: 'BaseLanguageModel'
            },
            {
                label: 'YAML File',
                name: 'yamlFile',
                type: 'file',
                fileType: '.yaml'
            }
        ];
        this.baseClasses = [this.type, 'Tool'];
    }
    async init(nodeData) {
        const openAIApiKey = nodeData.inputs?.openAIApiKey;
        const model = nodeData.inputs?.model;
        const yamlFileBase64 = nodeData.inputs?.yamlFile;
        const splitDataURI = yamlFileBase64.split(',');
        splitDataURI.pop();
        const bf = Buffer.from(splitDataURI.pop() || '', 'base64');
        const utf8String = bf.toString('utf-8');
        const data = (0, js_yaml_1.load)(utf8String);
        if (!data) {
            throw new Error('Failed to load OpenAPI spec');
        }
        const headers = {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${openAIApiKey}`
        };
        const toolkit = new agents_1.OpenApiToolkit(new tools_1.JsonSpec(data), model, headers);
        return toolkit.tools;
    }
}
module.exports = { nodeClass: OpenAPIToolkit_Tools };
//# sourceMappingURL=OpenAPIToolkit.js.map