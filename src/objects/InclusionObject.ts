"use strict"

class InclusionObject {
    // general index signature
    [key:string] : any;

    includeQuiz?: boolean;
    includeElearnVideo?: boolean;
    includeClickImage?: boolean;
    includeTimeSlider?: boolean;
    language: string = "en";

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
    constructor(
        includeQuiz?: boolean,
        includeElearnVideo?: boolean,
        includeClickImage?: boolean,
        includeTimeSlider?: boolean,
        language?: string)
    {
        if(includeQuiz !== undefined) this.includeQuiz = includeQuiz;
        if(includeElearnVideo !== undefined) this.includeElearnVideo = includeElearnVideo;
        if(includeClickImage !== undefined) this.includeClickImage = includeClickImage;
        if(includeTimeSlider !== undefined) this.includeTimeSlider = includeTimeSlider;
        if(language !== undefined) this.language = language;
    }
}

export default InclusionObject;