"use strict";
exports.__esModule = true;
var Showdown = require("showdown");
var FileManager_js_1 = require("./FileManager.js");
var ExtensionManager_js_1 = require("./ExtensionManager.js");
var ConversionObject_js_1 = require("./objects/ConversionObject.js");
var InclusionObject_js_1 = require("./objects/InclusionObject.js");
var elearnExtension = require('./ShowdownElearnJS.js');
var defaults = {
    'newSectionOnHeading': true,
    'headingDepth': 3,
    'useSubSections': true,
    'subSectionLevel': 3,
    'subsubSectionLevel': 4
};
var HtmlConverter = /** @class */ (function () {
    /**
    * Creates an HtmlConverter with specific options.
    * @param {ConverterSettingsObject} options: optional options
    */
    function HtmlConverter(options) {
        this.bodyConverter = new Showdown.Converter({
            simplifiedAutoLink: true,
            excludeTrailingPunctuationFromURLs: true,
            strikethrough: true,
            tables: true,
            extensions: elearnExtension.elearnHtmlBody()
        });
        this.imprintConverter = new Showdown.Converter({
            simplifiedAutoLink: true,
            excludeTrailingPunctuationFromURLs: true,
            strikethrough: true,
            tables: true,
            extensions: elearnExtension.elearnImprint()
        });
        // set export defaults
        for (var key in defaults) {
            this.bodyConverter.setOption(key, defaults[key]);
        }
        if (options) {
            for (var key in options) {
                this.bodyConverter.setOption(key, options[key]);
            }
        }
    }
    /**
    * Update one of the conversion options.
    *
    * @param opt: string - option key. Same possible as in the constructor.
    * @param val: obj - the value to set the option to.
    */
    HtmlConverter.prototype.setOption = function (opt, val) {
        this.bodyConverter.setOption(opt, val);
    };
    /**
    * Update multiple conversion options.
    * @param options: Object - same as in the constructor
    */
    HtmlConverter.prototype.setOptions = function (options) {
        for (var key in options) {
            this.bodyConverter.setOption(key, options[key]);
        }
    };
    /**
    * Converts given markdown to a HTML string.
    * Certain options will specify the output.
    *
    * @param markdown: string - the markdown code
    * @param {ConversionObject} options: optional options
    *
    * @return Promise: (html) - will resolve with the output html, when done.
    */
    HtmlConverter.prototype.toHtml = function (markdown, options) {
        var self = this;
        var opts = options || new ConversionObject_js_1["default"]();
        var ret = new Promise(function (res, rej) {
            var html = self.bodyConverter.makeHtml(markdown); // conversion
            if (opts.bodyOnly)
                res(html);
            // create meta and imprint
            var meta = elearnExtension.parseMetaData(markdown);
            var imprint = "";
            // create imprint only if explicitally inserted in markdown
            if (markdown.match(/(?:(?:^|\n)(```+|~~~+)imprint\s*?\n([\s\S]*?)\n\1|(?:^|\n)(<!--+)imprint\s*?\n([\s\S]*?)\n-->)/g)) {
                imprint = self.imprintConverter.makeHtml(markdown);
            }
            FileManager_js_1["default"].getHtmlTemplate().then(function (data) {
                if (!opts.language)
                    opts.language = "en";
                if (opts.automaticExtensionDetection) {
                    if (opts.includeQuiz == undefined)
                        opts.includeQuiz = ExtensionManager_js_1["default"].scanForQuiz(html);
                    if (opts.includeElearnVideo == undefined)
                        opts.includeElearnVideo = ExtensionManager_js_1["default"].scanForVideo(html);
                    if (opts.includeClickImage == undefined)
                        opts.includeClickImage = ExtensionManager_js_1["default"].scanForClickImage(html);
                    if (opts.includeTimeSlider == undefined)
                        opts.includeTimeSlider = ExtensionManager_js_1["default"].scanForTimeSlider(html);
                }
                res(self.getHTMLFileContent(data, html, meta, imprint, opts));
            }, function (err) { throw err; });
        });
        return ret;
    };
    /**
    * Inserts necessary elements into the HTML Template to create the
    * final fileContent.
    *
    * @param data: the content of the template_pdf.html as string
    * @param html: the converted HTML content, not the whole file, ohne what is
    *              within the elearn.js div.page (check the template)
    * @param meta: the converted meta part. HTML <scripts> and other added to
    *              the html <head>
    * @param imprint: HTML to be inserted into the elearn.js imprint
    * @param {InclusionObject} opts: optional options
    */
    HtmlConverter.prototype.getHTMLFileContent = function (data, html, meta, imprint, opts) {
        var options = opts || new InclusionObject_js_1["default"]();
        return data.replace(/\$\$meta\$\$/, function () { return meta; })
            .replace(/\$\$extensions\$\$/, function () {
            return ExtensionManager_js_1["default"].getHTMLAssetStrings(options.includeQuiz, options.includeElearnVideo, options.includeClickImage, options.includeTimeSlider);
        })
            .replace(/\$\$imprint\$\$/, function () { return imprint; })
            .replace(/\$\$body\$\$/, function () { return html; })
            .replace(/\$\$language\$\$/, function () {
            if (options.language && options.language !== "de") {
                return "<script>\n                                eLearnJS.setLanguage(\"" + options.language + "\");\n                                try { eLearnVideoJS.setLanguage(\"" + options.language + "\") } catch(e){ console.log(e) };\n                                try { quizJS.setLanguage(\"" + options.language + "\") } catch(e){ console.log(e) };\n                            </script>";
            }
            return "";
        });
    };
    return HtmlConverter;
}());
exports["default"] = HtmlConverter;
//# sourceMappingURL=HtmlConverter.js.map