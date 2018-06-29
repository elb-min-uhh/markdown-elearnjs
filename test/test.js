/**
* Runs all necessary methods once to test them.
*/
const fs = require('fs');
const MarkdownElearnJS = require('../out/main');

var htmlConverter = new MarkdownElearnJS.HtmlConverter();
var pdfConverter = new MarkdownElearnJS.PdfConverter();

var tests = {};

var exampleMarkdown =
    `# This is simple example markdown.

We will insert an image here ![Image](withSomeLink.jpg).`;

var exampleMeta =
    `<!--meta
    Title: Test
    Custom: "<script src='someSource.js'></script>"
-->`;

var exampleImprint =
    `<!--imprint
    #### elearn.js Template
    Universität Hamburg
-->`;

// TODO convert to actual correct tests

// ----------- HTML --------------

tests.testToHtmlBody = function() {
    var html = htmlConverter.toHtml(exampleMeta + "\n" + exampleImprint + "\n" + exampleMarkdown, { bodyOnly: true });
    html.then((text) => {
        assertFileEqual(text, `${__dirname}/resultFiles/testToHtmlBody.html`).then(() => {
            testDone();
        }, (err) => {
            console.error(err);
            testDone();
        });
    }, (err) => { console.error(err) });
}

tests.testToHtmlFull = function() {
    var html = htmlConverter.toHtml(exampleMeta + "\n" + exampleImprint + "\n" + exampleMarkdown);
    html.then((text) => {
        assertFileEqual(text, `${__dirname}/resultFiles/testToHtmlFull.html`).then(() => {
            testDone();
        }, (err) => {
            console.error(err);
            testDone();
        });
    }, (err) => { console.error(err) });
}

tests.testToHtmlFullExtractFiles = function() {
    var html = htmlConverter.toHtml(exampleMeta + "\n" + exampleImprint + "\n" + exampleMarkdown, {
        includeQuiz: true,
        includeElearnVideo: true,
        includeClickImage: true,
        includeTimeSlider: true,
    });
    html.then((text) => {
        text = MarkdownElearnJS.FileExtractor.replaceAllLinks(text).html;
        assertFileEqual(text, `${__dirname}/resultFiles/testToHtmlFullExtractFiles.html`).then(() => {
            testDone();
        }, (err) => {
            console.error(err);
            testDone();
        });
    }, (err) => { console.error(err) });
}

tests.testTemplateExample = function() {
    fs.readFile(`${__dirname}/inputFiles/testTemplateExample.md`, 'utf8', (err, data) => {
        if(err) {
            console.error(err);
            testDone();
            return;
        }
        htmlConverter.toHtml(data, {
            automaticExtensionDetection: true
        }).then((text) => {
            text = MarkdownElearnJS.FileExtractor.replaceAllLinks(text).html;
            assertFileEqual(text, `${__dirname}/resultFiles/testTemplateExample.html`).then(() => {
                testDone();
            }, (err) => {
                console.error(err);
                testDone();
            });
        }, (err) => { console.error(err) });
    });
}

tests.testTemplateToFile = function() {
    var outFile = `${__dirname}/testTemplateExample.html`
    fs.readFile(`${__dirname}/inputFiles/testTemplateExample.md`, 'utf8', (err, data) => {
        if(err) {
            console.error(err);
            testDone();
            return;
        }
        htmlConverter.toFile(data,
            outFile,
            `${__dirname}/inputFiles/`,
            {
                exportAssets: true,
                exportLinkedFiles: true,
                automaticExtensionDetection: true
            }, true).then((text) => {
                if(text !== outFile) console.error("Wrong output file.");
                testDone();
            }, (err) => { console.error(err) });
    });
}

// asset export

tests.testAssetExport = function() {
    MarkdownElearnJS.ExtensionManager.exportAssets(`${__dirname}/assetExport/`, {
        includeQuiz: true,
        includeClickImage: true,
    }).then(() => {
        console.log("Assets exported to test/assetExport/. Please check those by yourself.");
        // TODO actual result checking.
        testDone();
    }, (err) => {
        console.error(err);
        testDone();
    });
}

