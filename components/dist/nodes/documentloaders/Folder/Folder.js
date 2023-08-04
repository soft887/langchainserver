"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const text_1 = require("langchain/document_loaders/fs/text");
const directory_1 = require("langchain/document_loaders/fs/directory");
const json_1 = require("langchain/document_loaders/fs/json");
const csv_1 = require("langchain/document_loaders/fs/csv");
const pdf_1 = require("langchain/document_loaders/fs/pdf");
const docx_1 = require("langchain/document_loaders/fs/docx");
class Folder_DocumentLoaders {
    constructor() {
        this.label = 'Folder with Files';
        this.name = 'folderFiles';
        this.type = 'Document';
        this.icon = 'folder.svg';
        this.category = 'Document Loaders';
        this.description = `Load data from folder with multiple files`;
        this.baseClasses = [this.type];
        this.inputs = [
            {
                label: 'Folder Path',
                name: 'folderPath',
                type: 'string',
                placeholder: ''
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
        const folderPath = nodeData.inputs?.folderPath;
        const metadata = nodeData.inputs?.metadata;
        const loader = new directory_1.DirectoryLoader(folderPath, {
            '.json': (path) => new json_1.JSONLoader(path),
            '.txt': (path) => new text_1.TextLoader(path),
            '.csv': (path) => new csv_1.CSVLoader(path),
            '.docx': (path) => new docx_1.DocxLoader(path),
            // @ts-ignore
            '.pdf': (path) => new pdf_1.PDFLoader(path, { pdfjs: () => Promise.resolve().then(() => __importStar(require('pdf-parse/lib/pdf.js/v1.10.100/build/pdf.js'))) })
        });
        let docs = [];
        if (textSplitter) {
            docs = await loader.loadAndSplit(textSplitter);
        }
        else {
            docs = await loader.load();
        }
        if (metadata) {
            const parsedMetadata = typeof metadata === 'object' ? metadata : JSON.parse(metadata);
            let finaldocs = [];
            for (const doc of docs) {
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
        return docs;
    }
}
module.exports = { nodeClass: Folder_DocumentLoaders };
//# sourceMappingURL=Folder.js.map