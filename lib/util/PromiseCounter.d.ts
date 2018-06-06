/// <reference types="node" />
/**
* a PromiseCounter.
* This can be used to wait for multiple promises.
*/
declare class PromiseCounter {
    count: number;
    expected: number;
    timeout?: NodeJS.Timer;
    listenerAdded: boolean;
    resolve?: () => any;
    reject?: (err: any) => any;
    done: boolean;
    error?: any;
    /**
    * constructor
    *
    * @param promises: Promise[] list of promises to wait for
    * @param timeout (optional): integer, timeout in ms
    */
    constructor(promises: Promise<any>[], timeout?: number);
    /**
    * adds a Promise-Like callback
    */
    then(resolve: () => any, reject: (err: any) => any): void;
    onResolve(): void;
    onError(err: any): void;
    checkDone(): void;
}
export default PromiseCounter;
