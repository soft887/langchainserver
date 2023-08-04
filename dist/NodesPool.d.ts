import { IComponentNodes } from './Interface';
export declare class NodesPool {
    componentNodes: IComponentNodes;
    /**
     * Initialize to get all nodes
     */
    initialize(): Promise<void[]>;
    /**
     * Recursive function to get node files
     * @param {string} dir
     * @returns {string[]}
     */
    getFiles(dir: string): Promise<string[]>;
}
