"use strict";

import assert from 'assert';
import * as fs from "fs";
import path from 'path';
import rimraf from 'rimraf';
import FileExtractor from '../../FileExtractor';
import { HtmlConverter } from '../../main';
import PromiseCounter from '../../util/PromiseCounter';
import AssertExtensions from '../helpers/AssertExtensions';

const pathToTestAssets = '../../../testAssets/';
const pathToAssets = '../../../assets/elearnjs/';

const exampleMarkdown =
    `# This is simple example markdown.

We will insert an image here ![Image](withSomeLink.jpg).

## Heading 2

### Heading 3`;

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



const exampleMeta2 =
    `---
    Title: Test
    Custom: "<script src='someSource.js'></script>"
---`;

const exampleImprint2 =
    `\`\`\`imprint
    #### elearn.js Template
    Universität Hamburg
\`\`\``;


describe('HTML Converter Setup', () => {

    it('should create an HtmlConverter with correct settings', () => {
        let conv = new HtmlConverter({
            headingDepth: 2,
            newSectionOnHeading: false,
            useSubSections: false,
            subSectionLevel: 4,
            subsubSectionLevel: 5,
        });

        assert.equal(conv.getOption("headingDepth"), 2);
        assert.equal(conv.getOption("newSectionOnHeading"), false);
        assert.equal(conv.getOption("useSubSections"), false);
        assert.equal(conv.getOption("subSectionLevel"), 4);
        assert.equal(conv.getOption("subsubSectionLevel"), 5);
    });

    it('should update settings in HtmlConverter', () => {
        let conv = new HtmlConverter();

        assert.notEqual(conv.getOption("headingDepth"), 2);
        assert.notEqual(conv.getOption("newSectionOnHeading"), false);
        assert.notEqual(conv.getOption("useSubSections"), false);
        assert.notEqual(conv.getOption("subSectionLevel"), 4);
        assert.notEqual(conv.getOption("subsubSectionLevel"), 5);

        conv.setOptions({
            headingDepth: 2,
            newSectionOnHeading: false,
            useSubSections: false,
            subSectionLevel: 4,
            subsubSectionLevel: 5,
        });

        assert.equal(conv.getOption("headingDepth"), 2);
        assert.equal(conv.getOption("newSectionOnHeading"), false);
        assert.equal(conv.getOption("useSubSections"), false);
        assert.equal(conv.getOption("subSectionLevel"), 4);
        assert.equal(conv.getOption("subsubSectionLevel"), 5);

        conv.setOptions({
            subSectionLevel: 3,
        });

        assert.equal(conv.getOption("headingDepth"), 2);
        assert.equal(conv.getOption("newSectionOnHeading"), false);
        assert.equal(conv.getOption("useSubSections"), false);
        assert.equal(conv.getOption("subSectionLevel"), 3);
        assert.equal(conv.getOption("subsubSectionLevel"), 5);
    });

    it('creates correct subsections', (done) => {
        let htmlConverter = new HtmlConverter({
            subSectionLevel: 2,
            subsubSectionLevel: 3,
        });
        let html = htmlConverter.toHtml(exampleMeta + "\n" + exampleImprint + "\n" + exampleMarkdown, { bodyOnly: true });
        html.then((text) => {
            AssertExtensions.assertTextFileEqual(text, path.join(__dirname, pathToTestAssets, `resultFiles/testToHtmlBodySubSub.html`))
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


describe('HTML conversion', () => {

    let htmlConverter: HtmlConverter;

    before(() => {
        htmlConverter = new HtmlConverter();
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
        it('should create a valid html body', (done) => {
            let html = htmlConverter.toHtml(exampleMeta + "\n" + exampleImprint + "\n" + exampleMarkdown, { bodyOnly: true });
            html.then((text) => {
                AssertExtensions.assertTextFileEqual(text, path.join(__dirname, pathToTestAssets, `resultFiles/testToHtmlBody.html`))
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
        it('should create a valid html document', (done) => {
            let html = htmlConverter.toHtml(exampleMeta2 + "\n" + exampleImprint2 + "\n" + exampleMarkdown);
            html.then((text) => {
                AssertExtensions.assertTextFileEqual(text, path.join(__dirname, pathToTestAssets, `resultFiles/testToHtmlFull.html`))
                    .then(() => {
                        done();
                    }, (err) => {
                        done(err);
                    });
            }, (err) => {
                done(err);
            });
        });

        // basic full document with export ready links
        it('should create a valid html doc with updated file links', (done) => {
            htmlConverter.toHtml(exampleMeta + "\n" + exampleImprint + "\n" + exampleMarkdown, {
                automaticExtensionDetection: true,
                includeQuiz: false,
                includeElearnVideo: false,
                includeClickImage: false,
                includeTimeSlider: false,
            }).then((text) => {
                text = FileExtractor.replaceAllLinks(text).html;
                AssertExtensions.assertTextFileEqual(text, path.join(__dirname, pathToTestAssets, `resultFiles/testToHtmlFullExtractFiles.html`))
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

        it('should create the correct document without extensions', (done) => {
            fs.readFile(path.join(__dirname, pathToTestAssets, `inputFiles/testTemplateExample.md`), 'utf8', (error, data) => {
                if(error) {
                    done(error);
                    return;
                }
                htmlConverter.toHtml(data, { language: "de" }).then((text) => {
                    text = FileExtractor.replaceAllLinks(text).html;
                    AssertExtensions.assertTextFileEqual(text, path.join(__dirname, pathToTestAssets, `resultFiles/testTemplateExample.html`))
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

        it('should create the correct document with extensions', (done) => {
            fs.readFile(path.join(__dirname, pathToTestAssets, `inputFiles/testTemplateExample.md`), 'utf8', (error, data) => {
                if(error) {
                    done(error);
                    return;
                }
                htmlConverter.toHtml(data, {
                    language: "de",
                    includeQuiz: true,
                    includeElearnVideo: true,
                    includeClickImage: true,
                    includeTimeSlider: true,
                }).then((text) => {
                    text = FileExtractor.replaceAllLinks(text).html;
                    AssertExtensions.assertTextFileEqual(text, path.join(__dirname, pathToTestAssets, `resultFiles/testTemplateExampleExtensions.html`))
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

        it('should create the correct document with extension detection', (done) => {
            fs.readFile(path.join(__dirname, pathToTestAssets, `inputFiles/testTemplateExample.md`), 'utf8', (error, data) => {
                if(error) {
                    done(error);
                    return;
                }
                htmlConverter.toHtml(data, {
                    language: "de",
                    automaticExtensionDetection: true,
                }).then((text) => {
                    text = FileExtractor.replaceAllLinks(text).html;
                    AssertExtensions.assertTextFileEqual(text, path.join(__dirname, pathToTestAssets, `resultFiles/testTemplateExampleExtensions.html`))
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

        it('should create the correct file with extension export', (done) => {
            let inBuf = fs.readFileSync(
                path.join(__dirname, pathToTestAssets, `inputFiles/testTemplateExample.md`),
                { encoding: 'utf8' });
            let data = inBuf.toString();

            // create output folder
            fs.mkdirSync(path.join(__dirname, pathToTestAssets, "export"));

            // convert the file
            htmlConverter.toFile(data,
                path.join(__dirname, pathToTestAssets, "export", "out.html"),
                path.join(__dirname, pathToTestAssets, `inputFiles`),
                {
                    language: "de",
                    automaticExtensionDetection: true,
                    exportAssets: true,
                }).then((filename) => {
                    // check the output result
                    try {
                        AssertExtensions.assertFilesEqual(
                            path.join(__dirname, pathToTestAssets, "export", "out.html"),
                            path.join(__dirname, pathToTestAssets, `resultFiles/testTemplateExampleToFile.html`));

                        // check for all the js files, assume everything worked then
                        AssertExtensions.assertFilesEqual(
                            path.join(__dirname, pathToTestAssets, "export", "assets", "js", "elearn.js"),
                            path.join(__dirname, pathToAssets, "assets", "js", "elearn.js"));
                        AssertExtensions.assertFilesEqual(
                            path.join(__dirname, pathToTestAssets, "export", "assets", "js", "quiz.js"),
                            path.join(__dirname, pathToAssets, "extensions", "quiz", "assets", "js", "quiz.js"));
                        AssertExtensions.assertFilesEqual(
                            path.join(__dirname, pathToTestAssets, "export", "assets", "js", "elearnvideo.js"),
                            path.join(__dirname, pathToAssets, "extensions", "elearnvideo", "assets", "js", "elearnvideo.js"));
                        AssertExtensions.assertFilesEqual(
                            path.join(__dirname, pathToTestAssets, "export", "assets", "js", "clickimage.js"),
                            path.join(__dirname, pathToAssets, "extensions", "clickimage", "assets", "js", "clickimage.js"));
                        AssertExtensions.assertFilesEqual(
                            path.join(__dirname, pathToTestAssets, "export", "assets", "js", "timeslider.js"),
                            path.join(__dirname, pathToAssets, "extensions", "timeslider", "assets", "js", "timeslider.js"));
                        AssertExtensions.assertFilesEqual(
                            path.join(__dirname, pathToTestAssets, "export", "assets", "font", "eLearn-Icons.woff"),
                            path.join(__dirname, pathToAssets, "assets", "font", "eLearn-Icons.woff"));

                        done();
                    }
                    catch(err) {
                        done(err);
                    }
                }, (err) => {
                    done(err);
                });
        }).slow(500);

        it('should create the correct file with linked file export', (done) => {
            let inBuf = fs.readFileSync(
                path.join(__dirname, pathToTestAssets, `inputFiles/testTemplateExample.md`),
                { encoding: 'utf8' });
            let data = inBuf.toString();

            // create output folder
            fs.mkdirSync(path.join(__dirname, pathToTestAssets, "export"));

            // convert the file
            htmlConverter.toFile(data,
                path.join(__dirname, pathToTestAssets, "export", "out.html"),
                path.join(__dirname, pathToTestAssets, `inputFiles`),
                {
                    language: "de",
                    automaticExtensionDetection: true,
                    exportLinkedFiles: true,
                }).then((filename) => {
                    // check the output result
                    AssertExtensions.assertFilesEqual(
                        path.join(__dirname, pathToTestAssets, "export", "out.html"),
                        path.join(__dirname, pathToTestAssets, `resultFiles/testTemplateExampleExtensions.html`));

                    // check for all the js files, assume everything worked then
                    AssertExtensions.assertFilesEqual(
                        path.join(__dirname, pathToTestAssets, "export", "assets", "img", "illu-concept.png"),
                        path.join(__dirname, pathToTestAssets, "inputFiles", "images", "illu-concept.png"));

                    // no exported assets
                    assert.ok(!fs.existsSync(path.join(__dirname, pathToTestAssets, "export", "assets", "js")));

                    done();
                }, (err) => {
                    done(err);
                });
        }).slow(250);

        it('should not create the file, no path given', (done) => {
            let inBuf = fs.readFileSync(
                path.join(__dirname, pathToTestAssets, `inputFiles/testTemplateExample.md`),
                { encoding: 'utf8' });
            let data = inBuf.toString();

            // create output folder
            fs.mkdirSync(path.join(__dirname, pathToTestAssets, "export"));

            // convert the file
            assert.rejects(htmlConverter.toFile(data,
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
            assert.rejects(htmlConverter.toFile(data,
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

    });
});
