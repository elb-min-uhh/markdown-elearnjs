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

    });

    describe('with the template', () => {

        let puppeteerAvailable = false;

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
                pdfConverter.setOption("chromePath", selectedOptions.executablePath);
            }

            if(puppeteerAvailable) {
                console.log("Found available puppeteer config:", selectedOptions);
            }
        });

        it('should create the correct document with extensions', (done) => {
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
