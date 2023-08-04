"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@oclif/core");
const path_1 = __importDefault(require("path"));
const Server = __importStar(require("../index"));
const DataSource = __importStar(require("../DataSource"));
const dotenv_1 = __importDefault(require("dotenv"));
const logger_1 = __importDefault(require("../utils/logger"));
dotenv_1.default.config({ path: path_1.default.join(__dirname, '..', '..', '.env'), override: true });
var EXIT_CODE;
(function (EXIT_CODE) {
    EXIT_CODE[EXIT_CODE["SUCCESS"] = 0] = "SUCCESS";
    EXIT_CODE[EXIT_CODE["FAILED"] = 1] = "FAILED";
})(EXIT_CODE || (EXIT_CODE = {}));
let processExitCode = EXIT_CODE.SUCCESS;
class Start extends core_1.Command {
    async stopProcess() {
        logger_1.default.info('Shutting down Flowise...');
        try {
            // Shut down the app after timeout if it ever stuck removing pools
            setTimeout(() => {
                logger_1.default.info('Flowise was forced to shut down after 30 secs');
                process.exit(processExitCode);
            }, 30000);
            // Removing pools
            const serverApp = Server.getInstance();
            if (serverApp)
                await serverApp.stopApp();
        }
        catch (error) {
            logger_1.default.error('There was an error shutting down Flowise...', error);
        }
        process.exit(processExitCode);
    }
    async run() {
        process.on('SIGTERM', this.stopProcess);
        process.on('SIGINT', this.stopProcess);
        // Prevent throw new Error from crashing the app
        // TODO: Get rid of this and send proper error message to ui
        process.on('uncaughtException', (err) => {
            logger_1.default.error('uncaughtException: ', err);
        });
        const { flags } = await this.parse(Start);
        if (flags.FLOWISE_USERNAME)
            process.env.FLOWISE_USERNAME = flags.FLOWISE_USERNAME;
        if (flags.FLOWISE_PASSWORD)
            process.env.FLOWISE_PASSWORD = flags.FLOWISE_PASSWORD;
        if (flags.PORT)
            process.env.PORT = flags.PORT;
        if (flags.APIKEY_PATH)
            process.env.APIKEY_PATH = flags.APIKEY_PATH;
        if (flags.LOG_PATH)
            process.env.LOG_PATH = flags.LOG_PATH;
        if (flags.LOG_LEVEL)
            process.env.LOG_LEVEL = flags.LOG_LEVEL;
        if (flags.EXECUTION_MODE)
            process.env.EXECUTION_MODE = flags.EXECUTION_MODE;
        if (flags.DEBUG)
            process.env.DEBUG = flags.DEBUG;
        if (flags.TOOL_FUNCTION_BUILTIN_DEP)
            process.env.TOOL_FUNCTION_BUILTIN_DEP = flags.TOOL_FUNCTION_BUILTIN_DEP;
        if (flags.TOOL_FUNCTION_EXTERNAL_DEP)
            process.env.TOOL_FUNCTION_EXTERNAL_DEP = flags.TOOL_FUNCTION_EXTERNAL_DEP;
        // Database config
        if (flags.OVERRIDE_DATABASE)
            process.env.OVERRIDE_DATABASE = flags.OVERRIDE_DATABASE;
        if (flags.DATABASE_TYPE)
            process.env.DATABASE_TYPE = flags.DATABASE_TYPE;
        if (flags.DATABASE_PATH)
            process.env.DATABASE_PATH = flags.DATABASE_PATH;
        if (flags.DATABASE_PORT)
            process.env.DATABASE_PORT = flags.DATABASE_PORT;
        if (flags.DATABASE_HOST)
            process.env.DATABASE_HOST = flags.DATABASE_HOST;
        if (flags.DATABASE_NAME)
            process.env.DATABASE_NAME = flags.DATABASE_NAME;
        if (flags.DATABASE_USER)
            process.env.DATABASE_USER = flags.DATABASE_USER;
        if (flags.DATABASE_PASSWORD)
            process.env.DATABASE_PASSWORD = flags.DATABASE_PASSWORD;
        await (async () => {
            try {
                logger_1.default.info('Starting Flowise...');
                await DataSource.init();
                await Server.start();
            }
            catch (error) {
                logger_1.default.error('There was an error starting Flowise...', error);
                processExitCode = EXIT_CODE.FAILED;
                // @ts-ignore
                process.emit('SIGINT');
            }
        })();
    }
}
exports.default = Start;
Start.args = [];
Start.flags = {
    FLOWISE_USERNAME: core_1.Flags.string(),
    FLOWISE_PASSWORD: core_1.Flags.string(),
    PORT: core_1.Flags.string(),
    DEBUG: core_1.Flags.string(),
    APIKEY_PATH: core_1.Flags.string(),
    LOG_PATH: core_1.Flags.string(),
    LOG_LEVEL: core_1.Flags.string(),
    EXECUTION_MODE: core_1.Flags.string(),
    TOOL_FUNCTION_BUILTIN_DEP: core_1.Flags.string(),
    TOOL_FUNCTION_EXTERNAL_DEP: core_1.Flags.string(),
    OVERRIDE_DATABASE: core_1.Flags.string(),
    DATABASE_TYPE: core_1.Flags.string(),
    DATABASE_PATH: core_1.Flags.string(),
    DATABASE_PORT: core_1.Flags.string(),
    DATABASE_HOST: core_1.Flags.string(),
    DATABASE_NAME: core_1.Flags.string(),
    DATABASE_USER: core_1.Flags.string(),
    DATABASE_PASSWORD: core_1.Flags.string()
};
//# sourceMappingURL=start.js.map