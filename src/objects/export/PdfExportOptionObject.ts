"use strict";

import ConversionObject from "./ConversionObject";

class PdfExportOptionObject extends ConversionObject {
    public renderDelay: number = 0;

    /**
     * An Object containing options for the general conversions
     * of the HtmlConverter and PdfConverter functions.
     *
     * @param {object} options: an object to clone values from:
     *  - {boolean} bodyOnly will only return the HTML body.
     *  - {string} language will change the language
     *      if not `bodyOnly`.
     *      Default: "en"
     *  - {boolean} automaticExtensionDetection will scan for extensions and
     *      include only those found. Might be overwritten by specific `includeXY`
     *      Only if not `bodyOnly`
     *      Default: false
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
     *  - {number} renderDelay delay of rendering the html to pdf in ms
     */
    constructor(options?: {
        bodyOnly?: boolean,
        language?: "en" | "de",
        automaticExtensionDetection?: boolean,
        includeQuiz?: boolean,
        includeElearnVideo?: boolean
        includeClickImage?: boolean,
        includeTimeSlider?: boolean,
        renderDelay?: number,
    }) {

        super(options);
        if(options) {
            if(options.renderDelay !== undefined) this.renderDelay = options.renderDelay;
        }
    }
}

export default PdfExportOptionObject;
