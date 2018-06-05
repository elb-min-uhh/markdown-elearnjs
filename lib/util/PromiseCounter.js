"use strict";
exports.__esModule = true;
/**
* a PromiseCounter.
* This can be used to wait for multiple promises.
*/
var PromiseCounter = /** @class */ (function () {
    /**
    * constructor
    *
    * @param promises: Promise[] list of promises to wait for
    * @param timeout (optional): integer, timeout in ms
    */
    function PromiseCounter(promises, timeout) {
        var self = this;
        if (!promises || promises.length == undefined) {
            throw "No promise array given.";
        }
        self.count = 0;
        self.expected = promises.length;
        // add timeout if given
        if (timeout != null) {
            self.timeout = setTimeout(function () {
                self.onError("Timeout in PromiseCounter after " + timeout + " ms.");
            }, timeout);
        }
        for (var _i = 0, promises_1 = promises; _i < promises_1.length; _i++) {
            var promise = promises_1[_i];
            promise.then(function () {
                self.onResolve();
            }, function (err) {
                self.onError(err);
            });
        }
    }
    /**
    * adds a Promise-Like callback
    */
    PromiseCounter.prototype.then = function (resolve, reject) {
        this.listenerAdded = true;
        this.resolve = resolve;
        this.reject = reject;
        this.checkDone();
    };
    PromiseCounter.prototype.onResolve = function () {
        this.count++;
        this.checkDone();
    };
    PromiseCounter.prototype.onError = function (err) {
        if (!err)
            this.error = new Error("Undefined error in PromiseCounter.");
        else
            this.error = err;
        this.checkDone();
    };
    PromiseCounter.prototype.checkDone = function () {
        if (this.done || !this.listenerAdded)
            return; // only finalize once
        if (this.error) {
            this.done = true;
            this.reject(this.error);
        }
        else if (this.count === this.expected) {
            this.done = true;
            this.resolve();
        }
    };
    return PromiseCounter;
}());
exports["default"] = PromiseCounter;
//# sourceMappingURL=PromiseCounter.js.map