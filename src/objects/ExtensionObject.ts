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
     * @param {object} clone: an object to clone values from:
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
    constructor(clone?: any) {

        if(clone) {
            if(clone.includeQuiz !== undefined) this.includeQuiz = clone.includeQuiz;
            if(clone.includeElearnVideo !== undefined) this.includeElearnVideo = clone.includeElearnVideo;
            if(clone.includeClickImage !== undefined) this.includeClickImage = clone.includeClickImage;
            if(clone.includeTimeSlider !== undefined) this.includeTimeSlider = clone.includeTimeSlider;
        }
    }
}

export default ExtensionObject;
