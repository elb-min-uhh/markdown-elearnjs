"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ConverterSettingsObject {
    /**
     * An Object containing options for the general Converters
     *
     * @param {object} clone: an object to clone values from:
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
    constructor(clone) {
        this.newSectionOnHeading = true;
        this.headingDepth = 3;
        this.useSubSections = true;
        this.subSectionLevel = 3;
        this.subsubSectionLevel = 4;
        if (clone) {
            if (clone.newSectionOnHeading !== undefined)
                this.newSectionOnHeading = clone.newSectionOnHeading;
            if (clone.headingDepth !== undefined)
                this.headingDepth = clone.headingDepth;
            if (clone.useSubSections !== undefined)
                this.useSubSections = clone.useSubSections;
            if (clone.subSectionLevel !== undefined)
                this.subSectionLevel = clone.subSectionLevel;
            if (clone.subsubSectionLevel !== undefined)
                this.subsubSectionLevel = clone.subsubSectionLevel;
        }
    }
}
exports.default = ConverterSettingsObject;
