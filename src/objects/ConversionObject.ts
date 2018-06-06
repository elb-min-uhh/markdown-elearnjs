"use strict"

import InclusionObject from "./InclusionObject";

class ConversionObject extends InclusionObject {
    bodyOnly: boolean = false;
    automaticExtensionDetection: boolean = false;

    /**
     * An Object containing options for the general conversions
     * of the HtmlConverter and PdfConverter functions.
     *
     * @param {boolean} bodyOnly will only return the HTML body.
     * @param {string} language will change the language
     *      if not `bodyOnly`.
     *      Default: "en"
     * @param {boolean} automaticExtensionDetection will scan for extensions and
     *      include only those found. Might be overwritten by specific `includeXY`
     *      Only if not `bodyOnly`
     *      Default: false
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
    constructor(bodyOnly?: boolean,
        language?: string,
        automaticExtensionDetection?: boolean,
        includeQuiz?: boolean,
        includeElearnVideo?: boolean,
        includeClickImage?: boolean,
        includeTimeSlider?: boolean) {

        super(includeQuiz, includeElearnVideo, includeClickImage, includeTimeSlider, language);
        if(bodyOnly !== undefined) this.bodyOnly = bodyOnly;
        if(automaticExtensionDetection !== undefined) this.automaticExtensionDetection = automaticExtensionDetection;
    }
}

export default ConversionObject;