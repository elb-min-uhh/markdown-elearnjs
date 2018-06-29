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
     * @param {object} clone: an object to clone values from:
     *  - {string} language will change the language
     *      if not `bodyOnly`.
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
    constructor(clone?: any) {

        super(clone);

        if(clone) {
            if(clone.language !== undefined) this.language = clone.language;
        }
    }
}

export default InclusionObject;
