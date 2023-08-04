"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../../../src/utils");
const replicate_1 = require("langchain/llms/replicate");
class Replicate_LLMs {
    constructor() {
        this.label = 'Replicate';
        this.name = 'replicate';
        this.type = 'Replicate';
        this.icon = 'replicate.svg';
        this.category = 'LLMs';
        this.description = 'Use Replicate to run open source models on cloud';
        this.baseClasses = [this.type, 'BaseChatModel', ...(0, utils_1.getBaseClasses)(replicate_1.Replicate)];
        this.inputs = [
            {
                label: 'Replicate Api Key',
                name: 'replicateApiKey',
                type: 'password'
            },
            {
                label: 'Model',
                name: 'model',
                type: 'string',
                placeholder: 'a16z-infra/llama13b-v2-chat:df7690f1994d94e96ad9d568eac121aecf50684a0b0963b25a41cc40061269e5',
                optional: true
            },
            {
                label: 'Temperature',
                name: 'temperature',
                type: 'number',
                description: 'Adjusts randomness of outputs, greater than 1 is random and 0 is deterministic, 0.75 is a good starting value.',
                default: 0.7,
                optional: true
            },
            {
                label: 'Max Tokens',
                name: 'maxTokens',
                type: 'number',
                description: 'Maximum number of tokens to generate. A word is generally 2-3 tokens',
                optional: true,
                additionalParams: true
            },
            {
                label: 'Top Probability',
                name: 'topP',
                type: 'number',
                description: 'When decoding text, samples from the top p percentage of most likely tokens; lower to ignore less likely tokens',
                optional: true,
                additionalParams: true
            },
            {
                label: 'Repetition Penalty',
                name: 'repetitionPenalty',
                type: 'number',
                description: 'Penalty for repeated words in generated text; 1 is no penalty, values greater than 1 discourage repetition, less than 1 encourage it. (minimum: 0.01; maximum: 5)',
                optional: true,
                additionalParams: true
            },
            {
                label: 'Additional Inputs',
                name: 'additionalInputs',
                type: 'json',
                description: 'Each model has different parameters, refer to the specific model accepted inputs. For example: <a target="_blank" href="https://replicate.com/a16z-infra/llama13b-v2-chat/api#inputs">llama13b-v2</a>',
                additionalParams: true,
                optional: true
            }
        ];
    }
    async init(nodeData) {
        const modelName = nodeData.inputs?.model;
        const apiKey = nodeData.inputs?.replicateApiKey;
        const temperature = nodeData.inputs?.temperature;
        const maxTokens = nodeData.inputs?.maxTokens;
        const topP = nodeData.inputs?.topP;
        const repetitionPenalty = nodeData.inputs?.repetitionPenalty;
        const additionalInputs = nodeData.inputs?.additionalInputs;
        const version = modelName.split(':').pop();
        const name = modelName.split(':')[0].split('/').pop();
        const org = modelName.split(':')[0].split('/')[0];
        const obj = {
            model: `${org}/${name}:${version}`,
            apiKey
        };
        let inputs = {};
        if (maxTokens)
            inputs.max_length = parseInt(maxTokens, 10);
        if (temperature)
            inputs.temperature = parseFloat(temperature);
        if (topP)
            inputs.top_p = parseFloat(topP);
        if (repetitionPenalty)
            inputs.repetition_penalty = parseFloat(repetitionPenalty);
        if (additionalInputs) {
            const parsedInputs = typeof additionalInputs === 'object' ? additionalInputs : additionalInputs ? JSON.parse(additionalInputs) : {};
            inputs = { ...inputs, ...parsedInputs };
        }
        if (Object.keys(inputs).length)
            obj.input = inputs;
        const model = new replicate_1.Replicate(obj);
        return model;
    }
}
module.exports = { nodeClass: Replicate_LLMs };
//# sourceMappingURL=Replicate.js.map