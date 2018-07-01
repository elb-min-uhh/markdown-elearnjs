"use strict";

import assert from 'assert';
import * as fs from "fs";
import path from 'path';
import rimraf from 'rimraf';
import { ExtensionManager } from '../main';
import PromiseCounter from '../util/PromiseCounter';
import AssertExtensions from './helpers/assertExtensions';

const pathToTestAssets = '../../testAssets/';
const pathToAssets = '../../assets/elearnjs/';


describe('Extension Manager', () => {
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
            throw err;
        });
    });

    // basic body only test
    it('should export selected assets correctly', (done) => {

        // create output folder
        fs.mkdirSync(path.join(__dirname, pathToTestAssets, "export"));

        // export assets
        ExtensionManager.exportAssets(
            path.join(__dirname, pathToTestAssets, "export"), {
                includeQuiz: true,
                includeClickImage: true,
            }).then(() => {
                AssertExtensions.assertFilesEqual(
                    path.join(__dirname, pathToTestAssets, "export", "assets", "js", "elearn.js"),
                    path.join(__dirname, pathToAssets, "assets", "js", "elearn.js"));
                AssertExtensions.assertFilesEqual(
                    path.join(__dirname, pathToTestAssets, "export", "assets", "js", "quiz.js"),
                    path.join(__dirname, pathToAssets, "extensions", "quiz", "assets", "js", "quiz.js"));

                assert.ok(!fs.existsSync(path.join(__dirname, pathToTestAssets, "export", "assets", "js", "elearnvideo.js")));

                AssertExtensions.assertFilesEqual(
                    path.join(__dirname, pathToTestAssets, "export", "assets", "js", "clickimage.js"),
                    path.join(__dirname, pathToAssets, "extensions", "clickimage", "assets", "js", "clickimage.js"));

                assert.ok(!fs.existsSync(path.join(__dirname, pathToTestAssets, "export", "assets", "js", "timeslider.js")));

                AssertExtensions.assertFilesEqual(
                    path.join(__dirname, pathToTestAssets, "export", "assets", "font", "eLearn-Icons.woff"),
                    path.join(__dirname, pathToAssets, "assets", "font", "eLearn-Icons.woff"));
                done();
            }, (err) => {
                assert.fail(err);
                done();
            });
    });
});
