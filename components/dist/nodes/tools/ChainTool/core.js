"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChainTool = void 0;
const tools_1 = require("langchain/tools");
class ChainTool extends tools_1.DynamicTool {
    constructor({ chain, ...rest }) {
        super({
            ...rest,
            func: async (input, runManager) => {
                // To enable LLM Chain which has promptValues
                if (chain.prompt && chain.prompt.promptValues) {
                    const values = await chain.call(chain.prompt.promptValues, runManager?.getChild());
                    return values?.text;
                }
                return chain.run(input, runManager?.getChild());
            }
        });
        this.chain = chain;
    }
}
exports.ChainTool = ChainTool;
//# sourceMappingURL=core.js.map