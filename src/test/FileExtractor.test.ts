"use strict";

import assert from 'assert';
import * as fs from "fs";
import path from 'path';
import rimraf from 'rimraf';
import FileMoveObject from '../FileMoveObject';
import { FileExtractor } from '../main';
import PromiseCounter from '../util/PromiseCounter';

const pathToTestAssets = '../../testAssets/';

afterEach((done) => {
    let promises: Promise<any>[] = [];

    // remove all folders that might have been created
    let foldersToRemove = ["export"];

    foldersToRemove.forEach((folder) => {
        let promise = new Promise((res, rej) => {
            rimraf(path.join(__dirname, pathToTestAssets, folder), (err) => {
                if(err) rej(err);
                else res();
            });
        });
        promises.push(promise);
    });

    new PromiseCounter(promises, 15000).then(() => {
        done();
    }, (err) => {
        done(err);
    });
});

describe("FileExtractor", () => {

    describe("Negative Tests", () => {

        it("should extract files containg corrupt links", (done) => {

            fs.mkdirSync(path.join(__dirname, pathToTestAssets, "export"));

            let objects: FileMoveObject[] = [];

            // copy to itself, should be ignored
            objects.push(new FileMoveObject(
                path.join(pathToTestAssets, `resultFiles/testTemplateExample.pdf`),
                path.join(`resultFiles/testTemplateExample.pdf`)));

            // not existent
            objects.push(new FileMoveObject(
                path.join(pathToTestAssets, `notexistent.in`),
                path.join("export", "notexistent.out")));

            // invalid file
            objects.push(new FileMoveObject(
                path.join(pathToTestAssets, `notexistent.in`),
                undefined!));

            FileExtractor.extractAll(objects, __dirname, path.join(__dirname, pathToTestAssets), 15000).then(() => {
                try {
                    assert.ok(fs.existsSync(path.join(__dirname, pathToTestAssets, `resultFiles/testTemplateExample.pdf`)));
                    assert.ok(!fs.existsSync(path.join(__dirname, pathToTestAssets, `notexistent.in`)));
                    assert.ok(!fs.existsSync(path.join(__dirname, `resultFiles`, "export", "notexistent.out")));
                } catch(err) {
                    return done(err);
                }

                done();
            }, (err) => {
                done(err);
            });
        }).timeout(20000);

    });

});
