"use strict";

import { ncp } from 'ncp';
import * as path from 'path';
import HtmlConverter from './converter/HtmlConverter';
import IConverter from './converter/IConverter';
import PdfConverter from './converter/PdfConverter';
import ConversionObject from './objects/export/ConversionObject';
import ExtensionObject from './objects/ExtensionObject';
import ConverterSettingsObject from './objects/settings/ConverterSettingsObject';

const divClassRegExp = /<div[ \t]((?:(?!class[ \t]*=[ \t]*["'])\S+[ \t]*=[ \t]*(["'])(?:\\\2|(?!\2).)*\2[ \t]*)*)class[ \t]*=[ \t]*(["'])((?:\\\3|(?!\3).)*)\3((?:(?!\/?>).|[^\/>])*)(\/?)>/gi;
const videoRegExp = /<video[ \t>]/g;

const assetsPath = '../assets';

/**
 * Allows to parse HTML code for usage of elearn.js extensions.
 * Allows to get path to extension necessary files.
 * Allows to get include strings for extension necessary files.
 */
class ExtensionManager {

    // the default converter used for scanning
    private static htmlConverter: HtmlConverter;

    // Scan
    public static scanForQuiz(html: string) {
        let include = false;
        html.replace(divClassRegExp,
            (wholeMatch: string, before: string, wrapBefore: string, wrap: string,
                classVal: string, after: string, closingSlash: string) => {
                if(classVal.match(/(?:^|\s)question(?:$|\s)/g)) include = true;
                return "";
            });
        return include;
    }

    public static scanForVideo(html: string) {
        let include = false;
        if(html.match(videoRegExp)) include = true;
        return include;
    }

    public static scanForClickImage(html: string) {
        let include = false;
        html.replace(divClassRegExp,
            (wholeMatch: string, before: string, wrapBefore: string, wrap: string,
                classVal: string, after: string, closingSlash: string) => {
                if(classVal.match(/(?:^|\s)clickimage(?:$|\s)/g)) include = true;
                return "";
            });
        return include;
    }

    public static scanForTimeSlider(html: string) {
        let include = false;
        html.replace(divClassRegExp,
            (wholeMatch: string, before: string, wrapBefore: string, wrap: string,
                classVal: string, after: string, closingSlash: string) => {
                if(classVal.match(/(?:^|\s)timeslider(?:$|\s)/g)) include = true;
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
    public static scanHtmlForAll(html: string) {
        return new ExtensionObject({
            includeQuiz: ExtensionManager.scanForQuiz(html),
            includeElearnVideo: ExtensionManager.scanForVideo(html),
            includeClickImage: ExtensionManager.scanForClickImage(html),
            includeTimeSlider: ExtensionManager.scanForTimeSlider(html),
        });
    }

    /**
     * Scans the markdown code for elearn.js extensions.
     *
     * @param markdown string: the original markdown code to be scanned
     * @param IConverter (optional) HtmlConverter or PdfConverter:
     *  the converter to use for markdown to HTML conversion. If not given,
     *  a default HtmlConverter will be used.
     *
     * @return Promise<ExtensionObject>: including which extensions where found
     * and explicitly which were not found (true/false)
     */
    public static async scanMarkdownForAll(markdown: string, markdownConverter?: IConverter) {
        // define converter
        if(!ExtensionManager.htmlConverter)
            ExtensionManager.htmlConverter = new HtmlConverter(new ConverterSettingsObject());

        let converter: IConverter = ExtensionManager.htmlConverter;
        if(markdownConverter
            && (markdownConverter instanceof HtmlConverter
                || markdownConverter instanceof PdfConverter)) {
            converter = <IConverter>markdownConverter;
        }

        let opts = new ConversionObject();
        opts.bodyOnly = true;

        // convert and then scan
        let html = await converter.toHtml(markdown, opts);
        return ExtensionManager.scanHtmlForAll(html);
    }

    // Asset Strings for a HTML Export

    public static getHTMLAssetStrings(includeQuiz?: boolean, includeElearnVideo?: boolean, includeClickImage?: boolean, includeTimeSlider?: boolean) {
        return `${includeQuiz ? ExtensionManager.getQuizHTMLAssetString() : ""}
                ${includeElearnVideo ? ExtensionManager.getElearnVideoHTMLAssetString() : ""}
                ${includeClickImage ? ExtensionManager.getClickImageHTMLAssetString() : ""}
                ${includeTimeSlider ? ExtensionManager.getTimeSliderHTMLAssetString() : ""}`;
    }

    // Asset Strings for a PDF Export

    public static getPDFAssetStrings(includeQuiz?: boolean, includeElearnVideo?: boolean, includeClickImage?: boolean, includeTimeSlider?: boolean) {
        return `${includeQuiz ? ExtensionManager.getQuizPDFAssetString() : ""}
                ${includeElearnVideo ? ExtensionManager.getElearnVideoPDFAssetString() : ""}
                ${includeClickImage ? ExtensionManager.getClickImagePDFAssetString() : ""}
                ${includeTimeSlider ? ExtensionManager.getTimeSliderPDFAssetString() : ""}`;
    }

    /**
     * Writes the elearn.js assets to the given path.
     * @param dirPath: string - the path to write the `assets` folder to.
     * @param {ExtensionObject} opts optional options
     */
    public static async exportAssets(dirPath: string, opts: ExtensionObject) {
        let outPath = path.resolve(dirPath + "/assets/");
        let folders = [path.resolve(`${__dirname}/${assetsPath}/elearnjs/assets/`)];

        if(opts.includeQuiz) folders.push(ExtensionManager.getQuizAssetDir());
        if(opts.includeElearnVideo) folders.push(ExtensionManager.getElearnVideoAssetDir());
        if(opts.includeClickImage) folders.push(ExtensionManager.getClickImageAssetDir());
        if(opts.includeTimeSlider) folders.push(ExtensionManager.getTimeSliderAssetDir());

        return ExtensionManager.writeFolders(folders, outPath);
    }

    // Locations to copy from

    private static getQuizAssetDir() {
        return path.resolve(`${__dirname}/${assetsPath}/elearnjs/extensions/quiz/assets/`);
    }

    private static getElearnVideoAssetDir() {
        return path.resolve(`${__dirname}/${assetsPath}/elearnjs/extensions/elearnvideo/assets/`);
    }

    private static getClickImageAssetDir() {
        return path.resolve(`${__dirname}/${assetsPath}/elearnjs/extensions/clickimage/assets/`);
    }

    private static getTimeSliderAssetDir() {
        return path.resolve(`${__dirname}/${assetsPath}/elearnjs/extensions/timeslider/assets/`);
    }

    private static getHTMLAssetString(name: string) {
        return `<link rel="stylesheet" type="text/css" href="assets/css/${name}.css">
                <script type="text/javascript" src="assets/js/${name}.js"></script>`;
    }

    private static getQuizHTMLAssetString() {
        return ExtensionManager.getHTMLAssetString("quiz");
    }

    private static getElearnVideoHTMLAssetString() {
        return ExtensionManager.getHTMLAssetString("elearnvideo");
    }

    private static getClickImageHTMLAssetString() {
        return ExtensionManager.getHTMLAssetString("clickimage");
    }

    private static getTimeSliderHTMLAssetString() {
        return `<link rel="stylesheet" type="text/css" href="assets/css/timeslider.css">
                <script type="text/javascript" src="assets/js/moment.js"></script>
                <script type="text/javascript" src="assets/js/timeslider.js"></script>`;
    }

    // Asset Strings for a PDF Export

    private static getQuizPDFAssetString() {
        return `<link rel="stylesheet" type="text/css"
                    href="file:///${path.resolve(`${__dirname}/${assetsPath}/elearnjs/extensions/quiz/assets/css/quiz.css`).replace(/\\/g, "/")}" />
                <link rel="stylesheet" type="text/css"
                    href="file:///${path.resolve(`${__dirname}/${assetsPath}/elearnjs/pdfAssets/css/quiz.css`).replace(/\\/g, "/")}" />
                <script type="text/javascript"
                    src="file:///${path.resolve(`${__dirname}/${assetsPath}/elearnjs/extensions/quiz/assets/js/quiz.js`).replace(/\\/g, "/")}"></script>`;
    }

    private static getElearnVideoPDFAssetString() {
        return `<link rel="stylesheet" type="text/css"
                    href="file:///${path.resolve(`${__dirname}/${assetsPath}/elearnjs/extensions/elearnvideo/assets/css/elearnvideo.css`).replace(/\\/g, "/")}" />
                <link rel="stylesheet" type="text/css"
                    href="file:///${path.resolve(`${__dirname}/${assetsPath}/elearnjs/pdfAssets/css/elearnvideo.css`).replace(/\\/g, "/")}" />
                <script type="text/javascript"
                    src="file:///${path.resolve(`${__dirname}/${assetsPath}/elearnjs/extensions/elearnvideo/assets/js/elearnvideo.js`).replace(/\\/g, "/")}"></script>
                <script type="text/javascript"
                    src="file:///${path.resolve(`${__dirname}/${assetsPath}/elearnjs/pdfAssets/js/elearnvideo.js`).replace(/\\/g, "/")}"></script>`;
    }

    private static getClickImagePDFAssetString() {
        return `<link rel="stylesheet" type="text/css"
                    href="file:///${path.resolve(`${__dirname}/${assetsPath}/elearnjs/extensions/clickimage/assets/css/clickimage.css`).replace(/\\/g, "/")}" />
                <link rel="stylesheet" type="text/css"
                    href="file:///${path.resolve(`${__dirname}/${assetsPath}/elearnjs/pdfAssets/css/clickimage.css`).replace(/\\/g, "/")}" />
                <script type="text/javascript"
                    src="file:///${path.resolve(`${__dirname}/${assetsPath}/elearnjs/extensions/clickimage/assets/js/clickimage.js`).replace(/\\/g, "/")}"></script>`;
    }

    private static getTimeSliderPDFAssetString() {
        return `<link rel="stylesheet" type="text/css"
                    href="file:///${path.resolve(`${__dirname}/${assetsPath}/elearnjs/extensions/timeslider/assets/css/timeslider.css`).replace(/\\/g, "/")}" />
                <link rel="stylesheet" type="text/css"
                    href="file:///${path.resolve(`${__dirname}/${assetsPath}/elearnjs/pdfAssets/css/timeslider.css`).replace(/\\/g, "/")}" />
                <script type="text/javascript"
                    src="file:///${path.resolve(`${__dirname}/${assetsPath}/elearnjs/extensions/timeslider/assets/js/moment.js`).replace(/\\/g, "/")}"></script>
                <script type="text/javascript"
                    src="file:///${path.resolve(`${__dirname}/${assetsPath}/elearnjs/extensions/timeslider/assets/js/timeslider.js`).replace(/\\/g, "/")}"></script>`;
    }

    /**
     * Copies/writes a list of folders by their absolute paths to the outPath
     */
    private static async writeFolders(folders: string[], outPath: string) {
        // get first folder + remove from array
        for(let inPath of folders) {
            await new Promise((res, rej) => {
                ncp(inPath!, outPath, (err: any) => {
                    if(err) rej(err);
                    else res();
                });
            });
        }
    }
}

export default ExtensionManager;
