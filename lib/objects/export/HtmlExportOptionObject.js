"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ConversionObject_1 = __importDefault(require("./ConversionObject"));
class HtmlExportOptionObject extends ConversionObject_1.default {
    /**
     * An Object containing options for the general conversions
     * of the HtmlConverter and PdfConverter functions.
     *
     * @param {boolean} bodyOnly will only return the HTML body.
     * @param {string} language will change the language
     *      if not `bodyOnly`.
     *      Default: "en"
     * @param {boolean} automaticExtensionDetection will scan for extensions and
     *      include only those found. Might be overwritten by specific `includeXY`
     *      Only if not `bodyOnly`
     *      Default: false
     * @param {boolean} includeQuiz will include the import of the quiz.js in the head.
     *       The script has to be located under `./assets`
     *      Only if not `bodyOnly`
     *      Default: false
     * @param {boolean} includeElearnVideo will include the import of the
     *      elearnvideo.js in the head. The script has to be located under `./assets`
     *      Only if not `bodyOnly`
     *      Default: false
     * @param {boolean} includeClickImage will include the import of the clickimage.js
     *      in the head. The script has to be located under `./assets`
     *      Only if not `bodyOnly`
     *       Default: false
     * @param {boolean} includeTimeSlider will include the import of the timeslider.js
     *      in the head. The script has to be located under `./assets`
     *      Only if not `bodyOnly`
     *      Default: false
     * @param {boolean} exportAssets if set to true the elearn.js assets containing
     *      all included extensions will be exported next to the output file.
     * @param {boolean} exportLinkedFiles if set to true all linked files
     *      detected by the `FileExtractor` will be exported to the assets next
     *      to the output file.
     */
    constructor(bodyOnly, language, automaticExtensionDetection, includeQuiz, includeElearnVideo, includeClickImage, includeTimeSlider, exportAssets, exportLinkedFiles) {
        super(bodyOnly, language, automaticExtensionDetection, includeQuiz, includeElearnVideo, includeClickImage, includeTimeSlider);
        this.exportAssets = false;
        this.exportLinkedFiles = false;
        if (exportAssets !== undefined)
            this.exportAssets = exportAssets;
        if (exportLinkedFiles !== undefined)
            this.exportLinkedFiles = exportLinkedFiles;
    }
}
exports.default = HtmlExportOptionObject;