import { Command } from '@oclif/core';
export default class Start extends Command {
    static args: never[];
    static flags: {
        FLOWISE_USERNAME: import("@oclif/core/lib/interfaces").OptionFlag<string | undefined>;
        FLOWISE_PASSWORD: import("@oclif/core/lib/interfaces").OptionFlag<string | undefined>;
        PORT: import("@oclif/core/lib/interfaces").OptionFlag<string | undefined>;
        DEBUG: import("@oclif/core/lib/interfaces").OptionFlag<string | undefined>;
        APIKEY_PATH: import("@oclif/core/lib/interfaces").OptionFlag<string | undefined>;
        LOG_PATH: import("@oclif/core/lib/interfaces").OptionFlag<string | undefined>;
        LOG_LEVEL: import("@oclif/core/lib/interfaces").OptionFlag<string | undefined>;
        EXECUTION_MODE: import("@oclif/core/lib/interfaces").OptionFlag<string | undefined>;
        TOOL_FUNCTION_BUILTIN_DEP: import("@oclif/core/lib/interfaces").OptionFlag<string | undefined>;
        TOOL_FUNCTION_EXTERNAL_DEP: import("@oclif/core/lib/interfaces").OptionFlag<string | undefined>;
        OVERRIDE_DATABASE: import("@oclif/core/lib/interfaces").OptionFlag<string | undefined>;
        DATABASE_TYPE: import("@oclif/core/lib/interfaces").OptionFlag<string | undefined>;
        DATABASE_PATH: import("@oclif/core/lib/interfaces").OptionFlag<string | undefined>;
        DATABASE_PORT: import("@oclif/core/lib/interfaces").OptionFlag<string | undefined>;
        DATABASE_HOST: import("@oclif/core/lib/interfaces").OptionFlag<string | undefined>;
        DATABASE_NAME: import("@oclif/core/lib/interfaces").OptionFlag<string | undefined>;
        DATABASE_USER: import("@oclif/core/lib/interfaces").OptionFlag<string | undefined>;
        DATABASE_PASSWORD: import("@oclif/core/lib/interfaces").OptionFlag<string | undefined>;
    };
    stopProcess(): Promise<void>;
    run(): Promise<void>;
}
