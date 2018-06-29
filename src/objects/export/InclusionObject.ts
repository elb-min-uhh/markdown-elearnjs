import ExtensionObject from "../ExtensionObject";

"use strict"

class InclusionObject extends ExtensionObject {
    // general index signature
    [key: string]: any;

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
    constructor(includeQuiz?: boolean,
        includeElearnVideo?: boolean,
        includeClickImage?: boolean,
        includeTimeSlider?: boolean,
        language?: string) {

        super(includeQuiz, includeElearnVideo, includeClickImage, includeTimeSlider);

        if(language !== undefined) this.language = language;
    }
}

export default InclusionObject;
