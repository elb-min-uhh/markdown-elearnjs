"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ConverterSettingsObject {
    /**
     * An Object containing options for the general Converters
     *
     * @param newSectionOnHeading: bool - if sections are automatically created
     *      at headings.
     *      Default: true
     * @param headingDepth : int - until which depth headings are created.
     *      Default: 3 (H3)
     * @param useSubSections : bool - if sub- and subsubsections are created
     *      at a specific heading level (subSectionLevel, subsubSectionLevel)
     *      Default: true.
     * @param subSectionLevel : int - level from which on created sections are subsections.
     *      Default: 3 (H3)
     * @param subsubSectionLevel : int - level from which on sections are subsubsections.
     *      Default: 4 (H4) (will not be created with everything as default)
     */
    constructor(newSectionOnHeading, headingDepth, useSubSections, subSectionLevel, subsubSectionLevel) {
        this.newSectionOnHeading = true;
        this.headingDepth = 3;
        this.useSubSections = true;
        this.subSectionLevel = 3;
        this.subsubSectionLevel = 4;
        if (newSectionOnHeading !== undefined)
            this.newSectionOnHeading = newSectionOnHeading;
        if (headingDepth !== undefined)
            this.headingDepth = headingDepth;
        if (useSubSections !== undefined)
            this.useSubSections = useSubSections;
        if (subSectionLevel !== undefined)
            this.subSectionLevel = subSectionLevel;
        if (subsubSectionLevel !== undefined)
            this.subsubSectionLevel = subsubSectionLevel;
    }
}
exports.default = ConverterSettingsObject;
