"use strict";

/**
 * An object containing general converter settings. These apply for the
 * HtmlConverter and the PdfConverter but might be extended by specific objects.
 */
export class ConverterSettingsObject {
    // general index signature
    [key: string]: any;

    /**
     * Whether sections are automatically created at headings.
     * Default: true
     */
    public newSectionOnHeading?: boolean = true;
    /**
     * until which depth headings are created.
     * Default: 3 (H3)
     */
    public headingDepth?: 1 | 2 | 3 | 4 | 5 | 6 = 3;
    /**
     * Whether sub- and subsubsections are created
     * at a specific heading level (subSectionLevel, subsubSectionLevel)
     * Default: true.
     */
    public useSubSections?: boolean = true;
    /**
     * level from which on created sections are subsections.
     * Default: 3 (H3)
     */
    public subSectionLevel?: 1 | 2 | 3 | 4 | 5 | 6 = 3;
    /**
     * level from which on sections are subsubsections.
     * Default: 4 (H4) (will not be created with everything as default)
     */
    public subsubSectionLevel?: 1 | 2 | 3 | 4 | 5 | 6 = 4;

    /**
     * An Object containing options for the general Converters
     *
     * @param {object} options: Manual values for this objects fields. All optional.
     */
    constructor(options?: ConverterSettingsObject) {

        const keys = ["newSectionOnHeading",
            "headingDepth",
            "useSubSections",
            "subSectionLevel",
            "subsubSectionLevel"];

        if(options) {
            Object.keys(options).forEach((key) => {
                if(keys.indexOf(key) >= 0) {
                    this[key] = options[key];
                }
            });
        }
    }
}
