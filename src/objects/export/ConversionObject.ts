"use strict";

import { InclusionObject } from "./InclusionObject";

/**
 * An object containing information about included extensions, selected language
 * and additional conversion options, like `bodyOnly`,
 * `automaticExtensionDetection` and `removeComments`.
 *
 * Extending the `InclusionObject`
 */
export class ConversionObject extends InclusionObject {
    /**
     * bodyOnly will only return the HTML body.
     * Default: false
     */
    public bodyOnly?: boolean = false;
    /**
     * automaticExtensionDetection will scan for extensions and
     * include only those found. Will only autodetect extensions with
     * undefined as `includeEXTENSION` value.
     * Only if not `bodyOnly`
     * Default: false
     */
    public automaticExtensionDetection?: boolean = false;
    /**
     * Whether to remove all HTML comments from the conversion output.
     * Default: false - no removal.
     */
    public removeComments?: boolean = false;

    /**
     * An Object containing options for the general conversions
     * of the HtmlConverter and PdfConverter functions.
     *
     * @param {object} options: Manual values for this objects fields. All optional.
     */
    constructor(options?: ConversionObject) {
        super(options);

        const keys = [
            "bodyOnly",
            "automaticExtensionDetection",
            "removeComments",
        ];

        if(options) {
            Object.keys(options).forEach((key) => {
                if(keys.indexOf(key) >= 0) {
                    this[key] = options[key];
                }
            });
        }
    }
}
