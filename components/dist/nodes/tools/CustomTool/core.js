"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DynamicStructuredTool = void 0;
const tools_1 = require("langchain/tools");
const vm2_1 = require("vm2");
const utils_1 = require("../../../src/utils");
class DynamicStructuredTool extends tools_1.StructuredTool {
    constructor(fields) {
        super(fields);
        this.name = fields.name;
        this.description = fields.description;
        this.code = fields.code;
        this.func = fields.func;
        this.returnDirect = fields.returnDirect ?? this.returnDirect;
        this.schema = fields.schema;
    }
    async _call(arg) {
        let sandbox = {};
        if (typeof arg === 'object' && Object.keys(arg).length) {
            for (const item in arg) {
                sandbox[`$${item}`] = arg[item];
            }
        }
        const defaultAllowBuiltInDep = [
            'assert',
            'buffer',
            'crypto',
            'events',
            'http',
            'https',
            'net',
            'path',
            'querystring',
            'timers',
            'tls',
            'url',
            'zlib'
        ];
        const builtinDeps = process.env.TOOL_FUNCTION_BUILTIN_DEP
            ? defaultAllowBuiltInDep.concat(process.env.TOOL_FUNCTION_BUILTIN_DEP.split(','))
            : defaultAllowBuiltInDep;
        const externalDeps = process.env.TOOL_FUNCTION_EXTERNAL_DEP ? process.env.TOOL_FUNCTION_EXTERNAL_DEP.split(',') : [];
        const deps = utils_1.availableDependencies.concat(externalDeps);
        const options = {
            console: 'inherit',
            sandbox,
            require: {
                external: { modules: deps },
                builtin: builtinDeps
            }
        };
        const vm = new vm2_1.NodeVM(options);
        const response = await vm.run(`module.exports = async function() {${this.code}}()`, __dirname);
        return response;
    }
}
exports.DynamicStructuredTool = DynamicStructuredTool;
//# sourceMappingURL=core.js.map