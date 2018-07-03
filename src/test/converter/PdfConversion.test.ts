"use strict";

import assert from 'assert';
import * as fs from "fs";
import path from 'path';
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
                assert.ok(text.indexOf(footer) >= 0);
                assert.ok(text.indexOf(header) >= 0);
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
            let html = pdfConverter.toHtml(exampleMeta + "\n" + exampleImprint + "\n" + exampleMarkdown);
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

    });

    describe('with the template', () => {

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

        it('should create the correct file', (done) => {
            let inBuf = fs.readFileSync(
                path.join(__dirname, pathToTestAssets, `inputFiles/testTemplateExample.md`),
                { encoding: 'utf8' });
            let data = inBuf.toString();

            // create output folder
            fs.mkdirSync(path.join(__dirname, pathToTestAssets, "export"));

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
        }).slow(20000).timeout(30000);

        it('should not create the file, no path given', (done) => {
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
        }).slow(20000).timeout(30000);

        it('should not create the file, file exists already', (done) => {
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
        }).slow(20000).timeout(30000);

        it('should create a stream', (done) => {
            let inBuf = fs.readFileSync(
                path.join(__dirname, pathToTestAssets, `inputFiles/testTemplateExample.md`),
                { encoding: 'utf8' });
            let data = inBuf.toString();

            // create output folder
            fs.mkdirSync(path.join(__dirname, pathToTestAssets, "export"));

            // convert the file
            pdfConverter.toStream(data,
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
        }).slow(20000).timeout(30000);

        it('should create a buffer', (done) => {
            let inBuf = fs.readFileSync(
                path.join(__dirname, pathToTestAssets, `inputFiles/testTemplateExample.md`),
                { encoding: 'utf8' });
            let data = inBuf.toString();

            // create output folder
            fs.mkdirSync(path.join(__dirname, pathToTestAssets, "export"));

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
        }).slow(20000).timeout(30000);
    });
});
