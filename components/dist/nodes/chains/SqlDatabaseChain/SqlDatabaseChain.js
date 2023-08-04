"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sql_db_1 = require("langchain/chains/sql_db");
const utils_1 = require("../../../src/utils");
const typeorm_1 = require("typeorm");
const sql_db_2 = require("langchain/sql_db");
const handler_1 = require("../../../src/handler");
class SqlDatabaseChain_Chains {
    constructor() {
        this.label = 'Sql Database Chain';
        this.name = 'sqlDatabaseChain';
        this.type = 'SqlDatabaseChain';
        this.icon = 'sqlchain.svg';
        this.category = 'Chains';
        this.description = 'Answer questions over a SQL database';
        this.baseClasses = [this.type, ...(0, utils_1.getBaseClasses)(sql_db_1.SqlDatabaseChain)];
        this.inputs = [
            {
                label: 'Language Model',
                name: 'model',
                type: 'BaseLanguageModel'
            },
            {
                label: 'Database',
                name: 'database',
                type: 'options',
                options: [
                    {
                        label: 'SQlite',
                        name: 'sqlite'
                    }
                ],
                default: 'sqlite'
            },
            {
                label: 'Database File Path',
                name: 'dbFilePath',
                type: 'string',
                placeholder: 'C:/Users/chinook.db'
            }
        ];
    }
    async init(nodeData) {
        const databaseType = nodeData.inputs?.database;
        const model = nodeData.inputs?.model;
        const dbFilePath = nodeData.inputs?.dbFilePath;
        const chain = await getSQLDBChain(databaseType, dbFilePath, model);
        return chain;
    }
    async run(nodeData, input, options) {
        const databaseType = nodeData.inputs?.database;
        const model = nodeData.inputs?.model;
        const dbFilePath = nodeData.inputs?.dbFilePath;
        const chain = await getSQLDBChain(databaseType, dbFilePath, model);
        const loggerHandler = new handler_1.ConsoleCallbackHandler(options.logger);
        if (options.socketIO && options.socketIOClientId) {
            const handler = new handler_1.CustomChainHandler(options.socketIO, options.socketIOClientId, 2);
            const res = await chain.run(input, [loggerHandler, handler]);
            return res;
        }
        else {
            const res = await chain.run(input, [loggerHandler]);
            return res;
        }
    }
}
const getSQLDBChain = async (databaseType, dbFilePath, llm) => {
    const datasource = new typeorm_1.DataSource({
        type: databaseType,
        database: dbFilePath
    });
    const db = await sql_db_2.SqlDatabase.fromDataSourceParams({
        appDataSource: datasource
    });
    const obj = {
        llm,
        database: db,
        verbose: process.env.DEBUG === 'true' ? true : false
    };
    const chain = new sql_db_1.SqlDatabaseChain(obj);
    return chain;
};
module.exports = { nodeClass: SqlDatabaseChain_Chains };
//# sourceMappingURL=SqlDatabaseChain.js.map