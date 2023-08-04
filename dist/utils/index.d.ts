import { IComponentNodes, IDepthQueue, INodeDependencies, INodeDirectedGraph, IReactFlowEdge, IReactFlowNode, INodeData, IOverrideConfig } from '../Interface';
import { ICommonObject, IDatabaseEntity } from '../../components/dist/src/index';
import { DataSource } from 'typeorm';
export declare const databaseEntities: IDatabaseEntity;
/**
 * Returns the home folder path of the user if
 * none can be found it falls back to the current
 * working directory
 *
 */
export declare const getUserHome: () => string;
/**
 * Returns the path of node modules package
 * @param {string} packageName
 * @returns {string}
 */
export declare const getNodeModulesPackagePath: (packageName: string) => string;
/**
 * Construct graph and node dependencies score
 * @param {IReactFlowNode[]} reactFlowNodes
 * @param {IReactFlowEdge[]} reactFlowEdges
 * @param {boolean} isNondirected
 */
export declare const constructGraphs: (reactFlowNodes: IReactFlowNode[], reactFlowEdges: IReactFlowEdge[], isNondirected?: boolean) => {
    graph: INodeDirectedGraph;
    nodeDependencies: INodeDependencies;
};
/**
 * Get starting nodes and check if flow is valid
 * @param {INodeDependencies} graph
 * @param {string} endNodeId
 */
export declare const getStartingNodes: (graph: INodeDirectedGraph, endNodeId: string) => {
    startingNodeIds: string[];
    depthQueue: IDepthQueue;
};
/**
 * Get ending node and check if flow is valid
 * @param {INodeDependencies} nodeDependencies
 * @param {INodeDirectedGraph} graph
 */
export declare const getEndingNode: (nodeDependencies: INodeDependencies, graph: INodeDirectedGraph) => string;
/**
 * Build langchain from start to end
 * @param {string} startingNodeId
 * @param {IReactFlowNode[]} reactFlowNodes
 * @param {INodeDirectedGraph} graph
 * @param {IDepthQueue} depthQueue
 * @param {IComponentNodes} componentNodes
 * @param {string} question
 * @param {string} chatId
 * @param {DataSource} appDataSource
 * @param {ICommonObject} overrideConfig
 */
export declare const buildLangchain: (startingNodeIds: string[], reactFlowNodes: IReactFlowNode[], graph: INodeDirectedGraph, depthQueue: IDepthQueue, componentNodes: IComponentNodes, question: string, chatId: string, appDataSource: DataSource, overrideConfig?: ICommonObject) => Promise<IReactFlowNode[]>;
/**
 * Clear memory
 * @param {IReactFlowNode[]} reactFlowNodes
 * @param {IComponentNodes} componentNodes
 * @param {string} chatId
 * @param {string} sessionId
 */
export declare const clearSessionMemory: (reactFlowNodes: IReactFlowNode[], componentNodes: IComponentNodes, chatId: string, sessionId?: string) => Promise<void>;
/**
 * Get variable value from outputResponses.output
 * @param {string} paramValue
 * @param {IReactFlowNode[]} reactFlowNodes
 * @param {string} question
 * @param {boolean} isAcceptVariable
 * @returns {string}
 */
export declare const getVariableValue: (paramValue: string, reactFlowNodes: IReactFlowNode[], question: string, isAcceptVariable?: boolean) => string;
/**
 * Temporarily disable streaming if vectorStore is Faiss
 * @param {INodeData} flowNodeData
 * @returns {boolean}
 */
export declare const isVectorStoreFaiss: (flowNodeData: INodeData) => boolean;
/**
 * Loop through each inputs and resolve variable if neccessary
 * @param {INodeData} reactFlowNodeData
 * @param {IReactFlowNode[]} reactFlowNodes
 * @param {string} question
 * @returns {INodeData}
 */
