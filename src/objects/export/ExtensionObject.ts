"use strict";

/**
 * An object containing infos about included extensions.
 */
export class ExtensionObject {
    // general index signature
    [key: string]: any;

    /**
     * includeQuiz will include the import of the quiz.js in the head.
     * The script has to be located under `./assets`
     * This might be ignored in certain conditions when `bodyOnly` is set
     * to true.
     * Default: false
     */
    public includeQuiz?: boolean;
    /**
     * includeElearnVideo will include the import of the
     * elearnvideo.js in the head. The script has to be located under `./assets`
     * This might be ignored in certain conditions when `bodyOnly` is set
     * to true.
     * Default: undefined. Will only be overwritten by `automaticExtensionDetection` if undefined.
     */
    public includeElearnVideo?: boolean;
    /**
     * includeClickImage will include the import of the clickimage.js
     * in the head. The script has to be located under `./assets`
     * This might be ignored in certain conditions when `bodyOnly` is set
     * to true.
     * Default: undefined. Will only be overwritten by `automaticExtensionDetection` if undefined.
     */
    public includeClickImage?: boolean;
    /**
     * includeTimeSlider will include the import of the timeslider.js
     * in the head. The script has to be located under `./assets`
     * This might be ignored in certain conditions when `bodyOnly` is set
     * to true.
     * Default: undefined. Will only be overwritten by `automaticExtensionDetection` if undefined.
     */
    public includeTimeSlider?: boolean;

    /**
     * An Object containing options for the general conversions
     * of the HtmlConverter and PdfConverter functions.
     * @param {object} options: Manual values for this objects fields. All optional.
     */
    constructor(options?: ExtensionObject) {
        const keys = ["includeQuiz", "includeElearnVideo", "includeClickImage", "includeTimeSlider"];

        if(options) {
            Object.keys(options).forEach((key) => {
                if(keys.indexOf(key) >= 0) {
                    this[key] = options[key];
                }
            });
        }
    }
}
