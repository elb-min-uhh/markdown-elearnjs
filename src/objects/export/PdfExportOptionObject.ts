"use strict";

import { AInheritingObject } from "../AInheritingObject";
import { ConversionObject } from "./ConversionObject";

/**
 * An object containing all necessary information for the PDF conversion process.
 *
 * Extending the `ConversionObject`
 */
export class PdfExportOptionObject extends ConversionObject {

    protected static readonly CLASS_KEYS = [
        "renderDelay",
    ];

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
        AInheritingObject.inheritValues(this, PdfExportOptionObject.CLASS_KEYS, options);
    }
}
