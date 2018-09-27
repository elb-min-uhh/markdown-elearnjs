"use strict";

import assert from 'assert';
import * as fs from "fs";
import path from 'path';
import Puppeteer from 'puppeteer';
import rimraf from 'rimraf';
import { PdfConverter } from '../../main';
import PromiseCounter from '../../util/PromiseCounter';
import AssertExtensions from '../helpers/AssertExtensions';
import PostProcessing from '../helpers/PostProcessing';

const pathToTestAssets = '../../../testAssets/';
const pathToAssets = '../../../assets/elearnjs/';

const exampleMarkdown =
    `# This is simple example markdown.

We will insert an image here ![Image](withSomeLink.jpg).`;

const exampleMeta =
    `<!--meta
    Title: Test
    Custom: "<script src='someSource.js'></script>"
-->`;

const exampleImprint =
    `<!--imprint
    #### elearn.js Template
    Universität Hamburg
-->`;

describe('PDF Converter Setup', () => {

    it('creates a PdfConverter with default settings', () => {

        let conv = new PdfConverter();

        // assert defaults are set
        assert.equal(conv.getOption("newSectionOnHeading"), true);
        assert.equal(conv.getOption("headingDepth"), 3);
        assert.equal(conv.getOption("useSubSections"), true);
        assert.equal(conv.getOption("subSectionLevel"), 3);
        assert.equal(conv.getOption("subsubSectionLevel"), 4);

        assert.equal(conv.getOption("newPageOnSection"), true);
        assert.equal(conv.getOption("contentZoom"), 1);
        assert.equal(conv.getOption("customHeader"), undefined);
        assert.equal(conv.getOption("customFooter"), undefined);
        assert.equal(conv.getOption("headerHeight"), "0");
        assert.equal(conv.getOption("footerHeight"), "17mm");
        assert.equal(conv.getOption("customStyleFile"), undefined);
        assert.equal(conv.getOption("chromePath"), undefined);
        assert.equal(conv.getOption("puppeteerOptions"), undefined);
        assert.equal(conv.getOption("keepChromeAlive"), false);
    });

    it('should create an PdfConverter with correct settings', () => {
        let conv = new PdfConverter({
            headingDepth: 2,
            newSectionOnHeading: false,
            useSubSections: false,
            subSectionLevel: 4,
            subsubSectionLevel: 5,

            contentZoom: 2,
            customFooter: "testfooter",
            customHeader: "testheader",
            // keep default footer
            headerHeight: "20mm",
            customStyleFile: "somefile",
            newPageOnSection: false,
            // keep default chromePath
            // keep default puppeteerOptions
            // keep default keepChromeAlive
        });

        assert.equal(conv.getOption("headingDepth"), 2);
        assert.equal(conv.getOption("newSectionOnHeading"), false);
        assert.equal(conv.getOption("useSubSections"), false);
        assert.equal(conv.getOption("subSectionLevel"), 4);
        assert.equal(conv.getOption("subsubSectionLevel"), 5);

        assert.equal(conv.getOption("contentZoom"), 2);
        assert.equal(conv.getOption("customFooter"), "testfooter");
        assert.equal(conv.getOption("customHeader"), "testheader");
        assert.equal(conv.getOption("footerHeight"), "17mm");
        assert.equal(conv.getOption("headerHeight"), "20mm");
        assert.equal(conv.getOption("customStyleFile"), "somefile");
        assert.equal(conv.getOption("newPageOnSection"), false);
        assert.equal(conv.getOption("chromePath"), undefined);
        assert.equal(conv.getOption("puppeteerOptions"), undefined);
        assert.equal(conv.getOption("keepChromeAlive"), false);
    });

    it('should update settings in PdfConverter', () => {
        let conv = new PdfConverter();

        conv.setOptions({
            headingDepth: 2,
            newSectionOnHeading: false,
            useSubSections: false,
            subSectionLevel: 4,
            subsubSectionLevel: 5,

            contentZoom: 2,
            customFooter: "testfooter",
            customHeader: "testheader",
            footerHeight: "20mm",
            headerHeight: "20mm",
            customStyleFile: "somefile",
            newPageOnSection: false,
        });

        assert.equal(conv.getOption("headingDepth"), 2);
        assert.equal(conv.getOption("newSectionOnHeading"), false);
        assert.equal(conv.getOption("useSubSections"), false);
        assert.equal(conv.getOption("subSectionLevel"), 4);
        assert.equal(conv.getOption("subsubSectionLevel"), 5);

        assert.equal(conv.getOption("contentZoom"), 2);
        assert.equal(conv.getOption("customFooter"), "testfooter");
        assert.equal(conv.getOption("customHeader"), "testheader");
        assert.equal(conv.getOption("footerHeight"), "20mm");
        assert.equal(conv.getOption("headerHeight"), "20mm");
        assert.equal(conv.getOption("customStyleFile"), "somefile");
        assert.equal(conv.getOption("newPageOnSection"), false);

        // update only one setting
        conv.setOptions({
            contentZoom: 1.5,
        });

        assert.equal(conv.getOption("headingDepth"), 2);
        assert.equal(conv.getOption("newSectionOnHeading"), false);
        assert.equal(conv.getOption("useSubSections"), false);
        assert.equal(conv.getOption("subSectionLevel"), 4);
        assert.equal(conv.getOption("subsubSectionLevel"), 5);

        assert.equal(conv.getOption("contentZoom"), 1.5);
        assert.equal(conv.getOption("customFooter"), "testfooter");
        assert.equal(conv.getOption("customHeader"), "testheader");
        assert.equal(conv.getOption("footerHeight"), "20mm");
        assert.equal(conv.getOption("headerHeight"), "20mm");
        assert.equal(conv.getOption("customStyleFile"), "somefile");
        assert.equal(conv.getOption("newPageOnSection"), false);
    });

    it('inserts the correct settings', (done) => {
        let footer = `THIS IS THE TEST FOOTER`;
        let header = `THIS IS THE TEST HEADER`;

        let pdfConverter = new PdfConverter({
            customFooter: footer,
            customHeader: header,
            customStyleFile: path.join(__dirname, pathToAssets, "extensions", "quiz", "assets", "css", "quiz.css").replace(/\\/, "/"),
        });

        let html = pdfConverter.toHtml(exampleMeta + "\n" + exampleImprint + "\n" + exampleMarkdown);

        html.then((text) => {
            try {
                assert.ok(text.indexOf('quiz.css') >= 0);
            }
            catch(err) {
                done(err); return;
            }
            done();
        }, (err) => {
            done(err);
        });
    });

});

