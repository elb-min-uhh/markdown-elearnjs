"use strict";

/**
 * a PromiseCounter.
 * This can be used to wait for multiple promises.
 */
class PromiseCounter {

    // counter and timeout
    public count!: number;
    public expected!: number;

    // finish statess
    public done: boolean = false;
    public error?: any;

    private timeout?: NodeJS.Timer;

    // listener
    private listenerAdded: boolean = false;
    private resolve?: () => any;
    private reject?: (err: any) => any;

    /**
     * constructor
     *
     * @param promises: Promise[] list of promises to wait for
     * @param timeout (optional): integer, timeout in ms
     */
    constructor(promises: Promise<any>[], timeout?: number) {
        const self = this;

        if(!promises || promises.length === undefined) {
            throw new Error("No promise array given.");
        }

        self.count = 0;
        self.expected = promises.length;

        // add timeout if given
        if(timeout !== null && timeout !== undefined) {
            self.timeout = setTimeout(() => {
                self.onError(`Timeout in PromiseCounter after ${timeout} ms.`);
            }, timeout);
        }

        for(let promise of promises) {
            promise.then(
                () => {
                    self.onResolve();
                }, (err) => {
                    self.onError(err);
                });
        }
    }

    /**
     * adds a Promise-Like callback
     */
    public then(resolve: () => any, reject: (err: any) => any) {
        this.listenerAdded = true;
        this.resolve = resolve;
        this.reject = reject;

        this.checkDone();
    }

    public onResolve() {
        this.count++;
        this.checkDone();
    }

    public onError(err: any) {
        if(!err) this.error = new Error("Undefined error in PromiseCounter.");
        else this.error = err;
        this.checkDone();
    }

    public checkDone() {
        if(this.done || !this.listenerAdded) return; // only finalize once
        if(this.error) {
            this.done = true;
            if(this.reject) this.reject(this.error);
        }
        else if(this.count === this.expected) {
            this.done = true;
            if(this.resolve) this.resolve();
        }
    }
}

export default PromiseCounter;