export declare const resolveVariables: (reactFlowNodeData: INodeData, reactFlowNodes: IReactFlowNode[], question: string) => INodeData;
/**
 * Loop through each inputs and replace their value with override config values
 * @param {INodeData} flowNodeData
 * @param {ICommonObject} overrideConfig
 * @returns {INodeData}
 */
export declare const replaceInputsWithConfig: (flowNodeData: INodeData, overrideConfig: ICommonObject) => INodeData;
/**
 * Rebuild flow if LLMChain has dependency on other chains
 * User Question => Prompt_0 => LLMChain_0 => Prompt-1 => LLMChain_1
 * @param {IReactFlowNode[]} startingNodes
 * @returns {boolean}
 */
export declare const isStartNodeDependOnInput: (startingNodes: IReactFlowNode[]) => boolean;
/**
 * Rebuild flow if new override config is provided
 * @param {boolean} isInternal
 * @param {ICommonObject} existingOverrideConfig
 * @param {ICommonObject} newOverrideConfig
 * @returns {boolean}
 */
export declare const isSameOverrideConfig: (isInternal: boolean, existingOverrideConfig?: ICommonObject, newOverrideConfig?: ICommonObject) => boolean;
/**
 * Returns the api key path
 * @returns {string}
 */
export declare const getAPIKeyPath: () => string;
/**
 * Generate the api key
 * @returns {string}
 */
export declare const generateAPIKey: () => string;
/**
 * Generate the secret key
 * @param {string} apiKey
 * @returns {string}
 */
export declare const generateSecretHash: (apiKey: string) => string;
/**
 * Verify valid keys
 * @param {string} storedKey
 * @param {string} suppliedKey
 * @returns {boolean}
 */
export declare const compareKeys: (storedKey: string, suppliedKey: string) => boolean;
/**
 * Get API keys
 * @returns {Promise<ICommonObject[]>}
 */
export declare const getAPIKeys: () => Promise<ICommonObject[]>;
/**
 * Add new API key
 * @param {string} keyName
 * @returns {Promise<ICommonObject[]>}
 */
export declare const addAPIKey: (keyName: string) => Promise<ICommonObject[]>;
/**
 * Get API Key details
 * @param {string} apiKey
 * @returns {Promise<ICommonObject[]>}
 */
export declare const getApiKey: (apiKey: string) => Promise<ICommonObject | undefined>;
/**
 * Update existing API key
 * @param {string} keyIdToUpdate
 * @param {string} newKeyName
 * @returns {Promise<ICommonObject[]>}
 */
export declare const updateAPIKey: (keyIdToUpdate: string, newKeyName: string) => Promise<ICommonObject[]>;
/**
 * Delete API key
 * @param {string} keyIdToDelete
 * @returns {Promise<ICommonObject[]>}
 */
export declare const deleteAPIKey: (keyIdToDelete: string) => Promise<ICommonObject[]>;
/**
 * Replace all api keys
 * @param {ICommonObject[]} content
 * @returns {Promise<void>}
 */
export declare const replaceAllAPIKeys: (content: ICommonObject[]) => Promise<void>;
/**
 * Map MimeType to InputField
 * @param {string} mimeType
 * @returns {Promise<string>}
 */
export declare const mapMimeTypeToInputField: (mimeType: string) => "" | "txtFile" | "pdfFile" | "jsonFile" | "csvFile" | "docxFile";
/**
 * Find all available inpur params config
 * @param {IReactFlowNode[]} reactFlowNodes
 * @returns {Promise<IOverrideConfig[]>}
 */
export declare const findAvailableConfigs: (reactFlowNodes: IReactFlowNode[]) => IOverrideConfig[];
/**
 * Check to see if flow valid for stream
 * @param {IReactFlowNode[]} reactFlowNodes
 * @param {INodeData} endingNodeData
 * @returns {boolean}
 */
export declare const isFlowValidForStream: (reactFlowNodes: IReactFlowNode[], endingNodeData: INodeData) => boolean;
