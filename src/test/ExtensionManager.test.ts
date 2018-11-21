"use strict";

import assert from 'assert';
import * as fs from "fs";
import path from 'path';
import rimraf from 'rimraf';
import { ExtensionManager, ExtensionObject, HtmlConverter, PdfConverter } from '../main';
import { PromiseCounter } from '../util/PromiseCounter';
import AssertExtensions from './helpers/AssertExtensions';

const pathToTestAssets = '../../testAssets/';
const pathToAssets = '../../assets/elearnjs/';


describe('Extension Manager', () => {
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

    // basic body only test
    it('export assets without extension correctly', (done) => {

        // create output folder
        fs.mkdirSync(path.join(__dirname, pathToTestAssets, "export"));

        // export assets
        ExtensionManager.exportAssets(
            path.join(__dirname, pathToTestAssets, "export"), {}).then(() => {
                AssertExtensions.assertFilesEqual(
                    path.join(__dirname, pathToTestAssets, "export", "assets", "js", "elearn.js"),
                    path.join(__dirname, pathToAssets, "assets", "js", "elearn.js"));

                assert.ok(!fs.existsSync(path.join(__dirname, pathToTestAssets, "export", "assets", "js", "quiz.js")));
                assert.ok(!fs.existsSync(path.join(__dirname, pathToTestAssets, "export", "assets", "js", "elearnvideo.js")));
                assert.ok(!fs.existsSync(path.join(__dirname, pathToTestAssets, "export", "assets", "js", "clickimage.js")));
                assert.ok(!fs.existsSync(path.join(__dirname, pathToTestAssets, "export", "assets", "js", "timeslider.js")));

                AssertExtensions.assertFilesEqual(
                    path.join(__dirname, pathToTestAssets, "export", "assets", "font", "eLearn-Icons.woff"),
                    path.join(__dirname, pathToAssets, "assets", "font", "eLearn-Icons.woff"));
                done();
            }, (err) => {
                done(err);
            });
    });

    // basic body only test
    it('exports selected assets correctly', async () => {

        // create output folder
        fs.mkdirSync(path.join(__dirname, pathToTestAssets, "export"));

        // export assets
        await ExtensionManager.exportAssets(
            path.join(__dirname, pathToTestAssets, "export"), {
                includeQuiz: true,
                includeClickImage: true,
            });

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

        AssertExtensions.assertFilesEqual(
            path.join(__dirname, pathToTestAssets, "export", "assets", "lang", "elearnjs-en.js"),
            path.join(__dirname, pathToAssets, "assets", "lang", "elearnjs-en.js"));
    });

    // basic body only test
    it('exports all assets correctly', async () => {

        // create output folder
        fs.mkdirSync(path.join(__dirname, pathToTestAssets, "export"));

        // export assets
        await ExtensionManager.exportAssets(
            path.join(__dirname, pathToTestAssets, "export"), {
                includeQuiz: true,
                includeElearnVideo: true,
                includeClickImage: true,
                includeTimeSlider: true,
            });

        AssertExtensions.assertFilesEqual(
            path.join(__dirname, pathToTestAssets, "export", "assets", "js", "elearn.js"),
            path.join(__dirname, pathToAssets, "assets", "js", "elearn.js"));
        AssertExtensions.assertFilesEqual(
            path.join(__dirname, pathToTestAssets, "export", "assets", "js", "quiz.js"),
            path.join(__dirname, pathToAssets, "extensions", "quiz", "assets", "js", "quiz.js"));
        AssertExtensions.assertFilesEqual(
            path.join(__dirname, pathToTestAssets, "export", "assets", "css", "quiz.css"),
            path.join(__dirname, pathToAssets, "extensions", "quiz", "assets", "css", "quiz.css"));

        AssertExtensions.assertFilesEqual(
            path.join(__dirname, pathToTestAssets, "export", "assets", "js", "elearnvideo.js"),
            path.join(__dirname, pathToAssets, "extensions", "elearnvideo", "assets", "js", "elearnvideo.js"));
        AssertExtensions.assertFilesEqual(
            path.join(__dirname, pathToTestAssets, "export", "assets", "css", "elearnvideo.css"),
            path.join(__dirname, pathToAssets, "extensions", "elearnvideo", "assets", "css", "elearnvideo.css"));
        AssertExtensions.assertFilesEqual(
            path.join(__dirname, pathToTestAssets, "export", "assets", "font", "eLearn-Video.ttf"),
            path.join(__dirname, pathToAssets, "extensions", "elearnvideo", "assets", "font", "eLearn-Video.ttf"));
        AssertExtensions.assertFilesEqual(
            path.join(__dirname, pathToTestAssets, "export", "assets", "font", "eLearn-Video.woff"),
            path.join(__dirname, pathToAssets, "extensions", "elearnvideo", "assets", "font", "eLearn-Video.woff"));

        AssertExtensions.assertFilesEqual(
            path.join(__dirname, pathToTestAssets, "export", "assets", "js", "clickimage.js"),
            path.join(__dirname, pathToAssets, "extensions", "clickimage", "assets", "js", "clickimage.js"));
        AssertExtensions.assertFilesEqual(
            path.join(__dirname, pathToTestAssets, "export", "assets", "css", "clickimage.css"),
            path.join(__dirname, pathToAssets, "extensions", "clickimage", "assets", "css", "clickimage.css"));

        AssertExtensions.assertFilesEqual(
            path.join(__dirname, pathToTestAssets, "export", "assets", "js", "timeslider.js"),
            path.join(__dirname, pathToAssets, "extensions", "timeslider", "assets", "js", "timeslider.js"));
        AssertExtensions.assertFilesEqual(
            path.join(__dirname, pathToTestAssets, "export", "assets", "css", "timeslider.css"),
            path.join(__dirname, pathToAssets, "extensions", "timeslider", "assets", "css", "timeslider.css"));

        AssertExtensions.assertFilesEqual(
            path.join(__dirname, pathToTestAssets, "export", "assets", "font", "eLearn-Icons.woff"),
            path.join(__dirname, pathToAssets, "assets", "font", "eLearn-Icons.woff"));

        AssertExtensions.assertFilesEqual(
            path.join(__dirname, pathToTestAssets, "export", "assets", "lang", "elearnjs-en.js"),
            path.join(__dirname, pathToAssets, "assets", "lang", "elearnjs-en.js"));
        AssertExtensions.assertFilesEqual(
            path.join(__dirname, pathToTestAssets, "export", "assets", "lang", "elearnjs-de.js"),
            path.join(__dirname, pathToAssets, "assets", "lang", "elearnjs-de.js"));
    });

    it('detects no extensions in basic html', () => {
        let html = `<h1>This is basic HTML without any extension</h1>`;

        let extensionObject = ExtensionManager.scanHtmlForAll(html);
        assert.deepEqual(extensionObject, new ExtensionObject({
            includeClickImage: false,
            includeElearnVideo: false,
            includeQuiz: false,
            includeTimeSlider: false,
        }));
    });

    it('detects all extensions in markdown', (done) => {
        let inBuf = fs.readFileSync(
            path.join(__dirname, pathToTestAssets, `inputFiles/testTemplateExample.md`),
            { encoding: 'utf8' });
        let data = inBuf.toString();

        ExtensionManager.scanMarkdownForAll(data).then((extensionObject) => {
            assert.deepEqual(extensionObject, new ExtensionObject({
                includeClickImage: true,
                includeElearnVideo: true,
                includeQuiz: true,
                includeTimeSlider: true,
            }));
            done();
        });
    });

    it('detects all extensions in markdown with given HtmlConverter', (done) => {
        let inBuf = fs.readFileSync(
            path.join(__dirname, pathToTestAssets, `inputFiles/testTemplateExample.md`),
            { encoding: 'utf8' });
        let data = inBuf.toString();

        let htmlConverter = new HtmlConverter();

        ExtensionManager.scanMarkdownForAll(data, htmlConverter).then((extensionObject) => {
            assert.deepEqual(extensionObject, new ExtensionObject({
                includeClickImage: true,
                includeElearnVideo: true,
                includeQuiz: true,
                includeTimeSlider: true,
            }));
            done();
        });
    });

    it('detects all extensions in markdown with given PdfConverter', (done) => {
        let inBuf = fs.readFileSync(
            path.join(__dirname, pathToTestAssets, `inputFiles/testTemplateExample.md`),
            { encoding: 'utf8' });
        let data = inBuf.toString();

        let pdfConverter = new PdfConverter();

        ExtensionManager.scanMarkdownForAll(data, pdfConverter).then((extensionObject) => {
            assert.deepEqual(extensionObject, new ExtensionObject({
                includeClickImage: true,
                includeElearnVideo: true,
                includeQuiz: true,
                includeTimeSlider: true,
            }));
            done();
        });
    });
});
