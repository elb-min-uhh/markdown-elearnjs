"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const InclusionObject_1 = __importDefault(require("./InclusionObject"));
class ConversionObject extends InclusionObject_1.default {
    /**
     * An Object containing options for the general conversions
     * of the HtmlConverter and PdfConverter functions.
     *
     * @param {object} clone: an object to clone values from:
     *  - {boolean} bodyOnly will only return the HTML body.
     *  - {string} language will change the language
     *      if not `bodyOnly`.
     *      Default: "en"
     *  - {boolean} automaticExtensionDetection will scan for extensions and
     *      include only those found. Might be overwritten by specific `includeXY`
     *      Only if not `bodyOnly`
     *      Default: false
     *  - {boolean} includeQuiz will include the import of the quiz.js in the head.
     *      The script has to be located under `./assets`
     *      Only if not `bodyOnly`
     *      Default: false
     *  - {boolean} includeElearnVideo will include the import of the
     *      elearnvideo.js in the head. The script has to be located under `./assets`
     *      Only if not `bodyOnly`
     *      Default: false
     *  - {boolean} includeClickImage will include the import of the clickimage.js
     *      in the head. The script has to be located under `./assets`
     *      Only if not `bodyOnly`
     *       Default: false
     *  - {boolean} includeTimeSlider will include the import of the timeslider.js
     *       in the head. The script has to be located under `./assets`
     *      Only if not `bodyOnly`
     *      Default: false
     */
    constructor(clone) {
        super(clone);
        this.bodyOnly = false;
        this.automaticExtensionDetection = false;
        if (clone) {
            if (clone.bodyOnly !== undefined)
                this.bodyOnly = clone.bodyOnly;
            if (clone.automaticExtensionDetection !== undefined)
                this.automaticExtensionDetection = clone.automaticExtensionDetection;
        }
    }
}
exports.default = ConversionObject;
