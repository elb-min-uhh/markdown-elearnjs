"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ExtensionObject_1 = __importDefault(require("../ExtensionObject"));
"use strict";
class InclusionObject extends ExtensionObject_1.default {
    /**
     * An Object containing options for the general conversions
     * of the HtmlConverter and PdfConverter functions.
     *
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
     *       in the head. The script has to be located under `./assets`
     *      Only if not `bodyOnly`
     *      Default: false
     * @param {string} language will change the language
     *      if not `bodyOnly`.
     *      Default: "en"
     */
    constructor(includeQuiz, includeElearnVideo, includeClickImage, includeTimeSlider, language) {
        super(includeQuiz, includeElearnVideo, includeClickImage, includeTimeSlider);
        this.language = "en";
        if (language !== undefined)
            this.language = language;
    }
}
exports.default = InclusionObject;
