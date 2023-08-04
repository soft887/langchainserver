"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDataSource = exports.init = void 0;
require("reflect-metadata");
const path_1 = __importDefault(require("path"));
const typeorm_1 = require("typeorm");
const ChatFlow_1 = require("./entity/ChatFlow");
const ChatMessage_1 = require("./entity/ChatMessage");
const Tool_1 = require("./entity/Tool");
const utils_1 = require("./utils");
let appDataSource;
const init = async () => {
    var _a, _b;
    let homePath;
    const synchronize = process.env.OVERRIDE_DATABASE === 'false' ? false : true;
    switch (process.env.DATABASE_TYPE) {
        case 'sqlite':
            homePath = (_a = process.env.DATABASE_PATH) !== null && _a !== void 0 ? _a : path_1.default.join((0, utils_1.getUserHome)(), '.flowise');
            appDataSource = new typeorm_1.DataSource({
                type: 'sqlite',
                database: path_1.default.resolve(homePath, 'database.sqlite'),
                synchronize,
                entities: [ChatFlow_1.ChatFlow, ChatMessage_1.ChatMessage, Tool_1.Tool],
                migrations: []
            });
            break;
        case 'mysql':
            appDataSource = new typeorm_1.DataSource({
                type: 'mysql',
                host: process.env.DATABASE_HOST,
                port: parseInt(process.env.DATABASE_PORT || '3306'),
                username: process.env.DATABASE_USER,
                password: process.env.DATABASE_PASSWORD,
                database: process.env.DATABASE_NAME,
                charset: 'utf8mb4',
                synchronize,
                entities: [ChatFlow_1.ChatFlow, ChatMessage_1.ChatMessage, Tool_1.Tool],
                migrations: []
            });
            break;
        case 'postgres':
            appDataSource = new typeorm_1.DataSource({
                type: 'postgres',
                host: process.env.DATABASE_HOST,
                port: parseInt(process.env.DATABASE_PORT || '5432'),
                username: process.env.DATABASE_USER,
                password: process.env.DATABASE_PASSWORD,
                database: process.env.DATABASE_NAME,
                synchronize,
                entities: [ChatFlow_1.ChatFlow, ChatMessage_1.ChatMessage, Tool_1.Tool],
                migrations: []
            });
            break;
        default:
            homePath = (_b = process.env.DATABASE_PATH) !== null && _b !== void 0 ? _b : path_1.default.join((0, utils_1.getUserHome)(), '.flowise');
            appDataSource = new typeorm_1.DataSource({
                type: 'sqlite',
                database: path_1.default.resolve(homePath, 'database.sqlite'),
                synchronize,
                entities: [ChatFlow_1.ChatFlow, ChatMessage_1.ChatMessage, Tool_1.Tool],
                migrations: []
            });
            break;
    }
};
exports.init = init;
function getDataSource() {
    if (appDataSource === undefined) {
        (0, exports.init)();
    }
    return appDataSource;
}
exports.getDataSource = getDataSource;
//# sourceMappingURL=DataSource.js.map