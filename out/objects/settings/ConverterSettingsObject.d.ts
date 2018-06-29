declare class ConverterSettingsObject {
    [key: string]: any;
    newSectionOnHeading: boolean;
    headingDepth: number;
    useSubSections: boolean;
    subSectionLevel: number;
    subsubSectionLevel: number;
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
    constructor(clone?: any);
}
export default ConverterSettingsObject;
