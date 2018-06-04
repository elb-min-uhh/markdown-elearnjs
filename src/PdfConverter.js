"use strict";

const fs = require('fs');
const path = require('path');
const Showdown = require('showdown');
const HtmlPdf = require('html-pdf');
const FileManager = require('./FileManager.js');
const ExtensionManager = require('./ExtensionManager.js');
const elearnExtension = require('./ShowdownElearnJS.js');

const assetsPath = '../assets';

const defaults = {
    'newSectionOnHeading': true,
    'headingDepth': 3,
    'useSubSections': true,
    'subSectionLevel': 3,
    'subsubSectionLevel': 4,
    'newPageOnSection': true,
    'contentZoom': 1,
    'customHeader': undefined,
    'headerHeight': "0",
    'customFooter': undefined,
    'footerHeight': "17mm",
    'customStyleFile': undefined,
};

class PdfConverter {
    /**
    * Creates an HtmlConverter with specific options.
    * @param options: Object (optional)
    *   - newSectionOnHeading: bool - if sections are automatically created
    *       at headings.
    *       Default: true
    *   - headingDepth: int - until which depth headings are created.
    *       Default: 3 (H3)
    *   - useSubSections: bool - if sub- and subsubsections are created
    *       at a specific heading level (subSectionLevel, subsubSectionLevel)
    *       Default: true.
    *   - subSectionLevel: int - level from which on created sections are subsections.
    *       Default: 3 (H3)
    *   - subsubSectionLevel: int - level from which on sections are subsubsections.
    *       Default: 4 (H4) (will not be created with everything as default)
    *   - newPageOnSection: bool - will add page breaks before every section
    *   - contentZoom: float - zoom factor for the page rendering
    *   - customHeader: string - HTML of a custom page header
    *   - headerHeight: string - CSS declaration of the header's height
    *   - customFooter: string - HTML of a custom page footer
    *   - footerHeight: string - CSS declaration of the footer's height
    *   - customStyleFile: string - absolute path to a styling css file
    */
    constructor(options) {
        this.pdfBodyConverter = new Showdown.Converter({
            simplifiedAutoLink: true,
            excludeTrailingPunctuationFromURLs: true,
            strikethrough: true,
            tables: true,
            extensions: elearnExtension.elearnPdfBody(),
        });

        // set export defaults
        for(var key in defaults) {
            this.pdfBodyConverter.setOption(key, defaults[key]);
        }

        // overwrite defaults with given options
        if(options) {
            for(var key in options) {
                this.pdfBodyConverter.setOption(key, options[key]);
            }
        }
    }

    /**
    * Update one of the conversion options.
    *
    * @param opt: string - option key. Same possible as in the constructor.
    * @param val: obj - the value to set the option to.
    */
    setOption(opt, val) {
        this.pdfBodyConverter.setOption(opt, val);
    }

    /**
    * Update multiple conversion options.
    * @param options: Object - same as in the constructor
    */
    setOptions(options) {
        for(var key in options) {
            this.pdfBodyConverter.setOption(key, options[key]);
        }
    }

