"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const text_1 = require("langchain/document_loaders/fs/text");
class Text_DocumentLoaders {
    constructor() {
        this.label = 'Text File';
        this.name = 'textFile';
        this.type = 'Document';
        this.icon = 'textFile.svg';
        this.category = 'Document Loaders';
        this.description = `Load data from text files`;
        this.baseClasses = [this.type];
        this.inputs = [
            {
                label: 'Txt File',
                name: 'txtFile',
                type: 'file',
                fileType: '.txt'
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
        const textSplitter = nodeData.inputs?.textSplitter;
        const txtFileBase64 = nodeData.inputs?.txtFile;
        const metadata = nodeData.inputs?.metadata;
        let alldocs = [];
        let files = [];
        if (txtFileBase64.startsWith('[') && txtFileBase64.endsWith(']')) {
            files = JSON.parse(txtFileBase64);
        }
        else {
            files = [txtFileBase64];
        }
        for (const file of files) {
            const splitDataURI = file.split(',');
            splitDataURI.pop();
            const bf = Buffer.from(splitDataURI.pop() || '', 'base64');
            const blob = new Blob([bf]);
            const loader = new text_1.TextLoader(blob);
            if (textSplitter) {
                const docs = await loader.loadAndSplit(textSplitter);
                alldocs.push(...docs);
            }
            else {
                const docs = await loader.load();
                alldocs.push(...docs);
            }
        }
        if (metadata) {
            const parsedMetadata = typeof metadata === 'object' ? metadata : JSON.parse(metadata);
            let finaldocs = [];
            for (const doc of alldocs) {
                const newdoc = {
                    ...doc,
                    metadata: {
                        ...doc.metadata,
                        ...parsedMetadata
                    }
                };
                finaldocs.push(newdoc);
            }
            return finaldocs;
        }
        return alldocs;
    }
}
module.exports = { nodeClass: Text_DocumentLoaders };
//# sourceMappingURL=Text.js.map