describe('PDF conversion', () => {

    let pdfConverterKeptAlive: PdfConverter;

    before(() => {
        pdfConverterKeptAlive = new PdfConverter({
            keepChromeAlive: true,
        });
    });

    after(() => {
        // close chromium
        pdfConverterKeptAlive.setOption("keepChromeAlive", false);
    });

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

    describe('With small example codes', () => {

        // basic body only test
        it('should create a valid pdf body', async () => {
            let html = pdfConverterKeptAlive.toHtml(exampleMeta + "\n" + exampleImprint + "\n" + exampleMarkdown, { bodyOnly: true });
            let text = await html;
            text = PostProcessing.removeAbsolutePaths(text, path.join(__dirname, pathToTestAssets, `resultFiles`));
            AssertExtensions.assertTextFileEqual(text, path.join(__dirname, pathToTestAssets, `resultFiles/testToPdfBody.html`));
        });

        // basic body only test with toPdfHtml
        it('should create a valid pdf body with toPdfHtml', async () => {
            let html = pdfConverterKeptAlive.toPdfHtml(exampleMeta + "\n" + exampleImprint + "\n" + exampleMarkdown, { bodyOnly: true });
            let text = await html;
            text = PostProcessing.removeAbsolutePaths(text, path.join(__dirname, pathToTestAssets, `resultFiles`));
            AssertExtensions.assertTextFileEqual(text, path.join(__dirname, pathToTestAssets, `resultFiles/testToPdfBody.html`));
        });

        // basic full document test
        it('should create a valid pdf document without autodetection', async () => {
            let html = pdfConverterKeptAlive.toHtml(exampleMeta + "\n" + exampleImprint + "\n" + exampleMarkdown, {
                language: "de",
            });
            let text = await html;
            text = PostProcessing.removeAbsolutePaths(text, path.join(__dirname, pathToTestAssets, `resultFiles`));
            AssertExtensions.assertTextFileEqual(text, path.join(__dirname, pathToTestAssets, `resultFiles/testToPdfFull.html`));
        });

        // basic full document test
        it('should create a valid pdf document', async () => {
            let html = pdfConverterKeptAlive.toHtml(exampleMeta + "\n" + exampleImprint + "\n" + exampleMarkdown, {
                automaticExtensionDetection: true,
                language: "de",
                includeQuiz: false,
                includeElearnVideo: false,
                includeClickImage: false,
                includeTimeSlider: false,
            });
            let text = await html;
            text = PostProcessing.removeAbsolutePaths(text, path.join(__dirname, pathToTestAssets, `resultFiles`));
            AssertExtensions.assertTextFileEqual(text, path.join(__dirname, pathToTestAssets, `resultFiles/testToPdfFull.html`));
        });


        // basic full document test with english language selection
        it('should create a valid pdf document with english language', async () => {
            let html = pdfConverterKeptAlive.toHtml(exampleMeta + "\n" + exampleImprint + "\n" + exampleMarkdown, {
                automaticExtensionDetection: true,
                language: "en",
                includeQuiz: false,
                includeElearnVideo: false,
                includeClickImage: false,
                includeTimeSlider: false,
            });
            let text = await html;
            text = PostProcessing.removeAbsolutePaths(text, path.join(__dirname, pathToTestAssets, `resultFiles`));
            AssertExtensions.assertTextFileEqual(text, path.join(__dirname, pathToTestAssets, `resultFiles/testToPdfFullEnglish.html`));
        });

        it('creates the correct document with extensions from template', async () => {
            let data = fs.readFileSync(path.join(__dirname, pathToTestAssets, `inputFiles/testTemplateExample.md`), 'utf8');
            let text = await pdfConverterKeptAlive.toHtml(data, {
                language: "de",
                automaticExtensionDetection: true,
            });
            text = PostProcessing.removeAbsolutePaths(text, path.join(__dirname, pathToTestAssets, `resultFiles`));
            AssertExtensions.assertTextFileEqual(text, path.join(__dirname, pathToTestAssets, `resultFiles/testTemplateExamplePdf.html`));
        });

        it('creates the correct document without comments from template', async () => {
            let data = fs.readFileSync(path.join(__dirname, pathToTestAssets, `inputFiles/testTemplateExample.md`), 'utf8');
            let text = await pdfConverterKeptAlive.toHtml(data, {
                language: "de",
                removeComments: true,
            });
            text = PostProcessing.removeAbsolutePaths(text, path.join(__dirname, pathToTestAssets, `resultFiles`));
            AssertExtensions.assertTextFileEqual(text, path.join(__dirname, pathToTestAssets, `resultFiles/testTemplateExamplePdfNoComments.html`));
        });

    });

    describe('with puppeteer', () => {

        let puppeteerAvailable = false;
        let puppeteerOptions: Puppeteer.LaunchOptions;

        before(async function() {
            this.slow(120000);
            this.timeout(240000);

            let optionList = [
                {}, // bundled version
                { executablePath: "chrome" }, // globally available chrome
                { executablePath: "chromium-browser" }, // globally available chromium
            ];

            let selectedOptions;

            // check for all predefined option lists if one of it is possible
            // if so, set pdfConverter accordingly and puppeteerAvailable to true
            for(let options of optionList) {
                try {
                    let browser = await Puppeteer.launch(options);
                    browser.close();
                    selectedOptions = options;
                    break;
                }
                catch(err) {
                    // ignore errors
                }
            }

            if(selectedOptions) {
                puppeteerAvailable = true;
                puppeteerOptions = selectedOptions;
            }

            if(puppeteerAvailable) {
                console.log("Found available puppeteer config:", selectedOptions);
            }
        });

        beforeEach(() => {
            // reset default options before every test
            if(puppeteerAvailable) {
                pdfConverterKeptAlive.setOption("puppeteerOptions", puppeteerOptions);
            }
        });

        it('restarts puppeteer correctly', async function() {
            if(!puppeteerAvailable) {
                console.log("Puppeteer is not available on this device. Skipping this test.");
                this.skip();
            }

            let corruptConfig = {
                executablePath: "-//notexistent",
            };

            // set tested working config
            pdfConverterKeptAlive.setOption("puppeteerOptions", puppeteerOptions);
            await assert.doesNotReject(pdfConverterKeptAlive.toBuffer(exampleMarkdown, path.join(__dirname, pathToTestAssets, `inputFiles`)));
            assert.ok(pdfConverterKeptAlive.hasBrowserInstance());

            // try definitely wrong config
            pdfConverterKeptAlive.setOption("puppeteerOptions", corruptConfig);

            // assert global instance is not set anymore
            assert.ok(!pdfConverterKeptAlive.hasBrowserInstance());
            await assert.rejects(pdfConverterKeptAlive.toBuffer(exampleMarkdown, path.join(__dirname, pathToTestAssets, `inputFiles`)));

            // try tested working config again, check reset
            pdfConverterKeptAlive.setOption("puppeteerOptions", puppeteerOptions);
            await assert.doesNotReject(pdfConverterKeptAlive.toBuffer(exampleMarkdown, path.join(__dirname, pathToTestAssets, `inputFiles`)));
            assert.ok(pdfConverterKeptAlive.hasBrowserInstance());
        }).slow(40000).timeout(60000);

        it('handles multiple parallel calls correctly', async function() {
            if(!puppeteerAvailable) {
                console.log("Puppeteer is not available on this device. Skipping this test.");
                this.skip();
            }

            let newPdfConverter = new PdfConverter({
                puppeteerOptions,
                keepChromeAlive: true,
            });

            assert.ok(!newPdfConverter.hasBrowserInstance());

            // multiple starts should use one global instances
            // might corrupt if global instance is not used correctly
            let p1 = newPdfConverter.toBuffer(exampleMarkdown, path.join(__dirname, pathToTestAssets, `inputFiles`));
            let p2 = newPdfConverter.toBuffer(exampleMarkdown, path.join(__dirname, pathToTestAssets, `inputFiles`));
            let p3 = newPdfConverter.toBuffer(exampleMarkdown, path.join(__dirname, pathToTestAssets, `inputFiles`));

            await assert.doesNotReject(p1);
            await assert.doesNotReject(p2);
            await assert.doesNotReject(p3);

            // assert one global instance is set.
            assert.ok(newPdfConverter.hasBrowserInstance());

            // multiple starts should use global instance
            // might corrupt if global instance is not used correctly
            p1 = newPdfConverter.toBuffer(exampleMarkdown, path.join(__dirname, pathToTestAssets, `inputFiles`));
            p2 = newPdfConverter.toBuffer(exampleMarkdown, path.join(__dirname, pathToTestAssets, `inputFiles`));
            p3 = newPdfConverter.toBuffer(exampleMarkdown, path.join(__dirname, pathToTestAssets, `inputFiles`));

            await assert.doesNotReject(p1);
            await assert.doesNotReject(p2);
            await assert.doesNotReject(p3);

            assert.ok(newPdfConverter.hasBrowserInstance());

            // close instance
            newPdfConverter.setOption("keepChromeAlive", false);
            assert.ok(!newPdfConverter.hasBrowserInstance());
        }).slow(40000).timeout(60000);


        it('handles parallel keepChromeAlive reset correctly', async function() {
            if(!puppeteerAvailable) {
                console.log("Puppeteer is not available on this device. Skipping this test.");
                this.skip();
            }

            let newPdfConverter = new PdfConverter({
                puppeteerOptions,
                keepChromeAlive: true,
            });

            // multiple starts should create multiple local instances
            // might corrupt if global instance is not used correctly
            await newPdfConverter.toBuffer(exampleMarkdown, path.join(__dirname, pathToTestAssets, `inputFiles`));

            // assert one global instance is set.
            assert.ok(newPdfConverter.hasBrowserInstance());

            // multiple starts should use global instance
            // might corrupt if global instance is not used correctly
            let p1 = newPdfConverter.toBuffer(exampleMarkdown, path.join(__dirname, pathToTestAssets, `inputFiles`), { renderDelay: 2000 });
            let p2 = newPdfConverter.toBuffer(exampleMarkdown, path.join(__dirname, pathToTestAssets, `inputFiles`), { renderDelay: 2000 });
            let p3 = newPdfConverter.toBuffer(exampleMarkdown, path.join(__dirname, pathToTestAssets, `inputFiles`), { renderDelay: 2000 });

            // wait until processes are most likely started
            // should be deactivated while the render delay is active
            setTimeout(() => {
                newPdfConverter.setOption("keepChromeAlive", false);
                // browser seems to have been closed already
                assert.ok(!newPdfConverter.hasBrowserInstance());
            }, 1000);

            await assert.doesNotReject(p1);
            await assert.doesNotReject(p2);
            await assert.doesNotReject(p3);

            assert.ok(!newPdfConverter.hasBrowserInstance());
        }).slow(40000).timeout(60000);

        it('restarts after parallel `puppeteerOptions` change', async function() {
            if(!puppeteerAvailable) {
                console.log("Puppeteer is not available on this device. Skipping this test.");
                this.skip();
            }

            let corruptConfig = {
                executablePath: "-//notexistent",
            };

            // set tested working config
            pdfConverterKeptAlive.setOption("puppeteerOptions", puppeteerOptions);
            await assert.doesNotReject(pdfConverterKeptAlive.toBuffer(exampleMarkdown, path.join(__dirname, pathToTestAssets, `inputFiles`)));

            // assert global instance set
            assert.ok(pdfConverterKeptAlive.hasBrowserInstance());

            // start conversion 1
            let p1 = pdfConverterKeptAlive.toBuffer(exampleMarkdown, path.join(__dirname, pathToTestAssets, `inputFiles`), { renderDelay: 5000 });

            // wait one second
            await new Promise((res, rej) => {
                setTimeout(res, 1000);
            });

            // reset config to corrupt one
            pdfConverterKeptAlive.setOption("puppeteerOptions", corruptConfig);
            // browser seems to have been closed already
            assert.ok(!pdfConverterKeptAlive.hasBrowserInstance());

            // try definitely wrong config, before p1 has resolved
            // rejects only if restarted correctly
            let p2 = pdfConverterKeptAlive.toBuffer(exampleMarkdown, path.join(__dirname, pathToTestAssets, `inputFiles`));

            await assert.rejects(p2);
            await assert.doesNotReject(p1);

            // instance should be closed now, due to corrupt restart of p2
            assert.ok(!pdfConverterKeptAlive.hasBrowserInstance());
        }).slow(40000).timeout(60000);

        it('creates multiple local instances without `keepChromeAlive`', async function() {
            if(!puppeteerAvailable) {
                console.log("Puppeteer is not available on this device. Skipping this test.");
                this.skip();
            }

            let newPdfConverter = new PdfConverter({
                puppeteerOptions,
            });

            assert.ok(!newPdfConverter.hasBrowserInstance());

            // multiple starts should use one global instances
            // might corrupt if global instance is not used correctly
            let p1 = newPdfConverter.toBuffer(exampleMarkdown, path.join(__dirname, pathToTestAssets, `inputFiles`));
            let p2 = newPdfConverter.toBuffer(exampleMarkdown, path.join(__dirname, pathToTestAssets, `inputFiles`));

            assert.ok(!newPdfConverter.hasBrowserInstance());

            await assert.doesNotReject(p1);
            await assert.doesNotReject(p2);

            assert.ok(!newPdfConverter.hasBrowserInstance());
        }).slow(40000).timeout(60000);

        it('should create the correct file', async function() {
            if(!puppeteerAvailable) {
                console.log("Puppeteer is not available on this device. Skipping this test.");
                this.skip();
            }

            let inBuf = fs.readFileSync(
                path.join(__dirname, pathToTestAssets, `inputFiles/testTemplateExample.md`),
                { encoding: 'utf8' });
            let data = inBuf.toString();

            // create output folder
            fs.mkdirSync(path.join(__dirname, pathToTestAssets, "export"));

            // set options
            pdfConverterKeptAlive.setOptions({
                headerHeight: "0cm",
            });

            // convert the file
            await pdfConverterKeptAlive.toFile(data,
                path.join(__dirname, pathToTestAssets, "export", "out.pdf"),
                path.join(__dirname, pathToTestAssets, `inputFiles`),
                {
                    language: "de",
                    automaticExtensionDetection: true,
                    renderDelay: 5000,
                });

            assert.ok(fs.existsSync(path.join(__dirname, pathToTestAssets, "export", "out.pdf")));
        }).slow(40000).timeout(60000);

        it('should not create the file, no path given', async function() {
            if(!puppeteerAvailable) {
                console.log("Puppeteer is not available on this device. Skipping this test.");
                this.skip();
            }

            let inBuf = fs.readFileSync(
                path.join(__dirname, pathToTestAssets, `inputFiles/testTemplateExample.md`),
                { encoding: 'utf8' });
            let data = inBuf.toString();

            // create output folder
            fs.mkdirSync(path.join(__dirname, pathToTestAssets, "export"));

            // convert the file
            await assert.rejects(pdfConverterKeptAlive.toFile(data,
                undefined!,
                path.join(__dirname, pathToTestAssets, `inputFiles`),
                {
                    language: "de",
                    automaticExtensionDetection: true,
                    renderDelay: 5000,
                }));
        }).slow(40000).timeout(60000);

        it('should not create the file, file exists already', async function() {
            if(!puppeteerAvailable) {
                console.log("Puppeteer is not available on this device. Skipping this test.");
                this.skip();
            }

            let inBuf = fs.readFileSync(
                path.join(__dirname, pathToTestAssets, `inputFiles/testTemplateExample.md`),
                { encoding: 'utf8' });
            let data = inBuf.toString();

            // create output folder
            fs.mkdirSync(path.join(__dirname, pathToTestAssets, "export"));

            // create dummy
            let file = fs.openSync(path.join(__dirname, pathToTestAssets, "export", "dummy"), "w+");
            fs.closeSync(file);

            // convert the file
            await assert.rejects(pdfConverterKeptAlive.toFile(data,
                path.join(__dirname, pathToTestAssets, "export", "dummy"),
                path.join(__dirname, pathToTestAssets, `inputFiles`),
                {
                    language: "de",
                    automaticExtensionDetection: true,
                }));
        }).slow(40000).timeout(60000);

        it('should create the file, overwrite existing file', async function() {
            if(!puppeteerAvailable) {
                console.log("Puppeteer is not available on this device. Skipping this test.");
                this.skip();
            }

            let inBuf = fs.readFileSync(
                path.join(__dirname, pathToTestAssets, `inputFiles/testTemplateExample.md`),
                { encoding: 'utf8' });
            let data = inBuf.toString();

            // create output folder
            fs.mkdirSync(path.join(__dirname, pathToTestAssets, "export"));

            // create dummy
            let file = fs.openSync(path.join(__dirname, pathToTestAssets, "export", "dummy"), "w+");
            fs.closeSync(file);

            // convert the file
            await assert.doesNotReject(pdfConverterKeptAlive.toFile(data,
                path.join(__dirname, pathToTestAssets, "export", "dummy"),
                path.join(__dirname, pathToTestAssets, `inputFiles`),
                {
                    language: "de",
                    automaticExtensionDetection: true,
                }, true));
        }).slow(40000).timeout(60000);

        it('should create a buffer', async function() {
            if(!puppeteerAvailable) {
                console.log("Puppeteer is not available on this device. Skipping this test.");
                this.skip();
            }

            let inBuf = fs.readFileSync(
                path.join(__dirname, pathToTestAssets, `inputFiles/testTemplateExample.md`),
                { encoding: 'utf8' });
            let data = inBuf.toString();

            // create output folder
            fs.mkdirSync(path.join(__dirname, pathToTestAssets, "export"));

            // set some options
            pdfConverterKeptAlive.setOptions({
                headerHeight: "2in",
                footerHeight: "10px",
            });

            // convert the file
            await pdfConverterKeptAlive.toBuffer(data,
                path.join(__dirname, pathToTestAssets, `inputFiles`),
                {
                    language: "de",
                    automaticExtensionDetection: true,
                });
        }).slow(40000).timeout(60000);

        it('should create a buffer with incorrect footerHeight', async function() {
            if(!puppeteerAvailable) {
                console.log("Puppeteer is not available on this device. Skipping this test.");
                this.skip();
            }

            let inBuf = fs.readFileSync(
                path.join(__dirname, pathToTestAssets, `inputFiles/testTemplateExample.md`),
                { encoding: 'utf8' });
            let data = inBuf.toString();

            // create output folder
            fs.mkdirSync(path.join(__dirname, pathToTestAssets, "export"));

            // set some options
            pdfConverterKeptAlive.setOptions({
                headerHeight: undefined,
                footerHeight: "10pxls",
            });

            // convert the file
            await pdfConverterKeptAlive.toBuffer(data,
                path.join(__dirname, pathToTestAssets, `inputFiles`),
                {
                    language: "de",
                    automaticExtensionDetection: true,
                });
        }).slow(40000).timeout(60000);
    });
});
