"use strict";

import * as fs from 'fs';
import * as path from 'path';
import * as Showdown from "showdown";
import * as HtmlPdf from 'html-pdf';
import FileManager from '../FileManager';
import ExtensionManager from '../ExtensionManager';
import PdfSettingsObject from '../objects/settings/PdfSettingsObject';
import ConversionObject from '../objects/export/ConversionObject';
import PdfExportOptionObject from '../objects/export/PdfExportOptionObject';
import InclusionObject from '../objects/export/InclusionObject';
import MarkdownConverter from './MarkdownConverter';
const elearnExtension = require('./ShowdownElearnJS');

const assetsPath = '../assets';

const defaults: { [key: string]: any } = {
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

class PdfConverter implements MarkdownConverter {

    pdfBodyConverter: Showdown.Converter;

    /**
    * Creates an HtmlConverter with specific options.
    * @param {PdfSettingsObject} options: optional options
    */
    constructor(options: PdfSettingsObject) {
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
    setOption(opt: string, val: any) {
        this.pdfBodyConverter.setOption(opt, val);
    }

    /**
    * Update multiple conversion options.
    * @param options: Object - same as in the constructor
    */
    setOptions(options: PdfSettingsObject) {
        for(var key in options) {
            this.pdfBodyConverter.setOption(key, options[key]);
        }
    }

    /**
    * Converts given markdown to a HTML string for a HTML to PDF conversion.
    * Certain options will specify the output.
    *
    * @param markdown: string - the markdown code
    * @param {ConversionObject} options: optional options
    *
    * @return {Promise<string>} - will resolve with the output html, when done.
    */
    toHtml(markdown: string, options?: ConversionObject) {
        const self = this;
        var opts = options || new ConversionObject();

        var ret = new Promise<string>((res, rej) => {
            var html = self.pdfBodyConverter.makeHtml(markdown);// conversion

            if(opts.bodyOnly) res(html);

            // create meta and imprint
            var meta = elearnExtension.parseMetaData(markdown);

            FileManager.getPdfTemplate().then((data) => {
                if(opts.automaticExtensionDetection) {
                    if(opts.includeQuiz == undefined)
                        opts.includeQuiz = ExtensionManager.scanForQuiz(html);
                    if(opts.includeElearnVideo == undefined)
                        opts.includeElearnVideo = ExtensionManager.scanForVideo(html);
                    if(opts.includeClickImage == undefined)
                        opts.includeClickImage = ExtensionManager.scanForClickImage(html);
                    if(opts.includeTimeSlider == undefined)
                        opts.includeTimeSlider = ExtensionManager.scanForTimeSlider(html);
                }
                res(self.getPDFFileContent(data, html, meta, options));
            }, (err) => { throw err; });
        });

        return ret;
    }

    /**
    * Converts given markdown to a HTML string for a HTML to PDF conversion.
    * Certain options will specify the output.
    *
    * @deprecated use `.toHtml` instead
    *
    * @param markdown: string - the markdown code
    * @param {ConversionObject} options: optional options
    *
    * @return {Promise<string>} - will resolve with the output html, when done.
    */
    toPdfHtml(markdown: string, options?: ConversionObject) {
        return this.toHtml(markdown, options);
    }

    /**
    * Converts given markdown to a PDF File.
    * Certain options will specify the output.
    *
    * @param markdown: string - the markdown code
    * @param file: string - the output file path (including file name)
    * @param rootPath: string - the root path for relative paths in the file.
    * @param {PdfExportOptionObject} options: optional options
    * @param forceOverwrite: bool - if an existing file should be overwritten.
    *
    * @return {Promise<string>} - will resolve with the path when done. (err) when an error occurred.
    */
    toFile(markdown: string, file: string, rootPath: string, options?: PdfExportOptionObject, forceOverwrite?: boolean) {
        const self = this;
        var opts = options || new PdfExportOptionObject();

        var ret = new Promise<string>((res, rej) => {
            if(!file)
                throw "No output path given.";
            if(fs.existsSync(file) && !forceOverwrite)
                throw "File already exists. Set `forceOverwrite` to true if you really want to overwrite the file.";

            self.toHtml(markdown, <ConversionObject>options).then((html) => {
                HtmlPdf.create(html, self.getPdfOutputOptions(rootPath, opts.renderDelay)).toFile(file, (err, result) => {
                    if(err) rej(err);
                    res(result.toString());
                });
            }, (err) => { throw err });
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
    * @param {PdfExportOptionObject} options: optional options
    * @param forceOverwrite: bool - if an existing file should be overwritten.
    *
    * @return Promise: (stream) - will resolve when done. (err) when an error occurred.
    */
    toStream(markdown: string, rootPath: string, options?: PdfExportOptionObject, forceOverwrite?: boolean) {
        const self = this;
        var opts = options || new PdfExportOptionObject();

        var ret = new Promise((res, rej) => {
            self.toHtml(markdown, <ConversionObject>options).then((html) => {
                HtmlPdf.create(html, self.getPdfOutputOptions(rootPath, opts.renderDelay)).toStream((err, stream) => {
                    if(err) rej(err);
                    res(stream);
                });
            }, (err) => { throw err });
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
    * @param {PdfExportOptionObject} options: optional options
    * @param forceOverwrite: bool - if an existing file should be overwritten.
    *
    * @return Promise: (stream) - will resolve when done. (err) when an error occurred.
    */
    toBuffer(markdown: string, rootPath: string, options?: PdfExportOptionObject, forceOverwrite?: boolean) {
        const self = this;
        var opts = options || new PdfExportOptionObject();

        var ret = new Promise((res, rej) => {
            self.toHtml(markdown, <ConversionObject>options).then((html) => {
                HtmlPdf.create(html, self.getPdfOutputOptions(rootPath, opts.renderDelay)).toBuffer((err, buffer) => {
                    if(err) rej(err);
                    res(buffer);
                });
            }, (err) => { throw err });
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
    * @param opts: InclusionObject
    */
    getPDFFileContent(data: string, html: string, meta: string, opts?: InclusionObject) {
        const self = this;

        var options: InclusionObject = opts || new InclusionObject();

        var zoom = `<style>html {zoom: ${self.pdfBodyConverter.getOption('contentZoom')}}</style>`;
        // header and footer
        var header = self.pdfBodyConverter.getOption('customHeader');
        if(!header) header = self.getDefaultHeader();
        var footer = self.pdfBodyConverter.getOption('customFooter');
        if(!footer) footer = self.getDefaultFooter();

        var customStyleFile = self.pdfBodyConverter.getOption('customStyleFile');
        var customStyle = "";
        if(customStyleFile && customStyleFile.length > 0 && fs.existsSync(path.resolve(customStyleFile))) {
            customStyleFile = "file:///" + path.resolve(customStyleFile).replace(/\\/g, "/");
            customStyle = `<link rel="stylesheet" type="text/css" href="${customStyleFile}">`;
        }

        return data.replace(/\$\$meta\$\$/, () => { return meta })
            .replace(/\$\$extensions\$\$/, () => {
                return ExtensionManager.getPDFAssetStrings(
                    options.includeQuiz,
                    options.includeElearnVideo,
                    options.includeClickImage,
                    options.includeTimeSlider);
            })
            .replace(/\$\$zoom\$\$/, () => { return zoom })
            .replace(/\$\$custom_style\$\$/, () => { return customStyle })
            .replace(/\$\$header\$\$/, () => { return header })
            .replace(/\$\$footer\$\$/, () => { return footer })
            .replace(/\$\$body\$\$/, () => { return html })
            .replace(/\$\$assetspath\$\$/g, () => { return "file:///" + path.resolve(`${__dirname}/${assetsPath}/elearnjs/`).replace(/\\/g, "/") });
    }

    /**
    * Generates the PDF output options for the used node-html-pdf package.
    * @param filePath path to the currently opened file, necessary to link
    *                 included assets.
    * @param renderDelay (optional) delay of rendering by the package in ms.
    */
    getPdfOutputOptions(rootPath: string, renderDelay?: number): HtmlPdf.CreateOptions {
        const self = this;

        if(!renderDelay) renderDelay = 0;

        var opts = {
            // USE OPTIONS HERE
            "format": <"A4">"A4",
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
            "base": "file:///" + rootPath.replace(/\\/g, "/") + "/",
        };

        return opts;
    }

    getDefaultHeader() {
        return ``;
    }

    getDefaultFooter() {
        return `<div id="pageFooter" style="font-family: Arial, Verdana, sans-serif; color: #666; position: absolute; height: 100%; width: 100%;">
            <span style="position: absolute; bottom: 0; right: 0">{{page}}</span>
        </div>`;
    }
}

export default PdfConverter;
