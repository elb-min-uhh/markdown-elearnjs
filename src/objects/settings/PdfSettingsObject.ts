"use strinct";

import ConverterSettingsObject from "./ConverterSettingsObject";

class PdfSettingsObject extends ConverterSettingsObject {
    public newPageOnSection: boolean = true;
    public contentZoom: number = 1;
    public customHeader?: string;
    public customFooter?: string;
    public headerHeight: string = "0";
    public footerHeight: string = "17mm";
    public customStyleFile?: string;

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
    constructor(clone?: any) {

        super(clone);

        if(clone) {
            if(clone.newPageOnSection !== undefined) this.newPageOnSection = clone.newPageOnSection;
            if(clone.contentZoom !== undefined) this.contentZoom = clone.contentZoom;
            if(clone.customHeader !== undefined) this.customHeader = clone.customHeader;
            if(clone.customFooter !== undefined) this.customFooter = clone.customFooter;
            if(clone.headerHeight !== undefined) this.headerHeight = clone.headerHeight;
            if(clone.footerHeight !== undefined) this.footerHeight = clone.footerHeight;
            if(clone.customStyleFile !== undefined) this.customStyleFile = clone.customStyleFile;
        }
    }
}

export default PdfSettingsObject;
