"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../../../src/utils");
const prompts_1 = require("langchain/prompts");
class ChatPromptTemplate_Prompts {
    constructor() {
        this.label = 'Chat Prompt Template';
        this.name = 'chatPromptTemplate';
        this.type = 'ChatPromptTemplate';
        this.icon = 'prompt.svg';
        this.category = 'Prompts';
        this.description = 'Schema to represent a chat prompt';
        this.baseClasses = [this.type, ...(0, utils_1.getBaseClasses)(prompts_1.ChatPromptTemplate)];
        this.inputs = [
            {
                label: 'System Message',
                name: 'systemMessagePrompt',
                type: 'string',
                rows: 4,
                placeholder: `You are a helpful assistant that translates {input_language} to {output_language}.`
            },
            {
                label: 'Human Message',
                name: 'humanMessagePrompt',
                type: 'string',
                rows: 4,
                placeholder: `{text}`
            },
            {
                label: 'Format Prompt Values',
                name: 'promptValues',
                type: 'json',
                optional: true,
                acceptVariable: true,
                list: true
            }
        ];
    }
    async init(nodeData) {
        const systemMessagePrompt = nodeData.inputs?.systemMessagePrompt;
        const humanMessagePrompt = nodeData.inputs?.humanMessagePrompt;
        const promptValuesStr = nodeData.inputs?.promptValues;
        const prompt = prompts_1.ChatPromptTemplate.fromPromptMessages([
            prompts_1.SystemMessagePromptTemplate.fromTemplate(systemMessagePrompt),
            prompts_1.HumanMessagePromptTemplate.fromTemplate(humanMessagePrompt)
        ]);
        let promptValues = {};
        if (promptValuesStr) {
            promptValues = JSON.parse(promptValuesStr);
        }
        // @ts-ignore
        prompt.promptValues = promptValues;
        return prompt;
    }
}
module.exports = { nodeClass: ChatPromptTemplate_Prompts };
//# sourceMappingURL=ChatPromptTemplate.js.map