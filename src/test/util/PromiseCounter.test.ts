"use strict";

import assert from 'assert';
import PromiseCounter from '../../util/PromiseCounter';

function createPromises(count: number, resolving: boolean, timeoutMin: number, timeoutMax: number) {
    let timeoutBase = timeoutMin ? timeoutMin : 0;
    let timeoutStep = 0;
    if(count > 1 && timeoutMax) timeoutStep = (timeoutMax - timeoutBase) / (count - 1);

    let promises = [];

    for(let i = 0; i < count; i++) {
        let promise = new Promise((resolve, reject) => {
            if(resolving) setTimeout(resolve, timeoutBase + (i * timeoutStep));
            else setTimeout(reject, timeoutBase + (i * timeoutStep));
        });
        promises.push(promise);
    }

    return promises;
}

describe("PromiseCounter", () => {

    it('should resolve correctly', (done) => {
        let promises = createPromises(20, true, 0, 2000);

        let counter = new PromiseCounter(promises);
        counter.then(() => {
            done();
        }, (err) => {
            done(err);
        });
    }).slow(8000).timeout(10000);

    it('should reject', (done) => {
        let promises = createPromises(20, false, 0, 2000);

        let counter = new PromiseCounter(promises, 10000);
        counter.then(() => {
            done("Promises not correctly rejected.");
        }, (err) => {
            done();
        });
    }).slow(8000).timeout(10000);

    it('should reject with one timed out', (done) => {
        let timeout = 1250;
        let promises = createPromises(20, true, 0, 1000);

        promises.push(new Promise((resolve, reject) => {
            setTimeout(resolve, 2000);
        }));

        let counter = new PromiseCounter(promises, timeout);
        counter.then(() => {
            done("Promises not correctly rejected.");
        }, (err) => {
            try {
                assert.equal(err, `Timeout in PromiseCounter after ${timeout} ms.`);
            }
            catch(err) {
                return done(err);
            }
            done();
        });
    }).slow(8000).timeout(10000);

    it('should reject with all timed out', (done) => {
        let timeout = 500;
        let promises = createPromises(20, true, 1000, 5000);

        let counter = new PromiseCounter(promises, timeout);
        counter.then(() => {
            done("Promises not correctly rejected.");
        }, (err) => {
            try {
                assert.equal(err, `Timeout in PromiseCounter after ${timeout} ms.`);
            }
            catch(err) {
                return done(err);
            }
            done();
        });
    }).slow(8000).timeout(10000);

    it('should throw an error with no promise array given', () => {
        assert.throws(() => {
            let nothing = new PromiseCounter(undefined!);
            nothing.then(() => {
                assert.fail("Should not get here");
            }, (err) => {
                assert.fail("Should not get here");
            });
        });
    });

    it('should not resolve because of missing listener', (done) => {
        let timeout = 750;
        let promises = createPromises(20, true, 10, 100);

        let counter = new PromiseCounter(promises, timeout);
        counter.then(undefined!, (err) => {
            done(err);
        });

        // expect no done before
        setTimeout(done, 1000);
    }).slow(2000);

    it('should not reject because of missing listener', (done) => {
        let timeout = 750;
        let promises = createPromises(20, false, 10, 100);

        let counter = new PromiseCounter(promises, timeout);
        counter.then(() => {
            done("Resolved even though it should not.");
        }, undefined!);

        // expect no done before
        setTimeout(done, 1000);
    }).slow(2000);

    it('should resolve before a listener is added', (done) => {
        let timeout = 400;
        let promises = createPromises(1, true, 100, 100);

        let counter = new PromiseCounter(promises, timeout);

        setTimeout(() => {
            counter.then(() => {
                done();
            }, (err) => {
                return done(err);
            });
        }, 500);
    }).slow(1000);

});
