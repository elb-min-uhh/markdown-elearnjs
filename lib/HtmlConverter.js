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
const Showdown = __importStar(require("showdown"));
const FileManager_js_1 = __importDefault(require("./FileManager.js"));
const ExtensionManager_js_1 = __importDefault(require("./ExtensionManager.js"));
const ConversionObject_js_1 = __importDefault(require("./objects/ConversionObject.js"));
const InclusionObject_js_1 = __importDefault(require("./objects/InclusionObject.js"));
const elearnExtension = require('./ShowdownElearnJS.js');
const defaults = {
    'newSectionOnHeading': true,
    'headingDepth': 3,
    'useSubSections': true,
    'subSectionLevel': 3,
    'subsubSectionLevel': 4,
};
class HtmlConverter {
    /**
    * Creates an HtmlConverter with specific options.
    * @param {ConverterSettingsObject} options: optional options
    */
    constructor(options) {
        this.bodyConverter = new Showdown.Converter({
            simplifiedAutoLink: true,
            excludeTrailingPunctuationFromURLs: true,
            strikethrough: true,
            tables: true,
            extensions: elearnExtension.elearnHtmlBody(),
        });
        this.imprintConverter = new Showdown.Converter({
            simplifiedAutoLink: true,
            excludeTrailingPunctuationFromURLs: true,
            strikethrough: true,
            tables: true,
            extensions: elearnExtension.elearnImprint(),
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
    setOption(opt, val) {
        this.bodyConverter.setOption(opt, val);
    }
    /**
    * Update multiple conversion options.
    * @param options: Object - same as in the constructor
    */
    setOptions(options) {
        for (var key in options) {
            this.bodyConverter.setOption(key, options[key]);
        }
    }
    /**
    * Converts given markdown to a HTML string.
    * Certain options will specify the output.
    *
    * @param markdown: string - the markdown code
    * @param {ConversionObject} options: optional options
    *
    * @return Promise: (html) - will resolve with the output html, when done.
    */
    toHtml(markdown, options) {
        const self = this;
        var opts = options || new ConversionObject_js_1.default();
        var ret = new Promise((res, rej) => {
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
            FileManager_js_1.default.getHtmlTemplate().then((data) => {
                if (!opts.language)
                    opts.language = "en";
                if (opts.automaticExtensionDetection) {
                    if (opts.includeQuiz == undefined)
                        opts.includeQuiz = ExtensionManager_js_1.default.scanForQuiz(html);
                    if (opts.includeElearnVideo == undefined)
                        opts.includeElearnVideo = ExtensionManager_js_1.default.scanForVideo(html);
                    if (opts.includeClickImage == undefined)
                        opts.includeClickImage = ExtensionManager_js_1.default.scanForClickImage(html);
                    if (opts.includeTimeSlider == undefined)
                        opts.includeTimeSlider = ExtensionManager_js_1.default.scanForTimeSlider(html);
                }
                res(self.getHTMLFileContent(data, html, meta, imprint, opts));
            }, (err) => { throw err; });
        });
        return ret;
    }
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
    getHTMLFileContent(data, html, meta, imprint, opts) {
        var options = opts || new InclusionObject_js_1.default();
        return data.replace(/\$\$meta\$\$/, () => { return meta; })
            .replace(/\$\$extensions\$\$/, () => {
            return ExtensionManager_js_1.default.getHTMLAssetStrings(options.includeQuiz, options.includeElearnVideo, options.includeClickImage, options.includeTimeSlider);
        })
            .replace(/\$\$imprint\$\$/, () => { return imprint; })
            .replace(/\$\$body\$\$/, () => { return html; })
            .replace(/\$\$language\$\$/, () => {
            if (options.language && options.language !== "de") {
                return `<script>
                                eLearnJS.setLanguage("${options.language}");
                                try { eLearnVideoJS.setLanguage("${options.language}") } catch(e){ console.log(e) };
                                try { quizJS.setLanguage("${options.language}") } catch(e){ console.log(e) };
                            </script>`;
            }
            return "";
        });
    }
}
exports.default = HtmlConverter;
