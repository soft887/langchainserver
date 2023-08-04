import { IRunChatflowMessageValue } from './Interface';
export declare class ChildProcess {
    /**
     * Stop child process when app is killed
     */
    static stopChildProcess(): Promise<void>;
    /**
     * Process prediction
     * @param {IRunChatflowMessageValue} messageValue
     * @return {Promise<void>}
     */
    runChildProcess(messageValue: IRunChatflowMessageValue): Promise<void>;
}
