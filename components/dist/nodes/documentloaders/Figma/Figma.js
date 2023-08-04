"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const figma_1 = require("langchain/document_loaders/web/figma");
class Figma_DocumentLoaders {
    constructor() {
        this.label = 'Figma';
        this.name = 'figma';
        this.type = 'Document';
        this.icon = 'figma.png';
        this.category = 'Document Loaders';
        this.description = 'Load data from a Figma file';
        this.baseClasses = [this.type];
        this.inputs = [
            {
                label: 'Access Token',
                name: 'accessToken',
                type: 'password',
                placeholder: '<FIGMA_ACCESS_TOKEN>'
            },
            {
                label: 'File Key',
                name: 'fileKey',
                type: 'string',
                placeholder: 'key'
            },
            {
                label: 'Node IDs',
                name: 'nodeIds',
                type: 'string',
                placeholder: '0, 1, 2'
            },
            {
                label: 'Recursive',
                name: 'recursive',
                type: 'boolean',
                optional: true
            },
            {
                label: 'Text Splitter',
                name: 'textSplitter',
                type: 'TextSplitter',
                optional: true
            },
            {
                label: 'Metadata',
                name: 'metadata',
                type: 'json',
                optional: true,
                additionalParams: true
            }
        ];
    }
    async init(nodeData) {
        const accessToken = nodeData.inputs?.accessToken;
        const nodeIds = nodeData.inputs?.nodeIds?.split(',') || [];
        const fileKey = nodeData.inputs?.fileKey;
        const options = {
            accessToken,
            nodeIds,
            fileKey
        };
        const loader = new figma_1.FigmaFileLoader(options);
        const docs = await loader.load();
        return docs;
    }
}
module.exports = { nodeClass: Figma_DocumentLoaders };
//# sourceMappingURL=Figma.js.map