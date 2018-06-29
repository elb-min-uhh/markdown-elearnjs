import ConverterSettingsObject from "./ConverterSettingsObject";
declare class PdfSettingsObject extends ConverterSettingsObject {
    newPageOnSection: boolean;
    contentZoom: number;
    customHeader?: string;
    customFooter?: string;
    headerHeight: string;
    footerHeight: string;
    customStyleFile?: string;
    /**
     * An Object containing options for the PdfConverter
     *
     *  - {object} clone: an object to clone values from:
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
     *  - newPageOnSection : bool - will add page breaks before every section
     *  - contentZoom : float - zoom factor for the page rendering
     *  - customHeader : string - HTML of a custom page header
     *  - customFooter : string - HTML of a custom page footer
     *  - headerHeight : string - CSS declaration of the header's height
     *  - footerHeight : string - CSS declaration of the footer's height
     *  - customStyleFile : string - absolute path to a styling css file
     */
    constructor(clone?: any);
}
export default PdfSettingsObject;
