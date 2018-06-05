"use strict";

import * as path from 'path';
import { ncp } from 'ncp';
import InclusionObject from './objects/InclusionObject';

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
    static scanForQuiz(html: string) {
        var include = false;
        html.replace(divClassRegExp,
                (wholeMatch: string, before: string, wrapBefore: string, wrap: string,
                    classVal: string, after: string, closingSlash: string) => {
            if(classVal.match(/(?:^|\s)question(?:$|\s)/g)) include = true;
            return "";
        });
        return include;
    }

    static scanForVideo(html: string) {
        var include = false;
        if(html.match(videoRegExp)) include = true;
        return include;
    }

    static scanForClickImage(html: string) {
        var include = false;
        html.replace(divClassRegExp,
            (wholeMatch: string, before: string, wrapBefore: string, wrap: string,
                classVal: string, after: string, closingSlash: string) => {
            if(classVal.match(/(?:^|\s)clickimage(?:$|\s)/g)) include = true;
            return "";
        });
        return include;
    }

    static scanForTimeSlider(html: string) {
        var include = false;
        html.replace(divClassRegExp,
            (wholeMatch: string, before: string, wrapBefore: string, wrap: string,
                classVal: string, after: string, closingSlash: string) => {
            if(classVal.match(/(?:^|\s)timeslider(?:$|\s)/g)) include = true;
            return "";
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

    static getHTMLAssetStrings(includeQuiz?: boolean, includeElearnVideo?: boolean, includeClickImage?: boolean, includeTimeSlider?: boolean) {
        return `${includeQuiz ? ExtensionManager.getQuizHTMLAssetString() : ""}
                ${includeElearnVideo ? ExtensionManager.getElearnVideoHTMLAssetString() : ""}
                ${includeClickImage ? ExtensionManager.getClickImageHTMLAssetString() : ""}
                ${includeTimeSlider ? ExtensionManager.getTimeSliderHTMLAssetString() : ""}`;
    }

    static getHTMLAssetString(name: string) {
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

    static getPDFAssetStrings(includeQuiz?: boolean, includeElearnVideo?: boolean, includeClickImage?: boolean, includeTimeSlider?: boolean) {
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
    * @param {InclusionObject} opts optional options
    */
    static exportAssets(dirPath: string, opts: InclusionObject) {
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
    static writeFolders(folders: string[], outPath: string, callback: () => any, error?: (err: any) => any) {
        if(!folders || !folders.length) {
            if(callback) callback();
            return;
        }
        // get first folder + remove from array
        var inPath = folders.shift();
        ncp(inPath!, outPath, function(err: any) {
            if(err) {
                if(error) error(err);
                return;
            }

            ExtensionManager.writeFolders(folders, outPath, callback, error);
        });
    }
}

export default ExtensionManager;
