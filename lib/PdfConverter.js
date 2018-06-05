"use strict";
exports.__esModule = true;
var fs = require("fs");
var path = require("path");
var Showdown = require("showdown");
var HtmlPdf = require("html-pdf");
var FileManager_1 = require("./FileManager");
var ExtensionManager_1 = require("./ExtensionManager");
var PdfExportOptionObject_1 = require("./objects/PdfExportOptionObject");
var InclusionObject_1 = require("./objects/InclusionObject");
var elearnExtension = require('./ShowdownElearnJS.js');
var assetsPath = '../assets';
var defaults = {
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
    'customStyleFile': undefined
};
var PdfConverter = /** @class */ (function () {
    /**
    * Creates an HtmlConverter with specific options.
    * @param {PdfSettingsObject} options: optional options
    */
    function PdfConverter(options) {
        this.pdfBodyConverter = new Showdown.Converter({
            simplifiedAutoLink: true,
            excludeTrailingPunctuationFromURLs: true,
            strikethrough: true,
            tables: true,
            extensions: elearnExtension.elearnPdfBody()
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
    PdfConverter.prototype.setOption = function (opt, val) {
        this.pdfBodyConverter.setOption(opt, val);
    };
    /**
    * Update multiple conversion options.
    * @param options: Object - same as in the constructor
    */
    PdfConverter.prototype.setOptions = function (options) {
        for (var key in options) {
            this.pdfBodyConverter.setOption(key, options[key]);
        }
    };
    /**
    * Converts given markdown to a HTML string for a HTML to PDF conversion.
    * Certain options will specify the output.
    *
    * @param markdown: string - the markdown code
    * @param {ConversionObject} options: optional options
    *
    * @return {Promise<string>} - will resolve with the output html, when done.
    */
    PdfConverter.prototype.toPdfHtml = function (markdown, options) {
        var self = this;
        if (!options)
            options = {};
        var ret = new Promise(function (res, rej) {
            var html = self.pdfBodyConverter.makeHtml(markdown); // conversion
            if (options.bodyOnly)
                res(html);
            // create meta and imprint
            var meta = elearnExtension.parseMetaData(markdown);
            FileManager_1["default"].getPdfTemplate().then(function (data) {
                if (!options.language)
                    options.language = "en";
                if (options.automaticExtensionDetection) {
                    if (options.includeQuiz == undefined)
                        options.includeQuiz = ExtensionManager_1["default"].scanForQuiz(html);
                    if (options.includeElearnVideo == undefined)
                        options.includeElearnVideo = ExtensionManager_1["default"].scanForVideo(html);
                    if (options.includeClickImage == undefined)
                        options.includeClickImage = ExtensionManager_1["default"].scanForClickImage(html);
                    if (options.includeTimeSlider == undefined)
                        options.includeTimeSlider = ExtensionManager_1["default"].scanForTimeSlider(html);
                }
                res(self.getPDFFileContent(data, html, meta, options));
            }, function (err) { throw err; });
        });
        return ret;
    };
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
    PdfConverter.prototype.toFile = function (markdown, file, rootPath, options, forceOverwrite) {
        var self = this;
        var opts = options || new PdfExportOptionObject_1["default"]();
        var ret = new Promise(function (res, rej) {
            if (!file)
                throw "No output path given.";
            if (fs.existsSync(file) && !forceOverwrite)
                throw "File already exists. Set `forceOverwrite` to true if you really want to overwrite the file.";
            self.toPdfHtml(markdown, options).then(function (html) {
                HtmlPdf.create(html, self.getPdfOutputOptions(rootPath, opts.renderDelay)).toFile(file, function (err, result) {
                    if (err)
                        rej(err);
                    res(result);
                });
            }, function (err) { throw err; });
        });
        return ret;
    };
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
    PdfConverter.prototype.toStream = function (markdown, rootPath, options, forceOverwrite) {
        var self = this;
        var opts = options || new PdfExportOptionObject_1["default"]();
        var ret = new Promise(function (res, rej) {
            self.toPdfHtml(markdown, options).then(function (html) {
                HtmlPdf.create(html, self.getPdfOutputOptions(rootPath, opts.renderDelay)).toStream(function (err, stream) {
                    if (err)
                        rej(err);
                    res(stream);
                });
            }, function (err) { throw err; });
        });
        return ret;
    };
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
    PdfConverter.prototype.toBuffer = function (markdown, rootPath, options, forceOverwrite) {
        var self = this;
        var opts = options || new PdfExportOptionObject_1["default"]();
        var ret = new Promise(function (res, rej) {
            self.toPdfHtml(markdown, options).then(function (html) {
                HtmlPdf.create(html, self.getPdfOutputOptions(rootPath, opts.renderDelay)).toBuffer(function (err, buffer) {
                    if (err)
                        rej(err);
                    res(buffer);
                });
            }, function (err) { throw err; });
        });
        return ret;
    };
    /**
    * Inserts necessary elements into the PDF Template to create the
    * final fileContent.
    *
    * @param data: the content of the template_pdf.html as string
    * @param html: the base HTML as generated HTML Body of the file
    * @param meta: additional header elements for the HTML file
    * @param opts: InclusionObject
    */
    PdfConverter.prototype.getPDFFileContent = function (data, html, meta, opts) {
        var self = this;
        var options = opts || new InclusionObject_1["default"]();
        var zoom = "<style>html {zoom: " + self.pdfBodyConverter.getOption('contentZoom') + "}</style>";
        // header and footer
        var header = self.pdfBodyConverter.getOption('customHeader');
        if (!header)
            header = self.getDefaultHeader();
        var footer = self.pdfBodyConverter.getOption('customFooter');
        if (!footer)
            footer = self.getDefaultFooter();
        var customStyleFile = self.pdfBodyConverter.getOption('customStyleFile');
        var customStyle = "";
        if (customStyleFile && fs.existsSync(path.resolve(customStyleFile))) {
            customStyleFile = "file:///" + path.resolve(customStyleFile).replace(/\\/g, "/");
            customStyle = "<link rel=\"stylesheet\" type=\"text/css\" href=\"" + customStyleFile + "\">";
        }
        return data.replace(/\$\$meta\$\$/, function () { return meta; })
            .replace(/\$\$extensions\$\$/, function () {
            return ExtensionManager_1["default"].getPDFAssetStrings(options.includeQuiz, options.includeElearnVideo, options.includeClickImage, options.includeTimeSlider);
        })
            .replace(/\$\$zoom\$\$/, function () { return zoom; })
            .replace(/\$\$custom_style\$\$/, function () { return customStyle; })
            .replace(/\$\$header\$\$/, function () { return header; })
            .replace(/\$\$footer\$\$/, function () { return footer; })
            .replace(/\$\$body\$\$/, function () { return html; })
            .replace(/\$\$assetspath\$\$/g, function () { return "file:///" + path.resolve(__dirname + "/" + assetsPath + "/elearnjs/").replace(/\\/g, "/"); });
    };
    /**
    * Generates the PDF output options for the used node-html-pdf package.
    * @param filePath path to the currently opened file, necessary to link
    *                 included assets.
    * @param renderDelay (optional) delay of rendering by the package in ms.
    */
    PdfConverter.prototype.getPdfOutputOptions = function (rootPath, renderDelay) {
        var self = this;
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
                "height": self.pdfBodyConverter.getOption('headerHeight')
            },
            "footer": {
                "height": self.pdfBodyConverter.getOption('footerHeight')
            },
            "renderDelay": renderDelay,
            "base": "file:///" + rootPath.replace(/\\/g, "/") + "/"
        };
        return opts;
    };
    /**
    * The default PDF Header HTML elements
    */
    PdfConverter.prototype.getDefaultHeader = function () {
        return "";
    };
    /**
    * The default PDF Footer HTML elements
    */
    PdfConverter.prototype.getDefaultFooter = function () {
        return "<div id=\"pageFooter\" style=\"font-family: Arial, Verdana, sans-serif; color: #666; position: absolute; height: 100%; width: 100%;\">\n                    <span style=\"position: absolute; bottom: 0; right: 0\">{{page}}</span>\n                </div>"; // {{pages}} := maximale Anzahl
    };
    return PdfConverter;
}());
exports["default"] = PdfConverter;
//# sourceMappingURL=PdfConverter.js.map