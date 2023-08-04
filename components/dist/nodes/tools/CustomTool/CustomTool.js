"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../../../src/utils");
const core_1 = require("./core");
const zod_1 = require("zod");
class CustomTool_Tools {
    constructor() {
        //@ts-ignore
        this.loadMethods = {
            async listTools(nodeData, options) {
                const returnData = [];
                const appDataSource = options.appDataSource;
                const databaseEntities = options.databaseEntities;
                if (appDataSource === undefined || !appDataSource) {
                    return returnData;
                }
                const tools = await appDataSource.getRepository(databaseEntities['Tool']).find();
                for (let i = 0; i < tools.length; i += 1) {
                    const data = {
                        label: tools[i].name,
                        name: tools[i].id,
                        description: tools[i].description
                    };
                    returnData.push(data);
                }
                return returnData;
            }
        };
        this.label = 'Custom Tool';
        this.name = 'customTool';
        this.type = 'CustomTool';
        this.icon = 'customtool.svg';
        this.category = 'Tools';
        this.description = `Use custom tool you've created in Flowise within chatflow`;
        this.inputs = [
            {
                label: 'Select Tool',
                name: 'selectedTool',
                type: 'asyncOptions',
                loadMethod: 'listTools'
            }
        ];
        this.baseClasses = [this.type, 'Tool', ...(0, utils_1.getBaseClasses)(core_1.DynamicStructuredTool)];
    }
    async init(nodeData, input, options) {
        const selectedToolId = nodeData.inputs?.selectedTool;
        const appDataSource = options.appDataSource;
        const databaseEntities = options.databaseEntities;
        try {
            const tool = await appDataSource.getRepository(databaseEntities['Tool']).findOneBy({
                id: selectedToolId
            });
            if (!tool)
                throw new Error(`Tool ${selectedToolId} not found`);
            const obj = {
                name: tool.name,
                description: tool.description,
                schema: zod_1.z.object(convertSchemaToZod(tool.schema)),
                code: tool.func
            };
            return new core_1.DynamicStructuredTool(obj);
        }
        catch (e) {
            throw new Error(e);
        }
    }
}
const convertSchemaToZod = (schema) => {
    try {
        const parsedSchema = JSON.parse(schema);
        const zodObj = {};
        for (const sch of parsedSchema) {
            if (sch.type === 'string') {
                if (sch.required)
                    zod_1.z.string({ required_error: `${sch.property} required` }).describe(sch.description);
                zodObj[sch.property] = zod_1.z.string().describe(sch.description);
            }
            else if (sch.type === 'number') {
                if (sch.required)
                    zod_1.z.number({ required_error: `${sch.property} required` }).describe(sch.description);
                zodObj[sch.property] = zod_1.z.number().describe(sch.description);
            }
            else if (sch.type === 'boolean') {
                if (sch.required)
                    zod_1.z.boolean({ required_error: `${sch.property} required` }).describe(sch.description);
                zodObj[sch.property] = zod_1.z.boolean().describe(sch.description);
            }
        }
        return zodObj;
    }
    catch (e) {
        throw new Error(e);
    }
};
module.exports = { nodeClass: CustomTool_Tools };
//# sourceMappingURL=CustomTool.js.map