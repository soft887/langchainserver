"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../../../src/utils");
const supabase_1 = require("langchain/vectorstores/supabase");
const supabase_js_1 = require("@supabase/supabase-js");
class Supabase_Existing_VectorStores {
    constructor() {
        this.label = 'Supabase Load Existing Index';
        this.name = 'supabaseExistingIndex';
        this.type = 'Supabase';
        this.icon = 'supabase.svg';
        this.category = 'Vector Stores';
        this.description = 'Load existing index from Supabase (i.e: Document has been upserted)';
        this.baseClasses = [this.type, 'VectorStoreRetriever', 'BaseRetriever'];
        this.inputs = [
            {
                label: 'Embeddings',
                name: 'embeddings',
                type: 'Embeddings'
            },
            {
                label: 'Supabase API Key',
                name: 'supabaseApiKey',
                type: 'password'
            },
            {
                label: 'Supabase Project URL',
                name: 'supabaseProjUrl',
                type: 'string'
            },
            {
                label: 'Table Name',
                name: 'tableName',
                type: 'string'
            },
            {
                label: 'Query Name',
                name: 'queryName',
                type: 'string'
            },
            {
                label: 'Supabase Metadata Filter',
                name: 'supabaseMetadataFilter',
                type: 'json',
                optional: true,
                additionalParams: true
            },
            {
                label: 'Top K',
                name: 'topK',
                description: 'Number of top results to fetch. Default to 4',
                placeholder: '4',
                type: 'number',
                additionalParams: true,
                optional: true
            }
        ];
        this.outputs = [
            {
                label: 'Supabase Retriever',
                name: 'retriever',
                baseClasses: this.baseClasses
            },
            {
                label: 'Supabase Vector Store',
                name: 'vectorStore',
                baseClasses: [this.type, ...(0, utils_1.getBaseClasses)(supabase_1.SupabaseVectorStore)]
            }
        ];
    }
    async init(nodeData) {
        const supabaseApiKey = nodeData.inputs?.supabaseApiKey;
        const supabaseProjUrl = nodeData.inputs?.supabaseProjUrl;
        const tableName = nodeData.inputs?.tableName;
        const queryName = nodeData.inputs?.queryName;
        const embeddings = nodeData.inputs?.embeddings;
        const supabaseMetadataFilter = nodeData.inputs?.supabaseMetadataFilter;
        const output = nodeData.outputs?.output;
        const topK = nodeData.inputs?.topK;
        const k = topK ? parseInt(topK, 10) : 4;
        const client = (0, supabase_js_1.createClient)(supabaseProjUrl, supabaseApiKey);
        const obj = {
            client,
            tableName,
            queryName
        };
        if (supabaseMetadataFilter) {
            const metadatafilter = typeof supabaseMetadataFilter === 'object' ? supabaseMetadataFilter : JSON.parse(supabaseMetadataFilter);
            obj.filter = metadatafilter;
        }
        const vectorStore = await supabase_1.SupabaseVectorStore.fromExistingIndex(embeddings, obj);
        if (output === 'retriever') {
            const retriever = vectorStore.asRetriever(k);
            return retriever;
        }
        else if (output === 'vectorStore') {
            ;
            vectorStore.k = k;
            return vectorStore;
        }
        return vectorStore;
    }
}
module.exports = { nodeClass: Supabase_Existing_VectorStores };
//# sourceMappingURL=Supabase_Exisiting.js.map