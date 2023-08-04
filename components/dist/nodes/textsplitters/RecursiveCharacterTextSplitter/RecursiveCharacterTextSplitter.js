"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../../../src/utils");
const text_splitter_1 = require("langchain/text_splitter");
class RecursiveCharacterTextSplitter_TextSplitters {
    constructor() {
        this.label = 'Recursive Character Text Splitter';
        this.name = 'recursiveCharacterTextSplitter';
        this.type = 'RecursiveCharacterTextSplitter';
        this.icon = 'textsplitter.svg';
        this.category = 'Text Splitters';
        this.description = `Split documents recursively by different characters - starting with "\\n\\n", then "\\n", then " "`;
        this.baseClasses = [this.type, ...(0, utils_1.getBaseClasses)(text_splitter_1.RecursiveCharacterTextSplitter)];
        this.inputs = [
            {
                label: 'Chunk Size',
                name: 'chunkSize',
                type: 'number',
                default: 1000,
                optional: true
            },
            {
                label: 'Chunk Overlap',
                name: 'chunkOverlap',
                type: 'number',
                optional: true
            }
        ];
    }
    async init(nodeData) {
        const chunkSize = nodeData.inputs?.chunkSize;
        const chunkOverlap = nodeData.inputs?.chunkOverlap;
        const obj = {};
        if (chunkSize)
            obj.chunkSize = parseInt(chunkSize, 10);
        if (chunkOverlap)
            obj.chunkOverlap = parseInt(chunkOverlap, 10);
        const splitter = new text_splitter_1.RecursiveCharacterTextSplitter(obj);
        return splitter;
    }
}
module.exports = { nodeClass: RecursiveCharacterTextSplitter_TextSplitters };
//# sourceMappingURL=RecursiveCharacterTextSplitter.js.map