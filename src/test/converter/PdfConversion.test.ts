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

    let pdfConverter: PdfConverter;

    before(() => {
        pdfConverter = new PdfConverter();
    });

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

    describe('With small example codes', () => {

        // basic body only test
        it('should create a valid pdf body', (done) => {
            let html = pdfConverter.toHtml(exampleMeta + "\n" + exampleImprint + "\n" + exampleMarkdown, { bodyOnly: true });
            html.then((text) => {
                text = PostProcessing.removeAbsolutePaths(text, path.join(__dirname, pathToTestAssets, `resultFiles`));
                AssertExtensions.assertTextFileEqual(text, path.join(__dirname, pathToTestAssets, `resultFiles/testToPdfBody.html`))
                    .then(() => {
                        done();
                    }, (err) => {
                        done(err);
                    });
            }, (err) => {
                done(err);
            });
        });

        // basic body only test with toPdfHtml
        it('should create a valid pdf body with toPdfHtml', (done) => {
            let html = pdfConverter.toPdfHtml(exampleMeta + "\n" + exampleImprint + "\n" + exampleMarkdown, { bodyOnly: true });
            html.then((text) => {
                text = PostProcessing.removeAbsolutePaths(text, path.join(__dirname, pathToTestAssets, `resultFiles`));
                AssertExtensions.assertTextFileEqual(text, path.join(__dirname, pathToTestAssets, `resultFiles/testToPdfBody.html`))
                    .then(() => {
                        done();
                    }, (err) => {
                        done(err);
                    });
            }, (err) => {
                done(err);
            });
        });

        // basic full document test
        it('should create a valid pdf document without autodetection', (done) => {
            let html = pdfConverter.toHtml(exampleMeta + "\n" + exampleImprint + "\n" + exampleMarkdown, {
                language: "de",
            });
            html.then((text) => {
                text = PostProcessing.removeAbsolutePaths(text, path.join(__dirname, pathToTestAssets, `resultFiles`));
                AssertExtensions.assertTextFileEqual(text, path.join(__dirname, pathToTestAssets, `resultFiles/testToPdfFull.html`))
                    .then(() => {
                        done();
                    }, (err) => {
                        done(err);
                    });
            }, (err) => {
                done(err);
            });
        });

        // basic full document test
        it('should create a valid pdf document', (done) => {
            let html = pdfConverter.toHtml(exampleMeta + "\n" + exampleImprint + "\n" + exampleMarkdown, {
                automaticExtensionDetection: true,
                language: "de",
                includeQuiz: false,
                includeElearnVideo: false,
                includeClickImage: false,
                includeTimeSlider: false,
            });
            html.then((text) => {
                text = PostProcessing.removeAbsolutePaths(text, path.join(__dirname, pathToTestAssets, `resultFiles`));
                AssertExtensions.assertTextFileEqual(text, path.join(__dirname, pathToTestAssets, `resultFiles/testToPdfFull.html`))
                    .then(() => {
                        done();
                    }, (err) => {
                        done(err);
                    });
            }, (err) => {
                done(err);
            });
        });


        // basic full document test with english language selection
        it('should create a valid pdf document with english language', (done) => {
            let html = pdfConverter.toHtml(exampleMeta + "\n" + exampleImprint + "\n" + exampleMarkdown, {
                automaticExtensionDetection: true,
                language: "en",
                includeQuiz: false,
                includeElearnVideo: false,
                includeClickImage: false,
                includeTimeSlider: false,
            });
            html.then((text) => {
                text = PostProcessing.removeAbsolutePaths(text, path.join(__dirname, pathToTestAssets, `resultFiles`));
                AssertExtensions.assertTextFileEqual(text, path.join(__dirname, pathToTestAssets, `resultFiles/testToPdfFullEnglish.html`))
                    .then(() => {
                        done();
                    }, (err) => {
                        done(err);
                    });
            }, (err) => {
                done(err);
            });
        });

        it('creates the correct document with extensions from template', (done) => {
            fs.readFile(path.join(__dirname, pathToTestAssets, `inputFiles/testTemplateExample.md`), 'utf8', (error, data) => {
                if(error) {
                    done(error);
                    return;
                }
                pdfConverter.toHtml(data, {
                    language: "de",
                    automaticExtensionDetection: true,
                }).then((text) => {
                    text = PostProcessing.removeAbsolutePaths(text, path.join(__dirname, pathToTestAssets, `resultFiles`));
                    AssertExtensions.assertTextFileEqual(text, path.join(__dirname, pathToTestAssets, `resultFiles/testTemplateExamplePdf.html`))
                        .then(() => {
                            done();
                        }, (err) => {
                            done(err);
                        });
                }, (err) => {
                    done(err);
                });
            });
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
                // has to be set to false in the end, so the process stops
                pdfConverter.setOption("keepChromeAlive", true);
            }

            if(puppeteerAvailable) {
                console.log("Found available puppeteer config:", selectedOptions);
            }
        });

        after(() => {
            // close chromium
            pdfConverter.setOption("keepChromeAlive", false);
        });

        beforeEach(() => {
            // reset default options before every test
            if(puppeteerAvailable) {
                pdfConverter.setOption("puppeteerOptions", puppeteerOptions);
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

            try {
                // set tested working config
                pdfConverter.setOption("puppeteerOptions", puppeteerOptions);
                await assert.doesNotReject(pdfConverter.toBuffer(exampleMarkdown, path.join(__dirname, pathToTestAssets, `inputFiles`)));

                // try definetely wrong config
                pdfConverter.setOption("puppeteerOptions", corruptConfig);
                await assert.rejects(pdfConverter.toBuffer(exampleMarkdown, path.join(__dirname, pathToTestAssets, `inputFiles`)));

                // try tested working config again, check reset
                pdfConverter.setOption("puppeteerOptions", puppeteerOptions);
                await assert.doesNotReject(pdfConverter.toBuffer(exampleMarkdown, path.join(__dirname, pathToTestAssets, `inputFiles`)));
            } catch(err) {
                return err;
            }

            return;
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

            // multiple starts should create multiple local instances
            // might corrupt if global instance is not used correctly
            let p1 = newPdfConverter.toBuffer(exampleMarkdown, path.join(__dirname, pathToTestAssets, `inputFiles`));
            let p2 = newPdfConverter.toBuffer(exampleMarkdown, path.join(__dirname, pathToTestAssets, `inputFiles`));
            let p3 = newPdfConverter.toBuffer(exampleMarkdown, path.join(__dirname, pathToTestAssets, `inputFiles`));

            await assert.doesNotReject(p1);
            await assert.doesNotReject(p2);
            await assert.doesNotReject(p3);

            // assert one global instance is set. others are destroyed.

            // multiple starts should use global instance
            // might corrupt if global instance is not used correctly
            p1 = newPdfConverter.toBuffer(exampleMarkdown, path.join(__dirname, pathToTestAssets, `inputFiles`));
            p2 = newPdfConverter.toBuffer(exampleMarkdown, path.join(__dirname, pathToTestAssets, `inputFiles`));
            p3 = newPdfConverter.toBuffer(exampleMarkdown, path.join(__dirname, pathToTestAssets, `inputFiles`));

            await assert.doesNotReject(p1);
            await assert.doesNotReject(p2);
            await assert.doesNotReject(p3);

            // close instance
            newPdfConverter.setOption("keepChromeAlive", false);
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

            // multiple starts should use global instance
            // might corrupt if global instance is not used correctly
            let p1 = newPdfConverter.toBuffer(exampleMarkdown, path.join(__dirname, pathToTestAssets, `inputFiles`), { renderDelay: 2000 });
            let p2 = newPdfConverter.toBuffer(exampleMarkdown, path.join(__dirname, pathToTestAssets, `inputFiles`), { renderDelay: 2000 });
            let p3 = newPdfConverter.toBuffer(exampleMarkdown, path.join(__dirname, pathToTestAssets, `inputFiles`), { renderDelay: 2000 });

            // wait until processes are most likely started
            // should be deactivated while the render delay is active
            setTimeout(() => {
                newPdfConverter.setOption("keepChromeAlive", false);
            }, 1000);

            await assert.doesNotReject(p1);
            await assert.doesNotReject(p2);
            await assert.doesNotReject(p3);
        }).slow(40000).timeout(60000);

        it('should create the correct file', function(done) {
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
            pdfConverter.setOptions({
                headerHeight: "0cm",
            });

            // convert the file
            pdfConverter.toFile(data,
                path.join(__dirname, pathToTestAssets, "export", "out.pdf"),
                path.join(__dirname, pathToTestAssets, `inputFiles`),
                {
                    language: "de",
                    automaticExtensionDetection: true,
                    renderDelay: 5000,
                }).then((filename) => {
                    assert.ok(fs.existsSync(path.join(__dirname, pathToTestAssets, "export", "out.pdf")));
                    done();
                    return;
                }, (err) => {
                    done(err);
                });
        }).slow(40000).timeout(60000);

        it('should not create the file, no path given', function(done) {
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
            assert.rejects(pdfConverter.toFile(data,
                undefined!,
                path.join(__dirname, pathToTestAssets, `inputFiles`),
                {
                    language: "de",
                    automaticExtensionDetection: true,
                    renderDelay: 5000,
                })).then(() => {
                    done();
                }, (err) => {
                    done(err);
                });
        }).slow(40000).timeout(60000);

        it('should not create the file, file exists already', function(done) {
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
            assert.rejects(pdfConverter.toFile(data,
                path.join(__dirname, pathToTestAssets, "export", "dummy"),
                path.join(__dirname, pathToTestAssets, `inputFiles`),
                {
                    language: "de",
                    automaticExtensionDetection: true,
                })).then(() => {
                    done();
                }, (err) => {
                    done(err);
                });
        }).slow(40000).timeout(60000);

        it('should create a buffer', function(done) {
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
            pdfConverter.setOptions({
                headerHeight: "2in",
                footerHeight: "10px",
            });

            // convert the file
            pdfConverter.toBuffer(data,
                path.join(__dirname, pathToTestAssets, `inputFiles`),
                {
                    language: "de",
                    automaticExtensionDetection: true,
                }).then(() => {
                    done();
                    return;
                }, (err) => {
                    done(err);
                });
        }).slow(40000).timeout(60000);

        it('should create a buffer with incorrect footerHeight', function(done) {
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
            pdfConverter.setOptions({
                headerHeight: undefined,
                footerHeight: "10pxls",
            });

            // convert the file
            pdfConverter.toBuffer(data,
                path.join(__dirname, pathToTestAssets, `inputFiles`),
                {
                    language: "de",
                    automaticExtensionDetection: true,
                }).then(() => {
                    done();
                    return;
                }, (err) => {
                    done(err);
                });
        }).slow(40000).timeout(60000);
    });
});
