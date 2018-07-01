"use strict";

import ConversionObject from "./ConversionObject";

class HtmlExportOptionObject extends ConversionObject {
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

        const keys = ["exportAssets", "exportLinkedFiles"];

        if(options) {
            Object.keys(options).forEach((key) => {
                if(keys.indexOf(key) >= 0) {
                    this[key] = options[key];
                }
            });
        }
    }
}

export default HtmlExportOptionObject;