    /**
    * Converts given markdown to a HTML string for a HTML to PDF conversion.
    * Certain options will specify the output.
    *
    * @param markdown: string - the markdown code
    * @param options: Object with following optional keys:
    *   - bodyOnly: bool - will only return the HTML body.
    *   - language: string ["en", "de"] - will change the language
    *       if not `bodyOnly`.
    *       Default: "en"
    *   - automaticExtensionDetection: bool - will scan for extensions and
    *       include only those found. Might be overwritten by specific `includeXY`
    *       Only if not `bodyOnly`
    *       Default: false
    *   - includeQuiz: bool - will include the import of the quiz.js in the head.
    *       The script has to be located under `./assets`
    *       Only if not `bodyOnly`
    *       Default: auto detection
    *   - includeElearnVideo: bool - will include the import of the
    *       elearnvideo.js in the head. The script has to be located under `./assets`
    *       Only if not `bodyOnly`
    *       Default: auto detection
    *   - includeClickImage: bool - will include the import of the clickimage.js
    *       in the head. The script has to be located under `./assets`
    *       Only if not `bodyOnly`
    *       Default: auto detection
    *   - includeTimeSlider: bool - will include the import of the timeslider.js
    *       in the head. The script has to be located under `./assets`
    *       Only if not `bodyOnly`
    *       Default: auto detection
    *
    * @return Promise: (html) - will resolve with the output html, when done.
    */
    toPdfHtml(markdown, options) {
        const self = this;
        if(!options) options = {};

        var ret = new Promise((res, rej) => {
            var html = self.pdfBodyConverter.makeHtml(markdown);// conversion

            if(options.bodyOnly) res(html);

            // create meta and imprint
            var meta = elearnExtension.parseMetaData(markdown);

            FileManager.getPdfTemplate().then((data) => {
                if(!options.language) options.language = "en";
                if(options.automaticExtensionDetection) {
                    if(!options.includeQuiz)
                        options.includeQuiz = ExtensionManager.scanForQuiz(html);
                    if(!options.includeElearnVideo)
                        options.includeElearnVideo = ExtensionManager.scanForVideo(html);
                    if(!options.includeClickImage)
                        options.includeClickImage = ExtensionManager.scanForClickImage(html);
                    if(!options.includeTimeSlider)
                        options.includeTimeSlider = ExtensionManager.scanForTimeSlider(html);
                }
                res(self.getPDFFileContent(data, html, meta, options));
            }, (err) => { throw err; });
        });

        return ret;
    }

    /**
    * Converts given markdown to a PDF File.
    * Certain options will specify the output.
    *
    * @param markdown: string - the markdown code
    * @param file: string - the output file path (including file name)
    * @param rootPath: string - the root path for relative paths in the file.
    * @param options: Object with following optional keys:
    *   - bodyOnly: bool - will only return the HTML body.
    *   - language: string ["en", "de"] - will change the language
    *       if not `bodyOnly`.
    *       Default: "en"
    *   - automaticExtensionDetection: bool - will scan for extensions and
    *       include only those found. Might be overwritten by specific `includeXY`
    *       Only if not `bodyOnly`
    *       Default: false
    *   - includeQuiz: bool - will include the import of the quiz.js in the head.
    *       The script has to be located under `./assets`
    *       Only if not `bodyOnly`
    *       Default: auto detection
    *   - includeElearnVideo: bool - will include the import of the
    *       elearnvideo.js in the head. The script has to be located under `./assets`
    *       Only if not `bodyOnly`
    *       Default: auto detection
    *   - includeClickImage: bool - will include the import of the clickimage.js
    *       in the head. The script has to be located under `./assets`
    *       Only if not `bodyOnly`
    *       Default: auto detection
    *   - includeTimeSlider: bool - will include the import of the timeslider.js
    *       in the head. The script has to be located under `./assets`
    *       Only if not `bodyOnly`
    *       Default: auto detection
    *   - renderDelay: delay of rendering the html to pdf in ms
    * @param forceOverwrite: bool - if an existing file should be overwritten.
    *
    * @return Promise: (path) - will resolve when done. (err) when an error occurred.
    */
    toFile(markdown, file, rootPath, options, forceOverwrite) {
        const self = this;
        if(!options) options = {};

        var ret = new Promise((res, rej) => {
            if(!file)
                throw "No output path given.";
            if(fs.existsSync(file) && !forceOverwrite)
                throw "File already exists. Set `forceOverwrite` to true if you really want to overwrite the file.";

            self.toPdfHtml(markdown, options).then((html) => {
                HtmlPdf.create(html, self.getPdfOutputOptions(rootPath, options.renderDelay)).toFile(file, (err, result) => {
                    if(err) rej(err);
                    res(result);
                });
            }, (err) => {throw err});
        });

        return ret;
    }

