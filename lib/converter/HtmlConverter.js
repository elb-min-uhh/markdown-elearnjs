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
const FileManager_1 = __importDefault(require("../FileManager"));
const ExtensionManager_1 = __importDefault(require("../ExtensionManager"));
const ConversionObject_1 = __importDefault(require("../objects/export/ConversionObject"));
const InclusionObject_1 = __importDefault(require("../objects/export/InclusionObject"));
const HtmlExportOptionObject_1 = __importDefault(require("../objects/export/HtmlExportOptionObject"));
const FileExtractor_1 = __importDefault(require("../FileExtractor"));
const PromiseCounter_1 = __importDefault(require("../util/PromiseCounter"));
const elearnExtension = require('./ShowdownElearnJS');
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
        var opts = new ConversionObject_1.default(options);
        var ret = new Promise((res, rej) => {
            var html = self.bodyConverter.makeHtml(markdown); // conversion
            if (opts.bodyOnly) {
                res(html);
                return;
            }
            // create meta and imprint
            var meta = elearnExtension.parseMetaData(markdown);
            var imprint = "";
            // create imprint only if explicitally inserted in markdown
            if (markdown.match(/(?:(?:^|\n)(```+|~~~+)imprint\s*?\n([\s\S]*?)\n\1|(?:^|\n)(<!--+)imprint\s*?\n([\s\S]*?)\n-->)/g)) {
                imprint = self.imprintConverter.makeHtml(markdown);
            }
            FileManager_1.default.getHtmlTemplate().then((data) => {
                // scan for extensions if necessary
                opts = Object.assign(opts, HtmlConverter.fillExtensionOptions(html, opts));
                res(self.getHTMLFileContent(data, html, meta, imprint, opts));
            }, (err) => { rej(err); });
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
    * @param {HtmlExportOptionObject} options: optional options
    * @param forceOverwrite: bool - if an existing file should be overwritten.
    *
    * @return {Promise<string>} - will resolve with the path when done. (err) when an error occurred.
    */
    toFile(markdown, file, rootPath, options, forceOverwrite) {
        const self = this;
        var opts = new HtmlExportOptionObject_1.default(options);
        return new Promise((res, rej) => {
            if (!file)
                rej("No output path given.");
            if (fs.existsSync(file) && !forceOverwrite)
                rej("File already exists. Set `forceOverwrite` to true if you really want to overwrite the file.");
            self.toHtml(markdown, options).then((html) => {
                var filesToExport = [];
                // find files to export and change links
                if (opts.exportLinkedFiles) {
                    var fileExtractorObject;
                    fileExtractorObject = FileExtractor_1.default.replaceAllLinks(html);
                    html = fileExtractorObject.html;
                    filesToExport = filesToExport.concat(fileExtractorObject.files);
                }
                // scan for extensions if necessary
                opts = Object.assign(opts, HtmlConverter.fillExtensionOptions(html, opts));
                var promises = [];
                // write actual html file
                var writePromise = new Promise((resolve, reject) => {
                    fs.writeFile(file, html, (err) => {
                        if (err)
                            reject(err);
                        else
                            resolve();
                    });
                });
                promises.push(writePromise);
                // export assets
                if (opts.exportAssets)
                    promises.push(ExtensionManager_1.default.exportAssets(path.dirname(file), opts));
                // export linked files
                if (opts.exportLinkedFiles)
                    promises.push(FileExtractor_1.default.extractAll(filesToExport, rootPath, path.dirname(file), 30000));
                // actual finish condition
                var donePromise = new PromiseCounter_1.default(promises, 30000);
                donePromise.then(() => { res(file); }, rej);
            }, (err) => { rej(err); });
        });
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
        var options = new InclusionObject_1.default(opts);
        return data.replace(/\$\$meta\$\$/, () => { return meta; })
            .replace(/\$\$extensions\$\$/, () => {
            return ExtensionManager_1.default.getHTMLAssetStrings(options.includeQuiz, options.includeElearnVideo, options.includeClickImage, options.includeTimeSlider);
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
    static fillExtensionOptions(html, opts) {
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
        return opts;
    }
}
exports.default = HtmlConverter;