tests.testHtmlScanAll = function() {
    fs.readFile(`${__dirname}/inputFiles/testTemplateExample.md`, 'utf8', (err, data) => {
        if(err) {
            console.error(err);
            testDone();
            return;
        }
        MarkdownElearnJS.ExtensionManager.scanMarkdownForAll(data).then((extensionObject) => {
            if(extensionObject.includeQuiz && extensionObject.includeElearnVideo
                && extensionObject.includeClickImage && extensionObject.includeTimeSlider) {
                testDone();
            }
            else {
                console.error("Unexpected Scan result.", extensionObject);
            }
        }, (err) => {
            console.error(err);
            testDone();
        });
    });
}

// ---------- PDF -------------

tests.testToPdfBody = function() {
    var html = pdfConverter.toHtml(exampleMeta + "\n" + exampleImprint + "\n" + exampleMarkdown, { bodyOnly: true });
    html.then((text) => {
        assertFileEqual(text, `${__dirname}/resultFiles/testToPdfBody.html`).then(() => {
            testDone();
        }, (err) => {
            console.error(err);
            testDone();
        });
    }, (err) => { console.error(err) });
}

tests.testToPdfFull = function() {
    var html = pdfConverter.toHtml(exampleMeta + "\n" + exampleImprint + "\n" + exampleMarkdown);
    html.then((text) => {
        assertFileEqual(text, `${__dirname}/resultFiles/testToPdfFull.html`).then(() => {
            testDone();
        }, (err) => {
            console.error(err);
            testDone();
        });
    }, (err) => { console.error(err) });
}

tests.testTemplateExamplePdf = function() {
    fs.readFile(`${__dirname}/inputFiles/testTemplateExample.md`, 'utf8', (err, data) => {
        if(err) {
            console.error(err);
            testDone();
            return;
        }
        pdfConverter.toHtml(data, {
            automaticExtensionDetection: true
        }).then((text) => {
            assertFileEqual(text, `${__dirname}/resultFiles/testTemplateExamplePdf.html`).then(() => {
                testDone();
            }, (err) => {
                console.error(err);
                testDone();
            });
        }, (err) => { console.error(err) });
    });
}

tests.testTemplateExamplePdfExport = function() {
    fs.readFile(`${__dirname}/inputFiles/testTemplateExample.md`, 'utf8', (err, data) => {
        if(err) {
            console.error(err);
            testDone();
            return;
        }
        pdfConverter.toFile(data, `${__dirname}/testTemplateExample.pdf`, `${__dirname}/inputFiles/`, {
            automaticExtensionDetection: true,
            renderDelay: 5000,
        }, true).then((text) => {
            console.log("PDF file was created in test/testTemplateExample.pdf");
            testDone();
        }, (err) => {
            console.error(err);
            testDone();
        });
    });
}

// help functions

var assertFileEqual = function(text, file) {
    var ret = new Promise((res, rej) => {
        fs.readFile(file, 'utf8', (err, data) => {
            if(err) {
                rej(err);
            }
            text = text.replace(/\r/g, "").replace(/[ \t]*\n/g, "\n").replace(/[ \t\r\n]*$/g, "").trim();
            data = data.replace(/\r/g, "").replace(/[ \t]*\n/g, "\n").replace(/[ \t\r\n]*$/g, "").trim();

            // char compare to find difference
            for(var i = 0; i < text.length; i++) {
                if(text.charAt(i) !== data.charAt(i)) {
                    console.error(`Differs at ${i} with text:\n'${text.substr(i - 10, 50)}'\n\nfile:\n'${data.substr(i - 10, 50)}'`);
                    break;
                }
            }

            if(text.localeCompare(data)) {
                rej("Unexpected result. " + text.localeCompare(data));
            }
            else {
                res();
            }
        });
    });
    return ret;
}

// automatic run
var doneTests = [];
var currentTest = null;
var testDone = function() {
    console.log("\x1b[33m%s\x1b[0m", "Finished test: " + currentTest);
    doneTests.push(currentTest);
    currentTest = null;
    startTest();
}

var startTest = function() {
    for(var key in tests) {
        if(doneTests.indexOf(key) < 0) {
            currentTest = key;
            console.log("\x1b[33m%s\x1b[0m", "Starting test: " + key);
            tests[key]();
            break;
        }
    }
    if(currentTest === null) console.log("\x1b[1m%s\x1b[0m", "Done.");
}

startTest();
