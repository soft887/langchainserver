"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chains_1 = require("langchain/chains");
const utils_1 = require("../../../src/utils");
const handler_1 = require("../../../src/handler");
class OpenApiChain_Chains {
    constructor() {
        this.label = 'OpenAPI Chain';
        this.name = 'openApiChain';
        this.type = 'openApiChain';
        this.icon = 'openapi.png';
        this.category = 'Chains';
        this.description = 'Chain to run queries against OpenAPI';
        this.baseClasses = [this.type, ...(0, utils_1.getBaseClasses)(chains_1.APIChain)];
        this.inputs = [
            {
                label: 'ChatOpenAI Model',
                name: 'model',
                type: 'ChatOpenAI'
            },
            {
                label: 'YAML Link',
                name: 'yamlLink',
                type: 'string',
                placeholder: 'https://api.speak.com/openapi.yaml',
                description: 'If YAML link is provided, uploaded YAML File will be ignored and YAML link will be used instead'
            },
            {
                label: 'YAML File',
                name: 'yamlFile',
                type: 'file',
                fileType: '.yaml',
                description: 'If YAML link is provided, uploaded YAML File will be ignored and YAML link will be used instead'
            },
            {
                label: 'Headers',
                name: 'headers',
                type: 'json',
                additionalParams: true,
                optional: true
            }
        ];
    }
    async init(nodeData) {
        return await initChain(nodeData);
    }
    async run(nodeData, input, options) {
        const chain = await initChain(nodeData);
        const loggerHandler = new handler_1.ConsoleCallbackHandler(options.logger);
        if (options.socketIO && options.socketIOClientId) {
            const handler = new handler_1.CustomChainHandler(options.socketIO, options.socketIOClientId);
            const res = await chain.run(input, [loggerHandler, handler]);
            return res;
        }
        else {
            const res = await chain.run(input, [loggerHandler]);
            return res;
        }
    }
}
const initChain = async (nodeData) => {
    const model = nodeData.inputs?.model;
    const headers = nodeData.inputs?.headers;
    const yamlLink = nodeData.inputs?.yamlLink;
    const yamlFileBase64 = nodeData.inputs?.yamlFile;
    let yamlString = '';
    if (yamlLink) {
        yamlString = yamlLink;
    }
    else {
        const splitDataURI = yamlFileBase64.split(',');
        splitDataURI.pop();
        const bf = Buffer.from(splitDataURI.pop() || '', 'base64');
        yamlString = bf.toString('utf-8');
    }
    return await (0, chains_1.createOpenAPIChain)(yamlString, {
        llm: model,
        headers: typeof headers === 'object' ? headers : headers ? JSON.parse(headers) : {},
        verbose: process.env.DEBUG === 'true' ? true : false
    });
};
module.exports = { nodeClass: OpenApiChain_Chains };
//# sourceMappingURL=OpenAPIChain.js.map