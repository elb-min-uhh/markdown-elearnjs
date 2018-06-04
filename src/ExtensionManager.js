"use strict";

const path = require('path');
var ncp = require('ncp').ncp;
ncp.limit = 16;

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
            if(classVal.match(/(?:^|\s)question(?:$|\s)/g)) include = true;
            return false;
        });
        return include;
    }

    static scanForVideo(html) {
        var include = false;
        if(html.match(videoRegExp)) include = true;
        return include;
    }

    static scanForClickImage(html) {
        var include = false;
        html.replace(divClassRegExp, (wholeMatch, before, wrapBefore, wrap, classVal, after, closingSlash) => {
            if(classVal.match(/(?:^|\s)clickimage(?:$|\s)/g)) include = true;
            return false;
        });
        return include;
    }

    static scanForTimeSlider(html) {
        var include = false;
        html.replace(divClassRegExp, (wholeMatch, before, wrapBefore, wrap, classVal, after, closingSlash) => {
            if(classVal.match(/(?:^|\s)timeslider(?:$|\s)/g)) include = true;
            return false;
        });
        return include;
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
    * @param options: Object with following optional keys:
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
    */
    static exportAssets(dirPath, opts) {
        var outPath = path.resolve(dirPath + "/assets/");
        var folders = [path.resolve(`${__dirname}/${assetsPath}/elearnjs/assets/`)];

        if(opts.includeQuiz) folders.push(ExtensionManager.getQuizAssetDir());
        if(opts.includeElearnVideo) folders.push(ExtensionManager.getElearnVideoAssetDir());
        if(opts.includeClickImage) folders.push(ExtensionManager.getClickImageAssetDir());
        if(opts.includeTimeSlider) folders.push(ExtensionManager.getTimeSliderAssetDir());

        var ret = new Promise((res, rej) => {
            ExtensionManager.writeFolders(folders, outPath, res, rej);
        });
        return ret;
    }

    /**
    * Copies/writes a list of folders by their absolute paths to the outPath
    */
    static writeFolders(folders, outPath, callback, error) {
        if(!folders || !folders.length) {
            if(callback) callback();
            return;
        }
        // get first folder + remove from array
        var inPath = folders.shift();
        ncp(inPath, outPath, function(err) {
            if(err) {
                if(error) error(err);
                return;
            }

            ExtensionManager.writeFolders(folders, outPath, callback, error);
        });
    }
}

module.exports = ExtensionManager;