    /**
    * Converts given markdown to a pdf file stream.
    * Certain options will specify the output.
    *
    * @param markdown: string - the markdown code
    * @param file: string - the output file path (including file name)
    * @param rootPath: string - the root path for relative paths in the file.
    * @param options: Object with following optional keys:
    *   - bodyOnly: bool - will only return the HTML body.
    *   - language: string ["en", "de"] - will change the language
    *       if not `bodyOnly`.
    *       Default: "en"
    *   - automaticExtensionDetection: bool - will scan for extensions and
    *       include only those found. Might be overwritten by specific `includeXY`
    *       Only if not `bodyOnly`
    *       Default: false
    *   - includeQuiz: bool - will include the import of the quiz.js in the head.
    *       The script has to be located under `./assets`
    *       Only if not `bodyOnly`
    *       Default: auto detection
    *   - includeElearnVideo: bool - will include the import of the
    *       elearnvideo.js in the head. The script has to be located under `./assets`
    *       Only if not `bodyOnly`
    *       Default: auto detection
    *   - includeClickImage: bool - will include the import of the clickimage.js
    *       in the head. The script has to be located under `./assets`
    *       Only if not `bodyOnly`
    *       Default: auto detection
    *   - includeTimeSlider: bool - will include the import of the timeslider.js
    *       in the head. The script has to be located under `./assets`
    *       Only if not `bodyOnly`
    *       Default: auto detection
    *   - renderDelay: delay of rendering the html to pdf in ms
    * @param forceOverwrite: bool - if an existing file should be overwritten.
    *
    * @return Promise: (stream) - will resolve when done. (err) when an error occurred.
    */
    toStream(markdown, rootPath, options, forceOverwrite) {
        const self = this;
        if(!options) options = {};

        var ret = new Promise((res, rej) => {
            if(!file)
                throw "No output path given.";
            if(fs.existsSync(file) && !forceOverwrite)
                throw "File already exists. Set `forceOverwrite` to true if you really want to overwrite the file.";

            self.toPdfHtml(markdown, options).then((html) => {
                HtmlPdf.create(html, self.getPdfOutputOptions(rootPath, options.renderDelay)).toStream((err, stream) => {
                    if(err) rej(err);
                    res(stream);
                });
            }, (err) => {throw err});
        });

        return ret;
    }

    /**
    * Converts given markdown to a pdf file buffer.
    * Certain options will specify the output.
    *
    * @param markdown: string - the markdown code
    * @param file: string - the output file path (including file name)
    * @param rootPath: string - the root path for relative paths in the file.
    * @param options: Object with following optional keys:
    *   - bodyOnly: bool - will only return the HTML body.
    *   - language: string ["en", "de"] - will change the language
    *       if not `bodyOnly`.
    *       Default: "en"
    *   - automaticExtensionDetection: bool - will scan for extensions and
    *       include only those found. Might be overwritten by specific `includeXY`
    *       Only if not `bodyOnly`
    *       Default: false
    *   - includeQuiz: bool - will include the import of the quiz.js in the head.
    *       The script has to be located under `./assets`
    *       Only if not `bodyOnly`
    *       Default: auto detection
    *   - includeElearnVideo: bool - will include the import of the
    *       elearnvideo.js in the head. The script has to be located under `./assets`
    *       Only if not `bodyOnly`
    *       Default: auto detection
    *   - includeClickImage: bool - will include the import of the clickimage.js
    *       in the head. The script has to be located under `./assets`
    *       Only if not `bodyOnly`
    *       Default: auto detection
    *   - includeTimeSlider: bool - will include the import of the timeslider.js
    *       in the head. The script has to be located under `./assets`
    *       Only if not `bodyOnly`
    *       Default: auto detection
    *   - renderDelay: delay of rendering the html to pdf in ms
    * @param forceOverwrite: bool - if an existing file should be overwritten.
    *
    * @return Promise: (stream) - will resolve when done. (err) when an error occurred.
    */
    toBuffer(markdown, rootPath, options, forceOverwrite) {
        const self = this;
        if(!options) options = {};

        var ret = new Promise((res, rej) => {
            if(!file)
                throw "No output path given.";
            if(fs.existsSync(file) && !forceOverwrite)
                throw "File already exists. Set `forceOverwrite` to true if you really want to overwrite the file.";

            self.toPdfHtml(markdown, options).then((html) => {
                HtmlPdf.create(html, self.getPdfOutputOptions(rootPath, options.renderDelay)).toBuffer((err, buffer) => {
                    if(err) rej(err);
                    res(buffer);
                });
            }, (err) => {throw err});
        });

        return ret;
    }

