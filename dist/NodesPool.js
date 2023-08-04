"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NodesPool = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = require("fs");
class NodesPool {
    constructor() {
        this.componentNodes = {};
    }
    /**
     * Initialize to get all nodes
     */
    async initialize() {
        const packagePath = "../components";
        const nodesPath = path_1.default.join(packagePath, 'dist', 'nodes');
        const nodeFiles = await this.getFiles(nodesPath);
        return Promise.all(nodeFiles.map(async (file) => {
            if (file.endsWith('.js')) {
                const nodeModule = await require(file);
                if (nodeModule.nodeClass) {
                    const newNodeInstance = new nodeModule.nodeClass();
                    newNodeInstance.filePath = file;
                    this.componentNodes[newNodeInstance.name] = newNodeInstance;
                    // Replace file icon with absolute path
                    if (newNodeInstance.icon &&
                        (newNodeInstance.icon.endsWith('.svg') ||
                            newNodeInstance.icon.endsWith('.png') ||
                            newNodeInstance.icon.endsWith('.jpg'))) {
                        const filePath = file.replace(/\\/g, '/').split('/');
                        filePath.pop();
                        const nodeIconAbsolutePath = `${filePath.join('/')}/${newNodeInstance.icon}`;
                        this.componentNodes[newNodeInstance.name].icon = nodeIconAbsolutePath;
                    }
                }
            }
        }));
    }
    /**
     * Recursive function to get node files
     * @param {string} dir
     * @returns {string[]}
     */
    async getFiles(dir) {
        const dirents = await fs_1.promises.readdir(dir, { withFileTypes: true });
        const files = await Promise.all(dirents.map((dirent) => {
            const res = path_1.default.resolve(dir, dirent.name);
            return dirent.isDirectory() ? this.getFiles(res) : res;
        }));
        return Array.prototype.concat(...files);
    }
}
exports.NodesPool = NodesPool;
//# sourceMappingURL=NodesPool.js.map