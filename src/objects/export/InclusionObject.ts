"use strict";

import ExtensionObject from "../ExtensionObject";

class InclusionObject extends ExtensionObject {
    // general index signature
    public language: "en" | "de" = "en";

    /**
     * An Object containing options for the general conversions
     * of the HtmlConverter and PdfConverter functions.
     *
     * @param {object} options: an object to clone values from:
     *  - {string} language will change the language
     *      Default: "en"
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
        language?: "en" | "de",
        includeQuiz?: boolean,
        includeElearnVideo?: boolean
        includeClickImage?: boolean,
        includeTimeSlider?: boolean,
    }) {

        super(options);

        if(options) {
            if(options.language !== undefined) this.language = options.language;
        }
    }
}

export default InclusionObject;
