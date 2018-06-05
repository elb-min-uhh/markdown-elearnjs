"use strict";

/**
* a PromiseCounter.
* This can be used to wait for multiple promises.
*/
class PromiseCounter {

    // counter and timeout
    count: number;
    expected: number;
    timeout: NodeJS.Timer;

    // listener
    listenerAdded : boolean;
    resolve : () => any;
    reject : (err: any) => any;

    // finish statess
    done: boolean;
    error: Error;

    /**
    * constructor
    *
    * @param promises: Promise[] list of promises to wait for
    * @param timeout (optional): integer, timeout in ms
    */
    constructor(promises: Promise<any>[], timeout?: number) {
        const self = this;

        if(!promises || promises.length == undefined) {
            throw "No promise array given.";
        }

        self.count = 0;
        self.expected = promises.length;

        // add timeout if given
        if(timeout != null) {
            self.timeout = setTimeout(() => {
                self.onError(`Timeout in PromiseCounter after ${timeout} ms.`);
            }, timeout);
        }

        for(var promise of promises) {
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
    then(resolve: () => any, reject: (err: any) => any) {
        this.listenerAdded = true;
        this.resolve = resolve;
        this.reject = reject;

        this.checkDone();
    }

    onResolve() {
        this.count++;
        this.checkDone();
    }

    onError(err: any) {
        if(!err) this.error = new Error("Undefined error in PromiseCounter.");
        else this.error = err;
        this.checkDone();
    }

    checkDone() {
        if(this.done || !this.listenerAdded) return; // only finalize once
        if(this.error) {
            this.done = true;
            this.reject(this.error);
        }
        else if(this.count === this.expected) {
            this.done = true;
            this.resolve();
        }
    }
}

export default PromiseCounter;
