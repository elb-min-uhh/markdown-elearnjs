"use strict";

import assert from 'assert';
import * as fs from "fs";
import path from 'path';
import rimraf from 'rimraf';
import FileMoveObject from '../FileMoveObject';
import { FileExtractor } from '../main';
import PromiseCounter from '../util/PromiseCounter';

const pathToTestAssets = '../../testAssets/';

describe("FileExtractor", () => {

    afterEach(async () => {
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

        await new PromiseCounter(promises, 15000);
    });

    describe("Positive Tests", () => {

        it("extracts an absolute filepath correctly", (done) => {

            fs.mkdirSync(path.join(__dirname, pathToTestAssets, "export"));

            let inputPath = path.join(__dirname, pathToTestAssets, `resultFiles/testTemplateExample.pdf`);
            assert.ok(path.isAbsolute(inputPath));

            let objects: FileMoveObject[] = [];

            // copy to itself, should be ignored
            objects.push(new FileMoveObject(
                inputPath,
                path.join("export", `testTemplateExample.pdf`)));

            FileExtractor.extractAll(objects, __dirname, path.join(__dirname, pathToTestAssets), 15000).then(() => {
                try {
                    assert.ok(fs.existsSync(path.join(__dirname, pathToTestAssets, "export", `testTemplateExample.pdf`)));
                } catch(err) {
                    return done(err);
                }

                done();
            }, (err) => {
                done(err);
            });
        }).timeout(20000);

        it("extracts all types correctly from html", () => {
            let img = `<img src="img1"/>
                        <img style="" src="img2" alt="text"/>`;
            let source = `<source src="vid1"/>
                        <img style="" src="vid2" alt="text"/>`;
            let script = `<script src="scr1"></script>
                        <script style="" src="scr2" alt="text"></script>`;
            let link = `<link href="lnk1"/>
                        <link style="" href="lnk2" alt="text"/>`;

            let html = `${img}${source}${script}${link}`;

            // actual replacement
            let feo = FileExtractor.replaceAllLinks(html);

            let htmlExpected = html.replace(/img1/, "assets/img/img1")
                .replace(/img2/, "assets/img/img2")
                .replace(/vid1/, "assets/img/vid1")
                .replace(/vid2/, "assets/img/vid2")
                .replace(/scr1/, "assets/js/scr1")
                .replace(/scr2/, "assets/js/scr2")
                .replace(/lnk1/, "assets/css/lnk1")
                .replace(/lnk2/, "assets/css/lnk2");

            assert.equal(feo.html, htmlExpected);

            let filesExpected: FileMoveObject[] = [];
            filesExpected.push(new FileMoveObject("img1", "assets/img/img1"));
            filesExpected.push(new FileMoveObject("img2", "assets/img/img2"));
            filesExpected.push(new FileMoveObject("vid1", "assets/img/vid1"));
            filesExpected.push(new FileMoveObject("vid2", "assets/img/vid2"));
            filesExpected.push(new FileMoveObject("scr1", "assets/js/scr1"));
            filesExpected.push(new FileMoveObject("scr2", "assets/js/scr2"));
            filesExpected.push(new FileMoveObject("lnk1", "assets/css/lnk1"));
            filesExpected.push(new FileMoveObject("lnk2", "assets/css/lnk2"));

            feo.files = feo.files.sort((a, b) => (a.inputPath.localeCompare(b.inputPath)));
            filesExpected = filesExpected.sort((a, b) => (a.inputPath.localeCompare(b.inputPath)));

            assert.deepEqual(feo.files, filesExpected);
        });

    });

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
