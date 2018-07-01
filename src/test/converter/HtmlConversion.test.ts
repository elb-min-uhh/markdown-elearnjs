"use strict";

import assert from 'assert';
import * as fs from "fs";
import path from 'path';
import rimraf from 'rimraf';
import FileExtractor from '../../FileExtractor';
import { HtmlConverter } from '../../main';
import PromiseCounter from '../../util/PromiseCounter';
import AssertExtensions from '../helpers/assertExtensions';

const pathToTestAssets = '../../../testAssets/';
const pathToAssets = '../../../assets/elearnjs/';

let htmlConverter: HtmlConverter;

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


describe('HTML conversion', () => {
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
            throw err;
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
                        assert.fail(err);
                        done();
                    });
            }, (err) => {
                assert.fail(err);
                done();
            });
        });

        // basic full document test
        it('should create a valid html document', (done) => {
            let html = htmlConverter.toHtml(exampleMeta + "\n" + exampleImprint + "\n" + exampleMarkdown);
            html.then((text) => {
                AssertExtensions.assertTextFileEqual(text, path.join(__dirname, pathToTestAssets, `resultFiles/testToHtmlFull.html`))
                    .then(() => {
                        done();
                    }, (err) => {
                        assert.fail(err);
                        done();
                    });
            }, (err) => {
                assert.fail(err);
                done();
            });
        });

        // basic full document with export ready links
        it('should create a valid html doc with updated file links', (done) => {
            htmlConverter.toHtml(exampleMeta + "\n" + exampleImprint + "\n" + exampleMarkdown)
                .then((text) => {
                    text = FileExtractor.replaceAllLinks(text).html;
                    AssertExtensions.assertTextFileEqual(text, path.join(__dirname, pathToTestAssets, `resultFiles/testToHtmlFullExtractFiles.html`))
                        .then(() => {
                            done();
                        }, (err) => {
                            assert.fail(err);
                            done();
                        });
                }, (err) => {
                    assert.fail(err);
                    done();
                });
        });

    });

    describe('with the template', () => {

        it('should create the correct document without extensions', (done) => {
            fs.readFile(path.join(__dirname, pathToTestAssets, `inputFiles/testTemplateExample.md`), 'utf8', (error, data) => {
                if(error) {
                    throw error;
                }
                htmlConverter.toHtml(data, { language: "de" }).then((text) => {
                    text = FileExtractor.replaceAllLinks(text).html;
                    AssertExtensions.assertTextFileEqual(text, path.join(__dirname, pathToTestAssets, `resultFiles/testTemplateExample.html`))
                        .then(() => {
                            done();
                        }, (err) => {
                            assert.fail(err);
                            done();
                        });
                }, (err) => {
                    assert.fail(err);
                    done();
                });
            });
        });

        it('should create the correct document with extensions', (done) => {
            fs.readFile(path.join(__dirname, pathToTestAssets, `inputFiles/testTemplateExample.md`), 'utf8', (error, data) => {
                if(error) {
                    throw error;
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
                            assert.fail(err);
                            done();
                        });
                }, (err) => {
                    assert.fail(err);
                    done();
                });
            });
        });

        it('should create the correct document with extension detection', (done) => {
            fs.readFile(path.join(__dirname, pathToTestAssets, `inputFiles/testTemplateExample.md`), 'utf8', (error, data) => {
                if(error) {
                    throw error;
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
                            assert.fail(err);
                            done();
                        });
                }, (err) => {
                    assert.fail(err);
                    done();
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
                }, (err) => {
                    assert.fail(err);
                    done();
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
                    assert.fail(err);
                    done();
                });
        }).slow(250);

    });
});
