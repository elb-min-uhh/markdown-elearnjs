"use strict";
exports.__esModule = true;
var path = require("path");
var ncp_1 = require("ncp");
var divClassRegExp = /<div[ \t]((?:(?!class[ \t]*=[ \t]*["'])\S+[ \t]*=[ \t]*(["'])(?:\\\2|(?!\2).)*\2[ \t]*)*)class[ \t]*=[ \t]*(["'])((?:\\\3|(?!\3).)*)\3((?:(?!\/?>).|[^\/>])*)(\/?)>/gi;
var videoRegExp = /<video[ \t>]/g;
var assetsPath = '../assets';
/**
* Allows to parse HTML code for usage of elearn.js extensions.
* Allows to get path to extension necessary files.
* Allows to get include strings for extension necessary files.
*/
var ExtensionManager = /** @class */ (function () {
    function ExtensionManager() {
    }
    // Scan
    ExtensionManager.scanForQuiz = function (html) {
        var include = false;
        html.replace(divClassRegExp, function (wholeMatch, before, wrapBefore, wrap, classVal, after, closingSlash) {
            if (classVal.match(/(?:^|\s)question(?:$|\s)/g))
                include = true;
            return "";
        });
        return include;
    };
    ExtensionManager.scanForVideo = function (html) {
        var include = false;
        if (html.match(videoRegExp))
            include = true;
        return include;
    };
    ExtensionManager.scanForClickImage = function (html) {
        var include = false;
        html.replace(divClassRegExp, function (wholeMatch, before, wrapBefore, wrap, classVal, after, closingSlash) {
            if (classVal.match(/(?:^|\s)clickimage(?:$|\s)/g))
                include = true;
            return "";
        });
        return include;
    };
    ExtensionManager.scanForTimeSlider = function (html) {
        var include = false;
        html.replace(divClassRegExp, function (wholeMatch, before, wrapBefore, wrap, classVal, after, closingSlash) {
            if (classVal.match(/(?:^|\s)timeslider(?:$|\s)/g))
                include = true;
            return "";
        });
        return include;
    };
    // Locations to copy from
    ExtensionManager.getQuizAssetDir = function () {
        return path.resolve(__dirname + "/" + assetsPath + "/elearnjs/extensions/quiz/assets/");
    };
    ExtensionManager.getElearnVideoAssetDir = function () {
        return path.resolve(__dirname + "/" + assetsPath + "/elearnjs/extensions/elearnvideo/assets/");
    };
    ExtensionManager.getClickImageAssetDir = function () {
        return path.resolve(__dirname + "/" + assetsPath + "/elearnjs/extensions/clickimage/assets/");
    };
    ExtensionManager.getTimeSliderAssetDir = function () {
        return path.resolve(__dirname + "/" + assetsPath + "/elearnjs/extensions/timeslider/assets/");
    };
    // Asset Strings for a HTML Export
    ExtensionManager.getHTMLAssetStrings = function (includeQuiz, includeElearnVideo, includeClickImage, includeTimeSlider) {
        return (includeQuiz ? ExtensionManager.getQuizHTMLAssetString() : "") + "\n                " + (includeElearnVideo ? ExtensionManager.getElearnVideoHTMLAssetString() : "") + "\n                " + (includeClickImage ? ExtensionManager.getClickImageHTMLAssetString() : "") + "\n                " + (includeTimeSlider ? ExtensionManager.getTimeSliderHTMLAssetString() : "");
    };
    ExtensionManager.getHTMLAssetString = function (name) {
        return "<link rel=\"stylesheet\" type=\"text/css\" href=\"assets/css/" + name + ".css\">\n                <script type=\"text/javascript\" src=\"assets/js/" + name + ".js\"></script>";
    };
    ExtensionManager.getQuizHTMLAssetString = function () {
        return ExtensionManager.getHTMLAssetString("quiz");
    };
    ExtensionManager.getElearnVideoHTMLAssetString = function () {
        return ExtensionManager.getHTMLAssetString("elearnvideo");
    };
    ExtensionManager.getClickImageHTMLAssetString = function () {
        return ExtensionManager.getHTMLAssetString("clickimage");
    };
    ExtensionManager.getTimeSliderHTMLAssetString = function () {
        return "<link rel=\"stylesheet\" type=\"text/css\" href=\"assets/css/timeslider.css\">\n                <script type=\"text/javascript\" src=\"assets/js/moment.js\"></script>\n                <script type=\"text/javascript\" src=\"assets/js/timeslider.js\"></script>";
    };
    // Asset Strings for a PDF Export
    ExtensionManager.getPDFAssetStrings = function (includeQuiz, includeElearnVideo, includeClickImage, includeTimeSlider) {
        return (includeQuiz ? ExtensionManager.getQuizPDFAssetString() : "") + "\n                " + (includeElearnVideo ? ExtensionManager.getElearnVideoPDFAssetString() : "") + "\n                " + (includeClickImage ? ExtensionManager.getClickImagePDFAssetString() : "") + "\n                " + (includeTimeSlider ? ExtensionManager.getTimeSliderPDFAssetString() : "");
    };
    ExtensionManager.getQuizPDFAssetString = function () {
        return "<link rel=\"stylesheet\" type=\"text/css\"\n                    href=\"file:///" + path.resolve(__dirname + "/" + assetsPath + "/elearnjs/extensions/quiz/assets/css/quiz.css").replace(/\\/g, "/") + "\" />\n                <link rel=\"stylesheet\" type=\"text/css\"\n                    href=\"file:///" + path.resolve(__dirname + "/" + assetsPath + "/elearnjs/pdfAssets/css/quiz.css").replace(/\\/g, "/") + "\" />\n                <script type=\"text/javascript\"\n                    src=\"file:///" + path.resolve(__dirname + "/" + assetsPath + "/elearnjs/extensions/quiz/assets/js/quiz.js").replace(/\\/g, "/") + "\"></script>";
    };
    ExtensionManager.getElearnVideoPDFAssetString = function () {
        return "<link rel=\"stylesheet\" type=\"text/css\"\n                    href=\"file:///" + path.resolve(__dirname + "/" + assetsPath + "/elearnjs/extensions/elearnvideo/assets/css/elearnvideo.css").replace(/\\/g, "/") + "\" />\n                <link rel=\"stylesheet\" type=\"text/css\"\n                    href=\"file:///" + path.resolve(__dirname + "/" + assetsPath + "/elearnjs/pdfAssets/css/elearnvideo.css").replace(/\\/g, "/") + "\" />\n                <script type=\"text/javascript\"\n                    src=\"file:///" + path.resolve(__dirname + "/" + assetsPath + "/elearnjs/extensions/elearnvideo/assets/js/elearnvideo.js").replace(/\\/g, "/") + "\"></script>\n                <script type=\"text/javascript\"\n                    src=\"file:///" + path.resolve(__dirname + "/" + assetsPath + "/elearnjs/pdfAssets/js/elearnvideo.js").replace(/\\/g, "/") + "\"></script>";
    };
    ExtensionManager.getClickImagePDFAssetString = function () {
        return "<link rel=\"stylesheet\" type=\"text/css\"\n                    href=\"file:///" + path.resolve(__dirname + "/" + assetsPath + "/elearnjs/extensions/clickimage/assets/css/clickimage.css").replace(/\\/g, "/") + "\" />\n                <script type=\"text/javascript\"\n                    src=\"file:///" + path.resolve(__dirname + "/" + assetsPath + "/elearnjs/pdfAssets/js/clickimage.js").replace(/\\/g, "/") + "\"></script>";
    };
    ExtensionManager.getTimeSliderPDFAssetString = function () {
        return "<link rel=\"stylesheet\" type=\"text/css\"\n                    href=\"file:///" + path.resolve(__dirname + "/" + assetsPath + "/elearnjs/extensions/timeslider/assets/css/timeslider.css").replace(/\\/g, "/") + "\" />\n                <script type=\"text/javascript\"\n                    src=\"file:///" + path.resolve(__dirname + "/" + assetsPath + "/elearnjs/extensions/timeslider/assets/js/moment.js").replace(/\\/g, "/") + "\"></script>\n                <script type=\"text/javascript\"\n                    src=\"file:///" + path.resolve(__dirname + "/" + assetsPath + "/elearnjs/pdfAssets/js/timeslider.js").replace(/\\/g, "/") + "\"></script>";
    };
    /**
    * Writes the elearn.js assets to the given path.
    * @param dirPath: string - the path to write the `assets` folder to.
    * @param {InclusionObject} opts optional options
    */
    ExtensionManager.exportAssets = function (dirPath, opts) {
        var outPath = path.resolve(dirPath + "/assets/");
        var folders = [path.resolve(__dirname + "/" + assetsPath + "/elearnjs/assets/")];
        if (opts.includeQuiz)
            folders.push(ExtensionManager.getQuizAssetDir());
        if (opts.includeElearnVideo)
            folders.push(ExtensionManager.getElearnVideoAssetDir());
        if (opts.includeClickImage)
            folders.push(ExtensionManager.getClickImageAssetDir());
        if (opts.includeTimeSlider)
            folders.push(ExtensionManager.getTimeSliderAssetDir());
        var ret = new Promise(function (res, rej) {
            ExtensionManager.writeFolders(folders, outPath, res, rej);
        });
        return ret;
    };
    /**
    * Copies/writes a list of folders by their absolute paths to the outPath
    */
    ExtensionManager.writeFolders = function (folders, outPath, callback, error) {
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
    };
    return ExtensionManager;
}());
exports["default"] = ExtensionManager;
//# sourceMappingURL=ExtensionManager.js.map