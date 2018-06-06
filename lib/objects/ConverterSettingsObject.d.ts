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
    constructor(newSectionOnHeading?: boolean, headingDepth?: number, useSubSections?: boolean, subSectionLevel?: number, subsubSectionLevel?: number);
}
export default ConverterSettingsObject;
