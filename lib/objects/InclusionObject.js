"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class InclusionObject {
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
        this.language = "en";
        if (includeQuiz !== undefined)
            this.includeQuiz = includeQuiz;
        if (includeElearnVideo !== undefined)
            this.includeElearnVideo = includeElearnVideo;
        if (includeClickImage !== undefined)
            this.includeClickImage = includeClickImage;
        if (includeTimeSlider !== undefined)
            this.includeTimeSlider = includeTimeSlider;
        if (language !== undefined)
            this.language = language;
    }
}
exports.default = InclusionObject;
