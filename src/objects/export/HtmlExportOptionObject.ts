"use strict";

import { AInheritingObject } from "../AInheritingObject";
import { ConversionObject } from "./ConversionObject";

/**
 * An object containing all necessary information for the HTML conversion process.
 *
 * Extending the `ConversionObject`
 */
export class HtmlExportOptionObject extends ConversionObject {

    protected static readonly CLASS_KEYS = [
        "exportAssets",
        "exportLinkedFiles",
    ];

    /**
     * if set to true the elearn.js assets containing
     * all included extensions will be exported next to the output file.
     */
    public exportAssets?: boolean = false;
    /**
     * if set to true all linked files
     * detected by the `FileExtractor` will be exported to the assets next
     * to the output file.
     */
    public exportLinkedFiles?: boolean = false;

    /**
     * An Object containing options for the general conversions
     * of the HtmlConverter and PdfConverter functions.
     *
     * @param {object} options: Manual values for this objects fields. All optional.
     */
    constructor(options?: HtmlExportOptionObject) {
        super(options);
        AInheritingObject.inheritValues(this, HtmlExportOptionObject.CLASS_KEYS, options);
    }
}