    /**
    * Inserts necessary elements into the PDF Template to create the
    * final fileContent.
    *
    * @param data: the content of the template_pdf.html as string
    * @param html: the base HTML as generated HTML Body of the file
    * @param meta: additional header elements for the HTML file
    * @param opts: Object with following optional keys:
    *   - language: string ["en", "de"] - will change the language
    *       if not `bodyOnly`.
    *       Default: "de"
    *   - includeQuiz: bool - will include the import of the quiz.js in the head.
    *       The script has to be located under `./assets`
    *       Only if not `bodyOnly`
    *       Default: false
    *   - includeElearnVideo: bool - will include the import of the
    *       elearnvideo.js in the head. The script has to be located under `./assets`
    *       Only if not `bodyOnly`
    *       Default: false
    *   - includeClickImage: bool - will include the import of the clickimage.js
    *       in the head. The script has to be located under `./assets`
    *       Only if not `bodyOnly`
    *       Default: false
    *   - includeTimeSlider: bool - will include the import of the timeslider.js
    *       in the head. The script has to be located under `./assets`
    *       Only if not `bodyOnly`
    *       Default: false
    */
    getPDFFileContent(data, html, meta, opts) {
        const self = this;

        var zoom = `<style>html {zoom: ${self.pdfBodyConverter.getOption('contentZoom')}}</style>`;
        // header and footer
        var header = self.pdfBodyConverter.getOption('customHeader');
        if(!header) header = self.getDefaultHeader();
        var footer = self.pdfBodyConverter.getOption('customFooter');
        if(!footer) footer = self.getDefaultFooter();

        var customStyleFile = self.pdfBodyConverter.getOption('customStyleFile');
        var customStyle = "";
        if(customStyleFile && fs.existsSync(path.resolve(customStyleFile))) {
            customStyleFile = "file:///" + path.resolve(customStyleFile).replace(/\\/g, "/");
            customStyle = `<link rel="stylesheet" type="text/css" href="${customStyleFile}">`;
        }

        return data.replace(/\$\$meta\$\$/, () => {return meta})
            .replace(/\$\$extensions\$\$/, () => {
                return ExtensionManager.getPDFAssetStrings(
                    opts.includeQuiz,
                    opts.includeElearnVideo,
                    opts.includeClickImage,
                    opts.includeTimeSlider);
            })
            .replace(/\$\$zoom\$\$/, () => {return zoom})
            .replace(/\$\$custom_style\$\$/, () => {return customStyle})
            .replace(/\$\$header\$\$/, () => {return header})
            .replace(/\$\$footer\$\$/, () => {return footer})
            .replace(/\$\$body\$\$/, () => {return html})
            .replace(/\$\$assetspath\$\$/g, () => {return "file:///" + path.resolve(`${__dirname}/${assetsPath}/elearnjs/`).replace(/\\/g, "/")});
    }

    /**
    * Generates the PDF output options for the used node-html-pdf package.
    * @param filePath path to the currently opened file, necessary to link
    *                 included assets.
    * @param renderDelay (optional) delay of rendering by the package in ms.
    */
    getPdfOutputOptions(rootPath, renderDelay) {
        const self = this;

        if(!renderDelay) renderDelay = 0;

        var opts = {
            // USE OPTIONS HERE
            "format": "A4",
            "border": {
                "top": "18mm",            // default is 0, units: mm, cm, in, px
                "right": "23mm",
                "bottom": "18mm",
                "left": "23mm"
            },
            "header": {
                "height": self.pdfBodyConverter.getOption('headerHeight'),
            },
            "footer": {
                "height": self.pdfBodyConverter.getOption('footerHeight'),
            },
            "renderDelay": renderDelay,
        };

        opts.base = "file:///" + rootPath.replace(/\\/g, "/") + "/";

        return opts;
    }

    /**
    * The default PDF Header HTML elements
    */
    getDefaultHeader() {
        return ``;
    }

    /**
    * The default PDF Footer HTML elements
    */
    getDefaultFooter() {
        return `<div id="pageFooter" style="font-family: Arial, Verdana, sans-serif; color: #666; position: absolute; height: 100%; width: 100%;">
                    <span style="position: absolute; bottom: 0; right: 0">{{page}}</span>
                </div>`; // {{pages}} := maximale Anzahl
    }
}

module.exports = PdfConverter;
