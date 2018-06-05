"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const Showdown = __importStar(require("showdown"));
const HtmlPdf = __importStar(require("html-pdf"));
const FileManager_1 = __importDefault(require("./FileManager"));
const ExtensionManager_1 = __importDefault(require("./ExtensionManager"));
const ConversionObject_1 = __importDefault(require("./objects/ConversionObject"));
const PdfExportOptionObject_1 = __importDefault(require("./objects/PdfExportOptionObject"));
const InclusionObject_1 = __importDefault(require("./objects/InclusionObject"));
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
    * @param {PdfSettingsObject} options: optional options
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
        for (var key in defaults) {
            this.pdfBodyConverter.setOption(key, defaults[key]);
        }
        // overwrite defaults with given options
        if (options) {
            for (var key in options) {
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
        for (var key in options) {
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
    toPdfHtml(markdown, options) {
        const self = this;
        var opts = options || new ConversionObject_1.default();
        var ret = new Promise((res, rej) => {
            var html = self.pdfBodyConverter.makeHtml(markdown); // conversion
            if (opts.bodyOnly)
                res(html);
            // create meta and imprint
            var meta = elearnExtension.parseMetaData(markdown);
            FileManager_1.default.getPdfTemplate().then((data) => {
                if (opts.automaticExtensionDetection) {
                    if (opts.includeQuiz == undefined)
                        opts.includeQuiz = ExtensionManager_1.default.scanForQuiz(html);
                    if (opts.includeElearnVideo == undefined)
                        opts.includeElearnVideo = ExtensionManager_1.default.scanForVideo(html);
                    if (opts.includeClickImage == undefined)
                        opts.includeClickImage = ExtensionManager_1.default.scanForClickImage(html);
                    if (opts.includeTimeSlider == undefined)
                        opts.includeTimeSlider = ExtensionManager_1.default.scanForTimeSlider(html);
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
    * @param {PdfExportOptionObject} options: optional options
    * @param forceOverwrite: bool - if an existing file should be overwritten.
    *
    * @return {Promise<string>} - will resolve with the path when done. (err) when an error occurred.
    */
    toFile(markdown, file, rootPath, options, forceOverwrite) {
        const self = this;
        var opts = options || new PdfExportOptionObject_1.default();
        var ret = new Promise((res, rej) => {
            if (!file)
                throw "No output path given.";
            if (fs.existsSync(file) && !forceOverwrite)
                throw "File already exists. Set `forceOverwrite` to true if you really want to overwrite the file.";
            self.toPdfHtml(markdown, options).then((html) => {
                HtmlPdf.create(html, self.getPdfOutputOptions(rootPath, opts.renderDelay)).toFile(file, (err, result) => {
                    if (err)
                        rej(err);
                    res(result);
                });
            }, (err) => { throw err; });
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
    toStream(markdown, rootPath, options, forceOverwrite) {
        const self = this;
        var opts = options || new PdfExportOptionObject_1.default();
        var ret = new Promise((res, rej) => {
            self.toPdfHtml(markdown, options).then((html) => {
                HtmlPdf.create(html, self.getPdfOutputOptions(rootPath, opts.renderDelay)).toStream((err, stream) => {
                    if (err)
                        rej(err);
                    res(stream);
                });
            }, (err) => { throw err; });
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
    toBuffer(markdown, rootPath, options, forceOverwrite) {
        const self = this;
        var opts = options || new PdfExportOptionObject_1.default();
        var ret = new Promise((res, rej) => {
            self.toPdfHtml(markdown, options).then((html) => {
                HtmlPdf.create(html, self.getPdfOutputOptions(rootPath, opts.renderDelay)).toBuffer((err, buffer) => {
                    if (err)
                        rej(err);
                    res(buffer);
                });
            }, (err) => { throw err; });
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
    getPDFFileContent(data, html, meta, opts) {
        const self = this;
        var options = opts || new InclusionObject_1.default();
        var zoom = `<style>html {zoom: ${self.pdfBodyConverter.getOption('contentZoom')}}</style>`;
        // header and footer
        var header = self.pdfBodyConverter.getOption('customHeader');
        var footer = self.pdfBodyConverter.getOption('customFooter');
        var customStyleFile = self.pdfBodyConverter.getOption('customStyleFile');
        var customStyle = "";
        if (customStyleFile && customStyleFile.length > 0 && fs.existsSync(path.resolve(customStyleFile))) {
            customStyleFile = "file:///" + path.resolve(customStyleFile).replace(/\\/g, "/");
            customStyle = `<link rel="stylesheet" type="text/css" href="${customStyleFile}">`;
        }
        return data.replace(/\$\$meta\$\$/, () => { return meta; })
            .replace(/\$\$extensions\$\$/, () => {
            return ExtensionManager_1.default.getPDFAssetStrings(options.includeQuiz, options.includeElearnVideo, options.includeClickImage, options.includeTimeSlider);
        })
            .replace(/\$\$zoom\$\$/, () => { return zoom; })
            .replace(/\$\$custom_style\$\$/, () => { return customStyle; })
            .replace(/\$\$header\$\$/, () => { return header; })
            .replace(/\$\$footer\$\$/, () => { return footer; })
            .replace(/\$\$body\$\$/, () => { return html; })
            .replace(/\$\$assetspath\$\$/g, () => { return "file:///" + path.resolve(`${__dirname}/${assetsPath}/elearnjs/`).replace(/\\/g, "/"); });
    }
    /**
    * Generates the PDF output options for the used node-html-pdf package.
    * @param filePath path to the currently opened file, necessary to link
    *                 included assets.
    * @param renderDelay (optional) delay of rendering by the package in ms.
    */
    getPdfOutputOptions(rootPath, renderDelay) {
        const self = this;
        if (!renderDelay)
            renderDelay = 0;
        var opts = {
            // USE OPTIONS HERE
            "format": "A4",
            "border": {
                "top": "18mm",
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
}
exports.default = PdfConverter;
