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
const path = __importStar(require("path"));
const ncp_1 = require("ncp");
const HtmlConverter_1 = __importDefault(require("./HtmlConverter"));
const ConverterSettingsObject_1 = __importDefault(require("./objects/settings/ConverterSettingsObject"));
const PdfConverter_1 = __importDefault(require("./PdfConverter"));
const ExtensionObject_1 = __importDefault(require("./objects/ExtensionObject"));
const ConversionObject_1 = __importDefault(require("./objects/export/ConversionObject"));
const divClassRegExp = /<div[ \t]((?:(?!class[ \t]*=[ \t]*["'])\S+[ \t]*=[ \t]*(["'])(?:\\\2|(?!\2).)*\2[ \t]*)*)class[ \t]*=[ \t]*(["'])((?:\\\3|(?!\3).)*)\3((?:(?!\/?>).|[^\/>])*)(\/?)>/gi;
const videoRegExp = /<video[ \t>]/g;
const assetsPath = '../assets';
/**
* Allows to parse HTML code for usage of elearn.js extensions.
* Allows to get path to extension necessary files.
* Allows to get include strings for extension necessary files.
*/
class ExtensionManager {
    // Scan
    static scanForQuiz(html) {
        var include = false;
        html.replace(divClassRegExp, (wholeMatch, before, wrapBefore, wrap, classVal, after, closingSlash) => {
            if (classVal.match(/(?:^|\s)question(?:$|\s)/g))
                include = true;
            return "";
        });
        return include;
    }
    static scanForVideo(html) {
        var include = false;
        if (html.match(videoRegExp))
            include = true;
        return include;
    }
    static scanForClickImage(html) {
        var include = false;
        html.replace(divClassRegExp, (wholeMatch, before, wrapBefore, wrap, classVal, after, closingSlash) => {
            if (classVal.match(/(?:^|\s)clickimage(?:$|\s)/g))
                include = true;
            return "";
        });
        return include;
    }
    static scanForTimeSlider(html) {
        var include = false;
        html.replace(divClassRegExp, (wholeMatch, before, wrapBefore, wrap, classVal, after, closingSlash) => {
            if (classVal.match(/(?:^|\s)timeslider(?:$|\s)/g))
                include = true;
            return "";
        });
        return include;
    }
    /**
     * Scans the html code for elearn.js extensions.
     *
     * @param html string: the html code to be scanned
     *
     * @return ExtensionObject: including which extensions where found
     * and explicitly which were not found (true/false)
     */
    static scanHtmlForAll(html) {
        return new ExtensionObject_1.default(ExtensionManager.scanForQuiz(html), ExtensionManager.scanForVideo(html), ExtensionManager.scanForClickImage(html), ExtensionManager.scanForTimeSlider(html));
    }
    /**
     * Scans the markdown code for elearn.js extensions.
     *
     * @param markdown string: the original markdown code to be scanned
     * @param markdownConverter (optional) HtmlConverter or PdfConverter:
     *  the converter to use for markdown to HTML conversion. If not given,
     *  a default HtmlConverter will be used.
     *
     * @return Promise<ExtensionObject>: including which extensions where found
     * and explicitly which were not found (true/false)
     */
    static scanMarkdownForAll(markdown, markdownConverter) {
        var ret = new Promise((res, rej) => {
            // define converter
            if (!ExtensionManager.htmlConverter)
                ExtensionManager.htmlConverter = new HtmlConverter_1.default(new ConverterSettingsObject_1.default());
            let converter = ExtensionManager.htmlConverter;
            if (markdownConverter
                && (markdownConverter instanceof HtmlConverter_1.default
                    || markdownConverter instanceof PdfConverter_1.default)) {
                converter = markdownConverter;
            }
            var opts = new ConversionObject_1.default();
            opts.bodyOnly = true;
            // convert and then scan
            converter.toHtml(markdown, opts).then((html) => {
                res(ExtensionManager.scanHtmlForAll(html));
            }, rej);
        });
        return ret;
    }
    // Locations to copy from
    static getQuizAssetDir() {
        return path.resolve(`${__dirname}/${assetsPath}/elearnjs/extensions/quiz/assets/`);
    }
    static getElearnVideoAssetDir() {
        return path.resolve(`${__dirname}/${assetsPath}/elearnjs/extensions/elearnvideo/assets/`);
    }
    static getClickImageAssetDir() {
        return path.resolve(`${__dirname}/${assetsPath}/elearnjs/extensions/clickimage/assets/`);
    }
    static getTimeSliderAssetDir() {
        return path.resolve(`${__dirname}/${assetsPath}/elearnjs/extensions/timeslider/assets/`);
    }
    // Asset Strings for a HTML Export
    static getHTMLAssetStrings(includeQuiz, includeElearnVideo, includeClickImage, includeTimeSlider) {
        return `${includeQuiz ? ExtensionManager.getQuizHTMLAssetString() : ""}
                ${includeElearnVideo ? ExtensionManager.getElearnVideoHTMLAssetString() : ""}
                ${includeClickImage ? ExtensionManager.getClickImageHTMLAssetString() : ""}
                ${includeTimeSlider ? ExtensionManager.getTimeSliderHTMLAssetString() : ""}`;
    }
    static getHTMLAssetString(name) {
        return `<link rel="stylesheet" type="text/css" href="assets/css/${name}.css">
                <script type="text/javascript" src="assets/js/${name}.js"></script>`;
    }
    static getQuizHTMLAssetString() {
        return ExtensionManager.getHTMLAssetString("quiz");
    }
    static getElearnVideoHTMLAssetString() {
        return ExtensionManager.getHTMLAssetString("elearnvideo");
    }
    static getClickImageHTMLAssetString() {
        return ExtensionManager.getHTMLAssetString("clickimage");
    }
    static getTimeSliderHTMLAssetString() {
        return `<link rel="stylesheet" type="text/css" href="assets/css/timeslider.css">
                <script type="text/javascript" src="assets/js/moment.js"></script>
                <script type="text/javascript" src="assets/js/timeslider.js"></script>`;
    }
    // Asset Strings for a PDF Export
    static getPDFAssetStrings(includeQuiz, includeElearnVideo, includeClickImage, includeTimeSlider) {
        return `${includeQuiz ? ExtensionManager.getQuizPDFAssetString() : ""}
                ${includeElearnVideo ? ExtensionManager.getElearnVideoPDFAssetString() : ""}
                ${includeClickImage ? ExtensionManager.getClickImagePDFAssetString() : ""}
                ${includeTimeSlider ? ExtensionManager.getTimeSliderPDFAssetString() : ""}`;
    }
    static getQuizPDFAssetString() {
        return `<link rel="stylesheet" type="text/css"
                    href="file:///${path.resolve(`${__dirname}/${assetsPath}/elearnjs/extensions/quiz/assets/css/quiz.css`).replace(/\\/g, "/")}" />
                <link rel="stylesheet" type="text/css"
                    href="file:///${path.resolve(`${__dirname}/${assetsPath}/elearnjs/pdfAssets/css/quiz.css`).replace(/\\/g, "/")}" />
                <script type="text/javascript"
                    src="file:///${path.resolve(`${__dirname}/${assetsPath}/elearnjs/extensions/quiz/assets/js/quiz.js`).replace(/\\/g, "/")}"></script>`;
    }
    static getElearnVideoPDFAssetString() {
        return `<link rel="stylesheet" type="text/css"
                    href="file:///${path.resolve(`${__dirname}/${assetsPath}/elearnjs/extensions/elearnvideo/assets/css/elearnvideo.css`).replace(/\\/g, "/")}" />
                <link rel="stylesheet" type="text/css"
                    href="file:///${path.resolve(`${__dirname}/${assetsPath}/elearnjs/pdfAssets/css/elearnvideo.css`).replace(/\\/g, "/")}" />
                <script type="text/javascript"
                    src="file:///${path.resolve(`${__dirname}/${assetsPath}/elearnjs/extensions/elearnvideo/assets/js/elearnvideo.js`).replace(/\\/g, "/")}"></script>
                <script type="text/javascript"
                    src="file:///${path.resolve(`${__dirname}/${assetsPath}/elearnjs/pdfAssets/js/elearnvideo.js`).replace(/\\/g, "/")}"></script>`;
    }
    static getClickImagePDFAssetString() {
        return `<link rel="stylesheet" type="text/css"
                    href="file:///${path.resolve(`${__dirname}/${assetsPath}/elearnjs/extensions/clickimage/assets/css/clickimage.css`).replace(/\\/g, "/")}" />
                <script type="text/javascript"
                    src="file:///${path.resolve(`${__dirname}/${assetsPath}/elearnjs/pdfAssets/js/clickimage.js`).replace(/\\/g, "/")}"></script>`;
    }
    static getTimeSliderPDFAssetString() {
        return `<link rel="stylesheet" type="text/css"
                    href="file:///${path.resolve(`${__dirname}/${assetsPath}/elearnjs/extensions/timeslider/assets/css/timeslider.css`).replace(/\\/g, "/")}" />
                <script type="text/javascript"
                    src="file:///${path.resolve(`${__dirname}/${assetsPath}/elearnjs/extensions/timeslider/assets/js/moment.js`).replace(/\\/g, "/")}"></script>
                <script type="text/javascript"
                    src="file:///${path.resolve(`${__dirname}/${assetsPath}/elearnjs/pdfAssets/js/timeslider.js`).replace(/\\/g, "/")}"></script>`;
    }
    /**
    * Writes the elearn.js assets to the given path.
    * @param dirPath: string - the path to write the `assets` folder to.
    * @param {ExtensionObject} opts optional options
    */
    static exportAssets(dirPath, opts) {
        var outPath = path.resolve(dirPath + "/assets/");
        var folders = [path.resolve(`${__dirname}/${assetsPath}/elearnjs/assets/`)];
        if (opts.includeQuiz)
            folders.push(ExtensionManager.getQuizAssetDir());
        if (opts.includeElearnVideo)
            folders.push(ExtensionManager.getElearnVideoAssetDir());
        if (opts.includeClickImage)
            folders.push(ExtensionManager.getClickImageAssetDir());
        if (opts.includeTimeSlider)
            folders.push(ExtensionManager.getTimeSliderAssetDir());
        var ret = new Promise((res, rej) => {
            ExtensionManager.writeFolders(folders, outPath, res, rej);
        });
        return ret;
    }
    /**
    * Copies/writes a list of folders by their absolute paths to the outPath
    */
    static writeFolders(folders, outPath, callback, error) {
        if (!folders || !folders.length) {
            if (callback)
                callback();
            return;
        }
        // get first folder + remove from array
        var inPath = folders.shift();
        ncp_1.ncp(inPath, outPath, function (err) {
            if (err) {
                if (error)
                    error(err);
                return;
            }
            ExtensionManager.writeFolders(folders, outPath, callback, error);
        });
    }
}
exports.default = ExtensionManager;
