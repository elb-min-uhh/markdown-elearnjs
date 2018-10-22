"use strict";

import { ConversionObject } from "./ConversionObject";

/**
 * An object containing all necessary information for the PDF conversion process.
 *
 * Extending the `ConversionObject`
 */
export class PdfExportOptionObject extends ConversionObject {
    /**
     * delay of rendering the html to pdf in ms
     */
    public renderDelay?: number = 0;

    /**
     * An Object containing options for the general conversions
     * of the HtmlConverter and PdfConverter functions.
     *
     * @param {object} options: Manual values for this objects fields. All optional.
     */
    constructor(options?: PdfExportOptionObject) {

        super(options);

        const keys = ["renderDelay"];

        if(options) {
            Object.keys(options).forEach((key) => {
                if(keys.indexOf(key) >= 0) {
                    this[key] = options[key];
                }
            });
        }
    }
}
