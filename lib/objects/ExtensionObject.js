"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ExtensionObject {
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
     */
    constructor(includeQuiz, includeElearnVideo, includeClickImage, includeTimeSlider) {
        if (includeQuiz !== undefined)
            this.includeQuiz = includeQuiz;
        if (includeElearnVideo !== undefined)
            this.includeElearnVideo = includeElearnVideo;
        if (includeClickImage !== undefined)
            this.includeClickImage = includeClickImage;
        if (includeTimeSlider !== undefined)
            this.includeTimeSlider = includeTimeSlider;
    }
}
exports.default = ExtensionObject;
