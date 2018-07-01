"use strict";

class ConverterSettingsObject {
    // general index signature
    [key: string]: any;

    public newSectionOnHeading: boolean = true;
    public headingDepth: 1 | 2 | 3 | 4 | 5 | 6 = 3;
    public useSubSections: boolean = true;
    public subSectionLevel: 1 | 2 | 3 | 4 | 5 | 6 = 3;
    public subsubSectionLevel: 1 | 2 | 3 | 4 | 5 | 6 = 4;

    /**
     * An Object containing options for the general Converters
     *
     * @param {object} options: an object to clone values from:
     *  - newSectionOnHeading: bool - if sections are automatically created
     *      at headings.
     *      Default: true
     *  - headingDepth : int - until which depth headings are created.
     *      Default: 3 (H3)
     *  - useSubSections : bool - if sub- and subsubsections are created
     *      at a specific heading level (subSectionLevel, subsubSectionLevel)
     *      Default: true.
     *  - subSectionLevel : int - level from which on created sections are subsections.
     *      Default: 3 (H3)
     *  - subsubSectionLevel : int - level from which on sections are subsubsections.
     *      Default: 4 (H4) (will not be created with everything as default)
     */
    constructor(options?: {
        newSectionOnHeading?: boolean,
        headingDepth?: 1 | 2 | 3 | 4 | 5 | 6,
        useSubSections?: boolean,
        subSectionLevel?: 1 | 2 | 3 | 4 | 5 | 6,
        subsubSectionLevel?: 1 | 2 | 3 | 4 | 5 | 6,
    }) {

        if(options) {
            if(options.newSectionOnHeading !== undefined) this.newSectionOnHeading = options.newSectionOnHeading;
            if(options.headingDepth !== undefined) this.headingDepth = options.headingDepth;
            if(options.useSubSections !== undefined) this.useSubSections = options.useSubSections;
            if(options.subSectionLevel !== undefined) this.subSectionLevel = options.subSectionLevel;
            if(options.subsubSectionLevel !== undefined) this.subsubSectionLevel = options.subsubSectionLevel;
        }
    }
}

export default ConverterSettingsObject;
