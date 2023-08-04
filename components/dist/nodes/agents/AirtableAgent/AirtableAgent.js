"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Interface_1 = require("../../../src/Interface");
const agents_1 = require("langchain/agents");
const utils_1 = require("../../../src/utils");
const core_1 = require("./core");
const chains_1 = require("langchain/chains");
const handler_1 = require("../../../src/handler");
const axios_1 = __importDefault(require("axios"));
class Airtable_Agents {
    constructor() {
        this.label = 'Airtable Agent';
        this.name = 'airtableAgent';
        this.type = 'AgentExecutor';
        this.category = 'Agents';
        this.icon = 'airtable.svg';
        this.description = 'Agent used to to answer queries on Airtable table';
        this.baseClasses = [this.type, ...(0, utils_1.getBaseClasses)(agents_1.AgentExecutor)];
        this.inputs = [
            {
                label: 'Language Model',
                name: 'model',
                type: 'BaseLanguageModel'
            },
            {
                label: 'Personal Access Token',
                name: 'accessToken',
                type: 'password',
                description: 'Get personal access token from <a target="_blank" href="https://airtable.com/developers/web/guides/personal-access-tokens">official guide</a>'
            },
            {
                label: 'Base Id',
                name: 'baseId',
                type: 'string',
                placeholder: 'app11RobdGoX0YNsC',
                description: 'If your table URL looks like: https://airtable.com/app11RobdGoX0YNsC/tblJdmvbrgizbYICO/viw9UrP77Id0CE4ee, app11RovdGoX0YNsC is the base id'
            },
            {
                label: 'Table Id',
                name: 'tableId',
                type: 'string',
                placeholder: 'tblJdmvbrgizbYICO',
                description: 'If your table URL looks like: https://airtable.com/app11RobdGoX0YNsC/tblJdmvbrgizbYICO/viw9UrP77Id0CE4ee, tblJdmvbrgizbYICO is the table id'
            },
            {
                label: 'Return All',
                name: 'returnAll',
                type: 'boolean',
                default: true,
                additionalParams: true,
                description: 'If all results should be returned or only up to a given limit'
            },
            {
                label: 'Limit',
                name: 'limit',
                type: 'number',
                default: 100,
                step: 1,
                additionalParams: true,
                description: 'Number of results to return'
            }
        ];
    }
    async init() {
        // Not used
        return undefined;
    }
    async run(nodeData, input, options) {
        const model = nodeData.inputs?.model;
        const accessToken = nodeData.inputs?.accessToken;
        const baseId = nodeData.inputs?.baseId;
        const tableId = nodeData.inputs?.tableId;
        const returnAll = nodeData.inputs?.returnAll;
        const limit = nodeData.inputs?.limit;
        let airtableData = [];
        if (returnAll) {
            airtableData = await loadAll(baseId, tableId, accessToken);
        }
        else {
            airtableData = await loadLimit(limit ? parseInt(limit, 10) : 100, baseId, tableId, accessToken);
        }
        let base64String = Buffer.from(JSON.stringify(airtableData)).toString('base64');
        const loggerHandler = new handler_1.ConsoleCallbackHandler(options.logger);
        const handler = new handler_1.CustomChainHandler(options.socketIO, options.socketIOClientId);
        const pyodide = await (0, core_1.LoadPyodide)();
        // First load the csv file and get the dataframe dictionary of column types
        // For example using titanic.csv: {'PassengerId': 'int64', 'Survived': 'int64', 'Pclass': 'int64', 'Name': 'object', 'Sex': 'object', 'Age': 'float64', 'SibSp': 'int64', 'Parch': 'int64', 'Ticket': 'object', 'Fare': 'float64', 'Cabin': 'object', 'Embarked': 'object'}
        let dataframeColDict = '';
        try {
            const code = `import pandas as pd
import base64
import json

base64_string = "${base64String}"

decoded_data = base64.b64decode(base64_string)

json_data = json.loads(decoded_data)

df = pd.DataFrame(json_data)
my_dict = df.dtypes.astype(str).to_dict()
print(my_dict)
json.dumps(my_dict)`;
            dataframeColDict = await pyodide.runPythonAsync(code);
        }
        catch (error) {
            throw new Error(error);
        }
        options.logger.debug('[components/AirtableAgent] [1] DataframeColDict =>', dataframeColDict);
        // Then tell GPT to come out with ONLY python code
        // For example: len(df), df[df['SibSp'] > 3]['PassengerId'].count()
        let pythonCode = '';
        if (dataframeColDict) {
            const chain = new chains_1.LLMChain({
                llm: model,
                prompt: Interface_1.PromptTemplate.fromTemplate(core_1.systemPrompt),
                verbose: process.env.DEBUG === 'true' ? true : false
            });
            const inputs = {
                dict: dataframeColDict,
                question: input
            };
            const res = await chain.call(inputs, [loggerHandler]);
            pythonCode = res?.text;
        }
        options.logger.debug('[components/AirtableAgent] [2] Generated Python Code =>', pythonCode);
        // Then run the code using Pyodide
        let finalResult = '';
        if (pythonCode) {
            try {
                const code = `import pandas as pd\n${pythonCode}`;
                finalResult = await pyodide.runPythonAsync(code);
            }
            catch (error) {
                throw new Error(`Sorry, I'm unable to find answer for question: "${input}" using follwoing code: "${pythonCode}"`);
            }
        }
        options.logger.debug('[components/AirtableAgent] [3] Pyodide Result =>', finalResult);
        // Finally, return a complete answer
        if (finalResult) {
            const chain = new chains_1.LLMChain({
                llm: model,
                prompt: Interface_1.PromptTemplate.fromTemplate(core_1.finalSystemPrompt),
                verbose: process.env.DEBUG === 'true' ? true : false
            });
            const inputs = {
                question: input,
                answer: finalResult
            };
            if (options.socketIO && options.socketIOClientId) {
                const result = await chain.call(inputs, [loggerHandler, handler]);
                options.logger.debug('[components/AirtableAgent] [4] Final Result =>', result?.text);
                return result?.text;
            }
            else {
                const result = await chain.call(inputs, [loggerHandler]);
                options.logger.debug('[components/AirtableAgent] [4] Final Result =>', result?.text);
                return result?.text;
            }
        }
        return pythonCode;
    }
}
const fetchAirtableData = async (url, params, accessToken) => {
    try {
        const headers = {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            Accept: 'application/json'
        };
        const response = await axios_1.default.get(url, { params, headers });
        return response.data;
    }
    catch (error) {
        throw new Error(`Failed to fetch ${url} from Airtable: ${error}`);
    }
};
const loadAll = async (baseId, tableId, accessToken) => {
    const params = { pageSize: 100 };
    let data;
    let returnPages = [];
    do {
        data = await fetchAirtableData(`https://api.airtable.com/v0/${baseId}/${tableId}`, params, accessToken);
        returnPages.push.apply(returnPages, data.records);
        params.offset = data.offset;
    } while (data.offset !== undefined);
    return data.records.map((page) => page.fields);
};
const loadLimit = async (limit, baseId, tableId, accessToken) => {
    const params = { maxRecords: limit };
    const data = await fetchAirtableData(`https://api.airtable.com/v0/${baseId}/${tableId}`, params, accessToken);
    if (data.records.length === 0) {
        return [];
    }
    return data.records.map((page) => page.fields);
};
module.exports = { nodeClass: Airtable_Agents };
//# sourceMappingURL=AirtableAgent.js.map