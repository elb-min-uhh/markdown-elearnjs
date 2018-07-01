"use strict";

import assert from 'assert';
import * as fs from "fs";
import path from 'path';
import rimraf from 'rimraf';
import { PdfConverter } from '../../main';
import PromiseCounter from '../../util/PromiseCounter';
import AssertExtensions from '../helpers/assertExtensions';

const pathToTestAssets = '../../../testAssets/';
const pathToAssets = '../../../assets/elearnjs/';

let pdfConverter: PdfConverter;

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


describe('PDF conversion', () => {
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
            throw err;
        });
    });

    describe('With small example codes', () => {

        // basic body only test
        it('should create a valid pdf body', (done) => {
            let html = pdfConverter.toHtml(exampleMeta + "\n" + exampleImprint + "\n" + exampleMarkdown, { bodyOnly: true });
            html.then((text) => {
                AssertExtensions.assertTextFileEqual(text, path.join(__dirname, pathToTestAssets, `resultFiles/testToPdfBody.html`))
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
        it('should create a valid pdf document', (done) => {
            let html = pdfConverter.toHtml(exampleMeta + "\n" + exampleImprint + "\n" + exampleMarkdown);
            html.then((text) => {
                AssertExtensions.assertTextFileEqual(text, path.join(__dirname, pathToTestAssets, `resultFiles/testToPdfFull.html`))
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

        it('should create the correct document with extensions', (done) => {
            fs.readFile(path.join(__dirname, pathToTestAssets, `inputFiles/testTemplateExample.md`), 'utf8', (error, data) => {
                if(error) {
                    throw error;
                }
                pdfConverter.toHtml(data, {
                    language: "de",
                    automaticExtensionDetection: true,
                }).then((text) => {
                    AssertExtensions.assertTextFileEqual(text, path.join(__dirname, pathToTestAssets, `resultFiles/testTemplateExamplePdf.html`))
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
                    assert.fail(err);
                    done();
                });
        }).slow(20000).timeout(30000);
    });
});
