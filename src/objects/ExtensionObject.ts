"use strict";

class ExtensionObject {
    // general index signature
    [key: string]: any;

    public includeQuiz?: boolean;
    public includeElearnVideo?: boolean;
    public includeClickImage?: boolean;
    public includeTimeSlider?: boolean;

    /**
     * An Object containing options for the general conversions
     * of the HtmlConverter and PdfConverter functions.
     * @param {object} options: an object to clone values from:
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
    constructor(options?: {
        includeQuiz?: boolean,
        includeElearnVideo?: boolean
        includeClickImage?: boolean,
        includeTimeSlider?: boolean,
    }) {

        if(options) {
            if(options.includeQuiz !== undefined) this.includeQuiz = options.includeQuiz;
            if(options.includeElearnVideo !== undefined) this.includeElearnVideo = options.includeElearnVideo;
            if(options.includeClickImage !== undefined) this.includeClickImage = options.includeClickImage;
            if(options.includeTimeSlider !== undefined) this.includeTimeSlider = options.includeTimeSlider;
        }
    }
}

export default ExtensionObject;
